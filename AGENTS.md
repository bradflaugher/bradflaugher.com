# Repository guide for AI agents

This is the source for **bradflaugher.com**, a personal website hosted on
Cloudflare Pages. There is no build step — every file you see is shipped
verbatim. Two pages do real work:

| Page          | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| `index.html`  | Static landing page (Garamond serif, contact links, custom font, gradient bg). No JS logic worth describing. |
| `search.html` | A self-hosted, in-browser **semantic search router**: classify the user's query and redirect them to the best engine (DuckDuckGo, YouTube, GitHub, Wolfram Alpha, Maps, Amazon, Bing Images, Perplexity, Grok, or a direct link). |

The rest of the repo supports `search.html` or is static assets.

---

## Repository layout

```
.
├── index.html                       # Landing page
├── search.html                      # Search router (semantic + bangs + direct)
├── search-embeddings.json           # ~3.5 MB of pre-computed L2-normalized vectors
├── search.webmanifest               # PWA manifest for the search page
├── models/
│   └── sentence-transformers/
│       └── all-MiniLM-L6-v2/
│           ├── config.json
│           ├── tokenizer.json
│           ├── tokenizer_config.json
│           ├── special_tokens_map.json
│           └── onnx/
│               └── model_quantized.onnx   # ~22 MB, the only ONNX file we ship
├── tests/
│   └── search.spec.ts               # Playwright E2E test suite
├── playwright.config.ts             # Playwright runner config
├── serve.json                       # Local `npx serve` config (cleanUrls: false)
├── package.json / package-lock.json # Dev deps only (Playwright, serve)
├── _headers                         # Cloudflare Pages cache headers
├── .github/workflows/
│   ├── deploy.yml                   # CF Pages deploy
│   └── search-tests.yml             # Runs the Playwright suite on PRs
├── fonts/                           # Custom Garamond Classico SC for index.html
├── favicon-*.png, og-image*.png     # Static assets
└── tot.pdf                          # PDF download linked from index.html
```

---

## How `search.html` works

A single self-contained HTML/CSS/ES-module file. No bundler. The script
classifies the user's query through three layers, in this order:

1. **Bang shortcuts** (`!yt`, `!gh`, `!w`, `!a`, `!m`, `!i`, `!p`, `!d`,
   plus their aliases). Pure rule-based, instant, never touches the model.
   See `BANG_MAP` in the script.

2. **Direct-URL detection.** If the query has no spaces and matches a
   domain-shaped or `localhost[:port]` regex, classify as `direct` and
   open it as a URL. Also rule-based.

3. **Semantic routing** (the interesting part):
   - Embed the query with `sentence-transformers/all-MiniLM-L6-v2` (384-dim,
     q8-quantized ONNX, ~22 MB), running entirely in-browser via
     `@huggingface/transformers` v3 (CDN-loaded ESM, WebGPU/WASM backend).
   - Compare against pre-computed example-sentence embeddings from
     `search-embeddings.json`. Each route (`youtube`, `wolfram`, …) has
     ~50 example phrases.
   - **Each route's similarity score = max dot product over its examples**
     (nearest-neighbor pooling — more robust than averaging when example
     phrasings vary widely).
   - If the top score ≥ `SIMILARITY_THRESHOLD` (`0.30`), route there;
     otherwise fall back to DuckDuckGo.

The hint under the input shows the chosen engine; a small scores panel in
the bottom-left shows all 9 route similarities for transparency. Pressing
Enter (or visiting `/search.html?q=…`) navigates with a 1.5 s cancellable
delay.

### Embedding-comparison invariants

- **Both sides are L2-normalized**, so cosine similarity ≡ dot product. We
  enforce this on the runtime side via `extractor(..., { normalize: true })`
  and verified the route side once with:
  ```bash
  python3 -c "
  import json, math
  for r in json.load(open('search-embeddings.json')):
      for v in r['vectors']:
          assert abs(math.sqrt(sum(x*x for x in v)) - 1) < 1e-6
  print('all normalized')
  "
  ```
