/**
 * Encore site configuration.
 *
 * FORM_WEBHOOK_URL — where the contact form POSTs its JSON payload.
 * Point this at your form-handling endpoint (e.g. a serverless function,
 * Zapier/Make webhook, or CRM intake endpoint) before launch.
 */
window.ENCORE_CONFIG = {
  FORM_WEBHOOK_URL: "REPLACE_WITH_YOUR_FORM_WEBHOOK_URL",
};
