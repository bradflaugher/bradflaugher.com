# Repository notes for AI agents

## Search router (`search.html`)

A static, privacy-preserving search page that classifies the user's query
and redirects to the best-fit engine (DuckDuckGo, YouTube, GitHub, Wolfram,
Maps, Amazon, Bing Images, Perplexity, Grok, or a direct link).

### Architecture

1. **Rule layer** (synchronous, always runs first):
   - Bangs: `!yt`, `!gh`, `!w`, etc. (see `BANG_MAP`)
   - Direct-link detection: domain-like or `localhost[:port]` strings with no spaces
2. **Semantic layer** (only if rules don't match):
   - `sentence-transformers/all-MiniLM-L6-v2`, 384-dim, q8-quantized ONNX
   - Runs in-browser via `@huggingface/transformers` v3 (WebGPU/WASM)
   - Per-route example sentences are pre-embedded into `search-embeddings.json`
   - Each route's similarity score = max dot product over its examples
     (nearest-neighbor pooling)
   - Below `SIMILARITY_THRESHOLD` (0.30) we fall back to DuckDuckGo

### Embedding-comparison invariants

- **Vectors on both sides are L2-normalized**, so cosine similarity == dot
  product. The build-time pipeline emits `normalize: true`; query-time
  `extractor(..., { normalize: true })` enforces it on the runtime side.
  We verified this once with `python3 -c "math.sqrt(sum(x*x for x in v))"`
  giving 1.0 ± 1e-6 for every vector in `search-embeddings.json`.
- Route vectors are converted to `Float32Array` once at load time. Don't
  re-allocate per query.
- The `dot()` function is the hot path; keep it allocation-free.

### Critical pitfall: `dtype` must match the shipped ONNX file

Only `models/sentence-transformers/all-MiniLM-L6-v2/onnx/model_quantized.onnx`
is committed. In transformers.js v3, that filename is selected by
`dtype: 'q8'`. Using any other `dtype` causes a 404, which Cloudflare Pages
silently serves as the SPA-fallback HTML; ONNX runtime then tries to parse
HTML as protobuf and throws **"Failed to load model because protobuf
parsing failed"**. If you change `dtype`, you must ship the matching ONNX.

### Local dev / tests

- `serve.json` sets `cleanUrls: false` so `/search.html?q=…` is served
  directly. Without this, the default `serve` 301-redirects to `/search`
  and **drops the query string**, breaking the auto-redirect E2E test.
  (Cloudflare Pages does the same redirect in production but preserves
  the query string, so this is purely a local-server quirk.)
- `npx playwright test` from the repo root runs all 18 E2E tests in ~50s.
- The model is ~22 MB; first cold run downloads it. Tests use 2 workers
  in CI to balance speed against memory/network.

### Refactor notes (May 2026)

- Replaced cosine-similarity loop (3 mults + sqrt per dim) with plain dot
  product; ~2× faster per query.
- Replaced `isProcessing` flag (which dropped keystrokes) with a
  monotonically-increasing `hintSeq` token so the latest input always
  wins.
- Added `data-engine` on `<body>` and `data-state` on `#status` for
  reliable test assertions without text-matching.
- Added a visible `#error-banner` so model-load failures are surfaced to
  the user (previously only logged to console + a tiny red dot).
