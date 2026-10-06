# Repository guide for AI agents

Source for **bradflaugher.com**. Plain static HTML on Cloudflare Pages —
no framework, no bundler, no build step. Edit files in place; every push
to `main` deploys.

Things worth knowing before changing anything:

- **`index.html`** is a name and links. Other pages go on `/tree/` and
  get `noindex` in `_headers`. Projects live on GitHub. No bio, no job
  titles, no company, no phone, no address, no "get in touch".
- **Look:** shared in `site.css` (dark, monospace, Hack + Departure Mono
  under `fonts/`). No JavaScript, except `/swing/`. Check it on a phone.
- **`og.png`** is generated from a throwaway HTML render; if the copy on
  the page changes, re-render it so link previews match.
- **Workflow:** open a PR to `main` and squash-merge it immediately.
  `main` is the only long-lived branch. Do not keep a `dev` branch or a
  `CHANGELOG.md`.

Don't add build tooling, and don't grow this file or the README — they're
intentionally minimal so they don't rot.
