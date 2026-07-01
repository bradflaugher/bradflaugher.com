# bradflaugher.com

Personal site. Plain HTML, no framework, no build step — every push to
`main` deploys to Cloudflare Pages.

The one moving part: the deploy workflow generates the resume PDF from
`resume.html` (via `resume_converter.py` / WeasyPrint) before publishing,
so the PDF is never committed here.
