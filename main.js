(() => {
  'use strict';

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js-ready');

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ── hero: typed command sequence ─────────────────────────────
     Kept deliberately short. The CTAs live in the last reveal step, so
     every millisecond here is a millisecond a visitor cannot click
     "Get in touch". Whole sequence lands at roughly 2.2s. */

  const CHAR_MS = 18;   // base delay per character
  const JITTER  = 12;   // random extra, for a human cadence

  const typeInto = async (el, speed = CHAR_MS) => {
    const text = el.dataset.type || '';
    if (reduced) { el.textContent = text; return; }
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      await wait(speed + Math.random() * JITTER);
    }
  };

  const show = (step) => {
    const el = $(`.reveal[data-step="${step}"]`);
    if (el) el.classList.add('is-in');
  };

  const runHero = async () => {
    const types = $$('.terminal .type');
    if (!types.length) return;

    if (reduced) {
      types.forEach((el) => { el.textContent = el.dataset.type || ''; });
      $$('.terminal .reveal').forEach((el) => el.classList.add('is-in'));
      return;
    }

    await wait(200);
    await typeInto(types[0]);
    await wait(120);
    show(1);

    await wait(260);
    show(2);
    await wait(100);
    await typeInto(types[1]);
    await wait(100);
    show(3);

    await wait(240);
    show(4);
    await wait(100);
    await typeInto(types[2]);
    await wait(100);
    show(5);
  };

  /* ── scroll reveal for sections ───────────────────────────────── */

  const initRise = () => {
    if (reduced || !('IntersectionObserver' in window)) return;

    const targets = $$([
      '.section .section-title',
      '.section-note',
      '.about-grid > *',
      '.timeline .job',
      '.skill-card',
      '.project',
      '.edu-grid > *',
      '.post-item',
      '.contact-box'
    ].join(','));

    targets.forEach((el, i) => {
      el.classList.add('rise');
      el.style.setProperty('--rise-delay', `${(i % 6) * 55}ms`);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    targets.forEach((el) => io.observe(el));
  };

  /* ── nav: stuck state, active link, mobile menu ───────────────── */

  const initNav = () => {
    const nav = $('#nav');
    const toggle = $('#navToggle');
    if (!nav || !toggle) return;

    const links = $$('.nav-links a', nav);

    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    links.forEach((a) => a.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !nav.classList.contains('is-open')) return;
      close();
      toggle.focus();
    });

    if (!('IntersectionObserver' in window)) return;

    // Only same-page anchors take part in scroll-spy. Links to other pages
    // (e.g. /blog/ from the home nav) are skipped.
    const anchors = links.filter((a) => (a.getAttribute('href') || '').startsWith('#'));
    const sections = anchors.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if (!sections.length) return;

    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const current = sections.find((s) => visible.has(s.id));
      anchors.forEach((a) => {
        a.classList.toggle('is-active', !!current && a.getAttribute('href') === `#${current.id}`);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => io.observe(s));
  };

  /* ── contact: build the mailto at runtime ─────────────────────
     Keeps a plain address out of the served HTML. The markup carries a
     human-readable fallback, so this is an upgrade, not a requirement. */

  const initMail = () => {
    const el = $('#mail');
    if (!el) return;
    const { u, d } = el.dataset;
    if (!u || !d) return;
    const address = `${u}@${d}`;
    el.href = `mailto:${address}`;
    el.textContent = address;
  };

  /* ── 404: echo back the path that was actually requested ─────── */

  const init404 = () => {
    const el = $('#path404');
    if (!el) return;
    // textContent, never innerHTML — the path is attacker-controlled input.
    el.textContent = decodeURIComponent(location.pathname).slice(0, 80);
  };

  /* ── boot ─────────────────────────────────────────────────────── */

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  initNav();
  initMail();
  init404();
  initRise();
  runHero();
})();
