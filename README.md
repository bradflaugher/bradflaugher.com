# bradflaugher.com

Source code for [bradflaugher.com](https://bradflaugher.com) — a personal
website hosted on Cloudflare Pages. No build step, no framework, no
backend; every file in this repo is shipped verbatim.

The site is a single static landing page:

- **[`index.html`](./index.html)** — a static landing page (custom Garamond
  font, gradient background, contact links). Nothing fancy.

---

## `index.html`

A static, single-file landing page. Custom Garamond Classico SC font,
warm-tinted radial gradient background, three blocks of links (contact,
work, location). No JavaScript, no analytics, no tracking. Edit the HTML
in place; there's no build step.

---

## What's in the repo

```
.
├── index.html                       # Landing page (no JS logic)
├── fonts/                           # Garamond Classico SC for index.html
├── favicon-*.png, favicon.ico       # Static assets
├── og-image*.png                    # OpenGraph / Twitter card images
├── .github/workflows/
│   └── deploy.yml                   # Cloudflare Pages deploy
└── README.md                        # You are here
```

---

## License

Code in this repository is mine.
