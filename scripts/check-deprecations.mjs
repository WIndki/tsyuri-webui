import { chromium } from "playwright";

/**
 * Exercises the interactive controls and collects console warnings, so antd deprecations that only
 * appear while components are mounted are caught rather than discovered later.
 *
 * Usage: node scripts/check-deprecations.mjs [baseUrl]
 *
 * Run against a development server: React strips these warnings in a production build.
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:5500";

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const messages = [];
page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "warning" || message.type() === "error") messages.push(text);
});
page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));

/** Clicks a control if it is present, so one changed selector cannot abort the whole sweep. */
async function tryClick(label, timeout = 8000) {
    try {
        const target = page.getByLabel(label).first();
        await target.waitFor({ state: "visible", timeout });
        await target.click();
        return true;
    } catch {
        console.log(`  (skipped: ${label})`);
        return false;
    }
}

/* Landing page: mounts the search bar, the filter panel, the grid and the toolbar. */
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForSelector("article", { timeout: 60000 });
await page.waitForTimeout(1500);

/* The filter panel's Select, Segmented and Collapse are all mounted here; opening and changing one
   is enough to surface a deprecation on any of them. */
await tryClick("按标签筛选");
await page.waitForTimeout(600);
await page.keyboard.press("ArrowDown");
await page.keyboard.press("Enter");
await page.waitForTimeout(3000);

/* Segmented control. */
await tryClick("按状态筛选");
await page.waitForTimeout(1500);

/* Toolbar group, then the about dialog, then the theme toggle. */
if (await tryClick("工具菜单")) {
    await page.waitForTimeout(500);
    if (await tryClick("关于本站")) {
        await page.waitForTimeout(1000);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(600);
    }
    await tryClick(/切换到(浅色|深色)主题/);
    await page.waitForTimeout(800);
    /* Pagination mode mounts a different control set. */
    await tryClick(/切换到(分页|无限滚动)/);
    await page.waitForTimeout(3500);
}

/* The detail page mounts the tag row and the definition list. */
await page.goto(`${BASE}/book/1138645?title=${encodeURIComponent("刚选的圣女似乎有点痞")}`, {
    waitUntil: "domcontentloaded",
});
await page.waitForSelector("h1", { timeout: 30000 });
await page.waitForTimeout(1500);

await browser.close();

/* Deduplicate: antd repeats the same warning for every instance of a component. */
const unique = [...new Set(messages.map((text) => text.split("\n")[0].slice(0, 200)))];

console.log(`\nconsole warnings and errors: ${unique.length}`);
for (const text of unique) console.log("  " + text);

process.exit(unique.length === 0 ? 0 : 1);
