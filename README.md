# Encore — book-encore.com

Static marketing site for Encore, "the revenue engine for sports hospitality."
No build step, no framework, no dependencies — plain HTML/CSS/JS that can be
hosted on any static host (Netlify, Vercel, GitHub Pages, S3 + CloudFront, etc).
Currently deployed via GitHub Pages.

## Structure

```
index.html                     Home (single long page; nav links are in-page anchors)
demand-report/index.html       /demand-report — free 90-day demand report form
contact/index.html             Redirects to /demand-report/ (old URL)
assets/css/site.css            Encore Design System (dark) + Home/Demand Report styles
assets/js/site.js              Nav, scroll reveals, hero/calendar/agent animations, FAQ, video, form
assets/js/config.js            Site configuration (form webhook URL)
assets/img/icons.svg           Lucide icon sprite (lucide-static v0.460.0, ISC)
assets/video/                  AI Radar video (1280px desktop, 640px mobile) + poster frame
assets/brand/                  Logo, team/league marks, event photography
assets/img/                    Favicon, OG image (from the AI Radar graphic)
robots.txt, sitemap.xml
```

Home and Demand Report are ported from the Claude Design canvas. The older
pages (`for-teams/`, `for-corporate-events/`, `how-it-works/`, `about/`) still
exist on the previous design (`assets/css/platform.css`, `assets/js/main.js`)
but are no longer linked from the nav or listed in the sitemap.

Each page lives at `<folder>/index.html` so that clean URLs work on any static
host without extra rewrite rules.

## Before launch

1. **Connect the demand report form.** Edit `assets/js/config.js` and set
   `FORM_WEBHOOK_URL` to your form-handling endpoint. The form POSTs a JSON
   payload with `name, email, venue, role, submittedAt, source`. Until it's
   set, submitting shows a message pointing people to hello@book-encore.com.
2. **Illustrative content.** Harbor Arena, the Automotive Innovation Summit and
   all figures on Home are illustrative, as the footer states.
3. **Fonts** are loaded from Google Fonts (Inter + Geist Mono). Self-host if
   you'd rather avoid the third-party request.

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
