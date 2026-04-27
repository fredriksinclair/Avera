(function () {
  'use strict';

  var motion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  /* ─────────────────────────────────────────────
     LINE-MASK REVEAL
     Wraps an element's content in overflow:hidden
     so the text slides up into view cleanly.
  ───────────────────────────────────────────── */
  function maskEl(el) {
    var inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.innerHTML = el.innerHTML;
    el.innerHTML = '';
    var mask = document.createElement('span');
    mask.className = 'line-mask';
    mask.appendChild(inner);
    el.appendChild(mask);
    return inner;
  }

  function revealLine(inner, delay) {
    setTimeout(function () {
      inner.classList.add('visible');
    }, delay || 0);
  }

  /* ─────────────────────────────────────────────
     HERO — home page
     Each .hero-line slides up sequentially, then
     lede + CTA fade in.
  ───────────────────────────────────────────── */
  function setupHero() {
    var lines = document.querySelectorAll('.hero-line');
    if (!lines.length) return;

    if (motion) {
      lines.forEach(function (line, i) {
        var inner = maskEl(line);
        revealLine(inner, 60 + i * 150);
      });

      setTimeout(function () {
        document.querySelectorAll('.hero [data-reveal]').forEach(function (el) {
          el.classList.add('in-view');
        });
      }, 520);
    }
  }

  /* ─────────────────────────────────────────────
     INNER PAGE H1
     Slides up on page load.
  ───────────────────────────────────────────── */
  function setupPageTitle() {
    var h1 = document.querySelector('main.inner-main h1');
    if (!h1 || !motion) return;
    var inner = maskEl(h1);
    revealLine(inner, 160);
  }

  /* ─────────────────────────────────────────────
     SECTION CONTENT REVEALS
     H2/H3 elements get the line-mask slide-up.
     Everything else fades + rises on scroll.
  ───────────────────────────────────────────── */
  function setupSectionReveals() {
    document.querySelectorAll('section:not(.hero)').forEach(function (section) {
      var all = Array.prototype.slice.call(section.querySelectorAll('[data-reveal]'));
      var lineInners = [];
      var fadeEls    = [];

      all.forEach(function (el) {
        if (motion && (el.tagName === 'H2' || el.tagName === 'H3')) {
          el.removeAttribute('data-reveal');
          lineInners.push(maskEl(el));
        } else {
          fadeEls.push(el);
        }
      });

      var staggerBase = lineInners.length ? 180 : 0;
      fadeEls.forEach(function (el, i) {
        el.style.transitionDelay = (staggerBase + i * 110) + 'ms';
      });

      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          section.classList.add('in-view');
          lineInners.forEach(function (inner, i) { revealLine(inner, i * 110); });
          fadeEls.forEach(function (el) { el.classList.add('in-view'); });
          io.disconnect();
        }
      }, { threshold: 0.08 });

      io.observe(section);
    });
  }

  /* ─────────────────────────────────────────────
     HERO PARALLAX
  ───────────────────────────────────────────── */
  function setupParallax() {
    var content = document.querySelector('.hero-content');
    if (!content || !motion) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          content.style.transform = 'translateY(' + (window.scrollY * 0.28) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     NAV — single source of truth for link labels.
     Edit here to rename a tab across every page.
  ───────────────────────────────────────────── */
  var NAV_LINKS = [
    { href: 'index.html',    label: 'Home' },
    { href: 'approach.html', label: 'Our approach' },
    { href: 'work.html',     label: 'Our work' },
    { href: 'people.html',   label: 'Our people' },
    { href: 'contact.html',  label: 'Contact' },
  ];

  function setupNav() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;

    var page = window.location.pathname.split('/').pop() || 'index.html';
    nav.innerHTML = '';
    NAV_LINKS.forEach(function (link) {
      var a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.label;
      if (page === link.href) a.className = 'active';
      nav.appendChild(a);
    });

    // Mobile hamburger
    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-controls', 'site-nav');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.parentNode.insertBefore(toggle, nav.nextSibling);

    function closeMenu() {
      nav.classList.remove('nav--open');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav--open');
      document.body.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) closeMenu();
    });
  }

  /* ─────────────────────────────────────────────
     PAGE TRANSITIONS — cream curtain wipe
     Exit: cream panel sweeps in from the right,
           covering the page before navigation.
     Entry: cream panel starts covering, then
            sweeps off to the right revealing the
            new page.
  ───────────────────────────────────────────── */
  function setupPageTransitions() {
    if (!motion) return;

    var EASE     = 'cubic-bezier(0.76, 0, 0.24, 1)';
    var DUR_IN   = 520; // reveal: slower, lets the new page breathe
    var DUR_OUT  = 400; // cover: snappier

    var overlay = document.createElement('div');
    overlay.className = 'page-overlay';
    document.body.appendChild(overlay);

    // Entry: overlay covers on arrival, then sweeps right to reveal
    overlay.style.cssText = 'transform:translateX(0);transition:none';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.cssText =
          'transform:translateX(101%);' +
          'transition:transform ' + DUR_IN + 'ms ' + EASE;
      });
    });

    // Exit: overlay sweeps in from right, then navigate
    // Uses event delegation to catch nav links added by setupNav()
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' ||
          href.indexOf('mailto:') === 0 || href.indexOf('http') === 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      // Close mobile nav if open
      var nav = document.getElementById('site-nav');
      if (nav) nav.classList.remove('nav--open');
      document.body.classList.remove('nav-open');
      overlay.style.cssText =
        'transform:translateX(101%);transition:none';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.style.cssText =
            'transform:translateX(0);' +
            'transition:transform ' + DUR_OUT + 'ms ' + EASE;
          setTimeout(function () {
            window.location.href = href;
          }, DUR_OUT);
        });
      });
    });
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  setupNav();
  setupHero();
  setupPageTitle();
  setupSectionReveals();
  setupParallax();
  setupPageTransitions();

}());
