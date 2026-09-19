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
    await showFacets(page);
}

/**
 * Expands the facet section of the docked panel.
 *
 * The facets start collapsed, because the panel is docked and its height is height the results lose. Any check
 * that touches them has to open the section first. The click is skipped when it is already open, so the helper is
 * safe to call unconditionally.
 */
async function showFacets(page) {
    const container = page.locator(".ant-collapse-item");
    await container.waitFor({ state: "visible", timeout: 20000 });

    const isOpen = await container.evaluate((node) =>
        node.classList.contains("ant-collapse-item-active"),
    );
    if (isOpen) return;

    // The header rather than the label text, because the accessible name contains the same words and would
    // match more than one element.
    await page.locator(".ant-collapse-header").click();
    await page.waitForTimeout(400);
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

/* ── A card click opens the record over the list, and back closes it ───────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const href = await page.locator("article a").first().getAttribute("href");
    const cardsBefore = await page.locator("article").count();

    await page.locator("article a").first().click();
    await page.waitForURL(/\/book\/\d+/, { timeout: 20000 });

    const modal = page.locator(".ant-modal");
    await modal.waitFor({ state: "visible", timeout: 20000 });

    /*
     * The dialog now opens as soon as the navigation is intercepted, before the record resolves, so its heading is not
     * there yet. Waiting for the heading is waiting for the record; the placeholder check in the loading suite covers
     * the state in between.
     */
    await modal.locator("h1").waitFor({ state: "visible", timeout: 30000 });

    const opened = await page.evaluate((before) => ({
        // The dialog carries the heading, and the grid behind it was never unmounted — which is the whole point of
        // intercepting the navigation rather than replacing the page.
        heading: document.querySelector(".ant-modal h1")?.textContent?.trim() ?? "",
        cardsBehind: document.querySelectorAll("article").length,
        expectedBehind: before,
        url: window.location.pathname,
    }), cardsBefore);

    report(
        "clicking a card opens the record in a dialog",
        opened.heading.length > 0 ? null : "the dialog rendered no heading",
    );
    report(
        "the list stays on screen behind the dialog",
        opened.cardsBehind >= opened.expectedBehind
            ? null
            : `only ${opened.cardsBehind} of ${opened.expectedBehind} cards remained`,
    );
    report(
        "the address bar shows the book",
        /^\/book\/\d+$/.test(opened.url) ? null : `the path was ${opened.url}`,
    );

    // Back closes the record and returns to the results, rather than leaving the application.
    await page.goBack();
    await page.waitForTimeout(1500);
    const closed = await page.evaluate(() => ({
        modals: document.querySelectorAll(".ant-modal").length,
        path: window.location.pathname,
    }));
    report(
        "the back button closes the dialog and returns to the results",
        closed.modals === 0 && closed.path === "/" ? null : `path=${closed.path} modals=${closed.modals}`,
    );

    report("card link points at a book route", /^\/book\/\d+/.test(href ?? "") ? null : `href was ${href}`);
});

/* ── A book URL is only reachable through the list ────────────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const href = await page.locator("article a").first().getAttribute("href");

    /*
     * There is one route for a record: the intercepted one. Nothing renders a book outside the list it was opened from,
     * so a direct request for the URL is a 404. Asserted rather than tolerated, because a second rendering would be the
     * place the two could disagree.
     */
    const response = await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
    report(
        "a direct request for a book URL is not found",
        response?.status() === 404 ? null : `the server answered ${response?.status()}`,
    );
});

/* ── The record offers copy and search, and they work ─────────────────────── */

await withPage(async (page) => {
    // Clipboard access needs a permission grant in Chrome; without it the write rejects.
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });

    await gotoAndSettle(page, "/");
    await page.locator("article a").first().click();
    await page.waitForURL(/\/book\/\d+/, { timeout: 20000 });
    const modal = page.locator(".ant-modal");
    await modal.locator("h1").waitFor({ state: "visible", timeout: 30000 });

    const title = (await modal.locator("h1").textContent())?.trim() ?? "";

    await modal.getByRole("button", { name: /复制名称/ }).click();
    await page.waitForTimeout(600);

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    report(
        "the copy button puts the title on the clipboard",
        copied.length > 0 ? null : "the clipboard was empty after pressing copy",
    );
    report(
        "the copy button reports what it copied",
        copied === title ? null : `clipboard held "${copied}" while the title is "${title}"`,
    );

    /*
     * The search button opens a new tab. The URL is read and the tab closed immediately, so the check does not depend
     * on the search engine answering.
     *
     * The title is looked for anywhere in the opened URL rather than as the `wd` parameter, because a search engine may
     * redirect a browser it does not recognise and carry the intended query inside a parameter of its own. That
     * parameter is encoded a second time, so the URL is decoded twice before searching it. What is being checked is that
     * the title reached the engine, not how the engine chose to answer.
     */
    const [searchTab] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 15000 }),
        modal.getByRole("button", { name: /搜索该书/ }).click(),
    ]);
    const searchUrl = searchTab.url();
    await searchTab.close();

    let decoded;
    try {
        decoded = decodeURIComponent(decodeURIComponent(searchUrl));
    } catch {
        // A malformed escape sequence leaves the title unreadable, which this check treats as not carried.
        decoded = searchUrl;
    }
    const carried = decoded.includes(title);
    report(
        "the search button opens the engine carrying the title",
        carried ? null : `the title was not present in ${searchUrl.slice(0, 120)}`,
    );

    report(
        "the record shows its facts as a description list",
        (await modal.locator(".ant-descriptions-item").count()) >= 3
            ? null
            : "fewer than three facts were rendered",
    );
});

