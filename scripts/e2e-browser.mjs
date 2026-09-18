import { chromium } from "playwright";

/**
 * Browser-driven checks for the behaviour a static HTML fetch cannot cover: client-side state,
 * navigation, and the synchronisation between the URL and the rendered list.
 *
 * Usage: node scripts/e2e-browser.mjs [baseUrl]
 *
 * These run against the real upstream index, so a filter is expected to return different books.
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:4700";

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

/** The book ids currently rendered, in document order. */
const renderedIds = (page) =>
    page.$$eval("article", (cards) =>
        cards.map((card) => card.querySelector("a")?.getAttribute("href") ?? ""),
    );

async function gotoAndSettle(page, path) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 30000 });
}

/**
 * Matches a two-character CJK button label regardless of spacing.
 *
 * antd inserts a space between two adjacent Chinese characters in a button ("搜索" renders as
 * "搜 索"), so an exact-string accessible-name match fails. Matching on the characters with
 * optional whitespace between them is stable across that behaviour.
 */
const cjkButton = (label) => new RegExp(label.split("").join("\\s*"));

/* ── The reported defect: a filter change must replace the list ─────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const before = await renderedIds(page);

    // Change a facet that previously did not participate in the reset key.
    await page.getByLabel("最多字数").click();
    await page.getByTitle("30 万以下").click();
    await page.waitForFunction(
        () => window.location.search.includes("wordCountMax"),
        undefined,
        { timeout: 15000 },
    );
    await page.waitForTimeout(4000);

    const after = await renderedIds(page);
    const changed = after.length > 0 && after.join() !== before.join();
    report("changing a word-count bound replaces the list", changed ? null : `list did not change (${before.length} → ${after.length} identical)`);
});

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const before = await renderedIds(page);

    await page.getByLabel("按来源筛选").click();
    await page.getByTitle("刺猬猫").click();
    await page.waitForFunction(() => window.location.search.includes("source="), undefined, {
        timeout: 15000,
    });
    await page.waitForTimeout(4000);

    const after = await renderedIds(page);
    report(
        "changing the source filter replaces the list",
        after.length > 0 && after.join() !== before.join()
            ? null
            : `list did not change (${after.length} cards)`,
    );

    // Every rendered card must belong to the selected source.
    const sources = await page.$$eval("article", (cards) =>
        cards.map((card) => card.textContent?.includes("刺猬猫") ?? false),
    );
    report(
        "every card matches the selected source",
        sources.length > 0 && sources.every(Boolean)
            ? null
            : `${sources.filter((ok) => !ok).length} of ${sources.length} cards are from another source`,
    );
});

/* ── Pagination must show the page it names ────────────────────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const page1 = await renderedIds(page);

    await page.goto(`${BASE}/search?curr=2`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("article", { timeout: 30000 });
    const page2 = await renderedIds(page);

    report(
        "page 2 renders different books from page 1",
        page2.length > 0 && page2.join() !== page1.join()
            ? null
            : "page 2 rendered the same books as page 1",
    );
});

/* ── Keyword search and reset ─────────────────────────────────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");

    await page.getByLabel("搜索关键词").fill("圣女");
    await page.getByRole("button", { name: cjkButton("搜索") }).click();
    await page.waitForFunction(() => window.location.search.includes("keyword="), undefined, {
        timeout: 15000,
    });
    await page.waitForTimeout(4000);

    const ids = await renderedIds(page);
    const titles = await page.$$eval("article h3", (nodes) =>
        nodes.map((node) => node.textContent ?? ""),
    );
    report(
        "keyword search returns matching books",
        ids.length > 0 && titles.some((title) => title.includes("圣女"))
            ? null
            : "no rendered title contains the keyword",
    );

    /*
     * Clearing works by emptying the field and submitting: the submit button relabels itself to
     * "清除" once the field no longer holds the applied keyword. Submitting an empty field while no
     * keyword is applied is a no-op, which is why the button reads "搜索" at the start.
     */
    await page.getByLabel("搜索关键词").fill("");
    await page.getByRole("button", { name: cjkButton("清除") }).click();
    await page.waitForFunction(() => !window.location.search.includes("keyword="), undefined, {
        timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const cleared = await page.evaluate(() => window.location.search);
    report(
        "clearing the keyword removes it from the URL",
        cleared.includes("keyword=") ? `URL still contains ${cleared}` : null,
    );
});

/* ── A card click opens the detail page ───────────────────────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const href = await page.locator("article a").first().getAttribute("href");

    await page.locator("article a").first().click();
    await page.waitForURL(/\/book\/\d+/, { timeout: 20000 });
    await page.waitForSelector("h1", { timeout: 20000 });

    const heading = await page.locator("h1").textContent();
    report(
        "clicking a card opens its detail page",
        heading && heading.trim().length > 0 ? null : "detail page rendered no heading",
    );
    report("card link points at a book route", /^\/book\/\d+/.test(href ?? "") ? null : `href was ${href}`);
});

/* ── Display mode is part of the URL, so the server renders the right variant ─ */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const infiniteCards = await renderedIds(page);

    await page.getByLabel("工具菜单").click();
    const toggle = page.getByLabel(/切换到(分页|无限滚动)/);
    await toggle.waitFor({ state: "visible", timeout: 15000 });
    await toggle.click();
    await page.waitForFunction(() => window.location.search.includes("display=pagination"), undefined, {
        timeout: 15000,
    });
    await page.waitForTimeout(3000);
    await page.waitForSelector("article", { timeout: 20000 });

    const stored = await page.evaluate(() => window.localStorage.getItem("tsyuri.displayMode"));
    report(
        "switching to pagination records the choice in the URL and in storage",
        stored === "pagination" ? null : `stored displayMode was ${stored}`,
    );

    // A paginated view has no "load more" affordance; the pager replaces it.
    const hasPager = await page.locator(".ant-pagination").count();
    report(
        "pagination mode renders a pager instead of the load-more control",
        hasPager > 0 ? null : "no pager found in pagination mode",
    );

    report(
        "switching display mode keeps showing books",
        infiniteCards.length > 0 && (await renderedIds(page)).length > 0
            ? null
            : "one of the modes rendered no books",
    );
});

/* ── No uncaught errors during a normal session ───────────────────────────── */

await withPage(async (page, errors) => {
    await gotoAndSettle(page, "/");
    await page.getByLabel("按标签筛选").click();
    await page.getByTitle("百合").click();
    await page.waitForTimeout(4000);
    report(
        "no uncaught page errors while filtering",
        errors.length === 0 ? null : errors.join(" | ").slice(0, 200),
    );
});

/* ── Theme toggle persists ────────────────────────────────────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const initial = await page.evaluate(() => document.documentElement.dataset.theme);

    /*
     * The preference controls live inside a `FloatButton.Group` whose default trigger is `click`,
     * so the group has to be expanded before its buttons exist in the DOM.
     */
    await page.getByLabel("工具菜单").click();
    const toggle = page.getByLabel(/切换到(浅色|深色)主题/);
    await toggle.waitFor({ state: "visible", timeout: 15000 });
    await toggle.click();
    await page.waitForTimeout(600);

    const toggled = await page.evaluate(() => document.documentElement.dataset.theme);
    const stored = await page.evaluate(() => window.localStorage.getItem("tsyuri.theme"));

    report(
        "theme toggle changes the applied theme and persists it",
        initial !== toggled && stored === toggled
            ? null
            : `initial=${initial} toggled=${toggled} stored=${stored}`,
    );
});

await browser.close();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
