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
     Reveal on scroll (hybrid: IntersectionObserver + scroll fallback)
     --------------------------------------------------------------------- */
  const revealEls = $$('[data-reveal]');
  const revealedSet = new WeakSet();
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = Math.min(i * 40, 240) + 'ms';
  });

  function revealEl(el) {
    if (revealedSet.has(el)) return;
    revealedSet.add(el);
    el.classList.add('is-revealed');
    // Force inline opacity/transform/filter so the rule always wins
    // regardless of CSS specificity quirks in headless test environments.
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.filter = 'blur(0)';
  }

  function checkReveals() {
    const vh = window.innerHeight || 800;
    revealEls.forEach((el) => {
      if (revealedSet.has(el)) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        revealEl(el);
      }
    });
  }

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(revealEl);
  } else {
    let pending = false;
    function onRevealScroll() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        checkReveals();
        pending = false;
      });
    }
    // Primary: scroll/resize triggers
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealScroll);
    // Secondary: IntersectionObserver (covers programmatic scrolls)
    if ('IntersectionObserver' in window) {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealEl(entry.target);
              revealObs.unobserve(entry.target);
            }
          });
          checkReveals();
        },
        { threshold: 0.01, rootMargin: '0px 0px -5% 0px' }
      );
      revealEls.forEach((el) => revealObs.observe(el));
    }
    // Initial check after layout settles
    requestAnimationFrame(checkReveals);
    setTimeout(checkReveals, 200);
    setTimeout(checkReveals, 1000);
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
     Hero terminal: typing effect
     --------------------------------------------------------------------- */
  const heroCmd = $('#heroCmd');
  if (heroCmd) {
    const lines = ['init --secure', 'verify --integrity', 'deploy --channel=alpha', 'system --online', 'guard --start'];
    let lineIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const baseText = heroCmd.textContent;
    heroCmd.textContent = '';

    function typeLoop() {
      const current = lines[lineIdx];
      if (!deleting) {
        charIdx++;
        heroCmd.textContent = current.slice(0, charIdx);
        if (charIdx >= current.length) {
          deleting = true;
          setTimeout(typeLoop, 1400);
          return;
        }
        setTimeout(typeLoop, 55 + Math.random() * 40);
      } else {
        charIdx--;
        heroCmd.textContent = current.slice(0, charIdx);
        if (charIdx <= 0) {
          deleting = false;
          lineIdx = (lineIdx + 1) % lines.length;
          setTimeout(typeLoop, 280);
          return;
        }
        setTimeout(typeLoop, 28);
      }
    }
    setTimeout(typeLoop, 600);
  }

  /* ---------------------------------------------------------------------
     Hero binary rain text — randomize contents per column
     --------------------------------------------------------------------- */
  if (!reducedMotion) {
    const columns = $$('.hero__binary span');
    columns.forEach((col) => {
      let s = '';
      for (let i = 0; i < 30; i++) s += Math.random() > 0.5 ? '1 ' : '0 ';
      col.setAttribute('data-b', s);
    });
  }

  /* ---------------------------------------------------------------------
     Stats panel: count-up + bar fill when in view
     --------------------------------------------------------------------- */
  const statsCards = $$('.stats__card');
  const countedStats = new WeakSet();
  function countUp(card) {
    if (countedStats.has(card)) return;
    countedStats.add(card);
    const valueEl = card.querySelector('.stats__value');
    const target = parseFloat(valueEl.dataset.count || '0');
    const suffix = valueEl.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      const text = (target % 1 === 0)
        ? Math.round(v).toString()
        : v.toFixed(2);
      valueEl.textContent = text + suffix;
      if (t < 1) requestAnimationFrame(step);
      else valueEl.textContent = (target % 1 === 0 ? Math.round(target) : target.toFixed(2)) + suffix;
    }
    requestAnimationFrame(step);
    card.classList.add('is-counted');
  }
  function checkStats() {
    const vh = window.innerHeight || 800;
    statsCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < vh * 0.85 && rect.bottom > 0) countUp(card);
    });
  }
  if (statsCards.length) {
    let pendingStats = false;
    window.addEventListener('scroll', () => {
      if (pendingStats) return;
      pendingStats = true;
      requestAnimationFrame(() => { checkStats(); pendingStats = false; });
    }, { passive: true });
    window.addEventListener('resize', checkStats);
    requestAnimationFrame(checkStats);
    setTimeout(checkStats, 600);
  }

  /* ---------------------------------------------------------------------
     Boot / intro overlay
     --------------------------------------------------------------------- */
  const boot = $('#boot');
  function dismissBoot() {
    if (!boot || boot.classList.contains('is-done')) return;
    boot.classList.add('is-done');
    document.body.classList.remove('is-booting');
    sessionStorage.setItem('nxl-booted', '1');
    // Force the hidden state regardless of CSS transition quirks
    setTimeout(() => {
      if (boot) {
        boot.style.opacity = '0';
        boot.style.visibility = 'hidden';
        boot.style.pointerEvents = 'none';
      }
    }, 700);
  }
  if (boot) {
    if (sessionStorage.getItem('nxl-booted') === '1' || reducedMotion) {
      // Skip the intro on revisit / reduced-motion users
      boot.classList.add('is-done');
      boot.style.opacity = '0';
      boot.style.visibility = 'hidden';
      boot.style.pointerEvents = 'none';
    } else {
      document.body.classList.add('is-booting');
      // Auto-dismiss after the log finishes
      const totalMs = 2600 + 400;
      setTimeout(dismissBoot, totalMs);
      // Click / key to skip
      const skipHandler = () => dismissBoot();
      boot.addEventListener('click', skipHandler, { once: true });
      window.addEventListener('keydown', skipHandler, { once: true });
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
