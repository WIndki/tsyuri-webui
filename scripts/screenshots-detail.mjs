import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

/**
 * Captures tightly scoped views: the top of the page, a single card, and the detail page.
 *
 * Usage: node scripts/screenshots-detail.mjs [baseUrl]
 *
 * Element-level captures are used instead of `fullPage` because a full-page shot composites regions
 * the viewport never visited, which misrepresents cards whose covers are loaded lazily.
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:4700";
const OUT = ".screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });

async function newPage(theme = "light", viewport = { width: 1440, height: 900 }) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        ["tsyuri.theme", theme],
    );
    return { context, page };
}

async function settle(page) {
    await page.waitForSelector("article", { timeout: 30000 }).catch(() => {});
    await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.8);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 150));
        }
        window.scrollTo(0, 0);
    });
    await page
        .waitForFunction(
            async () => {
                await Promise.all(
                    [...document.querySelectorAll("img")].map((img) =>
                        img.complete ? img.decode().catch(() => {}) : Promise.resolve(),
                    ),
                );
                return true;
            },
            undefined,
            { timeout: 30000 },
        )
        .catch(() => {});
}

/* 1. Top of the results page, viewport-sized. */
{
    const { context, page } = await newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.screenshot({ path: `${OUT}/01-top.png` });
    console.log("wrote 01-top.png");
    await context.close();
}

/* 2. A single card and its neighbours, so cover geometry is unambiguous. */
{
    const { context, page } = await newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await settle(page);
    const grid = page.locator('[class*="__grid"]');
    await grid.screenshot({ path: `${OUT}/02-grid-rows.png` });
    console.log("wrote 02-grid-rows.png");
    await context.close();
}

/* 3. The detail page. */
{
    const { context, page } = await newPage();
    await page.goto(`${BASE}/book/1138645?title=${encodeURIComponent("刚选的圣女似乎有点痞")}`, {
        waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("h1", { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/03-detail.png` });
    console.log("wrote 03-detail.png");
    await context.close();
}

/* 4. Dark theme. */
{
    const { context, page } = await newPage("dark");
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.screenshot({ path: `${OUT}/04-dark.png` });
    console.log("wrote 04-dark.png");
    await context.close();
}

/* 5. Mobile. */
{
    const { context, page } = await newPage("light", { width: 390, height: 844 });
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await settle(page);
    await page.screenshot({ path: `${OUT}/05-mobile.png` });
    console.log("wrote 05-mobile.png");
    await context.close();
}

/* 6. Empty state. */
{
    const { context, page } = await newPage();
    await page.goto(`${BASE}/search?keyword=zzzznomatch9999`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/06-empty.png` });
    console.log("wrote 06-empty.png");
    await context.close();
}

await browser.close();
