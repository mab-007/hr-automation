# Wheelz365 — marketing site

Static marketing site for **Wheelz365**, which designs and builds custom AI automation
for professional-services firms — and sells the source code to clients who want it.

Plain HTML/CSS/JS with no build step and no dependencies, so it can be served straight
from GitHub Pages.

```
index.html                  home — 14 sections, the whole positioning
what-we-build/index.html    six automation archetypes + featured HR & hiring use case
security/index.html         data boundary, audit trail, exit rights (the forwardable one)
audit/index.html            the conversion page and its form
assets/css/styles.css       all styling, shared by every page
assets/js/waves.js          the iridescent hero backdrop (canvas, no images)
assets/js/main.js           nav, tabs, accordion, reveals, flow preview, audit form
assets/favicon.svg          tab icon
assets/og-cover.png         social share image
tools/og-template.html      source for og-cover.png — see "Regenerating the OG image"
.nojekyll                   tells GitHub Pages to serve the files as-is
```

## Run it locally

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

Use a server rather than opening `index.html` over `file://` — the subpages live in
directories and the relative paths between them need real URL resolution.

## How the pages link to each other

Every asset and page path is **relative**, never root-absolute (`/assets/…`), so the site
also works unchanged from `mab-007.github.io/hr-automation/`. That constraint is easy to
break by accident:

| From | Stylesheet | Home | A sibling page |
| --- | --- | --- | --- |
| `index.html` | `assets/css/styles.css` | `#hero` | `security/` |
| `security/index.html` | `../assets/css/styles.css` | `../` | `../audit/` |

Always link to a subpage **with the trailing slash** (`security/`, not `security`).
Without it, GitHub Pages redirects and every relative path on the destination page
resolves one level too high.

To check you haven't broken this, serve the *parent* directory and load the site through
the subpath:

```bash
cd .. && python3 -m http.server 4174
# open http://localhost:4174/hr-automation/ and click through all four pages
```

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

## Things to change before you go live

| What | Where |
| --- | --- |
| Registered entity name + city | All four pages, `footer__base` — marked `TODO`. Enterprise buyers look for it. Add the real one; don't invent a placeholder. |
| LinkedIn URL | All four pages, `.footer__social` — currently email only, marked `TODO` |
| The McKinsey citation | `index.html`, the `#problem` footnote — the 23% figure is attributed but unlinked. A page arguing against unverifiable claims should not contain one. |
| Client logos | `index.html`, the `.cap-strip` — swap the capability statements for greyscale logos **only** with written permission |

## Where the audit form goes

GitHub Pages is static and cannot receive a form POST, so submitting the audit form opens
the visitor's own mail client with a labelled message addressed to `CONTACT_EMAIL`
(top of `assets/js/main.js`). Nothing is sent until they send it.

Consequences worth knowing:

- Each free-text answer is capped when the `mailto:` URL is built, because some clients
  truncate long links silently. When that happens the body says so.
- A visible fallback address sits under the button for anyone with no mail client.
- There is no honeypot and no rate limiting. Both are server-side concepts and would be
  pure theatre in front of a `mailto:` link.
- A free email provider produces a **warning, not a block** — plenty of real small firms
  run on Gmail, and there is no server to enforce a rule anyway.

If you later want submissions to land in a sheet or CRM, the change is to POST the
`FormData` to a form-handler endpoint (Formspree, Basin, Getform, or a Google Apps Script
web app) in the submit handler, keeping the mailto as the failure path.

## Regenerating the OG image

`assets/og-cover.png` is rendered from `tools/og-template.html` rather than designed by
hand, so it stays in sync with the hero:

```bash
python3 -m http.server 4180
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --force-prefers-reduced-motion \
  --window-size=1200,630 --screenshot=assets/og-cover.png \
  "http://localhost:4180/tools/og-template.html"
```

`--force-prefers-reduced-motion` is not optional: it makes `waves.js` paint a single
static frame. Without it the canvas animates forever and the screenshot never lands.

## Notes

- The hero background is drawn on a `<canvas>` — no image files. It pauses when scrolled
  out of view or when the tab is hidden, and renders a single static frame for visitors
  who have "reduce motion" turned on. It loads on the **home page only**; the subpages use
  a static CSS gradient header so their LCP stays cheap.
- Typeface is General Sans, loaded from Fontshare, with a system font fallback. Mono type
  (the audit-log sample on `/security/`) uses the system mono stack — no second web font.
- `?tab=audit|design|build|run` deep-links a phase of the "How we work" section. The tabs
  do not auto-advance; a panel that rotates away mid-sentence is worse than no motion.
- Old anchor links from the previous single-page site (`#early-access`, `#how`, `#why`,
  `#integrations`, `#compare`, `#proof`, `#team`) are remapped to their new equivalents on
  load by `main.js`. Static hosting can't issue a 301, so that's the substitute.
- Several CSS class names (`.payrun*`, `.approve*`, `.src--books`) are left over from the
  earlier payroll site. They're reused generically now and are invisible to visitors —
  renaming them would touch a few hundred lines of working CSS for no user-visible gain.
