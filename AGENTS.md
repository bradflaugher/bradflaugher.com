# Repository guide for AI agents

Source for **bradflaugher.com**. Plain static HTML on Cloudflare Pages —
no framework, no bundler, no build step. Edit files in place; every push
to `main` deploys.

Things worth knowing before changing anything:

- **`index.html`** is a deliberately designed "desk scene" landing page.
  Its layout, fixed pixel sizes, and desktop-only link objects are
  intentional — don't restyle, rescale, or "improve" it without being
  asked.
- **The resume PDF is generated in CI, not committed.** The deploy
  workflow (`.github/workflows/deploy.yml`) runs `resume_converter.py`
  on `resume.html` with WeasyPrint to produce `Brad_Flaugher_Resume.pdf`
  before publishing. To change the PDF, edit `resume.html` or the
  converter's CSS.
- **Workflow:** open a PR to `main` and merge it immediately
  (`gh pr create`, then `gh pr merge --merge --delete-branch`).

Don't add build tooling, and don't grow this file or the README — they're
intentionally minimal so they don't rot.
