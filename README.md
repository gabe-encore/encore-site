# Encore — book-encore.com

Static marketing site for Encore, "the revenue engine for sports hospitality."
No build step, no framework, no dependencies — plain HTML/CSS/JS that can be
hosted on any static host (Netlify, Vercel, GitHub Pages, S3 + CloudFront, etc).
Currently deployed via GitHub Pages.

## Structure

```
index.html                 Home (for venue premium sales teams)
plan/index.html            /plan — for event planners; "See availability" goes to the app
demo/index.html            /demo — Book a demo (form drafts an email, or pick a calendar slot)
thanks/index.html          /thanks — after the demo form; calendar link + email fallbacks
demand-report/, contact/   Redirect to /demo/
for-teams/, about/         Redirect to /
how-it-works/              Redirects to /#how-it-works
for-corporate-events/      Redirects to /plan/
assets/css/site.css        Encore Design System (dark) + all page styles
assets/js/site.js          Config (APP_URL, calendar, demo email) + all interactions
assets/img/icons.svg       Lucide icon sprite (lucide-static v0.460.0, ISC)
assets/video/              AI Radar video (1280px desktop, 640px mobile) + poster frame
assets/brand/              Logo and event photography
assets/img/                Favicons, OG image
robots.txt, sitemap.xml
```

Pages are ported from the Claude Design project and share the same header
(with **Log in**) and footer markup, so a nav/footer change has to be made in
every page.

Each page lives at `<folder>/index.html` so that clean URLs work on any static
host without extra rewrite rules.

## Configuration (top of `assets/js/site.js`)

- **`APP_URL`**: the Encore app. Currently staging
  (`https://app-staging.book-encore.com`); change to
  `https://app.book-encore.com` at launch. Every app link carries
  `data-app-path` and is built from it: Log in → `/start`, See availability →
  `/plan`.
- **`CALENDAR_URL`**: the Google Calendar booking page for demos.
- **`DEMO_TO`**: where demo requests are emailed. The Demo form opens the
  visitor's email app with a drafted message (name, email, venue/team, role);
  they still press Send. They then land on /thanks/, which offers the calendar
  plus "Open email again" / "Copy details" fallbacks.

## Before launch

1. **Privacy and Terms.** The design includes these pages, but only as
   placeholders, so they aren't published or linked yet.
2. **Illustrative content.** The hero, inbox and status examples (Google, Cyber
   Conference, Miami) are labeled "Illustrative example"; the footer explains
   the label. The Early results slides name the Brooklyn Nets and Charlotte
   Hornets / Spectrum Center; confirm you're cleared to name them.
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
