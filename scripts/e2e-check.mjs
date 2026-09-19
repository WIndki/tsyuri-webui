/**
 * End-to-end checks against a running production server.
 *
 * Usage:
 *   npm run build && npx next start -p 4300 &
 *   node scripts/e2e-check.mjs [baseUrl]
 *
 * These run against the real upstream index, so they verify the parts that unit tests cannot:
 * that the parsing layer neutralises hostile URL parameters, that every filter reaches upstream
 * in the form it expects, and that the page still renders when a query matches nothing.
 */

const BASE = process.argv[2] ?? "http://127.0.0.1:4300";

let passed = 0;
let failed = 0;

/**
 * Runs one check.
 *
 * `expect` receives the response status and body so a check can assert on either. Failures are
 * collected rather than thrown, so one broken case does not hide the rest.
 */
async function check(name, path, expect) {
    const url = `${BASE}${path}`;
    let status;
    let body;

    try {
        const response = await fetch(url);
        status = response.status;
        body = await response.text();
    } catch (error) {
        failed += 1;
        console.error(`FAIL  ${name}\n      request threw: ${error.message}`);
        return;
    }

    const problem = expect({ status, body });
    if (problem) {
        failed += 1;
        console.error(`FAIL  ${name}\n      ${problem}`);
        return;
    }

    passed += 1;
    console.log(`ok    ${name}`);
}

/**
 * Counts rendered book cards in a server response.
 *
 * A card is an `<article>`, which is what `BookCard` renders. This has to be countable from raw
 * HTML with no JavaScript, because the point of these checks is that the results are in the initial
 * document rather than fetched after hydration.
 */
const cardCount = (body) => (body.match(/<article[\s>]/g) ?? []).length;

/** Every page must be a rendered document, never an error page. */
const isRenderedPage = ({ status, body }) => {
    if (status !== 200) return `expected HTTP 200, received ${status}`;
    if (!body.includes("<title>")) return "response has no <title>, so it is not a rendered page";
    return null;
};

console.log(`Checking ${BASE}\n`);

await check("home renders", "/", isRenderedPage);

await check("search renders results server-side", "/search", ({ body, ...rest }) => {
    const base = isRenderedPage({ body, ...rest });
    if (base) return base;
    const cards = cardCount(body);
    if (cards === 0) return "no book cards in the server-rendered HTML";
    return null;
});

await check("keyword search renders and titles the page", "/search?keyword=%E5%9C%A3%E5%A5%B3", (r) => {
    const base = isRenderedPage(r);
    if (base) return base;
    if (!r.body.includes("<title>")) return "missing title";
    if (cardCount(r.body) === 0) return "no results for a keyword that upstream matches";
    return null;
});

await check("tag filter applies", "/search?tag=%E7%99%BE%E5%90%88", (r) => {
    const base = isRenderedPage(r);
    if (base) return base;
    if (cardCount(r.body) === 0) return "no results for a tag that upstream matches";
    return null;
});

await check("source filter applies", "/search?source=SF%E8%BD%BB%E5%B0%8F%E8%AF%B4", (r) => {
    const base = isRenderedPage(r);
    if (base) return base;
    if (cardCount(r.body) === 0) return "no results for a source that upstream matches";
    return null;
});

await check("purity threshold applies", "/search?purity=1", (r) => {
    const base = isRenderedPage(r);
    if (base) return base;
    if (cardCount(r.body) === 0) return "no results for the strictest purity threshold";
    return null;
});

await check("pagination renders a later page", "/search?curr=2&limit=12", (r) => {
    const base = isRenderedPage(r);
    if (base) return base;
    if (cardCount(r.body) === 0) return "page 2 rendered no cards";
    return null;
});

await check("an out-of-range page is clamped and renders", "/search?curr=99999", (r) => {
    const base = isRenderedPage(r);
    if (base) return base;
    /*
     * `PAGE_BOUNDS` clamps to 5000, and the unfiltered index holds roughly 3,780 pages, so this
     * request legitimately returns results. Clamping rather than failing is what keeps an absurd
     * URL from producing a blank page, and it also bounds what a hostile client can ask upstream
     * to skip through.
     */
    if (cardCount(r.body) === 0) return "expected the page number to be clamped into range";
    return null;
});

await check("a keyword that matches nothing renders an empty state", "/search?keyword=zzzznomatch9999", (r) => {
    const base = isRenderedPage(r);
    if (base) return base;
    if (cardCount(r.body) !== 0) return "expected no cards for a keyword with no matches";
    return null;
});

/*
 * Hostile parameters.
 *
 * Upstream answers an unrecognised `sort` or a letter-grade `purity` with HTTP 200 and
 * `{"code":"500","data":null}`, and treats `limit=0` as "return the entire 87,233-record table"
 * (103 MB, 163 s). Forwarding any of these verbatim would produce a blank page or a stalled
 * request; the parsing layer is what turns them into defaults.
 */
const hostileParams = [
    "sort=BOGUS_SORT",
    "curr=abc&limit=abc",
    "limit=0",
    "limit=-5",
    "purity=A",
    "bookStatus=abc",
    "updatePeriod=14.5",
    "curr=-1",
    "tag=nonexistenttag",
];

for (const params of hostileParams) {
    await check(`hostile parameter neutralised: ${params}`, `/search?${params}`, (r) => {
        const base = isRenderedPage(r);
        if (base) return base;
        if (cardCount(r.body) === 0) {
            return "expected the invalid value to fall back to a default that still returns results";
        }
        return null;
    });
}

/*
 * A keyword whose truncation boundary falls inside an emoji.
 *
 * Truncating by UTF-16 code unit leaves a lone surrogate at the cut, and `encodeURIComponent` throws on one, so this
 * request used to fail the whole route with HTTP 500 rather than rendering a page with no matches.
 */
const boundaryKeyword = `${"a".repeat(99)}${String.fromCodePoint(0x1f600)}`;
await check(
    "a keyword truncated inside an emoji still renders",
    `/search?keyword=${encodeURIComponent(boundaryKeyword)}`,
    (r) => isRenderedPage(r),
);

/* The manifest must reference icons that actually exist. v1's referenced four files that did not. */
const manifestResponse = await fetch(`${BASE}/manifest.webmanifest`);
if (manifestResponse.status !== 200) {
    failed += 1;
    console.error(`FAIL  manifest: expected HTTP 200, received ${manifestResponse.status}`);
} else {
    passed += 1;
    console.log("ok    manifest is served");

    const manifest = await manifestResponse.json();
    for (const icon of manifest.icons ?? []) {
        const iconResponse = await fetch(`${BASE}${icon.src}`, { method: "HEAD" });
        if (iconResponse.status === 200) {
            passed += 1;
            console.log(`ok    manifest icon exists: ${icon.src}`);
        } else {
            failed += 1;
            console.error(
                `FAIL  manifest icon missing: ${icon.src} returned ${iconResponse.status}`,
            );
        }
    }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
