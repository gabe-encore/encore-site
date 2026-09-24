# Encore — book-encore.com

Static marketing site for Encore, "the revenue engine for sports hospitality."
No build step, no framework, no dependencies — plain HTML/CSS/JS that can be
hosted on any static host (Netlify, Vercel, GitHub Pages, S3 + CloudFront, etc).
Currently deployed via GitHub Pages.

## Structure

```
index.html                     Home
for-teams/index.html           /for-teams — for sports organizations (AI Radar)
for-corporate-events/index.html /for-corporate-events — packages, approval pages
how-it-works/index.html        /how-it-works — the 4-step flow
about/index.html                /about — why Encore exists, founder bio
contact/index.html              /contact — "Run an Encore Pilot" demand-report form
assets/css/platform.css        Design system + all page styles
assets/js/config.js            Site configuration (form webhook URL)
assets/js/main.js              Mobile nav, footer year, contact form submission
assets/brand/                  Logo, team/league marks, event photography
assets/img/                    Favicon, generated OG image
robots.txt, sitemap.xml
```

Each page lives at `<folder>/index.html` so that clean URLs like `/for-teams/`
work on any static host without extra rewrite rules.

## Before launch

1. **Connect the contact form.** Edit `assets/js/config.js` and set
   `FORM_WEBHOOK_URL` to your form-handling endpoint (serverless function,
   Zapier/Make webhook, CRM intake, etc). The form POSTs a JSON payload with
   `name, email, org, role, market`.
2. **Real team/league marks in use.** The site displays real logos and named
   scenarios for the NBA, Detroit Pistons, New York Knicks, Los Angeles
   Lakers, Brooklyn Nets, Barclays Center, Little Caesars Arena, Kia and
   Tissot (the last two appear incidentally in event photography). Usage was
   confirmed authorized during development — reconfirm before any relaunch
   or hand-off if that authorization has since changed.
3. **Event photography** (`assets/brand/hero-nba-arena.jpg`,
   `event-concept-suite.jpg`) is captioned "Concept rendering" on every page
   it appears — provenance (real event vs. composited) was not confirmed, so
   keep that caption unless you can confirm otherwise.
4. **Fonts** are loaded from Google Fonts (Schibsted Grotesk + Instrument
   Serif) via CDN. Self-host if you'd rather avoid the third-party request.

## Local preview

No build step required — just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Currently live via GitHub Pages (`gabe-encore/encore-site`, custom domain
via the `CNAME` file). Any other static host works the same way — point it
at this directory with no build command and no output directory override.
