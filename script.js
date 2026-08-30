/* ==========================================================================
   NXL — Nexel Labs
   Interactions & behavior
   ========================================================================== */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     Navigation: scroll state + mobile menu + active link
     --------------------------------------------------------------------- */
  const nav = $('#nav');
  const navMenu = $('#navMenu');
  const navMobile = $('#navMobile');
  const navLinks = $$('[data-nav-link]');

  function updateNavOnScroll() {
    if (!nav) return;
    if (window.scrollY > 12) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateNavOnScroll();
      scrollTicking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNavOnScroll();

  // Mobile menu toggle
  if (navMenu && navMobile) {
    navMenu.addEventListener('click', () => {
      const open = navMenu.getAttribute('aria-expanded') === 'true';
      navMenu.setAttribute('aria-expanded', String(!open));
      if (open) {
        navMobile.classList.remove('is-open');
        navMobile.setAttribute('hidden', '');
      } else {
        navMobile.removeAttribute('hidden');
        // Force reflow so transition triggers
        // eslint-disable-next-line no-unused-expressions
        navMobile.offsetHeight;
        navMobile.classList.add('is-open');
      }
    });

    // Close mobile menu when a link is clicked
    navMobile.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      navMenu.setAttribute('aria-expanded', 'false');
      navMobile.classList.remove('is-open');
      navMobile.setAttribute('hidden', '');
    });
  }

  // Active nav link tracking via IntersectionObserver
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return null;
      const section = document.querySelector(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            const id = '#' + entry.target.id;
            navLinks.forEach((l) => l.classList.toggle('nav__link--active', l.getAttribute('href') === id));
          }
        });
      },
      { threshold: [0.2, 0.5], rootMargin: '-80px 0px -40% 0px' }
    );
    sections.forEach(({ section }) => observer.observe(section));
  }

  /* ---------------------------------------------------------------------
     Smooth scroll for anchor links (with sticky-nav offset)
     --------------------------------------------------------------------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length && !reducedMotion) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 40, 240) + 'ms';
      revealObs.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-revealed'));
  }

  /* ---------------------------------------------------------------------
     Product showcase: tab switcher
     --------------------------------------------------------------------- */
  const tabs = $$('.device__tab');
  const screens = $$('.device__screen');
  const tabIndicator = $('.device__tab-indicator');

  function activateTab(name) {
    tabs.forEach((t) => {
      const isActive = t.dataset.tab === name;
      t.classList.toggle('device__tab--active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });
    screens.forEach((s) => {
      s.classList.toggle('device__screen--active', s.dataset.screen === name);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const idx = tabs.indexOf(tab);
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(idx + dir + tabs.length) % tabs.length];
      if (next) {
        next.focus();
        activateTab(next.dataset.tab);
      }
    });
  });

  /* ---------------------------------------------------------------------
     Hero visual: subtle mouse-follow parallax
     --------------------------------------------------------------------- */
  const heroVisual = $('.hero__visual');
  const heroSection = $('.hero');

  if (heroVisual && heroSection && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = null;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 14;
      targetY = y * 10;
      if (!raf) animate();
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!raf) animate();
    });

    function animate() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      heroVisual.style.transform = `translate(calc(-50% + ${currentX.toFixed(2)}px), calc(-50% + ${currentY.toFixed(2)}px))`;
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        raf = window.requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    }
  }

  /* ---------------------------------------------------------------------
     Console banner
     --------------------------------------------------------------------- */
  if (window.console && console.log) {
    const styles = [
      'color:#60A5FA',
      'font-weight:600',
      'font-size:14px'
    ].join(';');
    console.log('%cNXL // Nexel Labs — Engineering what comes next.', styles);
    console.log('%cBuild 2026 · System Online', 'color:#6B7280;font-size:11px');
  }
})();
