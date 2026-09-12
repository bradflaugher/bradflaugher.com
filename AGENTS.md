# Repository guide for AI agents

Source for **bradflaugher.com**. Plain static HTML on Cloudflare Pages —
no framework, no bundler, no build step. Edit files in place; every push
to `main` deploys.

Things worth knowing before changing anything:

- **`index.html`** is a project list, not a résumé. Two lists matter:
  things Brad makes and things Brad supports. Keep it small — a short
  bench looks more alive than a complete catalog. No job titles, no
  company, no phone, no address, no "get in touch". One joke per section.
- **Look:** dark, monospace, TUI-flavored (JetBrains Mono + Departure
  Mono, self-hosted under `fonts/`). Keyboard nav lives in `tui.js` and
  is optional — the page must work with JS off. Check it on a phone.
- **`og.png`** is generated from a throwaway HTML render; if the copy on
  the page changes, re-render it so link previews match.
- **Workflow:** open a PR to `main` and squash-merge it immediately.
  `main` is the only long-lived branch. Do not keep a `dev` branch or a
  `CHANGELOG.md`.

Don't add build tooling, and don't grow this file or the README — they're
intentionally minimal so they don't rot.
