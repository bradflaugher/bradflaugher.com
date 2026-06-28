# fix_plan.md

## Feature

Add a link on `index.html` to Brad's X.com profile, placed **outside** the business card (`.card`), not inside it.

## Context

- **File:** `index.html` only — static landing page, no build step, no JS.
- **X URL:** `https://x.com/BradFlaugher` (matches `resume.html` contact block).
- **Constraint:** The ivory `.card` is the business card; the X link must live in the page chrome around it (e.g. below the card on the dark gradient background).
- **Out of scope:** `search.html`, embeddings, Playwright suite (no `index.html` tests exist).

## Tasks

- [x] Read `index.html` layout: note `.card` structure, body centering, existing link patterns (`target="_blank"`, `rel="noopener"`, opacity hover).
- [x] Adjust body layout so content can sit outside `.card` — e.g. `flex-direction: column` on `body` with a small gap; keep the card centered and unchanged inside.
- [x] Add an `<a>` sibling **after** `.card` (not inside it) pointing to `https://x.com/BradFlaugher` with `target="_blank"` and `rel="noopener"`. Label: `x.com/BradFlaugher` (consistent with `resume.html`).
- [x] Style the external link for the dark gradient background — light/warm text, Garamond stack, subtle opacity hover matching card link behavior; verify at 520px and 400px breakpoints.
- [x] Manual smoke check: `npx serve -l 3000 .` → open `/` → confirm link is visible outside the card, opens X in a new tab, and card content is untouched.