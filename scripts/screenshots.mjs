import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

/**
 * Captures screenshots of each view in both themes.
 *
 * Usage: node scripts/screenshots.mjs [baseUrl]
 *
 * Chrome is used through `channel` so no browser download is needed. The images land in
 * `../screenshots/` at the repository root, which is git-ignored: they exist to be looked at
 * while reviewing the interface, not to be committed.
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:4600";
const OUT = new URL("../.screenshots/", import.meta.url).pathname.replace(/^\//, "");

mkdirSync(OUT, { recursive: true });

const VIEWS = [
    { name: "home", path: "/", theme: "light", full: true },
    { name: "home-dark", path: "/", theme: "dark", full: true },
    { name: "filtered", path: "/search?tag=%E7%99%BE%E5%90%88&purity=1", theme: "light", full: true },
    { name: "keyword", path: "/search?keyword=%E5%9C%A3%E5%A5%B3", theme: "light", full: false },
    { name: "empty", path: "/search?keyword=zzzznomatch9999", theme: "light", full: false },
    { name: "mobile", path: "/", theme: "light", mobile: true, full: false },
];

const browser = await chromium.launch({ channel: "chrome" });

for (const view of VIEWS) {
    const context = await browser.newContext({
        viewport: view.mobile
            ? { width: 390, height: 844 }
            : { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        // The theme is stored client-side, so it has to be seeded before the page loads or the
        // bootstrap script will render the default.
        storageState: undefined,
    });

    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

    await page.addInitScript(
        ([key, theme]) => {
            window.localStorage.setItem(key, theme);
        },
        ["tsyuri.theme", view.theme],
    );

    /*
     * `domcontentloaded` rather than `networkidle`: cover images come from third-party hosts that
     * are frequently slow or unreachable, so waiting for the network to go quiet would time out on
     * a page that is fully rendered. What matters is that the grid exists, which is awaited below.
     */
    await page.goto(`${BASE}${view.path}`, { waitUntil: "domcontentloaded" });

    // The grid is rendered by a client island that waits for the stored display-mode preference,
    // so wait for a real card rather than for the network to settle.
    await page.waitForSelector("article", { timeout: 30000 }).catch(() => {});

    /*
     * Scroll the whole document to trigger lazy image loading.
     *
     * Covers below the first rows use `loading="lazy"`, which the browser resolves against the
     * viewport. A `fullPage` screenshot composes the entire document without ever moving the
     * viewport, so anything below the fold keeps an empty frame — the capture shows blank covers
     * on a page that is correct. Scrolling through first forces every image to load.
     */
    await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.8);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 120));
        }
        window.scrollTo(0, 0);
    });

    /*
     * Then wait for the images to be fully decoded, not merely downloaded.
     *
     * `img.complete` only means the resource is available; Chromium still decodes lazily, and a
     * capture taken before decode finishes paints partial covers even though the layout is uniform.
     */
    await page
        .waitForFunction(
            async () => {
                const images = [...document.querySelectorAll("img")];
                await Promise.all(
                    images.map((img) =>
                        img.complete ? img.decode().catch(() => {}) : Promise.resolve(),
                    ),
                );
                return true;
            },
            undefined,
            { timeout: 30000 },
        )
        .catch(() => {});

    const file = `${OUT}/${view.name}.png`;
    await page.screenshot({ path: file, fullPage: view.full, animations: "disabled" });

    const cardCount = await page.locator("article").count();
    console.log(
        `${view.name.padEnd(12)} cards=${String(cardCount).padStart(3)}  errors=${consoleErrors.length}  ${file}`,
    );

    for (const error of consoleErrors) {
        console.log(`    console error: ${error.slice(0, 160)}`);
    }

    await context.close();
}

await browser.close();
