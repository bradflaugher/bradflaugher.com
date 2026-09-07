# Repository guide for AI agents

Source for **bradflaugher.com**. Plain static HTML on Cloudflare Pages —
no framework, no bundler, no build step. Edit files in place; every push
to `main` deploys.

Things worth knowing before changing anything:

- **`index.html`** is a deliberately designed "desk scene" landing page.
  Its layout, fixed pixel sizes, and desktop-only link objects are
  intentional — don't restyle, rescale, or "improve" it without being
  asked.
- **Workflow:** open a PR to `main` and squash-merge it immediately
  (`gh pr create`, then `gh pr merge --squash --delete-branch`).
  `main` is the only long-lived branch. Do not keep a `dev` branch or a
  `CHANGELOG.md`.

Don't add build tooling, and don't grow this file or the README — they're
intentionally minimal so they don't rot.
