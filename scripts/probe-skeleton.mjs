import { chromium } from "playwright";

/**
 * Reports what the results area contains at each frame around a slow navigation.
 *
 * Usage: node scripts/probe-skeleton.mjs [baseUrl] [--dev]
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:6100";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForSelector("article", { timeout: 60000 });
await page.waitForTimeout(1500);

/* Record the DOM at every frame while a search runs. */
const frames = await page.evaluate(async () => {
    const out = [];
    let running = true;

    const record = () => {
        if (!running) return;
        out.push({
            t: Math.round(performance.now()),
            skeletons: document.querySelectorAll(".ant-skeleton").length,
            articles: document.querySelectorAll("article").length,
            busy: Boolean(document.querySelector('[aria-busy="true"]')),
            grid: document.querySelectorAll('[class*="__grid"]').length,
            search: window.location.search,
        });
        requestAnimationFrame(record);
    };
    requestAnimationFrame(record);

    const input = document.querySelector('input[type="search"]');
    const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
    ).set;
    setter.call(input, "魔法少女");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const button = document.querySelector('form[role="search"] button[type="submit"]');
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    running = false;
    return out;
});

const compact = [];
for (const frame of frames) {
    const signature = `${frame.skeletons}/${frame.articles}/${frame.busy}/${frame.grid}`;
    const previous = compact[compact.length - 1];
    if (!previous || previous.signature !== signature) {
        compact.push({ signature, t: frame.t, search: frame.search });
    }
}

console.log("distinct states (skeletons/articles/busy/grids):");
for (const state of compact) {
    console.log(`  t=${String(state.t).padStart(5)}ms  ${state.signature}  ${state.search}`);
}

await browser.close();
