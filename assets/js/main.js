(function () {
  "use strict";

  // ---- Mobile nav toggle -------------------------------------------------
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Footer year -------------------------------------------------------
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // ---- Contact form submission -------------------------------------------
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusEl = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("[data-submit-btn]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var webhookUrl =
        window.ENCORE_CONFIG && window.ENCORE_CONFIG.FORM_WEBHOOK_URL;

      if (!webhookUrl || webhookUrl.indexOf("REPLACE_WITH") === 0) {
        setStatus(
          "error",
          "Form isn't connected yet — set FORM_WEBHOOK_URL in assets/js/config.js."
        );
        return;
      }

      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) {
        payload[key] = value;
      });
      payload.submittedAt = new Date().toISOString();
      payload.source = "book-encore.com/contact";

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setStatus("", "");

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
          }
          form.reset();
          setStatus(
            "success",
            "Thanks — we've got it. Someone from Encore will follow up directly."
          );
        })
        .catch(function () {
          setStatus(
            "error",
            "Something went wrong sending that. Please try again, or email us directly."
          );
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Request your night";
        });
    });

    function setStatus(state, message) {
      statusEl.textContent = message;
      if (state) {
        statusEl.setAttribute("data-state", state);
      } else {
        statusEl.removeAttribute("data-state");
      }
    }
  }
})();