- The `dot()` function is the hot path. Keep it allocation-free; route
  vectors are converted to `Float32Array` once at load time.
- Route vectors total ~461 × 384 ≈ 177 K multiplications per query — fast
  enough on the main thread (no Web Worker needed for this scale).

### Critical pitfall: `dtype` must match the shipped ONNX file

We ship exactly one model file: `model_quantized.onnx`. In
`@huggingface/transformers` v3 that filename is selected by `dtype: 'q8'`.
Any other dtype (e.g. `'fp32'` → `model.onnx`) will request a missing file.

**Cloudflare Pages serves missing assets as a 200 with the SPA-fallback
HTML**, which the ONNX runtime then tries to parse as protobuf and throws:

```
Failed to load model because protobuf parsing failed.
```

If you change `dtype`, ship the matching ONNX file. Don't trust 404s to be
loud — they aren't here.

### State machine, briefly

```
        ┌──────────────┐                ┌──────────────┐
input → │ classifyRules │ ── bang/dir ─→│ route immediately
        └──────────────┘                └──────────────┘
              │ (no rule match)
              ▼
        ┌──────────────┐    ≥ 0.30     ┌──────────────┐
        │  classify()   │ ───────────→  │  best engine │
        │  via model    │                └──────────────┘
        └──────────────┘    < 0.30     ┌──────────────┐
                            ───────→    │  DuckDuckGo  │
                                        └──────────────┘
```

`updateHint()` runs on every keystroke (debounced 150 ms). It uses a
monotonically-increasing `hintSeq` token so older inferences are dropped
on arrival — the latest input always wins.

### Mobile keyboard awareness

`position: fixed` is anchored to the layout viewport on iOS Safari, so the
soft keyboard hides bottom-fixed elements. We solve this two ways:

1. `interactive-widget=resizes-content` in the viewport meta — modern
   Chrome/Safari will shrink the layout viewport itself when the keyboard
   appears (no JS needed there).
2. A `visualViewport` listener computes
   `inset = innerHeight - vv.height - vv.offsetTop` and writes it to a
   `--keyboard-inset` CSS variable. `.scores-panel` and `.status-dot` add
   it to their `bottom` offset. This is the fallback path for older iOS.

### Test hooks

The page exposes structured state via data-attributes so tests don't have
to scrape user-facing text:

| Element        | Attribute             | Values                                           |
| -------------- | --------------------- | ------------------------------------------------ |
| `#status`      | `data-state`          | `loading` \| `ready` \| `failed`                 |
| `<body>`       | `data-engine`         | engine key (e.g. `youtube`); absent when no query |
| `.score-row`   | `data-engine`         | engine key for that row                          |
| `#error-banner`| `.active` class       | added when model load fails                      |

---

## Local development

### One-time setup
```bash
npm ci
npx playwright install --with-deps chromium
```

### Running the page locally
```bash
npx serve -l 3000 .
# then visit http://localhost:3000/search.html
```

`serve.json` sets `cleanUrls: false` so `/search.html?q=…` is served
directly. Without that, the default `serve` 301-redirects `/search.html` →
`/search` and **drops the query string**, breaking `?q=` redirect tests.
(Cloudflare Pages does the same redirect in production but preserves the
query string, so this quirk is purely a local-server thing.)

### Running the E2E tests

```bash
# Full suite, list reporter
npx playwright test

# In CI mode (retries=1, traces/video on failure, HTML report)
CI=1 npx playwright test

# A single describe block
npx playwright test -g "bang shortcuts"

# A single test, with the browser visible
npx playwright test -g "cancel stops" --headed

# Step through interactively
npx playwright test --debug

# Open the last HTML report
npx playwright show-report

# Replay a trace from a failed CI run
npx playwright show-trace test-results/.../trace.zip
```

The webServer block in `playwright.config.ts` auto-starts `npx serve` on
port 3000 — you don't have to start it manually.

