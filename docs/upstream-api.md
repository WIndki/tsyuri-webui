# `searchByPage` — upstream API reference

`GET https://index.tsyuri.com/book/searchByPage` is the public, read-only, unauthenticated JSON endpoint that backs the tsyuri book index. It is the only endpoint this front end needs.

Every claim in this document was established empirically against the live endpoint. Nothing here is inferred from upstream documentation, and nothing here is speculation: where a question could not be answered by probing, it is listed under [Open questions](#open-questions) rather than guessed at.

The evidence base is a corpus of **1,823 `list` items** collected across **4 sort modes × 3 pages** plus keyword, tag, source and deep-page queries, spanning **1,469 distinct book IDs**; a full `limit` sweep from 1 to 100,000 plus `0` and `-5`; more than 30 calls for the `lastIndexId` question; and 12 identical repeat requests that landed on 12 different Cloudflare edge nodes (MXP/MRS/SIN/NRT/KGS/HKG).

## Envelope

On success the body is always exactly this shape:

```json
{"code":"200","msg":"SUCCESS","data":{"pageNum":"1","pageSize":"2","total":"87233","list":[...]}}
```

- Top-level keys are always exactly `code`, `msg`, `data`.
- `code` and `msg` are always strings. On success `code` is `"200"` — a **string**, not a number.
- `data` is an object on success and `null` on failure.
- `data` keys are always exactly `pageNum`, `pageSize`, `total`, `list`.
- `pageNum`, `pageSize` and `total` are all **strings**. Only `list` is an array.

There are exactly **two** failure envelopes, distinguished by `code`:

| `code` | `msg` | `data` | Meaning |
|---|---|---|---|
| `"500"` | `未知异常，请联系管理员！` | `null` | Coercion / type failure |
| `"400"` | `非法参数！` | `null` | Parameter validation failure |

Because `code` is a string, comparison against the number `200` always fails. Compare against `"200"`.

## Failures arrive as HTTP 200

Almost all failures use **HTTP 200 with an in-body `code`**. A client that checks only `response.ok` or `status === 200` will treat failures as success and then crash reading `data.list` off `null`.

| Case | HTTP | Body |
|---|---|---|
| Valid baseline | 200 | `{"code":"200","msg":"SUCCESS",...}` |
| Empty result (keyword or tag that matches nothing) | 200 | `{"code":"200","data":{"pageNum":"1","pageSize":"20","total":"0","list":[]}}` |
| `limit=abc` | 200 | `{"code":"500","msg":"未知异常，请联系管理员！","data":null}` |
| `curr=abc` | 200 | `{"code":"500",...}` |
| `sort=bogus_sort` | 200 | `{"code":"500",...}` |
| `sort=wordcount` (wrong case) | 200 | `{"code":"500",...}` |
| `sort=last_index_update_time DESC` | 200 | `{"code":"500",...}` |
| `purity=A` (letter grade) | 200 | `{"code":"500",...}` |
| `purity=1,2` | 200 | `{"code":"500",...}` |
| `bookStatus=abc` | 200 | `{"code":"400","msg":"非法参数！","data":null}` |
| `wordCountMin=abc` | 200 | `{"code":"400",...}` |
| `updatePeriod=14.5` (float) | 200 | `{"code":"400",...}` |
| `limit=0` | 200 | entire dataset: 87,233 records, 103,602,086 bytes, 163.4 s |
| `limit=-5` | 200 | `{"code":"200","data":{"pageNum":"1","pageSize":"-5","total":"87233","list":[]}}` |
| `limit=` (empty) | 200 | defaults to `pageSize:"20"` |
| `curr=0` | 200 | `pageNum:"0"`, returns **page-1 data** |
| `curr=-1` | 200 | `pageNum:"-1"`, returns **page-1 data** |
| `curr=999999` (past end) | 200 | `{"code":"200","data":{"pageNum":"999999","list":[]}}` |
| No params at all | 200 | defaults: pageNum 1, pageSize 20, total 87233 |
| Garbage params (`foo=bar&baz=qux`) | 200 | fully ignored, defaults returned |
| Raw unencoded UTF-8 in query string | 400 | empty body |
| `Accept: text/html` | 406 | Spring `Whitelabel Error Page` HTML, 698 bytes |
| `Accept: application/xml` | 406 | empty body |
| POST / PUT / PATCH / DELETE | 405 | JSON Spring error mentioning the method |
| OPTIONS with Origin | 403 | plain text `Invalid CORS request` |
| Unknown path (`/book/nope`) | 404 | empty body |

> **What a client must do.** Parsing HTTP status alone is not sufficient and is actively dangerous here. The client must (1) require an HTTP 200 at the transport layer, (2) parse the body as JSON, (3) require `body.code === "200"` — the string, and (4) require `body.data` to be non-null before touching `body.data.list`. Steps 3 and 4 are what actually catch `limit=abc`, `sort=bogus_sort` and every other in-body failure. Conversely, the HTTP-level failures in the table (400 with an empty body, 406, 405, 403, 404) are **not** JSON and must be handled without a guaranteed parse — an empty body is a normal outcome for several of them.

## Field contract

A corpus of 1,823 `list` items was analysed across 4 sort modes × 3 pages plus keyword, tag, source and deep-page queries (1,469 distinct IDs). **All 32 keys were present in 100% of records — no key was ever missing.** There are no optional fields; the only axis of variation is `null` versus a value.

### Fields that were null in every record

Sixteen fields were null in **0 of 1,823** records. Fourteen are listed here as unconditionally null. The other two — `lastIndexId` and `lastIndexName` — are deliberately **excluded** from this group and documented in the caveat below.

| Field | Non-null count |
|---|---|
| `workDirection` | 0 of 1,823 |
| `picUrlLocal` | 0 of 1,823 |
| `score` | 0 of 1,823 |
| `visitCount` | 0 of 1,823 |
| `commentCount` | 0 of 1,823 |
| `yesterdayBuy` | 0 of 1,823 |
| `isVip` | 0 of 1,823 |
| `status` | 0 of 1,823 |
| `updateTime` | 0 of 1,823 |
| `createTime` | 0 of 1,823 |
| `crawlSourceId` | 0 of 1,823 |
| `crawlBookId` | 0 of 1,823 |
| `crawlLastTime` | 0 of 1,823 |
| `crawlIsStop` | 0 of 1,823 |

### Fields that were never null and never empty

| Field | Non-null | Empty string |
|---|---|---|
| `id` | 1,823 of 1,823 | never |
| `bookName` | 1,823 of 1,823 | never |
| `authorName` | 1,823 of 1,823 | never |
| `picUrl` | 1,823 of 1,823 | never |
| `wordCount` | 1,823 of 1,823 | never |
| `lastIndexUpdateTime` | 1,823 of 1,823 | never |
| `crawlSourceName` | 1,823 of 1,823 | never |

### Fields that were never null but sometimes an empty string

| Field | Nulls | Empty strings | Note |
|---|---|---|---|
| `purity` | 0 of 1,823 | 1,392 of 1,823 | `""` is the single most common value |
| `tag` | 0 of 1,823 | 4 of 1,823 | |
| `newTag` | 0 of 1,823 | 4 of 1,823 | same records |

### Genuinely nullable fields

| Field | Non-null | Nulls | Pattern |
|---|---|---|---|
| `catId` | 99 of 100 sampled | — | null for 刺猬猫 / 番茄 / 起点 sources |
| `catName` | 1,348 of 1,823 | 475 | null exactly for 刺猬猫 (338) + 番茄 (111) + 起点 (26) |
| `authorId` | 1,459 of 1,823 | 364 | all 364 nulls are 刺猬猫 (338) + 起点 (26) |
| `bookDesc` | 1,820 of 1,823 | 1 | 1 null plus 2 empty strings out of 1,823 |
| `userTag` | 90 of 1,823 (4.9%) | 1,733 | **never** an empty string — always either `null` or a real value |

### Per-field notes

- `bookStatus` — only `"0"` (1,538) or `"1"` (285) observed.
- `wordCount` — numeric string; maximum observed `"15687435"`.
- `lastIndexUpdateTime` — format `"YYYY-MM-DD HH:mm:ss"`, **no timezone**.
- `crawlSourceName` — only 5 values observed: SF轻小说 (1,331), 刺猬猫 (338), 番茄 (111), 起点 (26), 次元姬 (17).
- `tag` — comma-joined CSV.
- `newTag` — **byte-identical to `tag` in 100% of the 1,823 records** (0 differences).
- `purity` — grades observed: `""` (1,392), `A` (75), `---` (73), `--` (70), `-` (64), `A+` (47), `A-` (36), `B` (34), `B+` (32). Note that these are **record values** and are unrelated to what the `purity` *filter* accepts (see [`purity`](#purity--integer-code-not-the-letter-grade)).

### Caveat: `lastIndexId` / `lastIndexName`

These two fields were null in all 1,823 records across 30+ calls, **but they were observed POPULATED once, on the very first call of the investigation.** Twelve identical repeats hit twelve different Cloudflare edge nodes (MXP/MRS/SIN/NRT/KGS/HKG) and all returned null; `total` and `lastIndexUpdateTime` were byte-stable throughout, so this was not edge-cache variance. The trigger could not be reproduced or identified.

Type them `string | null`, not `null`.

## Pagination

- `curr` is **1-based**.
- `curr=0` and `curr=-1` do **not** error; they return page-1 content.
- `pageNum` echoes `curr` verbatim, including `"0"` and `"-1"`.
- Paging is correct: pages 1–5 at `limit=20` yielded 100 IDs, all distinct, no pairwise overlap.
- `total` stayed `"87233"` across all pages, sorts and limits tested.
- Ordering is stable across page sizes: `limit=7` page 1 equals the first 7 IDs of `limit=20` page 1.
- Deep pages work: `curr=50` and `curr=400` at `limit=100` each returned 100 items.
- Past the end: `curr=87234`, `curr=999999` and `curr=1000000` all return HTTP 200, `code:"200"`, `list:[]`. There is **no "invalid page" signal** — an empty `list` is the only indicator.

> **`total` is NOT reliably the number of pageable rows.** For `tag=百合` it reports `"18030"`, but 4 pages of 500 yielded 2,000 distinct records and then `curr=99999` returned empty; the true reachable count differs. For `tag=%2C百合` it reports `"17864"` for an **identical** result set.
>
> Treat `total` as a **display estimate only**, and terminate paging on `list.length === 0` **or** `list.length < limit`.

## `limit`

There is **no clamping and no upper cap**. Measured:

| requested `limit` | echoed `pageSize` | `list` length | bytes | time |
|---|---|---|---|---|
| 1 | `"1"` | 1 | 1,111 | 0.93 s |
| 20 | `"20"` | 20 | 33,635 | 1.34 s |
| 50 | `"50"` | 50 | 82,278 | 0.84 s |
| 100 | `"100"` | 100 | 168,441 | 1.33 s |
| 200 | `"200"` | 200 | 330,212 | 1.43 s |
| 500 | `"500"` | 500 | 825,164 | 2.38 s |
| 1000 | `"1000"` | 1000 | 1,651,148 | 0.93–30.3 s |
| 5000 | `"5000"` | 5000 | 7,606,946 | 5.13 s |
| 10000 | `"10000"` | 10000 | 14,848,215 | 39.8 s |
| 20000 | `"20000"` | 20000 | 28,725,334 | 13.6 s |
| 50000 | `"50000"` | 50000 | 53,644,039 | 34.6 s |
| 100000 | `"100000"` | 87233 (all) | 84,204,661 | >120 s |
| 0 | `"0"` | 87233 (all) | 103,602,086 | 163.4 s |
| -5 | `"-5"` | 0 | 95 | 1.20 s |

**Practical maximum: 500.** `limit=0` is a self-inflicted denial of service — it is interpreted as "no limit" and streams the entire dataset. `limit` must be >= 1.

## Filter parameters

All filters combine with **AND**. Verified: `tag=百合&source=SF轻小说` → 50/50 records satisfied both.

### `keyword`

Substring match over book **name and description**.

Space and comma are treated as **literals, not separators**:

| `keyword` | `total` |
|---|---|
| `魔法少女` | 2,758 |
| `魔法 少女` | 0 |
| `魔法,少女` | 0 |
| `百合` | 4,147 |
| `魔法` | 7,051 |
| `的` | 81,083 |
| `zzzznomatch` | 0 |
| empty | 87,233 |

It was **not determined** whether `authorName` is searched.

### `tag` — single value only

**Send exactly ONE bare percent-encoded tag, with no comma anywhere.**

| `tag` value | `total` | Verification |
|---|---|---|
| `百合` (bare, percent-encoded) | 18,030 | 50/50 records contain `百合` as a tag token |
| `变身` | 16,218 | 50/50 correct |
| `性转` | 2,846 | 50/50 correct |
| `变百` | 20,840 | **0 of 50** records contained `变百` in either `tag` or `userTag` — this specific term's semantics are unexplained |
| `%2C百合` (leading encoded comma) | 17,864 | by ID-set comparison this is the SAME result set in the SAME order as bare `百合` (2,000 vs 2,000 IDs, Jaccard 1.0000, identical first 100 in order) — the leading `%2C` is a no-op for results but **does** perturb the reported `total` |
| `百合,变身` | **0** | |
| `百合,变百` | **84,968** | not a union: 300/300 sampled records matched `百合` only, none matched `变百` |
| `%2C百合%2C变百` (leading comma plus two values) | **0** | |
| `百合子` | 0 | |

Conclusion: multi-value `tag` semantics are unpredictable and internally inconsistent with any simple rule (AND, OR or literal substring). Use a single bare value.

### `source` — exactly one exact name

**This is a strict single-value exact-match enum. EVERY comma-joined form returns 0 results, including a single value with a leading comma.**

| value | `total` | Verification |
|---|---|---|
| `SF轻小说` | 63,660 | 50/50 |
| `刺猬猫` | 20,338 | 50/50 |
| `次元姬` | 1,324 | 50/50 |
| `起点` | 23 | 23/23 |
| `%2CSF轻小说` | 0 | leading comma kills it |
| `SF轻小说,刺猬猫` | 0 | |
| `SF轻小说%2C次元姬` | 0 | |
| `%2CSF轻小说%2C刺猬猫` | 0 | |
| `""` | 87,233 | no filter |
| `,` or `%2C` alone | 0 | |

### `bookStatus`

| value | `total` |
|---|---|
| `0` | 77,412 |
| `1` | 9,821 |
| `""` | 87,233 |
| `2` / `-1` | 0 |
| `abc` | error, `code` 400 |

Returned records verified 50/50.

### `purity` — INTEGER code, NOT the letter grade

Counter-intuitive: the **record field** holds `"A+"`, `"B"`, `"---"`, `""`, but the **filter** takes an integer 1–5 and behaves as a cumulative quality threshold (smaller = stricter; the sets are nested):

| `purity` | `total` | grades actually returned |
|---|---|---|
| omitted / `""` / `0` | 87,233 | all |
| 1 | 1,916 | A+ only |
| 2 | 5,031 | A, A+ |
| 3 | 6,718 | A, A-, A+ |
| 4 | 7,854 | A, A+, A-, B+ |
| 5 | 9,334 | A, A+, A-, B, B+ |
| 100, -1 | 87,233 | all (out of range ignored) |
| `A`, `B`, `A+`, `-`, `--`, `---`, `a`, `Z`, `null`, `1,2` | error | `code` 500 |

### `wordCountMin` / `wordCountMax` — inclusive integer range

| Parameter(s) | `total` |
|---|---|
| `wordCountMin=100000` | 18,213 |
| `wordCountMax=1000` | 2,816 |
| `wordCountMin=100000&wordCountMax=200000` | 7,075 |
| `wordCountMax=100000` | 69,020 |
| `wordCountMin=100000000` | 0 |
| `wordCountMin=0` / `-5` | 87,233 |
| `wordCountMax=0` / `-1` | 0 |
| `wordCountMin=abc` | error, `code` 400 |

Verified in-record: minimum observed 101,154 for `wordCountMin=100000`; the band 100000..200000 had min 101,154 / max 185,714, all in range. The subsets partition exactly: 18,213 + 69,020 = 87,233.

### `updatePeriod` — integer DAYS lookback, data-dependent

Filters on `lastIndexUpdateTime >= now - N days`. **Integer only**; a float is rejected with `code` 400.

| `updatePeriod` | `total` |
|---|---|
| `1`–`7` | 0 |
| `8` | 579 |
| `9` | 923 |
| `10` | 1,055 |
| `13` | 1,312 |
| `14` | 1,369 |
| `20` | 1,663 |
| `30` | 2,047 |
| `0` / `-1` | 0 |
| `""` | 87,233 |

At sampling time the server date was **2026-09-18** and the newest `lastIndexUpdateTime` in the whole dataset was **2026-09-11** — 7 days old — which is exactly why windows of 1–7 days returned zero and 8 was the first non-zero. This is a "recently updated" filter that can legitimately be empty; it is **not a fixed menu** of allowed values.

### Unknown parameters

Silently ignored, no error.

## `sort`

All four documented values are accepted and change ordering (verified monotonic over 40 records each):

| `sort` | Observed ordering |
|---|---|
| `last_index_update_time` | `lastIndexUpdateTime` strictly descending |
| `word_count` | `wordCount` strictly descending |
| `create_time` | `id` descending (IDs are monotonic with creation) |
| `click_purity_score` | Ordering is real but **NOT verifiable from the payload** — neither `purity` nor `wordCount` is monotonic, and the underlying score column is not exposed |

Invalid values are a **HARD ERROR, not a silent fallback**: `bogus_sort`, `wordcount` (wrong case), `last_index_update_time DESC` and `;DROP` all return `code` 500.

Empty string or omitted → HTTP 200 with the default ordering.

Undocumented but valid: `id`, `ID` and `1` all return 200 with the same order as `create_time`. **The default ordering equals that same newest-first ordering.**

## Headers and CORS

- A plain request with **no headers at all** returns HTTP 200 with correct JSON (curl's default `Accept: */*`).
- `Referer` is **not** checked: absent, empty, and foreign (`https://evil.example.com/`) all return identical responses.
- `User-Agent`, `Accept-Language`, `Cache-Control`, `Pragma` and `DNT` are all unnecessary.
- **`Accept` IS load-bearing**: `text/html` → 406, `application/xml` → 406. `application/json`, `*/*`, and the multi-value form `application/json, text/javascript, */*; q=0.01` all work.
- **No CORS headers are ever returned.** `Access-Control-Allow-Origin` is absent from every response, and `OPTIONS` preflight returns 403 `Invalid CORS request`.

> **Verdict: a server-side (same-origin) proxy is genuinely required.** Because `Access-Control-Allow-Origin` is never present and the preflight is rejected outright, a browser **cannot** call this endpoint cross-origin from the Next.js client. There is no header combination, credential mode or request shape that fixes this — the missing CORS headers are the blocker, and only a same-origin server-side hop can work around it. The Next.js server (route handler / server action / SSR data fetch) must make the call and re-serve the result from the app's own origin.

Caching and cookies:

- **No caching headers on the JSON endpoint**: no `Cache-Control`, `Expires`, `ETag` or `Last-Modified`; only `cf-cache-status: DYNAMIC`. Every request hits origin, so **the client must implement its own cache**.
- `Set-Cookie: userClientMarkKey=<32 hex>; Path=/` is set on every response; it is not needed by a read-only client.
- `Accept-Encoding` is honoured: gzip compresses `limit=100` from 168,441 to **56,824 bytes (−66%)**; `br` to **58,584 bytes**.

## Cover images and `/localPic`

`picUrl` is used **verbatim as the path**. `"/localPic/2021/04/05/9cefe20d....jpg"` is served as `https://index.tsyuri.com/localPic/2021/04/05/9cefe20d....jpg` (200, 91,358 bytes, real JPEG 720x902).

Two and only two shapes exist (558 relative / 1,265 absolute out of 1,823; **zero others**):

| Shape | Count | Handling |
|---|---|---|
| relative `/localPic/...` | 558 | the index's own mirror |
| absolute `https://<host>/...` | 1,265 | use as-is, **never rewrite** |

Hosts seen in the absolute group:

| Host | Count |
|---|---|
| `rss.sfacg.com` | 846 |
| `e1.kuangxiangit.com` | 221 |
| `p3-reading-sign.fqnovelpic.com` | 109 |
| `d1.kuangxiangit.com` | 42 |
| `c1.kuangxiangit.com` | 35 |
| `img.ciyuanji.com` | 10 |
| `p9-reading-sign.fqnovelpic.com` | 2 |

`/localPic` is **NOT** a proxy for the third-party hosts — it is an independent mirror that already replaces the foreign URL for the books it holds.

Serving behaviour:

- Real files return 200 with `Cache-Control: max-age=315360000` (about 10 years) and Cloudflare edge caching (`HIT` / `MISS`).
- `/localPic/` (trailing slash) → **500** with a JSON body containing `pic/localPic (Is a directory)`, which reveals the server maps the prefix onto a filesystem path.
- `/localPic` (no slash) → 404.
- Paths under `/localPic/` may contain literal dots as **directory** names, e.g. a 起点 cover path fragment `.cn/qdbimg/349573/1011453734/180`.

> **Critical quirk: a MISSING image returns HTTP 200 with a ZERO-BYTE body**, not 404. A status check cannot detect a broken cover — you must check for an empty body or a non-image content type.

## Performance and caching

- Connection setup is negligible (`time_connect` 0.007–0.023 s); essentially all latency is origin processing, with **TTFB approximately equal to total time**.
- There is a large **fixed per-request cost of about 0.7–1.0 s even for `limit=2`**, and a **marginal cost of about 16.5 KB raw / 5.5 KB gzipped per record**.
- `limit=20` is about **12 KB gzipped and about 1.1 s**; `limit=200` is about **110 KB gzipped and about 1.2 s**.
- Because the fixed cost dominates, `limit=100`–`200` gives roughly **10× the records for roughly 10% more latency**.
- Latency is highly variable, so any proxy timeout must be generous; **`limit <= 500` keeps a 10 s timeout safe**.

Combined with the caching findings above (no `Cache-Control` / `Expires` / `ETag` / `Last-Modified`, `cf-cache-status: DYNAMIC`, every request hitting origin), the practical policy is: prefer `limit=100`–`200`, cache aggressively in the Next.js layer, and never let a client-side interaction issue an uncached upstream request.

## Reproduction commands

```bash
BASE='https://index.tsyuri.com/book/searchByPage'

# Valid baseline: HTTP 200, code "200" (a STRING), data.list has 2 items.
curl -sS "$BASE?curr=1&limit=2"

# limit=abc -> HTTP 200 but code "500" in the body. response.ok calls this a success.
curl -sS "$BASE?limit=abc"

# bookStatus=abc -> HTTP 200 with code "400": parameter validation, not a transport error.
curl -sS "$BASE?bookStatus=abc"

# Past-the-end page: HTTP 200, code "200", list: [] — the only "no more rows" signal.
curl -sS "$BASE?curr=999999&limit=20"

# Wrong-case sort is a hard error, not a silent fallback.
curl -sS "$BASE?sort=wordcount"

# Single bare tag: correct results. Any comma-bearing form is unreliable.
curl -sS --get --data-urlencode 'tag=百合' "$BASE?limit=50"

# source is a strict single-value enum: every comma-joined form returns 0 results.
curl -sS --get --data-urlencode 'source=SF轻小说,刺猬猫' "$BASE?limit=50"

# purity takes an INTEGER 1-5, not the letter grade stored on the record.
curl -sS "$BASE?purity=2&limit=50"
curl -sS "$BASE?purity=A"        # -> code "500"

# No headers at all is enough: no Referer, UA, cookies or auth required.
curl -sS "$BASE?limit=20"

# Accept IS load-bearing: text/html and application/xml are rejected with HTTP 406.
curl -sS -H 'Accept: text/html' -i "$BASE?limit=20"
curl -sS -H 'Accept: application/xml' -i "$BASE?limit=20"

# Preflight from a browser origin is rejected: 403 "Invalid CORS request", no ACAO header.
curl -sS -X OPTIONS -H 'Origin: https://evil.example.com' -i "$BASE"

# Raw unencoded UTF-8 in the query string -> HTTP 400 with an empty body.
curl -sS -i "$BASE?keyword=百合"

# Accept-Encoding is honoured: gzip takes limit=100 from 168,441 to 56,824 bytes.
curl -sS -H 'Accept-Encoding: gzip' -o /dev/null -w 'gzip bytes: %{size_download}\n' "$BASE?limit=100"

# Missing cover on the mirror: HTTP 200 with a ZERO-BYTE body, not 404.
curl -sS -o /dev/null -w '%{http_code} %{size_download}\n' \
  "https://index.tsyuri.com/localPic/<path-to-a-cover-that-does-not-exist>"

# limit=0 means "the entire dataset": 87,233 records, 103,602,086 bytes, 163.4 s. Do not run casually.
# curl -sS "$BASE?limit=0"
```

## Open questions

- What triggers `lastIndexId` / `lastIndexName` to be populated? It happened exactly once, on the first call, and could not be reproduced in 30+ subsequent calls including 12 repeats spread across 12 Cloudflare edge nodes.
- What does `sort=click_purity_score` actually order by? The ordering is real, but neither `purity` nor `wordCount` is monotonic and the underlying score column is not exposed in the payload.
- What is the exact server-side predicate for multi-value `tag`? `百合,变身` → 0, `百合,变百` → 84,968, and `%2C百合%2C变百` → 0, which no simple AND / OR / literal-substring rule explains.
- Why does `total` differ between `tag=百合` (`"18030"`) and `tag=%2C百合` (`"17864"`) when the ID sets are identical (Jaccard 1.0000, identical first 100 in order)?
- Does `/localPic` serve formats other than JPEG?
- Does `keyword` search `authorName` in addition to book name and description? Only name and description were confirmed.
