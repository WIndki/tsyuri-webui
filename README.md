# tsyuri-webui

A read-only search interface for a Chinese web-novel index. It exposes upstream's filter surface
(tag, source, word count, purity, update recency, completion status, sort) in a grid of covers, and
adds a detail route per book.

All data comes from [`index.tsyuri.com`](https://index.tsyuri.com). This application stores no
content and serves no chapter text; cover art remains the property of the original authors and
source platforms.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run verify       # typecheck + lint + build
npm run build && npm start
npm run e2e          # 23 checks over HTTP against a running server
npm run e2e:browser  # 13 checks in Chrome via Playwright
npm run check:deprecations  # walks the controls, reports console warnings (needs dev server)
npm run screenshots  # writes .screenshots/ for visual review
```

`npm run e2e` and `npm run e2e:browser` read the live upstream index, so they need a built server
running and network access. Both take the base URL as an optional argument, defaulting to
`http://127.0.0.1:4700`.

`npm run check:deprecations` must run against `npm run dev`, because React strips the warnings it
looks for from a production build. It is how the antd v6 `Space` prop rename was found.

If the machine reaches the network through a proxy, set `HTTPS_PROXY` (and `NO_PROXY` for the hosts
that should bypass it). Node's `fetch` does not read those variables on its own, so
`src/lib/server/proxy-dispatcher.ts` installs a dispatcher that does.

## Layout

```
src/app/            routes: /, /search, /book/[id], manifest, not-found
src/components/     Server Components, with Client islands only where interaction is needed
src/lib/api/        transport types, domain model, validation, error kinds
src/lib/search/     query parsing and canonical URL construction
src/lib/server/     upstream reader, cache, Server Actions, proxy dispatcher
src/lib/theme/      theme preference and the pre-paint bootstrap script
docs/               architecture decisions and the verified upstream contract
scripts/            end-to-end checks and screenshot capture
```

## How it works

The search page is a Server Component. It parses `searchParams` into a validated query, reads the
upstream index on the server, and renders the result cards into the HTML — so the first page of
results is in the initial document, before any JavaScript runs.

The URL is the only source of truth for what is being searched, including which presentation mode is
in use (`?display=pagination`). Client Components exist for the keyword field, the facet controls, the
pager, the infinite-scroll sentinel and the preference toolbar; nothing else ships JavaScript.

`docs/refactor-plan.md` explains why each of those decisions was made, including the ones that are
not obvious — why the display mode cannot be a client preference, why cached values must be
JSON-representable, and which antd components are reachable from a Server Component.
`docs/upstream-api.md` documents the upstream endpoint as measured, including its failure modes.
