# Encore — book-encore.com

Static marketing site for Encore. No build step, no framework, no dependencies —
plain HTML/CSS/JS that can be hosted on any static host (Netlify, Vercel, GitHub
Pages, S3 + CloudFront, etc.).

## Structure

```
index.html            Home
experiences/index.html /experiences — illustrative event scenarios
venues/index.html      /venues — venue & team partnership page
contact/index.html     /contact — intake form
assets/css/style.css   Design system + all page styles
assets/js/config.js    Site configuration (form webhook URL)
assets/js/main.js      Mobile nav, footer year, contact form submission
assets/img/favicon.svg Site favicon / mark
robots.txt, sitemap.xml
```

Each page lives at `<folder>/index.html` so that clean URLs like `/experiences/`
work on any static host without extra rewrite rules.

## Before launch

1. **Connect the contact form.** Edit `assets/js/config.js` and set
   `FORM_WEBHOOK_URL` to your form-handling endpoint (serverless function,
   Zapier/Make webhook, CRM intake, etc). The form POSTs a JSON payload with
   `name, company, email, phone, city, dates, guestCount, inquiryType, impress`.
2. **Confirm the contact email.** `gabe@book-encore.com` is used as a
   placeholder throughout (footer + contact page). Replace it if the real
   inbox differs.
3. **Add a real Open Graph image.** All pages reference
   `/assets/img/og-default.png` (1200×630) for social previews. No raster
   image is included yet — add one before launch so link previews render
   correctly on LinkedIn/Twitter/Slack, etc.
4. **Fonts** are loaded from Google Fonts (Fraunces + Inter) via CDN. Self-host
   if you'd rather avoid the third-party request.
5. Everything under "illustrative example" / "placeholder" labels (the
   `/experiences` scenarios, the contact email) is intentionally generic per
   the brief — no client names, logos, testimonials, or stats have been
   invented.

## Local preview

No build step required — just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Any static host works. For Netlify/Vercel, point the project at this
directory with no build command and no output directory override — deploy
the files as-is.

<!-- redeploy trigger -->
