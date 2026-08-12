# Wheelz365 — landing page

Static, single-page marketing site for **Wheelz365**, an HR & payroll automation product.
Plain HTML/CSS/JS with no build step and no dependencies, so it can be served straight
from GitHub Pages.

```
index.html            the whole page
assets/css/styles.css all styling
assets/js/waves.js    the iridescent hero backdrop (canvas, no images)
assets/js/main.js     nav, tabs, accordion, stats carousel, reveals, form
assets/favicon.svg    tab icon
assets/og-cover.png   social share image
.nojekyll             tells GitHub Pages to serve the files as-is
```

## Run it locally

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

Opening `index.html` directly with `file://` also works.

## Publish to GitHub Pages

1. Create an empty repo on GitHub (e.g. `wheelz365-landing`) — no README, no .gitignore.
2. From this folder:

   ```bash
   git remote add origin https://github.com/<your-user>/<your-repo>.git
   git branch -M main
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**
   Source = *Deploy from a branch*, Branch = `main`, Folder = `/ (root)`. Save.
4. The site appears at `https://<your-user>.github.io/<your-repo>/` within a minute or two.

Every asset path is relative, so it works from a repo sub-path without changes. If you
later point a custom domain at it, add a `CNAME` file containing just the domain.

## Things to change before you go live

| What | Where |
| --- | --- |
| The four proof numbers (3 / 6× / 0 / 1 day) and the client one-liners | `index.html`, the `.stats` block — these are placeholders, replace with your real client outcomes |
| `hello@wheelz365.com` | `index.html` (footer + contact links) and `CONTACT_EMAIL` in `assets/js/main.js` |
| LinkedIn / social links | `index.html`, `.footer__social` |
| `og:image` URL | `index.html` — make it absolute once you know the live URL |

## Where the early-access form goes

GitHub Pages is static and cannot receive a form POST. Out of the box the form opens the
visitor's mail client addressed to `CONTACT_EMAIL`.

To collect submissions properly, set `FORM_ENDPOINT` at the top of `assets/js/main.js` to a
form-handler URL (Formspree, Getform, Basin, or a Google Apps Script web app). The form
POSTs `FormData` and expects a 2xx response; the mail fallback is used only while the
endpoint is empty.

## Notes

- The hero background is drawn on a `<canvas>` — no image files. It pauses when scrolled
  out of view or when the tab is hidden, and renders a single static frame for visitors
  who have "reduce motion" turned on.
- Typeface is General Sans, loaded from Fontshare, with a system font fallback.
- `?tab=connect|automate|approve|pay` deep-links a step of the "How it works" section.
