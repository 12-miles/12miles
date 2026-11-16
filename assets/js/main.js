/* ==========================================================================
   EAYDI — site behaviour
   Vanilla JS, no dependencies. Every link and every piece of content works
   without it; this file only adds polish and convenience.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Header: shadow + reading progress ---------- */
  var header = $('.site-header');
  var toTop  = $('.to-top');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) {
      header.classList.toggle('is-stuck', y > 8);
      header.style.setProperty('--progress', max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
    }
    if (toTop) toTop.classList.toggle('is-on', y > 900);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      var brand = $('.brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger');
  var drawer = $('#drawer');
  var behind = $$('main, .site-footer, .to-top');   // made inert while the menu is open

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
    behind.forEach(function (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
  }
  function drawerOpen() { return !!burger && burger.getAttribute('aria-expanded') === 'true'; }

  if (burger && drawer) {
    burger.addEventListener('click', function () { setDrawer(!drawerOpen()); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1060) setDrawer(false); });

    // keep keyboard focus cycling between the menu button and the menu's links
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !drawerOpen()) return;
      var links = $$('a', drawer);
      var last = links[links.length - 1];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); burger.focus(); }
      else if (e.shiftKey && document.activeElement === burger) { e.preventDefault(); last.focus(); }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawerOpen()) { setDrawer(false); burger.focus(); }
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
    // anything the keyboard reaches is shown immediately, never focused while invisible
    document.addEventListener('focusin', function (e) {
      var host = e.target.closest && e.target.closest('[data-reveal], [data-reveal-stagger]');
      if (host) host.classList.add('is-in');
    });
  }

  /* ---------- Count-up stats (the final value is already in the HTML) ---------- */
  function fmt(el, value) {
    var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
    return (el.getAttribute('data-prefix') || '') +
      Number(value).toLocaleString('en-NG', { minimumFractionDigits: d, maximumFractionDigits: d }) +
      (el.getAttribute('data-suffix') || '');
  }
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var start = null, dur = 1400;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(el, (target * (1 - Math.pow(1 - p, 3))).toFixed(d));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = $$('[data-count]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
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

  /* ---------- Photo viewer (built here, so pages carry no extra markup) ---------- */
  var items = $$('.gal__item');
  var lb = null, lbImg, lbCap, lbCount, index = 0, lastFocus = null;
  var ICON = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    prev:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    next:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
  };

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.id = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML =
      '<p class="lightbox__count" id="lightbox-count" aria-live="polite"></p>' +
      '<button class="lightbox__close" type="button" aria-label="Close photo viewer">' + ICON.close + '</button>' +
      '<button class="lightbox__nav lb-prev" type="button" aria-label="Previous photo">' + ICON.prev + '</button>' +
      '<button class="lightbox__nav lb-next" type="button" aria-label="Next photo">' + ICON.next + '</button>' +
      '<figure style="margin:0;display:grid;justify-items:center">' +
        '<img id="lightbox-img" src="" alt="">' +
        '<figcaption class="lightbox__cap" id="lightbox-cap"></figcaption>' +
      '</figure>';
    document.body.appendChild(lb);
    lbImg = $('#lightbox-img', lb);
    lbCap = $('#lightbox-cap', lb);
    lbCount = $('#lightbox-count', lb);

    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    $('.lightbox__close', lb).addEventListener('click', closeLightbox);
    $('.lb-prev', lb).addEventListener('click', function () { show(index - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(index + 1); });

    // swipe left / right on touch screens
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 48) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var cap = items[index].getAttribute('data-caption') || '';
    lbImg.src = items[index].getAttribute('data-full');
    lbImg.alt = cap;
    lbCap.textContent = cap;
    lbCount.textContent = (index + 1) + ' / ' + items.length;
    // warm the neighbours so the next tap is instant
    [index + 1, index - 1].forEach(function (n) {
      var el = items[(n + items.length) % items.length];
      new Image().src = el.getAttribute('data-full');
    });
  }

  function openLightbox(i) {
    if (!lb) buildLightbox();
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    document.body.classList.add('no-scroll');
    $('.lightbox__close', lb).focus();
  }

  function closeLightbox() {
    if (!lb || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (item, i) {
    item.setAttribute('aria-haspopup', 'dialog');
    item.addEventListener('click', function () { openLightbox(i); });
  });

  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft')  show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') {
      var f = $$('button', lb);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Forms ----------
     Each form checks its own fields, then hands the message to the visitor's
     email app, addressed to the form's data-mailto. No server is involved.
     To use a form service instead (Formspree, Netlify Forms…), give the <form>
     an action and method, and remove its data-mailto attribute.
  ------------------------------------------------------------------------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function labelOf(field) {
    var l = field.id && document.querySelector('label[for="' + field.id + '"]');
    return l ? l.textContent.replace(/\*/g, '').trim() : field.name;
  }
  function setError(field, msg) {
    var wrap = field.closest('.field');
    if (!wrap) return;
    var err = $('.field__err', wrap);
    if (!msg) {
      wrap.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      if (err) err.remove();
      return;
    }
    if (!err) {
      err = document.createElement('p');
      err.className = 'field__err';
      err.id = field.id + '-err';
      wrap.appendChild(err);
    }
    err.textContent = msg;
    wrap.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', err.id);
  }
  function check(field) {
    var v = field.value.trim();
    if (field.required && !v) return (field.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in ' + labelOf(field).toLowerCase() + '.');
    if (field.type === 'email' && v && !EMAIL.test(v)) return 'That email address does not look right — please check it.';
    return '';
  }

  $$('form[data-form]').forEach(function (form) {
    var fields = $$('input, select, textarea', form);

    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value.trim() || f.getAttribute('aria-invalid')) setError(f, check(f)); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) setError(f, check(f)); });
    });

    form.addEventListener('submit', function (e) {
      var firstBad = null;
      fields.forEach(function (f) {
        var msg = check(f);
        setError(f, msg);
        if (msg && !firstBad) firstBad = f;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); return; }

      var to = form.getAttribute('data-mailto');
      if (!to) return;                      // a real action= is set: let the browser submit
      e.preventDefault();

      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var body = fields.filter(function (f) { return f.value.trim(); })
        .map(function (f) { return labelOf(f) + ': ' + f.value.trim(); }).join('\n\n');
      var subject = (form.getAttribute('data-subject') || 'Website enquiry') + (name ? ' — ' + name.trim() : '');
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      var status = $('.form-status', form);
      if (status) {
        status.hidden = false;
        status.innerHTML = 'Thank you' + (name ? ', ' + name.trim().split(' ')[0].replace(/[<>&]/g, '') : '') +
          '. Your email app should now be open with your message ready — just press send. ' +
          'If nothing opened, write to us at <a href="mailto:' + to + '">' + to + '</a>.';
        status.focus();
      }
      window.location.href = href;
    });
  });

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
