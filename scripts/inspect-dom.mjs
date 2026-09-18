import { chromium } from "playwright";

/**
 * Reports what the results area actually contains, before and after hydration.
 *
 * Usage: node scripts/inspect-dom.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:4700";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleMessages = [];
page.on("console", (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));
page.on("pageerror", (error) => consoleMessages.push(`pageerror: ${error.message}`));

await page.goto(BASE, { waitUntil: "networkidle" });

const report = await page.evaluate(() => {
    const summary = document.querySelector('[class*="results-summary"]');
    const grid = document.querySelector('[class*="__grid"]');
    const section = document.querySelector('section[aria-label="搜索结果"]');
    const firstCard = document.querySelector("article");
    const main = document.querySelector("main");

    return {
        summaryText: summary?.textContent ?? null,
        hasSection: Boolean(section),
        gridFound: Boolean(grid),
        gridChildCount: grid?.children.length ?? null,
        gridColumnCount: grid
            ? getComputedStyle(grid).gridTemplateColumns.split(" ").length
            : null,
        gridDisplay: grid ? getComputedStyle(grid).display : null,
        articleCount: document.querySelectorAll("article").length,
        firstCardClass: firstCard?.className ?? null,
        firstCardHeight: firstCard ? firstCard.getBoundingClientRect().height : null,
        mainHeight: main ? main.getBoundingClientRect().height : null,
        bodyText: document.body.innerText.slice(0, 400),
    };
});

console.log(JSON.stringify(report, null, 2));
console.log("\nconsole messages:", consoleMessages.length);
for (const message of consoleMessages.slice(0, 10)) {
    console.log("  " + message.slice(0, 200));
}

await browser.close();
