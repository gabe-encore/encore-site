(function () {
  "use strict";

  // ---- Site configuration --------------------------------------------------
  // APP_URL is the single switch for the app environment.
  // Staging: "https://app-staging.book-encore.com" · Production: "https://app.book-encore.com".
  // App links carry data-app-path (e.g. "/start", "/plan").
  var APP_URL = "https://app-staging.book-encore.com";
  var CALENDAR_URL = "https://calendar.app.google/6KHFfEngVETtsaE66";
  var DEMO_TO = "gabe@book-encore.com";
  var DEMO_KEY = "encore_demo_request";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var store = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  $$("[data-app-path]").forEach(function (a) { a.href = APP_URL + a.getAttribute("data-app-path"); });
  $$("[data-calendar]").forEach(function (a) { a.href = CALENDAR_URL; });
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  // ---- Mobile nav --------------------------------------------------------
  var toggle = $("[data-nav-toggle]");
  var menu = $("[data-mobile-menu]");
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
    };
    toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    document.addEventListener("click", function (e) {
      if (menu.classList.contains("is-open") && !menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  // ---- Home hero: game → in town → sequence ready (loops) ----------------
  var hero = $('[data-trigger="hero"]');
  function runHero() {
    if (!hero) return;
    var steps = $$("[data-hstep]", hero);
    function stage(hs) {
      steps.forEach(function (li, i) {
        var active = hs === i + 1, done = hs > i + 1;
        li.classList.toggle("is-reached", hs >= i + 1);
        li.classList.toggle("is-active", active);
        li.classList.toggle("is-done", done);
        $("[data-stat]", li).textContent = done ? "DONE" : active ? (i === 2 ? "READY" : "WORKING") : "";
      });
      $$("[data-hchip]", hero).forEach(function (c) { c.classList.toggle("is-on", hs >= +c.getAttribute("data-hchip")); });
      $$("[data-hblip]", hero).forEach(function (b) { b.classList.toggle("is-hidden", hs < 1); });
      $$('[data-hblip="2"]', hero).forEach(function (b) { b.classList.toggle("is-strong", hs >= 2); });
    }
    if (reduced) { stage(3); return; }
    stage(0);
    setTimeout(function () { stage(1); }, 900);
    setTimeout(function () { stage(2); }, 3200);
    setTimeout(function () { stage(3); }, 5500);
    setTimeout(runHero, 11500);
  }

  // ---- Video (inside How it works) ---------------------------------------
  var video = $("[data-video]"), vbtn = $("[data-video-toggle]");
  var videoUserPaused = reduced, videoVisible = false;
  function syncVideoBtn() {
    if (!video || !vbtn) return;
    vbtn.classList.toggle("is-paused", video.paused);
    vbtn.setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
  }
  function updateVideo() {
    if (!video) return;
    var shown = !video.closest("[hidden]");
    if (shown && videoVisible && !videoUserPaused) { video.muted = true; video.play().catch(function () {}); }
    else video.pause();
  }
  if (video && vbtn) {
    video.addEventListener("play", syncVideoBtn);
    video.addEventListener("pause", syncVideoBtn);
    vbtn.addEventListener("click", function () {
      if (video.paused) { videoUserPaused = false; video.play().catch(function () {}); }
      else { videoUserPaused = true; video.pause(); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { videoVisible = es[0].isIntersecting; updateVideo(); }, { threshold: 0.25 }).observe(video.parentNode);
    }
  }

  // ---- Home: How it works tabs (auto-advance every 7s until clicked) -----
  var hiwTabs = $$("[data-hiw-tab]"), hiwViews = $$("[data-hiw-view]");
  var hiwTimer = null, hiwAuto = true, HIW_MS = 7000;
  function hiwSelect(i, auto) {
    clearTimeout(hiwTimer);
    hiwTabs.forEach(function (t, k) {
      var sel = k === i;
      t.setAttribute("aria-selected", String(sel));
      t.tabIndex = sel ? 0 : -1;
      var bar = $(".hiw__prog", t);
      bar.style.transition = "none";
      bar.style.width = "0%";
    });
    hiwViews.forEach(function (v, k) { v.hidden = k !== i; });
    var status = $("[data-status]", hiwViews[i]);
    if (status && !reduced) {
      status.classList.remove("is-in");
      void status.offsetHeight;
      setTimeout(function () { status.classList.add("is-in"); }, 60);
    }
    updateVideo();
    if (auto && hiwAuto && !reduced) {
      var bar = $(".hiw__prog", hiwTabs[i]);
      void bar.offsetWidth;
      bar.style.transition = "width " + HIW_MS + "ms linear";
      bar.style.width = "100%";
      hiwTimer = setTimeout(function () { hiwSelect((i + 1) % hiwTabs.length, true); }, HIW_MS);
    }
  }
  hiwTabs.forEach(function (t, i) {
    t.addEventListener("click", function () { hiwAuto = false; hiwSelect(i, false); });
    t.addEventListener("keydown", function (e) {
      var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      var n = (i + d + hiwTabs.length) % hiwTabs.length;
      hiwAuto = false; hiwSelect(n, false); hiwTabs[n].focus();
    });
  });

  // ---- Home: Early results carousel --------------------------------------
  var track = $("[data-cases]");
  if (track) {
    var slides = $$(".case", track), dots = $$("[data-case-dot]");
    var prev = $("[data-case-prev]"), next = $("[data-case-next]");
    var ci = 0;
    var setCase = function (i) {
      ci = i;
      dots.forEach(function (d, k) { if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    };
    var goCase = function (i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
      setCase(i);
    };
    prev.addEventListener("click", function () { goCase(ci - 1); });
    next.addEventListener("click", function () { goCase(ci + 1); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { goCase(k); }); });
    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== ci) setCase(i);
    }, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goCase(ci + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goCase(ci - 1); }
    });
  }

  // ---- Scroll triggers + reveal -----------------------------------------
  var triggers = {
    hero: runHero,
    hiw: function () { hiwSelect(0, true); },
    timeline: function () { $('[data-trigger="timeline"]').classList.add("is-on"); }
  };
  if ("IntersectionObserver" in window) {
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, t = el.getAttribute("data-trigger");
        if (t && triggers[t]) triggers[t]();
        if (el.hasAttribute("data-reveal")) el.classList.remove("is-pending");
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    $$("[data-trigger]").forEach(function (el) { io.observe(el); });
    if (!reduced) {
      $$("[data-reveal]").forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.95) return;
        el.classList.add("is-pending");
        requestAnimationFrame(function () { el.classList.add("is-revealing"); });
        io.observe(el);
      });
    }
  } else {
    Object.keys(triggers).forEach(function (k) { if ($('[data-trigger="' + k + '"]')) triggers[k](); });
  }

  // ---- FAQ accordion (one open at a time) --------------------------------
  var faqBtns = $$(".faq__q");
  faqBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      faqBtns.forEach(function (b) {
        var isThis = b === btn && !open;
        b.setAttribute("aria-expanded", String(isThis));
        document.getElementById(b.getAttribute("aria-controls")).classList.toggle("is-open", isThis);
      });
    });
  });

  // ---- Demo form → drafted email to Gabe, then the Thanks page -----------
  var form = $("[data-demo-form]");
  if (form) {
    var role = form.elements.role;
    var syncRole = function () { role.classList.toggle("is-empty", !role.value); };
    role.addEventListener("change", syncRole);
    syncRole();

    var tried = false;
    var rules = {
      name: function (v) { return v.trim() ? "" : "Add your name"; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Add a valid work email"; },
      venue: function (v) { return v.trim() ? "" : "Add your venue or team"; }
    };
    var validate = function () {
      var firstBad = null;
      Object.keys(rules).forEach(function (k) {
        var input = form.elements[k], msg = rules[k](input.value), field = input.closest(".field");
        field.classList.toggle("has-error", !!msg);
        input.setAttribute("aria-invalid", String(!!msg));
        $(".field__error", field).textContent = msg;
        if (msg && !firstBad) firstBad = input;
      });
      return firstBad;
    };
    form.addEventListener("input", function () { if (tried) validate(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      tried = true;
      var bad = validate();
      if (bad) { bad.focus(); return; }

      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
      var body = [
        "Name: " + d.name,
        "Work email: " + d.email,
        "Venue or team: " + d.venue,
        "Role: " + (d.role || "Not specified"),
        "",
        "Sent from book-encore.com/demo"
      ].join("\r\n");
      var mailto = "mailto:" + DEMO_TO + "?subject=" + encodeURIComponent("Demo request: " + d.venue) + "&body=" + encodeURIComponent(body);
      store.set(DEMO_KEY, { mailto: mailto, text: "To: " + DEMO_TO + "\n" + body.replace(/\r\n/g, "\n") });

      window.location.href = mailto;
      setTimeout(function () { window.location.href = "/thanks/"; }, 600);
    });
  }

  // ---- Thanks page fallbacks ---------------------------------------------
  var fallback = $("[data-thanks-fallback]");
  var req = store.get(DEMO_KEY);
  if (fallback && req) {
    fallback.hidden = false;
    $("[data-mailto-again]", fallback).href = req.mailto;
    var status = $("[data-copy-status]", fallback);
    $("[data-copy]", fallback).addEventListener("click", function () {
      var done = function () { status.textContent = "Copied. Paste it into an email to " + DEMO_TO + "."; };
      var fail = function () { status.textContent = "Couldn't copy. Email " + DEMO_TO + " with your name, venue and role."; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(req.text).then(done, fail);
      else {
        var ta = document.createElement("textarea");
        ta.value = req.text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { fail(); }
        document.body.removeChild(ta);
      }
    });
  }
})();
