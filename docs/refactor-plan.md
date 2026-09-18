# Refactor: modern SSR rebuild

Branch: `refactor/modern-ssr` · worktree: `.worktrees/modern-ssr`

This document is the working agreement for the v1 → v2 rewrite. It records *why* each
decision was made, because several of them are non-obvious and would otherwise be
re-litigated by the next person (or agent) to touch the repo.

---

## 1. What v1 got right, and what it got wrong

### Kept

- The reverse-proxy idea. Upstream is a third-party index; fronting it from our own origin
  removes CORS from the picture and lets us add caching and normalization in one place.
- The filter surface. The parameter set the UI exposes matches what the upstream API
  actually supports, which is not true of most search UIs.
- `displayMode` (infinite scroll vs. pagination) as a first-class user preference with iOS
  defaulting to pagination.

### Rejected, with reasons

| v1 approach | Why it was dropped |
| --- | --- |
| Redux Toolkit + RTK Query for everything | The entire app has exactly one remote data source and no cross-page shared client state. Search state was already mirrored into the URL by a listener middleware, so Redux was a second copy of the URL — one that could and did drift from it. `useSearchParams()` is now the single source of truth. |
| Three near-duplicate data hooks (`useInfiniteBooks`, `usePaginatedBooks`, `useLazyBooks`) | Identical logic copy-pasted three times, including a `setTimeout(0)`-wrapped `setState` that created races when paging quickly. Replaced by one server-side query function plus one client hook. |
| `history.pushState` driven by a Redux listener | Bypasses the Next.js router, so the App Router never learns about the navigation. Replaced by `useRouter()` + `startTransition`. |
| Every component split into `index.tsx` + `XxxUI.tsx` + `useXxx.ts` | Applied mechanically, it produced files whose "logic hook" returned a constant, and prop chains that passed `dispatch` through three layers. Split by *responsibility* now: a component is a Server Component until it needs interactivity. |
| Client-side-only rendering | First paint required hydration → `router.isInitialized` → fetch → render. Result pages are now server-rendered from `searchParams`, so the HTML already contains the books. |
| `react-infinite-scroll-component` | Unmaintained, its React 19 support is unofficial. A ~40-line `IntersectionObserver` sentinel replaces it. |
| `axios` | Was a dead dependency; requests already went through `fetchBaseQuery`. |
| `@ant-design/v5-patch-for-react-19` | Only needed for antd v5. antd v6 supports React 19 natively. |

---

## 2. Data flow

```
              ┌──────────────────────────────────────────┐
  URL  ──────►│ app/search/page.tsx  (Server Component)  │
/search?…     │  • awaits searchParams                   │
              │  • parses + validates into SearchQuery   │
              └───────────────┬──────────────────────────┘
                              │  getBookPage(query)   [server, cached]
                              ▼
              ┌──────────────────────────────────────────┐
              │ lib/server/bookIndex.ts                  │
              │  • fetch(upstream, { next: { revalidate }})
              │  • 8s timeout via AbortSignal.timeout     │
              │  • normalizes envelope → Result<T>        │
              └───────────────┬──────────────────────────┘
                              │  BookPage { items, total, … }
                              ▼
              ┌──────────────────────────────────────────┐
              │ <BookGrid>  Server Component             │
              │   emits N × <BookCard> as static HTML    │
              └───────────────┬──────────────────────────┘
                              │  hydrates
                              ▼
              ┌──────────────────────────────────────────┐
              │ Client islands (only these):             │
              │  • <SearchBar>      useRouter()          │
              │  • <FilterPanel>    useRouter()          │
              │  • <ThemeToggle>    localStorage         │
              │  • <LoadMore>       IntersectionObserver │
              │  • <BookDetail>     antd Drawer          │
              └──────────────────────────────────────────┘
```

Key consequence: **adding a page of results is a server round-trip**, not client-side state
accumulation. `?curr=2` renders server-side and the client stops owning the list.

---

## 3. Server vs. client boundary

| Concern | Where it lives | Why |
| --- | --- | --- |
| Search query parsing/validation | `lib/search/query.ts`, pure | Must run on both sides; must be testable without React |
| Upstream fetching | `lib/server/*` | `server-only`; keeps tokens/hosts off the client |
| Filter option tables | `lib/search/options.ts`, pure | Shared by server render and client controls, no duplication |
| URL navigation | client components via `useRouter` | The router owns history; no manual `pushState` |
| Theme & display-mode prefs | client, `localStorage` read in a blocking inline script | Avoids the flash-of-wrong-theme that v1 had |

`server-only` is imported by `lib/server/*` so importing server code from a Client
Component becomes a build error instead of a silent bundle-size and secret-leak problem.

---

## 4. Caching policy

Product decision: novel metadata changes on the order of hours, searches are cheap to
repeat, and upstream is a volunteer-run index we should not hammer.

| Data | Strategy |
| --- | --- |
| First page of a query (`curr === 1`) | `revalidate: 300` (5 min) — the hot path, shared across users |
| Deeper pages | `revalidate: 900` (15 min) — colder, and less likely to be re-requested |
| Detail view | Derived from the list payload; no extra request at all |

This is why `getBookPage` takes the parsed query rather than a raw string: the revalidate
window is part of the cache key decision, making cache behavior explicit instead of an
accident of the URL.

---

## 5. Upstream contract notes

