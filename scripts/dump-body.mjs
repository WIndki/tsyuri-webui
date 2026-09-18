import { readFileSync } from "node:fs";

/**
 * Prints the server-rendered body with style and script contents removed, so the markup a browser
 * receives before hydration can be read directly.
 *
 * Usage: node scripts/dump-body.mjs <file>
 */

const file = process.argv[2];
if (!file) {
    console.error("usage: node scripts/dump-body.mjs <html-file>");
    process.exit(1);
}

const html = readFileSync(file, "utf8");

const body = html
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<link[^>]*>/g, "")
    .replace(/\s+/g, " ");

const start = body.indexOf("<body");
console.log(body.slice(start, start + 3000));
