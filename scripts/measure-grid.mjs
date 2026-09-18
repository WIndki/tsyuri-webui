import { chromium } from "playwright";

/**
 * Measures the result grid so layout defects can be seen as numbers.
 *
 * Usage: node scripts/measure-grid.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:4700";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForSelector("article", { timeout: 30000 });

const report = await page.evaluate(() => {
    const grid = document.querySelector('[class*="__grid"]');
    if (!grid) return { error: "grid not found" };

    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").map(parseFloat);
    const items = [...grid.children];

    return {
        gridWidth: grid.getBoundingClientRect().width,
        columnWidths: columns,
        itemCount: items.length,
        // A grid item must not force its track wider than the others; equal widths are expected.
        itemWidths: [...new Set(items.map((item) => Math.round(item.getBoundingClientRect().width)))],
        cardHeights: items.slice(0, 6).map((item) => Math.round(item.getBoundingClientRect().height)),
        coverFrame: (() => {
            const frame = items[0]?.querySelector("div");
            if (!frame) return null;
            const style = getComputedStyle(frame);
            const rect = frame.getBoundingClientRect();
            return {
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                aspectRatio: style.aspectRatio,
                position: style.position,
            };
        })(),
        image: (() => {
            const img = items[0]?.querySelector("img");
            if (!img) return null;
            const rect = img.getBoundingClientRect();
            const style = getComputedStyle(img);
            return {
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                objectFit: style.objectFit,
                position: style.position,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                complete: img.complete,
                currentSrc: img.currentSrc.slice(0, 90),
            };
        })(),
    };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
