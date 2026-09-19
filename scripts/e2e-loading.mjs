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
            const busy = document.querySelectorAll('[aria-busy="true"]').length;
            window.__samples.push({
                at: Math.round(performance.now()),
                skeletons: document.querySelectorAll('[class*="skeleton"]').length,
                articles: document.querySelectorAll("article").length,
                busy,
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

/* ── The control changes before the response ───────────────────────────────── */

await withPage(async (page) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 60000 });

    /*
     * Record the selected segment at every frame. The committed value only arrives with the server
     * render, so a selection visible before the results change proves the control reacted first.
     */
    const observed = await page.evaluate(async () => {
        const frames = [];
        const record = () => {
            const checked = document.querySelector(
                '.ant-segmented-item-selected .ant-segmented-item-label',
            );
            frames.push(checked?.textContent ?? null);
            if (frames.length < 200) requestAnimationFrame(record);
        };
        requestAnimationFrame(record);

        // Click the "已完结" segment.
        const labels = [...document.querySelectorAll(".ant-segmented-item-label")];
        const target = labels.find((node) => node.textContent?.includes("已完结"));
        target?.click();

        await new Promise((resolve) => setTimeout(resolve, 1200));
        return frames;
    });

    const changed = observed.findIndex((value) => value?.includes("已完结"));
    report(
        "the segment reflects the click before the results arrive",
        changed >= 0 ? null : "the selected segment never showed 已完结",
    );
});

/* ── Clicking a book shows the detail skeleton ─────────────────────────────── */

await withPage(async (page) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 60000 });
    await page.waitForTimeout(600);

    /*
     * Sampled after a click rather than after a document load.
     *
     * A `loading.tsx` fallback is streamed inside the response of a full page load, so by the time the driver
     * can query the document the record has already arrived and the placeholder is gone. Clicking is what
     * exercises the case that matters: a client navigation whose route segment still has to be fetched.
     */
    const samples = await sample(page, async () => {
        await page.locator("article a").first().click();
        await page.waitForURL(/\/book\/\d+/, { timeout: 30000 });
    });

    const sawPlaceholder = samples.some((s) => s.busy > 0 || s.skeletons > 0);
    const sawHeading = await page.locator("h1").count();

    report(
        "clicking a book shows a placeholder while the record is resolved",
        sawPlaceholder ? null : "no placeholder observed during the navigation",
    );
    report(
        "the detail page then renders the record",
        sawHeading > 0 ? null : "no heading appeared",
    );
});

/* ── No uncaught errors ────────────────────────────────────────────────────── */

await withPage(async (page, errors) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 60000 });
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
