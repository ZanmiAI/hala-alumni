/* HALA site interactions: count-up stats, scroll reveals, gallery, back-to-top */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- count-up stats ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) target = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
    if (reduceMotion || target <= 0) { el.textContent = target.toLocaleString("en-US"); return; }
    var dur = 1600, t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var statNums = document.querySelectorAll(".stat .num");
  statNums.forEach(function (el) {
    el.setAttribute("data-count", el.textContent.replace(/\D/g, ""));
  });
  if ("IntersectionObserver" in window && statNums.length) {
    var seen = new WeakSet();
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !seen.has(e.target)) { seen.add(e.target); countUp(e.target); so.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { so.observe(el); });
  } else {
    statNums.forEach(countUp);
  }

  /* ---------- scroll reveal ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".section .container > *, .card, .alumni-card, .moments-track img").forEach(function (el) {
      el.classList.add("rv"); ro.observe(el);
    });
  }

  /* ---------- moments gallery buttons ---------- */
  document.querySelectorAll(".moments-wrap").forEach(function (wrap) {
    var track = wrap.querySelector(".moments-track");
    if (!track) return;
    wrap.querySelectorAll("[data-mnav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = btn.getAttribute("data-mnav") === "next" ? 1 : -1;
        track.scrollBy({ left: dir * Math.min(track.clientWidth * 0.8, 560), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  });

  /* ---------- back to top ---------- */
  var btt = document.createElement("button");
  btt.className = "to-top";
  btt.setAttribute("aria-label", "Back to top");
  btt.innerHTML = "↑";
  document.body.appendChild(btt);
  function onScroll() {
    btt.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btt.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- mobile nav toggle (if not already wired) ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav && !toggle.dataset.wired) {
    toggle.dataset.wired = "1";
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();
