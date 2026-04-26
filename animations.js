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

      // lede + cta-row fade in after heading finishes
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
    revealLine(inner, 120);
  }

  /* ─────────────────────────────────────────────
     SECTION CONTENT REVEALS
     IntersectionObserver per section — adds in-view
     to the section (for rule animation) and to each
     [data-reveal] child with staggered delay.
  ───────────────────────────────────────────── */
  function setupSectionReveals() {
    document.querySelectorAll('section:not(.hero)').forEach(function (section) {
      var els = section.querySelectorAll('[data-reveal]');

      // Apply stagger delays
      els.forEach(function (el, i) {
        el.style.transitionDelay = (i * 110) + 'ms';
      });

      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          section.classList.add('in-view');
          els.forEach(function (el) { el.classList.add('in-view'); });
          io.disconnect();
        }
      }, { threshold: 0.1 });

      io.observe(section);
    });
  }

  /* ─────────────────────────────────────────────
     HERO PARALLAX
     Hero content rises slightly as you scroll away
     from it, creating depth.
  ───────────────────────────────────────────── */
  function setupParallax() {
    var content = document.querySelector('.hero-content');
    if (!content || !motion) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.scrollY;
          content.style.transform = 'translateY(' + (y * 0.28) + 'px)';
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
  }

  /* ─────────────────────────────────────────────
     PAGE TRANSITIONS
     Intercepts internal link clicks to fade the page
     out before navigating.
  ───────────────────────────────────────────── */
  function setupPageTransitions() {
    if (!motion) return;
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('http') === 0) return;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        document.body.classList.add('page-leaving');
        setTimeout(function () { window.location.href = href; }, 210);
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