/* ── The heading above the results names the ordering ─────────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const heading = page.locator("h1").first();

    const before = (await heading.textContent())?.trim();
    await page.getByText("字数最多", { exact: true }).click();
    // One frame later: the click has been handled, the results have not arrived.
    await page.waitForTimeout(120);
    const during = (await heading.textContent())?.trim();
    await page.waitForTimeout(3500);
    const after = (await heading.textContent())?.trim();

    report(
        "the heading above the results follows the chosen ordering",
        during === "字数最多" ? null : `the heading read "${during}" one frame after the click`,
    );
    report(
        "the heading keeps the chosen ordering once the results arrive",
        after === "字数最多" ? null : `the heading settled on "${after}"`,
    );
    report(
        "the heading changed from its initial value",
        before !== after ? null : `the heading stayed "${before}"`,
    );
});

/* ── The wheel scrolls the page wherever the pointer is ───────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    await page.waitForTimeout(600);

    /*
     * Checked over several parts of the page, because a wheel that works in one place and not another is the failure
     * this guards against: a scroll container or a containment rule that covers part of the grid stops the wheel there
     * while leaving it working over the parts that are themselves scrollable.
     */
    const spots = [
        [300, 300, "the results grid"],
        [720, 120, "the heading"],
        [700, 760, "the search field"],
    ];

    const blocked = [];
    for (const [x, y, where] of spots) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(250);
        await page.mouse.move(x, y);
        await page.mouse.wheel(0, 800);
        await page.waitForTimeout(500);
        const scrolled = await page.evaluate(() => window.scrollY);
        if (scrolled === 0) blocked.push(where);
    }

    report(
        "the wheel scrolls the page wherever the pointer rests",
        blocked.length === 0 ? null : `no scrolling happened over ${blocked.join(", ")}`,
    );
});

/* ── The address bar is not rewritten while a record is open ──────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    await page.waitForTimeout(500);

    /*
     * The results island stays mounted behind the dialog, and its sentinel keeps loading. Anything it writes to the
     * address bar therefore lands on top of the book's URL. It used to mirror its depth there, so opening a record could
     * replace the book with the list a second later, and a return to the list started from whatever depth had been
     * written last.
     *
     * The URL is sampled across several seconds rather than once, because the overwrite arrived after a page finished
     * loading — which is why it looked intermittent.
     */
    await page.evaluate(() => {
        window.__urls = [];
        const sample = () => window.__urls.push(window.location.pathname + window.location.search);
        sample();
        window.__urlTimer = setInterval(sample, 100);
    });

    await page.locator("article a").first().click({ timeout: 25000 });
    await page.waitForURL(/\/book\/\d+/, { timeout: 20000 });
    await page.waitForTimeout(7000);

    const urls = await page.evaluate(() => {
        clearInterval(window.__urlTimer);
        return window.__urls;
    });

    const bookPath = urls.find((url) => url.startsWith("/book/"));
    const reverted = urls.slice(urls.indexOf(bookPath)).filter((url) => !url.startsWith("/book/"));

    report(
        "opening a record is not undone by the list behind it",
        bookPath !== undefined ? null : "the address bar never showed the book",
    );
    report(
        "the book URL survives while the record is open",
        reverted.length === 0 ? null : `the address bar became ${reverted[0]} after the book was opened`,
    );

    await page.keyboard.press("Escape");
    await page.waitForTimeout(1500);
});

/* ── Returning from a record keeps the list where it was ──────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    await page.waitForTimeout(500);

    // Load a second page so the list is taller than the first result set.
    await page.locator("button", { hasText: "加载下一页" }).scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(6000);

    const before = await page.evaluate(() => ({
        cards: document.querySelectorAll("article").length,
        firstLink: document.querySelector("article a")?.getAttribute("href") ?? "",
    }));

    await page.locator("article a").nth(Math.min(before.cards - 2, 30)).click({ timeout: 25000 });
    await page.waitForURL(/\/book\/\d+/, { timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.goBack();
    await page.waitForTimeout(3000);

    const after = await page.evaluate(() => ({
        cards: document.querySelectorAll("article").length,
        firstLink: document.querySelector("article a")?.getAttribute("href") ?? "",
        search: window.location.search,
    }));

    report(
        "returning from a record restores the accumulated list",
        after.cards >= before.cards
            ? null
            : `${after.cards} cards remained of ${before.cards}`,
    );
    report(
        "returning from a record starts the list from the first page",
        after.firstLink === before.firstLink
            ? null
            : `the first card changed from ${before.firstLink.slice(0, 24)} to ${after.firstLink.slice(0, 24)}`,
    );
    report(
        "the depth is not carried in the address bar",
        !after.search.includes("curr=") ? null : `the URL was ${after.search}`,
    );
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

/* ── Ordering is available and changes the result order ───────────────────── */

await withPage(async (page) => {
    await gotoAndSettle(page, "/");
    const before = await renderedIds(page);

    /*
     * Ordering lives outside the collapsible facet section, because it is used more often than any single facet
     * and it is not a constraint. It is therefore reachable without opening the facets, which is what this checks
     * as much as the ordering itself.
     */
    const sort = page.getByLabel("结果排序");
    await sort.waitFor({ state: "visible", timeout: 15000 });
    const options = await sort.locator(".ant-segmented-item-label").allTextContents();

    await page.getByText("字数最多", { exact: true }).click();
    await page.waitForFunction(() => window.location.search.includes("sort=word_count"), undefined, {
        timeout: 15000,
    });
    await page.waitForTimeout(4000);

    const after = await renderedIds(page);
    report(
        "ordering is offered with every upstream sort option",
        options.length === 4 ? null : `found ${options.length} options: ${options.join(", ")}`,
    );
    report(
        "choosing an ordering re-sorts the list",
        after.length > 0 && after.join() !== before.join()
            ? null
            : "the list did not change after choosing 字数最多",
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
