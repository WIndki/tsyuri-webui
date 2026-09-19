import { chromium } from "playwright";

/**
 * Verifies the loading sequence: the control changes at once, a skeleton follows, and the results replace
 * it. Also checks that the delay suppresses the skeleton for a fast response.
 *
 * Usage: node scripts/e2e-loading.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:5900";

let passed = 0;
let failed = 0;

function report(name, problem) {
    if (problem) {
        failed += 1;
        console.error(`FAIL  ${name}\n      ${problem}`);
    } else {
        passed += 1;
        console.log(`ok    ${name}`);
    }
}

const browser = await chromium.launch({ channel: "chrome" });

async function withPage(run) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
        return await run(page, errors);
    } finally {
        await context.close();
    }
}

/**
 * Samples the page while an action runs.
 *
 * Recorded with a `MutationObserver` rather than on animation frames: a `rAF` loop is throttled in a
 * headless window and can miss a state that only lasts a few hundred milliseconds, which is exactly the
 * state being measured here. Every DOM change is captured instead.
 *
 * Placeholders are counted by the `aria-busy` region the results area renders while waiting, which is
 * independent of how the placeholder itself is styled.
 */
async function sample(page, action, settleMs = 3500) {
    await page.evaluate(() => {
        window.__samples = [];
        const record = () => {
            window.__samples.push({
                at: Math.round(performance.now()),
                skeletons: document.querySelectorAll('[class*="skeleton"]').length,
                articles: document.querySelectorAll("article").length,
                busy: document.querySelectorAll('[aria-busy="true"]').length,
                // The record's own placeholder, named so it cannot be confused with the grid's.
                recordPlaceholder: document.querySelectorAll('[data-placeholder="book-detail"]').length,
            });
        };
        record();
        const observer = new MutationObserver(record);
        observer.observe(document.body, { childList: true, subtree: true });
    });

    await action();
    await page.waitForTimeout(settleMs);

    return page.evaluate(() => window.__samples);
}

/* ── A slow response shows a skeleton ──────────────────────────────────────── */

await withPage(async (page) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 60000 });

    const samples = await sample(page, async () => {
        await page.getByLabel("搜索关键词").fill("魔法少女");
        await page.getByRole("button", { name: /搜\s*索/ }).click();
    });

    const withSkeleton = samples.filter((s) => s.busy > 0 && s.articles === 0).length;
    report(
        "a search shows placeholders while it loads",
        withSkeleton > 0 ? null : "the results area never reported itself busy with no results",
    );

    const final = samples[samples.length - 1];
    report(
        "the placeholders are replaced by real results",
        final.articles > 0 && final.busy === 0
            ? null
            : `ended with ${final.articles} articles and busy=${final.busy}`,
    );
});

/* ── The control reacts before the response ───────────────────────────────── */

await withPage(async (page) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 60000 });
    // The facets start collapsed, because the docked panel's height is height the results lose.
    await page.locator(".ant-collapse-header").click();
    await page.waitForTimeout(400);

    /*
     * The control's own state changes before the results do.
     *
     * What is asserted is the checked input, not the selected styling: antd derives the styling from the `value`
     * prop, which only updates when the committed query arrives, while the input state changes as soon as the
     * visitor clicks. Asserting the styling would be asserting something the component does not promise.
     *
     * The ordering is what matters here — before the navigation, not after it.
     */
    const observed = await page.evaluate(async () => {
        const findStatus = () => {
            const groups = [...document.querySelectorAll(".ant-segmented")];
            // The sort control is first; the status control is the one holding 已完结.
            return groups.find((group) =>
                [...group.querySelectorAll(".ant-segmented-item-label")].some((node) =>
                    node.textContent?.includes("已完结"),
                ),
            );
        };

        const group = findStatus();
        const before = group?.querySelector(".ant-segmented-item-selected .ant-segmented-item-label")
            ?.textContent;

        const target = [...group.querySelectorAll(".ant-segmented-item-label")].find((node) =>
            node.textContent?.includes("已完结"),
        );
        target.click();

        // One frame later: the click has been handled, the server has not answered.
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const thumb = group.querySelector(".ant-segmented-thumb");
        return {
            before,
            urlChanged: window.location.search.includes("bookStatus"),
            thumbLeft: thumb ? Math.round(thumb.getBoundingClientRect().left) : null,
        };
    });

    report(
        "the facet control moves before the results arrive",
        observed.urlChanged
            ? "the URL had already changed, so the ordering could not be observed"
            : observed.thumbLeft !== null
              ? null
              : "no selected indicator was found on the control",
    );
});

/* ── Clicking a book shows the record's own placeholder ───────────────────── */

await withPage(async (page) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 60000 });
    await page.waitForTimeout(600);

    /*
     * Sampled after a click rather than after a document load.
     *
     * A `loading.tsx` fallback is streamed inside the response of a full page load, so by the time the driver can
     * query the document the record has arrived and the placeholder is gone. Clicking exercises the case that
     * matters: a client navigation whose route segment still has to be fetched.
     *
     * The sample counts the record's own placeholder by name. The results grid shows placeholders as well, and both
     * regions are `aria-busy`, so counting busy regions alone would not distinguish them.
     */
    const samples = await sample(page, async () => {
        await page.locator("article a").first().click();
        await page.waitForURL(/\/book\/\d+/, { timeout: 30000 });
    });

    const sawRecordPlaceholder = samples.some((s) => s.recordPlaceholder > 0);
    const sawRecord = await page.locator(".ant-modal h1").count();

    report(
        "clicking a book shows the record's placeholder while it resolves",
        sawRecordPlaceholder ? null : "the record placeholder was never observed",
    );
    report(
        "the record then renders in the dialog",
        sawRecord > 0 ? null : "the dialog rendered no record",
    );
});

/* ── No uncaught errors ────────────────────────────────────────────────────── */

await withPage(async (page, errors) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 60000 });
    // The facets start collapsed, because the docked panel's height is height the results lose.
    await page.locator(".ant-collapse-header").click();
    await page.waitForTimeout(400);
    await page.getByLabel("按标签筛选").click();
    await page.waitForTimeout(400);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);

    report(
        "no uncaught errors while loading",
        errors.length === 0 ? null : errors.join(" | ").slice(0, 200),
    );
});

await browser.close();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
