/* ==========================================================================
   EAYDI — site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Header shadow on scroll ---------- */
  var header = $('.site-header');
  var toTop  = $('.to-top');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop)  toTop.classList.toggle('is-on', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile drawer ---------- */
  var burger = $('.burger');
  var drawer = $('#drawer');

  function closeDrawer() {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      drawer.classList.toggle('is-open', !open);
      document.body.classList.toggle('no-scroll', !open);
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) closeDrawer();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeDrawer();
    closeLightbox();
  });

  /* ---------- Scroll reveal ---------- */
  var revealables = $$('[data-reveal], [data-reveal-stagger]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  var counters = $$('[data-count]');
  function runCount(el) {
    var target   = parseFloat(el.getAttribute('data-count'));
    var suffix   = el.getAttribute('data-suffix') || '';
    var prefix   = el.getAttribute('data-prefix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var dur      = 1500;
    var start    = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = (target * eased).toFixed(decimals);
      el.textContent = prefix + Number(value).toLocaleString('en-NG', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
        el.textContent = (el.getAttribute('data-prefix') || '')
          + Number(el.getAttribute('data-count')).toLocaleString('en-NG', {
              minimumFractionDigits: d, maximumFractionDigits: d })
          + (el.getAttribute('data-suffix') || '');
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          cio.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Accordion ---------- */
  $$('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open  = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.setAttribute('data-open', String(!open));
    });
  });

  /* ---------- Lightbox ---------- */
  var lb        = $('#lightbox');
  var lbImg     = $('#lightbox-img');
  var lbCap     = $('#lightbox-cap');
  var items     = $$('.gal__item');
  var index     = 0;
  var lastFocus = null;

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    var src = items[index].getAttribute('data-full');
    var cap = items[index].getAttribute('data-caption') || '';
    if (lbImg) { lbImg.src = src; lbImg.alt = cap; }
    if (lbCap) lbCap.textContent = cap;
  }

  function openLightbox(i) {
    if (!lb) return;
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    lb.removeAttribute('aria-hidden');
    document.body.classList.add('no-scroll');
    var close = $('.lightbox__close', lb);
    if (close) close.focus();
  }

  function closeLightbox() {
    if (!lb || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () { openLightbox(i); });
  });

  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    var closeBtn = $('.lightbox__close', lb);
    var prevBtn  = $('.lb-prev', lb);
    var nextBtn  = $('.lb-next', lb);
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn)  prevBtn.addEventListener('click', function () { show(index - 1); });
    if (nextBtn)  nextBtn.addEventListener('click', function () { show(index + 1); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'ArrowLeft')  show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'Tab') {
        var f = $$('button', lb);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Forms ----------
     No backend is wired up yet. Point action= at Formspree / Netlify Forms /
     your own handler and delete the block below to send for real.
  ------------------------------------------------------------------------- */
  $$('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('.form-status', form);
      if (!status) return;
      var name = (form.querySelector('[name="name"]') || {}).value || 'there';
      status.hidden = false;
      status.textContent = 'Thanks, ' + name.split(' ')[0] +
        ' — this form is not connected to an inbox yet. Please email us directly in the meantime.';
      status.focus && status.focus();
    });
  });

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
