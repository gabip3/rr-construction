/* ============================================================
   R&R Construction
   No dependencies. Each behaviour is self-contained and bails out
   quietly if its markup is not on the page.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


  /* ----------------------------------------------------------
     Intro

     Shown once per session, so moving between pages does not
     replay it. The bar tracks the real page load rather than a
     made-up timer, with a hard cap so a slow asset can never hold
     the site behind it.
     ---------------------------------------------------------- */

  // One is picked at random per session. All of them are things that
  // actually happen on a jobsite, and the first two are the wait
  // making fun of itself.
  var INTRO_LINES = [
    'Letting the paint dry.',
    'Still faster than a permit.',
    'Sawdust settling.',
    'Snapping the chalk line.',
    'Measure twice.'
  ];

  var INTRO_MIN_MS = 2300;

  function initIntro() {
    var el = document.querySelector('[data-intro]');
    if (!el) return;

    var fill = el.querySelector('[data-intro-fill]');
    var line = el.querySelector('[data-intro-line]');
    var started = Date.now();

    // Set before the line's entrance animation has faded it in, so the
    // swap is never visible.
    if (line) {
      line.textContent = INTRO_LINES[Math.floor(Math.random() * INTRO_LINES.length)];
    }

    function remove() {
      document.body.classList.remove('intro-open');
      if (el.parentNode) el.parentNode.removeChild(el);
    }

    function dismiss() {
      document.body.classList.remove('intro-open');
      el.classList.add('is-done');
      window.setTimeout(remove, 700);
    }

    var seen = false;
    try { seen = window.sessionStorage.getItem('rr-intro') === 'seen'; } catch (e) {}

    if (seen || reduceMotion.matches) { remove(); return; }

    try { window.sessionStorage.setItem('rr-intro', 'seen'); } catch (e) {}

    // Safe to lock: the only code that adds this class also owns the
    // timers that remove it, and the hard cap below guarantees one of
    // them fires. If main.js never loads, the class is never added.
    document.body.classList.add('intro-open');

    // Run most of the way immediately, then finish on load. The bar
    // never sits at 100% waiting, and never stalls at 0.
    window.setTimeout(function () { if (fill) fill.style.width = '92%'; }, 60);

    var finished = false;
    function complete() {
      if (finished) return;
      finished = true;

      // A fast connection must not cut the line short. Loading can push
      // the intro longer, never shorter than INTRO_MIN_MS.
      var wait = Math.max(0, INTRO_MIN_MS - (Date.now() - started));
      window.setTimeout(function () {
        if (fill) fill.style.width = '100%';
        window.setTimeout(dismiss, 480);
      }, wait);
    }

    if (document.readyState === 'complete') complete();
    else window.addEventListener('load', complete);

    window.setTimeout(complete, 4500);
  }


  /* ----------------------------------------------------------
     Reveal on scroll
     One observer drives every reveal token on the page.
     ---------------------------------------------------------- */

  function initReveals() {
    var targets = document.querySelectorAll(
      '[data-reveal], [data-rule], [data-reveal-image], [data-timeline]'
    );

    function revealAll() {
      forEach(targets, function (el) { el.classList.add('is-in'); });
    }

    if (!('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    var delivered = false;

    var observer = new IntersectionObserver(function (entries) {
      delivered = true;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, {
      // Threshold stays at 0: several targets (the hero photograph,
      // the charcoal standards column) are taller than the viewport,
      // and any ratio-based threshold would never be met for those.
      rootMargin: '0px 0px -12% 0px',
      threshold: 0
    });

    forEach(targets, function (el) { observer.observe(el); });

    // Failsafe. The reveal start state is opacity:0, so if the observer
    // never delivers a single entry the page would stay blank. That can
    // happen when the document is never painted (opened in a background
    // tab and restored from bfcache, some embedded webviews). Reveal
    // everything if nothing has come through shortly after load.
    // Checking `delivered` rather than a blanket timeout means the
    // normal scroll-triggered behaviour is left intact.
    window.setTimeout(function () {
      if (!delivered && !document.hidden) revealAll();
    }, 2500);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden || delivered) return;
      window.setTimeout(function () {
        if (!delivered) revealAll();
      }, 600);
    });
  }


  /* ----------------------------------------------------------
     Header: solid once the page has scrolled past the hero edge
     ---------------------------------------------------------- */

  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;

    // Inner pages have no photograph behind the bar, so the header is
    // solid from the top and never transitions.
    if (header.hasAttribute('data-header-static')) {
      header.classList.add('is-scrolled');
      return;
    }

    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }


  /* ----------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------- */

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('primaryNav');
    if (!toggle || !nav) return;

    var label = toggle.querySelector('[data-nav-label]');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // The panel only exists below this width, so leaving it open while
    // resizing up would strand the body scroll lock.
    var wide = window.matchMedia('(min-width: 961px)');
    addMediaListener(wide, function (event) {
      if (event.matches) setOpen(false);
    });
  }


  /* ----------------------------------------------------------
     Current section in the navigation
     ---------------------------------------------------------- */

  function initScrollSpy() {
    var links = document.querySelectorAll('.nav__link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];

    forEach(links, function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      sections.push(section);
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          forEach(links, function (other) { other.classList.remove('is-current'); });
          link.classList.add('is-current');
        }
      });
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { observer.observe(section); });
  }


  /* ----------------------------------------------------------
     Before / after comparison
     Pointer drag, click to jump, and full keyboard control.
     ---------------------------------------------------------- */

  function initCompare() {
    forEach(document.querySelectorAll('[data-compare]'), setUpCompare);
  }

  function setUpCompare(root) {
    var frame = root.querySelector('[data-compare-frame]');
    var handle = root.querySelector('[data-compare-handle]');
    if (!frame || !handle) return;

    var value = 50;

    function render() {
      frame.style.setProperty('--pos', value + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(value)));
      handle.setAttribute(
        'aria-valuetext',
        Math.round(value) + ' percent before, ' + Math.round(100 - value) + ' percent after'
      );
    }

    function setFromClientX(clientX) {
      var rect = frame.getBoundingClientRect();
      if (!rect.width) return;
      value = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      render();
    }

    function onPointerMove(event) {
      setFromClientX(event.clientX);
    }

    function endDrag() {
      root.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    }

    // Each comparison owns its own listeners, so several can sit on the
    // same page without their drags interfering with one another.

    frame.addEventListener('pointerdown', function (event) {
      // Let the keyboard handle keep focus behaviour, but a press
      // anywhere on the photograph should move the split.
      event.preventDefault();
      root.classList.add('is-dragging');
      setFromClientX(event.clientX);
      handle.focus();
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
    });

    handle.addEventListener('keydown', function (event) {
      var step = event.shiftKey ? 10 : 2;
      var next = value;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':  next = value - step; break;
        case 'ArrowRight':
        case 'ArrowUp':    next = value + step; break;
        case 'Home':       next = 0; break;
        case 'End':        next = 100; break;
        case 'PageDown':   next = value - 10; break;
        case 'PageUp':     next = value + 10; break;
        default: return;
      }

      event.preventDefault();
      value = clamp(next, 0, 100);
      render();
    });

    render();
  }


  /* ----------------------------------------------------------
     Estimate form

     Validates, then posts to Web3Forms over fetch so the visitor
     stays on the page. Until a real access key is pasted into the
     hidden field, submitting points them at the phone instead of
     firing a request that would only come back as an error.
     ---------------------------------------------------------- */

  var PHONE = '(943) 255-2352';
  var KEY_PLACEHOLDER = 'PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE';

  function initEstimateForm() {
    var form = document.querySelector('[data-estimate]');
    if (!form) return;

    var status = form.querySelector('[data-estimate-status]');

    function fieldOf(input) {
      return input.closest('.field');
    }

    function errorFor(input) {
      return form.querySelector('[data-error-for="' + input.id + '"]');
    }

    function validate(input) {
      var valid = input.checkValidity();
      var field = fieldOf(input);
      var error = errorFor(input);

      if (field) field.classList.toggle('field--invalid', !valid);
      if (error) error.hidden = valid;
      input.setAttribute('aria-invalid', String(!valid));

      return valid;
    }

    var inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    forEach(inputs, function (input) {
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        if (fieldOf(input) && fieldOf(input).classList.contains('field--invalid')) {
          validate(input);
        }
      });
    });

    var submit = form.querySelector('[type="submit"]');
    var keyField = form.querySelector('[name="access_key"]');

    function setStatus(message, state) {
      status.textContent = message;
      status.classList.toggle('is-error', state === 'error');
      status.classList.toggle('is-success', state === 'success');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var firstInvalid = null;

      forEach(inputs, function (input) {
        if (!validate(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        setStatus('Please check the highlighted fields.', 'error');
        firstInvalid.focus();
        return;
      }

      if (!keyField || !keyField.value || keyField.value === KEY_PLACEHOLDER) {
        setStatus(
          'This form is not connected yet. Please call or text ' + PHONE + ' and we will pick it up from there.',
          'error'
        );
        return;
      }

      var original = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'Sending';
      setStatus('Sending your request.', null);

      var payload = {};
      new FormData(form).forEach(function (value, key) { payload[key] = value; });

      window.fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) { return response.json().catch(function () { return {}; }); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            forEach(form.querySelectorAll('.field--invalid'), function (f) {
              f.classList.remove('field--invalid');
            });
            setStatus('Thanks. We have your request and will be in touch shortly.', 'success');
          } else {
            setStatus(
              'That did not go through. Please call or text ' + PHONE + ' and we will sort it out.',
              'error'
            );
          }
        })
        .catch(function () {
          setStatus(
            'That did not go through. Please call or text ' + PHONE + ' and we will sort it out.',
            'error'
          );
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = original;
        });
    });
  }


  /* ----------------------------------------------------------
     Gallery lightbox

     Tiles are already <button>s, so keyboard access comes free.
     The viewer moves within the group the tile belongs to, keeps
     focus inside itself while open, and hands focus back to the
     tile that opened it on close.
     ---------------------------------------------------------- */

  function initLightbox() {
    var dialog = document.querySelector('[data-lightbox-dialog]');
    var tiles = document.querySelectorAll('[data-lightbox]');
    if (!dialog || !tiles.length) return;

    var imgEl = dialog.querySelector('[data-lightbox-img]');
    var capEl = dialog.querySelector('[data-lightbox-caption]');
    var groupEl = dialog.querySelector('[data-lightbox-groupname]');
    var countEl = dialog.querySelector('[data-lightbox-count]');
    var prevBtn = dialog.querySelector('[data-lightbox-prev]');
    var nextBtn = dialog.querySelector('[data-lightbox-next]');

    var group = [];
    var groupName = '';
    var index = 0;
    var opener = null;

    function groupOf(tile) {
      var list = tile.closest('[data-lightbox-group]');
      return list || document;
    }

    function show(i) {
      index = (i + group.length) % group.length;
      var tile = group[index];

      dialog.classList.remove('is-ready');
      imgEl.src = tile.getAttribute('data-full');
      imgEl.alt = tile.getAttribute('data-caption') || '';
      capEl.textContent = tile.getAttribute('data-caption') || '';
      groupEl.textContent = groupName;
      countEl.textContent = (index + 1) + ' of ' + group.length;

      var reveal = function () { dialog.classList.add('is-ready'); };
      if (imgEl.complete) reveal();
      else imgEl.addEventListener('load', reveal, { once: true });

      var single = group.length < 2;
      prevBtn.hidden = single;
      nextBtn.hidden = single;
    }

    function open(tile) {
      var list = groupOf(tile);
      group = Array.prototype.slice.call(list.querySelectorAll('[data-lightbox]'));
      groupName = list.getAttribute && list.getAttribute('data-lightbox-group') || '';
      opener = tile;

      dialog.hidden = false;
      document.body.classList.add('lightbox-open');
      show(group.indexOf(tile));

      // Must be the close BUTTON, not the backdrop: the backdrop also
      // carries data-lightbox-close but is a div and cannot take focus,
      // which would leave the keyboard tabbing the page behind the
      // overlay.
      dialog.querySelector('button[data-lightbox-close]').focus();
    }

    function close() {
      dialog.hidden = true;
      dialog.classList.remove('is-ready');
      document.body.classList.remove('lightbox-open');
      imgEl.removeAttribute('src');
      if (opener) opener.focus();
      opener = null;
    }

    forEach(tiles, function (tile) {
      tile.addEventListener('click', function () { open(tile); });
    });

    forEach(dialog.querySelectorAll('[data-lightbox-close]'), function (el) {
      el.addEventListener('click', close);
    });
    prevBtn.addEventListener('click', function () { show(index - 1); });
    nextBtn.addEventListener('click', function () { show(index + 1); });

    document.addEventListener('keydown', function (event) {
      if (dialog.hidden) return;

      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); return; }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); return; }

      if (event.key !== 'Tab') return;

      // Keep Tab inside the dialog while it is open.
      var focusable = Array.prototype.filter.call(
        dialog.querySelectorAll('button:not([hidden])'),
        function (el) { return el.offsetParent !== null || el === document.activeElement; }
      );
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Swipe between photographs on touch
    var startX = null;
    dialog.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });
    dialog.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) < 45) return;
      show(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });
  }


  /* ----------------------------------------------------------
     Footer year
     ---------------------------------------------------------- */

  function initYear() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }


  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */

  function forEach(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function addMediaListener(query, handler) {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
    } else if (typeof query.addListener === 'function') {
      query.addListener(handler);
    }
  }


  /* ---------------------------------------------------------- */

  initIntro();
  initReveals();
  initHeader();
  initNav();
  initScrollSpy();
  initCompare();
  initEstimateForm();
  initLightbox();
  initYear();

  // Keep reduced-motion users out of the scroll-driven reveal entirely
  // if they switch the preference on mid-session.
  addMediaListener(reduceMotion, function (event) {
    if (!event.matches) return;
    forEach(
      document.querySelectorAll('[data-reveal], [data-rule], [data-reveal-image], [data-timeline]'),
      function (el) { el.classList.add('is-in'); }
    );
  });

}());
