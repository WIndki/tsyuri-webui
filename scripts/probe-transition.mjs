import { chromium } from "playwright";

/**
 * Measures how long `useTransition`'s pending flag stays true around a server round-trip.
 *
 * Usage: node scripts/probe-transition.mjs [baseUrl]
 *
 * The loading design depends on this: if the flag clears before the server render commits, a
 * skeleton driven by it would disappear while the old grid is still on screen, which is worse than
 * showing nothing.
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:5500";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/*
 * Instrument the page so every transition boundary reports its own lifetime.
 *
 * `useTransition`'s flag is only observable from inside a component, so the probe reads the DOM
 * instead: the submit button already carries `loading` while a search is pending, and the grid's
 * opacity is driven by the same flag.
 */
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForSelector("article", { timeout: 60000 });

/** Samples the visual state every 50ms for a second after an action. */
async function sampleAfter(action, label) {
    const samples = [];
    const started = Date.now();

    await action();

    for (let i = 0; i < 40; i += 1) {
        const state = await page.evaluate(() => {
            const button = document.querySelector('form[role="search"] button[type="submit"]');
            const grid = document.querySelector('[class*="__grid"]');
            return {
                buttonLoading: button?.className.includes("ant-btn-loading") ?? false,
                gridOpacity: grid ? getComputedStyle(grid).opacity : null,
                articleCount: document.querySelectorAll("article").length,
                skeletonNodes: document.querySelectorAll(".ant-skeleton").length,
                search: window.location.search,
            };
        });
        samples.push({ at: Date.now() - started, ...state });
        await page.waitForTimeout(50);
    }

    const pending = samples.filter((s) => s.buttonLoading);
    console.log(`\n${label}`);
    console.log(`  samples: ${samples.length}`);
    console.log(
        `  pending observed: ${pending.length} samples` +
            (pending.length ? ` (${pending[0].at}ms → ${pending[pending.length - 1].at}ms)` : ""),
    );
    console.log(`  final search: ${samples[samples.length - 1].search}`);
    console.log(`  final articles: ${samples[samples.length - 1].articleCount}`);
    return pending.length;
}

/* A keyword search is the clearest case: the button reports the same pending flag. */
const keywordPending = await sampleAfter(async () => {
    await page.getByLabel("搜索关键词").fill("魔法少女");
    await page.getByRole("button", { name: /搜\s*索/ }).click();
}, "keyword search");

/* A filter change goes through the same hook. */
const filterPending = await sampleAfter(async () => {
    await page.getByLabel("按标签筛选").click();
    await page.waitForTimeout(300);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
}, "filter change");

await browser.close();

console.log(`\nverdict: keyword=${keywordPending > 0 ? "observable" : "NOT observable"}, filter=${filterPending > 0 ? "observable" : "NOT observable"}`);