See `docs/upstream-api.md` for the empirically verified contract. Two behaviours are
worth calling out here because they drive code structure:

1. **The envelope returns numbers as strings.** `pageNum`, `pageSize`, `total` and
   `wordCount` are all strings. v1 did `parseInt()` at every call site and typed them as
   `string`, so consumers could not tell which representation they held. v2 parses once at
   the boundary in `lib/server/normalize.ts` and exposes real `number`s.
2. **Most optional-looking fields are genuinely absent.** v1's `Book` type declared
   `userTag: string` while the API returns `null`, which type-checked but would have
   thrown at runtime. v2 types them as `| null` from the probe results, not from
   assumption.

---

## 6. Verification gates

Every phase must pass:

```
npm run typecheck   # tsc --noEmit, strict + noUncheckedIndexedAccess
npm run lint        # eslint flat config (v1 had none)
npm run build       # next build (Turbopack)
npm run e2e         # HTTP checks against a running `next start` (see scripts/e2e-check.mjs)
```

`npm run e2e` talks to the real upstream index, so it covers what unit tests cannot: that the
parsing layer neutralises hostile URL parameters, that each filter reaches upstream in the form it
expects, and that the page still renders when a query matches nothing.

---

## 6b. Values that survive caching must be JSON-representable

`unstable_cache` serializes whatever its inner function returns with `JSON.stringify` and parses it
back on a hit (verified in `next/dist/server/web/spec-extension/unstable-cache.js`).

This is invisible until it breaks. A `Date` in the domain model type-checks as a `Date`, is stored
as an ISO string, and comes back as a `string` — so the type is a lie that the compiler cannot
catch, and the failure appears far from its cause:

```
TypeError: a.getTime is not a function
```

Two consequences for the data layer:

1. **`Book.updatedAtMs` is epoch milliseconds, not a `Date`.** One representation survives caching,
   the server/client boundary, and the Server Action boundary unchanged. `formatRelativeDate`
   converts it for display and `formatAbsoluteDate` for a `title` attribute.
2. **There is no serialization layer.** An earlier iteration added `SerializedBook` plus
   `serializeBook`/`deserializeBook` to convert between a `Date`-carrying `Book` and a
   wire-safe variant. Once the timestamp became a number the two shapes were identical, so that
   whole layer was removed.

The same rule bounds what `formatRelativeDate` may do: labels are coarse ("3天前") and `now` is
pinned once per request, because a minutes-precision label would differ between the server render
and hydration.

---

## 7. antd v6 + Server Components: what actually works

Recorded here because each of these cost a build failure to discover, and none is obvious from
the migration guide.

### Compound components cannot cross the RSC boundary

`Layout`, `Card`, `Typography`, `Space` and friends are *compound*: their sub-parts are attached
to the exported object at runtime (`Layout.Content = Content`).

antd marks every module `"use client"`. From a Server Component, Next.js therefore sees the
export as a **client reference** — a stub carrying only `$$typeof`, `$$id`, `$$async`. Custom
statics are **not** copied onto that stub, so:

```tsx
// Server Component — throws "Element type is invalid", because Layout.Content is undefined
import { Layout } from "antd";
const { Content } = Layout;          // undefined
<Layout.Content />                    // undefined
```

The sub-parts are not re-exported from the package root either (`antd/es/index.js` exports only
the default `Layout`), so a Server Component cannot reach `Content` at all.

**Rule:** in a Server Component, only use antd components imported by their own name. Anything
reached through a parent's static properties must live in a Client Component. For layout in
particular, a few lines of CSS is the better answer anyway — it ships no JavaScript.

### API changes that break v5 code

| v5 | v6 | Notes |
| --- | --- | --- |
| `<Divider orientation="left">` | `<Divider titlePlacement="start">` | `orientation` now means the axis (`horizontal`/`vertical`) |
| `theme={{ algorithm: "dark" }}` | `theme={{ algorithm: theme.darkAlgorithm }}` | No longer accepts a string |
| `<ConfigProvider cssVar>` | `<ConfigProvider theme={{ cssVar: {...} }}>` | `cssVar` is no longer a top-level prop |
| `Collapse.Panel` | `Collapse items={[...]}` | Already true in late v5; v1 still used `Panel` |
| `@ant-design/v5-patch-for-react-19` | not needed | v6 supports React 19 natively |
| `destroyOnClose` | `destroyOnHidden` | On `Drawer`/`Modal` |

### `optimizePackageImports` is not needed

antd v6 ships proper ESM and tree-shakes on its own. The `experimental.optimizePackageImports`
rewrite that v5-era projects rely on adds a failure mode (it rewrites barrel imports into deep
imports, which interacts badly with compound components) for no measurable benefit here. It was
removed from `next.config.ts`.

### The confirmed availability rule

Measured by rendering a Server Component that reports `typeof` for each export during prerender:

| export | typeof in a Server Component |
| --- | --- |
| `Button`, `Card`, `Empty`, `Space`, `Tag`, `Typography` | `"function"` |
| `Typography.Text` / `.Title` / `.Paragraph` | `"undefined"` |
| `Space.Compact` | `"undefined"` |
| `Card.Meta` | `"undefined"` |
| `Empty.PRESENTED_IMAGE_SIMPLE` | `"undefined"` |

Only top-level exports are reachable. Every compound sub-component is `undefined`, so any component
that needs one has to be a Client Component, and anything that must stay a Server Component uses
plain HTML with a CSS module.