First cold run downloads the ~22 MB ONNX model from `localhost`, so the
first test takes a few extra seconds. Subsequent specs in the same run
reuse the on-disk model file (browser caching is short-lived because each
test gets a fresh context).

### What the tests cover (18 specs, ~50 s wall clock)

| Group                                     | Coverage |
| ----------------------------------------- | -------- |
| boot                                      | model loads, status reaches `ready`, no console errors |
| bang shortcuts (parametrized × 7)         | each `!x` routes to the right host (encoding-agnostic) |
| `?q=` redirect                            | auto-redirect for `?q=!yt+lofi`; empty `?q=` stays put |
| direct URL detection                      | `github.com` / `localhost:3000` → direct; phrase with space → not direct |
| semantic routing                          | scores panel renders 9 rows with one `.best`, hint matches `data-engine`, no stale UI on rapid input |
| cancel button                             | overlay hides, focus restored, query intact (uses `addInitScript` to stub `location.replace` so the 1.5 s timer can't race the click) |
| mobile keyboard awareness                 | a synthetic `visualViewport` resize lifts `.scores-panel` by ~350 px |

### Updating the embeddings file

`search-embeddings.json` is a hand-curated set of example queries per
route, embedded once and committed. There is no build script in this repo;
the file was generated externally. To add or remove examples, the simplest
path is to regenerate from a Python script using
`sentence-transformers/all-MiniLM-L6-v2` with `normalize_embeddings=True`,
producing the same `[{ key, vectors: [[…384 floats…], …] }, …]` shape.
The JSON must keep all vectors L2-normalized — that's the invariant the
`dot()` shortcut relies on.

If you regenerate the file, sanity-check it with the snippet under
"Embedding-comparison invariants" above, and verify all 9 route keys
(`ddg`, `bing-images`, `perplexity`, `grok`, `maps`, `youtube`, `amazon`,
`github`, `wolfram`) are present. `direct` is rule-based and has no
vectors.

---

## CI

`.github/workflows/search-tests.yml` runs the Playwright suite on PRs and
pushes to `main` when any of these change:

- `search.html`
- `search-embeddings.json`
- `tests/**`
- `playwright.config.ts`
- `serve.json`
- `models/**`
- the workflow itself

Caches `~/.cache/ms-playwright` keyed on `package-lock.json`, uploads the
HTML report as an artifact (`playwright-report/`, 14-day retention).

`.github/workflows/deploy.yml` handles the Cloudflare Pages deploy.

---

## Common gotchas / things to check first

1. **"protobuf parsing failed" in production but not locally** → `dtype`
   in `search.html` doesn't match a shipped ONNX file. CF Pages 200s the
   SPA-fallback HTML for missing static assets.

2. **Query parameter test times out locally but works in prod** → you're
   missing `serve.json`, or it's not being picked up. Verify with
   `curl -I http://localhost:3000/search.html?q=foo` — it should return
   `200`, not `301 Location: /search`.

3. **Stale hint after rapid typing** → the `hintSeq` race-token logic in
   `updateHint()` was bypassed (e.g., someone re-introduced the old
   `isProcessing` flag). Latest keystroke must always be the one that
   wins.

4. **Scores look weirdly compressed (e.g., everything 17–25 %)** → check
   that `extractor(..., { normalize: true })` is still set and that the
   embeddings file is still L2-normalized. Without normalization, dot
   products can run wild and the similarity threshold becomes meaningless.

5. **Cancel test flakes** → the 1.5 s redirect timer is racing the
   Playwright click. Make sure the `location.replace` stub uses
   `page.addInitScript(...)` (set BEFORE page load), not `page.evaluate`
   after-the-fact.

6. **Mobile keyboard hides the scores panel** → check that the JS
   `visualViewport` block is still present and that `.scores-panel` /
   `.status-dot` use `bottom: calc(2rem + var(--keyboard-inset, 0px))`.
