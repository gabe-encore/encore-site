(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var easeOut = function (p) { return 1 - Math.pow(1 - p, 3); };

  // Tween a number into an element (textContent) over `dur` ms.
  function countTo(el, to, dur, opts) {
    opts = opts || {};
    var fmt = opts.format || String;
    if (!el) return function () {};
    if (reduced) { el.textContent = fmt(to); return function () {}; }
    var raf, start = null, stopped = false;
    function tick(now) {
      if (stopped) return;
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / dur);
      el.textContent = fmt(Math.round(to * (opts.linear ? p : easeOut(p))));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function () { stopped = true; cancelAnimationFrame(raf); };
  }

  // ---- Footer year -------------------------------------------------------
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

  // ---- Hero: detect → match → pitch loop ---------------------------------
  var hero = $('[data-trigger="hero"]');
  var heroTimers = [];
  function runHero() {
    if (!hero) return;
    var steps = $$("[data-hstep]", hero);
    var chips = $$("[data-hchip]", hero);
    var hcEl = $("[data-hc]", hero), hfEl = $("[data-hf]", hero), quote = $("[data-hquote]", hero);
    var stops = [];

    function setStage(hs) {
      steps.forEach(function (li, i) {
        var active = hs === i + 1, done = hs > i + 1;
        li.classList.toggle("is-reached", hs >= i + 1);
        li.classList.toggle("is-active", active);
        li.classList.toggle("is-done", done);
        $("[data-stat]", li).textContent = done ? "DONE" : active ? (i === 2 ? "READY FOR YOUR REP" : "WORKING") : "";
      });
      quote.classList.toggle("is-on", hs >= 3);
      $$('[data-hblip="pre"]', hero).forEach(function (b) { b.classList.toggle("is-hidden", hs >= 1); });
      $$('[data-hblip="1"], [data-hblip="2"]', hero).forEach(function (b) { b.classList.toggle("is-hidden", hs < 1); });
      $$('[data-hblip="2"]', hero).forEach(function (b) { b.classList.toggle("is-strong", hs >= 2); });
      if (hs < 1) chips.forEach(function (c) { c.classList.remove("is-on"); });
      if (hs > 1) chips.forEach(function (c) { c.classList.add("is-on"); });
    }

    if (reduced) { setStage(3); return; }
    var T = function (fn, ms) { heroTimers.push(setTimeout(fn, ms)); };
    hcEl.textContent = "0"; hfEl.textContent = "0";
    setStage(0);
    T(function () { setStage(1); }, 900);
    // Chips appear as the company count climbs (every ~40 companies)
    T(function () {
      stops.push(countTo(hcEl, 187, 1600));
      chips.forEach(function (c, i) { T(function () { c.classList.add("is-on"); }, 250 + i * 330); });
    }, 1000);
    T(function () { setStage(2); }, 3600);
    T(function () { stops.push(countTo(hfEl, 42, 1200)); }, 3700);
    T(function () { setStage(3); }, 5800);
    T(function () { stops.forEach(function (s) { s(); }); heroTimers = []; runHero(); }, 12500);
  }

  // ---- Testimonials carousel ---------------------------------------------
  var tst = $("[data-tst]");
  if (tst) (function () {
    var INTERVAL = 9000;                 // ms per testimonial
    var tabs = $$("[data-tst-tab]", tst);
    var n = tabs.length;
    var i = 0, p = 0, last = null;
    var hover = false, focusIn = false, visible = false;

    // Each layer (photo, chip text, quote) is a list of items indexed by slide
    function render() {
      [$$(".tst__layer", tst), $$(".tst__chip-text", tst), $$(".tst__slide", tst)].forEach(function (items) {
        items.forEach(function (el, k) {
          el.classList.toggle("is-on", k === i);
          if (el.classList.contains("tst__slide")) el.setAttribute("aria-hidden", String(k !== i));
        });
      });
      tabs.forEach(function (t, k) {
        t.classList.toggle("is-on", k === i);
        t.classList.toggle("is-past", k < i);
        if (k === i) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
        $(".tst__bar span", t).style.width = k < i ? "100%" : k === i ? (p * 100) + "%" : "0%";
      });
    }
    function go(k) {
      k = (k + n) % n;
      p = 0;
      if (k === i) { render(); return; }
      i = k;
      render();
    }
    function tick(now) {
      var dt = last === null ? 0 : now - last;
      last = now;
      if (!reduced && visible && !hover && !focusIn && !document.hidden) {
        p += dt / INTERVAL;
        if (p >= 1) go(i + 1);
        else $(".tst__bar span", tabs[i]).style.width = (p * 100) + "%";
      }
      requestAnimationFrame(tick);
    }

    $("[data-tst-prev]", tst).addEventListener("click", function () { go(i - 1); });
    $("[data-tst-next]", tst).addEventListener("click", function () { go(i + 1); });
    tabs.forEach(function (t, k) { t.addEventListener("click", function () { go(k); }); });
    tst.addEventListener("mouseenter", function () { hover = true; });
    tst.addEventListener("mouseleave", function () { hover = false; });
    tst.addEventListener("focusin", function () { focusIn = true; });
    tst.addEventListener("focusout", function (e) { if (!tst.contains(e.relatedTarget)) focusIn = false; });

    // Swipe left/right on touch screens
    var sx = null, sy = null;
    tst.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    tst.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? i + 1 : i - 1);
      sx = null;
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(tst);
    } else { visible = true; }

    render();
    if (!reduced) setTimeout(function () { tst.classList.add("is-kb"); }, 80);
    requestAnimationFrame(tick);
  })();

  // ---- Pain: 3 vs 44 -----------------------------------------------------
  function runCompare() {
    var root = $('[data-trigger="compare"]');
    var rows = $$(".crow--city", root);
    if (reduced) return;
    var cl = $("[data-cl]", root), cr = $("[data-cr]", root);
    cl.textContent = "0"; cr.textContent = "0";
    rows.forEach(function (r) { r.classList.remove("is-on"); });
    setTimeout(function () { countTo(cl, 3, 600); }, 300);
    rows.forEach(function (r, i) { setTimeout(function () { r.classList.add("is-on"); }, 500 + i * 260); });
    setTimeout(function () { countTo(cr, 44, 1800); }, 600);
  }

  // ---- Calendar ----------------------------------------------------------
  var calData = [
    { d: "Thu Nov 5", night: "Game", avail: "4 suites" },
    { d: "Thu Nov 12", night: "Game", avail: "2 suites", detail: "Automotive Innovation Summit, Nov 11–13 · 187 companies attending · 42 fit your suites · $22K suite opportunity." },
    { d: "Wed Nov 18", night: "Dark", avail: "Entire arena" },
    { d: "Wed Jan 6", night: "Game", avail: "7 suites", detail: "Materials Week · high-fit companies matched to 7 open suites · $14K suite opportunity." },
    { d: "Wed Jan 20", night: "Dark", avail: "Entire arena", detail: "EV Supply Chain Forum · a dark night matched to a full-venue buyout." }
  ];
  var cols = $$(".cal-col");
  var scan = 4;
  function litCol(col, on) {
    var fit = $("[data-fit]", col);
    col.classList.toggle("is-lit", on);
    if (fit) {
      col.classList.toggle("is-hot", on);
      fit.textContent = on ? fit.getAttribute("data-fit") : "Scanning";
    }
  }
  function selectCol(i) {
    cols.forEach(function (c, j) {
      c.classList.toggle("is-sel", i === j);
      c.setAttribute("aria-pressed", String(i === j));
    });
    var c = calData[i];
    $("[data-sel-eyebrow]").textContent = (c.d + " · " + c.night + " night · " + c.avail).toUpperCase();
    $("[data-sel-detail]").textContent = c.detail || "No high-fit demand in town yet. Radar keeps watching this date.";
  }
  cols.forEach(function (col, i) {
    col.addEventListener("click", function () {
      scan = 4;
      cols.forEach(function (c) { litCol(c, true); });
      selectCol(i);
    });
  });
  function runCalendar() {
    if (reduced) return;
    scan = -1;
    cols.forEach(function (c) { litCol(c, false); });
    cols.forEach(function (c, i) {
      setTimeout(function () { if (scan < i) { scan = i; litCol(c, true); } }, 300 + i * 420);
    });
  }

  // ---- Coordination agent ------------------------------------------------
  var coordTimers = [], coordStops = [];
  function runCoord() {
    var root = $('[data-trigger="coord"]');
    if (!root) return;
    coordTimers.forEach(clearTimeout); coordStops.forEach(function (s) { s(); });
    coordTimers = []; coordStops = [];
    var steps = $$("[data-astep]", root), chips = $$("[data-schip]", root), bars = $$("[data-bars]", root);
    var final = $("[data-final]", root), valEl = $("[data-value]", root), elEl = $("[data-elapsed]", root);
    var money = function (n) { return "$" + n.toLocaleString("en-US"); };
    var clock = function (s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
    function setStep(step) {
      steps.forEach(function (li, i) {
        li.classList.toggle("is-reached", step >= i);
        li.classList.toggle("is-done", step > i);
        li.classList.toggle("is-active", step === i);
      });
      final.classList.toggle("is-on", step >= 5);
    }
    if (reduced) {
      setStep(5); bars.forEach(function (b) { b.classList.add("is-on"); });
      chips.forEach(function (c) { c.classList.add("is-on"); });
      valEl.textContent = money(22000); elEl.textContent = clock(252);
      return;
    }
    var T = function (fn, ms) { coordTimers.push(setTimeout(fn, ms)); };
    setStep(-1);
    chips.forEach(function (c) { c.classList.remove("is-on"); });
    // snap the bars back to empty without animating the reset
    var fills = $$(".bar__fill", root);
    fills.forEach(function (f) { f.style.transition = "none"; });
    bars.forEach(function (b) { b.classList.remove("is-on"); });
    void root.offsetHeight;
    fills.forEach(function (f) { f.style.transition = ""; });
    valEl.textContent = money(0); elEl.textContent = clock(0);
    T(function () { bars.forEach(function (b) { b.classList.add("is-on"); }); }, 150);
    [0, 1, 2, 3, 4].forEach(function (i) { T(function () { setStep(i); }, 700 + i * 1100); });
    var t4 = 700 + 4 * 1100;
    [0, 140, 90, 220].forEach(function (d, j) { T(function () { chips[j].classList.add("is-on"); }, t4 + 300 + d); });
    T(function () { setStep(5); }, t4 + 1100);
    coordStops.push(countTo(elEl, 252, t4 + 1100, { linear: true, format: clock }));
    T(function () { coordStops.push(countTo(valEl, 22000, 1200, { format: money })); }, t4 + 1100);
  }
  var replay = $("[data-replay]");
  if (replay) replay.addEventListener("click", runCoord);

  // ---- Scroll triggers + reveal -----------------------------------------
  var triggers = { hero: runHero, compare: runCompare, calendar: runCalendar, coord: runCoord };
  if ("IntersectionObserver" in window) {
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var t = el.getAttribute("data-trigger");
        if (t && triggers[t]) triggers[t]();
        if (el.hasAttribute("data-reveal")) el.classList.remove("is-pending");
        io.unobserve(el);
      });
    }, { threshold: 0.15 });

    $$("[data-trigger]").forEach(function (el) { io.observe(el); });
    if (!reduced) {
      $$("[data-reveal]").forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.95) return;
        el.classList.add("is-pending");
        // enable transition on next frame so the hidden state doesn't animate in
        requestAnimationFrame(function () { el.classList.add("is-revealing"); });
        io.observe(el);
      });
    }
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

  // ---- Video: play/pause, pause off-screen, respect reduced motion -------
  var video = $("[data-video]"), vbtn = $("[data-video-toggle]");
  if (video && vbtn) {
    var userPaused = reduced;
    var sync = function () {
      var paused = video.paused;
      vbtn.classList.toggle("is-paused", paused);
      vbtn.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
    };
    video.muted = true;
    if (reduced) { video.removeAttribute("autoplay"); video.pause(); }
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    vbtn.addEventListener("click", function () {
      if (video.paused) { userPaused = false; video.play().catch(function () {}); }
      else { userPaused = true; video.pause(); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !userPaused) video.play().catch(function () {});
          else if (!e.isIntersecting) video.pause();
        });
      }, { threshold: 0.25 }).observe(video);
    }
    sync();
  }

  // ---- Demand report form ------------------------------------------------
  var form = $("[data-report-form]");
  if (form) {
    var sent = $("[data-sent]");
    var REPORT_TO = "gabe@book-encore.com";
    var tried = false, body = "", mailto = "";
    var rules = {
      name: function (v) { return v.trim() ? "" : "Add your name"; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Use your work email"; },
      venue: function (v) { return v.trim() ? "" : "Add your venue"; }
    };
    var validate = function () {
      var firstBad = null;
      Object.keys(rules).forEach(function (k) {
        var input = form.elements[k];
        var msg = rules[k](input.value);
        var field = input.closest(".field");
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
      var subject = "Demand report request: " + d.venue;
      body = [
        "Name: " + d.name,
        "Work email: " + d.email,
        "Venue: " + d.venue,
        "Role: " + d.role,
        "",
        "Sent from book-encore.com/demand-report"
      ].join("\r\n");
      mailto = "mailto:" + REPORT_TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      if (window.gtag) window.gtag("event", "demand_report_submit", { role: d.role });
      $("[data-mailto-again]", sent).setAttribute("href", mailto);
      $("[data-copy-status]", sent).textContent = "";
      form.hidden = true;
      sent.hidden = false;
      sent.focus();
      window.location.href = mailto;
    });

    $("[data-edit]", sent).addEventListener("click", function () {
      sent.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });

    // Fallback for visitors with no mail app set up: copy the request to paste into webmail
    $("[data-copy]", sent).addEventListener("click", function () {
      var status = $("[data-copy-status]", sent);
      var text = "To: " + REPORT_TO + "\n" + body.replace(/\r\n/g, "\n");
      var done = function () { status.textContent = "Copied. Paste it into an email to " + REPORT_TO + "."; };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { status.textContent = "Couldn't copy. Email " + REPORT_TO + " with your name, venue and role."; });
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { status.textContent = "Couldn't copy. Email " + REPORT_TO + " with your name, venue and role."; }
        document.body.removeChild(ta);
      }
    });
  }
})();
