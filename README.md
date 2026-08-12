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

## Hosting

Live at **https://www.wheelz365.com** — GitHub Pages serving `main` / root from
`github.com/mab-007/hr-automation`, with the domain registered at GoDaddy.

Pushing to `main` redeploys; the build takes about a minute.

The `CNAME` file in this repo is what tells Pages which domain to answer on. **Do not
delete it** — removing it drops the custom domain. GitHub also rewrites this file if the
domain is changed in Settings → Pages, so `git pull` before your next push if you change
it there.

### DNS records at GoDaddy

The custom domain in Settings → Pages is **`www.wheelz365.com`**, so `www` is the canonical
host and the CNAME file must read `www.wheelz365.com`.

Target state:

| Type | Name | Value | Purpose |
| --- | --- | --- | --- |
| CNAME | www | mab-007.github.io | serves the site — **required** |
| A | @ | 185.199.108.153 | apex → redirects to www |
| A | @ | 185.199.109.153 | " |
| A | @ | 185.199.110.153 | " |
| A | @ | 185.199.111.153 | " |

Only the `www` CNAME is strictly required. The four A records exist so that
`wheelz365.com` reaches GitHub, which then redirects it to `www.wheelz365.com`.
GoDaddy has no ALIAS/ANAME record type, so the apex has to use A records.

Two records have to be *removed* first, both left over from earlier setups:

- `www` is currently a CNAME to `wheelz-web-alb-1330214366.ap-south-1.elb.amazonaws.com`,
  an AWS load balancer that no longer exists — the name does not resolve, so `www` is dead
  today. Replacing it with `mab-007.github.io` both fixes it and clears a dangling CNAME.
- `@` resolves to `3.33.130.190` / `15.197.148.33`, which serve GoDaddy's parking lander.
  Delete those A records, and switch off Domain Forwarding if it is on or it will keep
  re-adding them.

HTTPS is handled by GitHub via Let's Encrypt: the certificate is issued automatically once
`www` resolves to `mab-007.github.io`, after which **Enforce HTTPS** can be ticked in
Settings → Pages. Do not tick it before the certificate exists — the option is disabled
until then.

Every asset path is relative, so the site also works unchanged from the
`mab-007.github.io/hr-automation/` sub-path.

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
