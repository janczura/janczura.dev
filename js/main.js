/* ============================================================
   JANCZURA.DE — INK & VERMILION
   main.js — theme, nav, reveal, typing, petals, cursor,
   cookie consent, email reveal, misc.
   ============================================================ */
(() => {
    'use strict';

    const root = document.documentElement;
    root.classList.add('js');

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- THEME (day / night) ---------- */
    const THEME_KEY = 'sj-theme';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const themeBtn = document.getElementById('theme-toggle');
    const themeGlyph = document.getElementById('theme-glyph');
    const DARK_COLOR = '#0f0d0b';
    const LIGHT_COLOR = '#f4edde';

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (themeGlyph) {
            themeGlyph.textContent = theme === 'dark' ? '\u65e5' : '\u6708'; // day / moon
        }
        if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? DARK_COLOR : LIGHT_COLOR);
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    }

    let savedTheme = null;
    try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    setTheme(savedTheme === 'light' ? 'light' : 'dark');

    if (themeBtn && themeGlyph) {
        // Easter egg: the toggle dodges the cursor a few times before settling.
        let dodges = 0;
        const dodgeGlyphs = ['\u8d70', '\u5feb', '\u4f86']; // "walk", "fast", "come"
        let restoreTimer = null;

        function placeAwayFrom(x, y) {
            const rect = themeBtn.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let nx, ny, tries = 0;
            do {
                nx = Math.round(16 + Math.random() * Math.max(40, vw - rect.width - 32));
                ny = Math.round(70 + Math.random() * Math.max(40, vh - rect.height - 120));
                tries += 1;
            } while (tries < 40 && Math.abs(nx - x) < 170 && Math.abs(ny - y) < 170);
            themeBtn.style.left = nx + 'px';
            themeBtn.style.top = ny + 'px';
            themeBtn.style.right = 'auto';
        }

        themeBtn.addEventListener('mouseenter', (e) => {
            if (!finePointer || dodges >= 3) return;
            dodges += 1;
            placeAwayFrom(e.clientX, e.clientY);
            themeGlyph.textContent = dodgeGlyphs[dodges - 1];
            clearTimeout(restoreTimer);
            const target = root.getAttribute('data-theme') === 'dark' ? '\u65e5' : '\u6708';
            restoreTimer = setTimeout(() => { themeGlyph.textContent = target; }, 1000);
        });

        themeBtn.addEventListener('click', () => {
            clearTimeout(restoreTimer);
            setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    }

    /* ---------- NAV: scroll state, active section, smooth scroll ---------- */
    function initNav() {
        const nav = document.getElementById('site-nav');
        const links = Array.from(document.querySelectorAll('.nav-links a'));
        const sections = Array.from(document.querySelectorAll('main section[id]'));
        if (!nav || !links.length) return;

        let ticking = false;

        function update() {
            ticking = false;
            nav.classList.toggle('scrolled', window.scrollY > 28);

            let current = '';
            const pos = window.scrollY + window.innerHeight * 0.35;
            sections.forEach((s) => {
                if (pos >= s.offsetTop) current = s.id;
            });
            links.forEach((l) => {
                l.classList.toggle('active', current !== '' && l.dataset.section === current);
            });
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });
        update();

        links.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
                }
            });
        });

        const hint = document.querySelector('.scroll-hint');
        if (hint) {
            hint.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('about');
                if (target) target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
            });
        }
    }

    /* ---------- SCROLL REVEAL ---------- */
    function initReveal() {
        const els = Array.from(document.querySelectorAll('[data-reveal]'));
        if (!els.length) return;

        // stagger within each sibling group
        els.forEach((el) => {
            const siblings = Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal'));
            el.style.setProperty('--d', (siblings.indexOf(el) * 90) + 'ms');
        });

        if (prefersReduced || !('IntersectionObserver' in window)) {
            els.forEach((el) => el.classList.add('revealed'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        els.forEach((el) => io.observe(el));
    }

    /* ---------- TYPING ---------- */
    function initTyping() {
        const el = document.getElementById('typing');
        if (!el) return;
        const words = ['Spring Boot', 'PostgreSQL', 'Docker', 'REST APIs', 'e-commerce scale', 'Rust'];

        if (prefersReduced) {
            el.textContent = words[0];
            return;
        }

        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function tick() {
            const word = words[wordIndex];
            if (!deleting) {
                charIndex += 1;
                el.textContent = word.slice(0, charIndex);
                if (charIndex === word.length) {
                    deleting = true;
                    setTimeout(tick, 1700);
                    return;
                }
                setTimeout(tick, 55 + Math.random() * 45);
            } else {
                charIndex -= 1;
                el.textContent = word.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    setTimeout(tick, 350);
                    return;
                }
                setTimeout(tick, 28);
            }
        }

        setTimeout(tick, 500);
    }

    /* ---------- DRIFTING PETALS (canvas) ---------- */
    function initPetals() {
        const canvas = document.getElementById('petals');
        if (!canvas || prefersReduced) return;
        const ctx = canvas.getContext('2d');

        let w = 0;
        let h = 0;
        let dpr = 1;
        let petals = [];
        let running = true;
        let rafId = null;
        let last = 0;

        function readColors() {
            const cs = getComputedStyle(root);
            return {
                red: cs.getPropertyValue('--vermilion').trim() || '#d0492f',
                gold: cs.getPropertyValue('--gold').trim() || '#c9a227'
            };
        }
        let colors = readColors();
        new MutationObserver(() => { colors = readColors(); })
            .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

        function spawn(init) {
            const isDot = Math.random() < 0.22;
            return {
                x: Math.random() * w,
                y: init ? Math.random() * h : -24,
                s: isDot ? 0.8 + Math.random() * 1.4 : 2.6 + Math.random() * 4.2,
                vy: 9 + Math.random() * 22,
                vx: -6 + Math.random() * 12,
                ph: Math.random() * Math.PI * 2,
                sw: 0.4 + Math.random() * 0.9,
                amp: 0.35 + Math.random() * 0.6,
                rot: Math.random() * Math.PI,
                vr: -0.6 + Math.random() * 1.2,
                a: isDot ? 0.16 + Math.random() * 0.16 : 0.10 + Math.random() * 0.14,
                dot: isDot,
                gold: !isDot && Math.random() < 0.25,
                t: Math.random() * 100
            };
        }

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.max(14, Math.min(34, Math.round((w * h) / 42000)));
            petals = Array.from({ length: count }, () => spawn(true));
        }

        function frame(now) {
            if (!running) return;
            const dt = Math.min(50, (now - last) || 16) / 1000;
            last = now;
            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < petals.length; i += 1) {
                const p = petals[i];
                p.t += dt;
                p.y += p.vy * dt;
                p.x += (p.vx + Math.sin(p.t * p.sw + p.ph) * p.amp * 14) * dt;
                p.rot += p.vr * dt;

                if (p.y > h + 26) { Object.assign(p, spawn(false)); }
                if (p.x < -32) p.x = w + 22;
                else if (p.x > w + 32) p.x = -22;

                ctx.globalAlpha = p.a;
                ctx.fillStyle = (p.gold || p.dot) ? colors.gold : colors.red;
                if (p.dot) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.scale(1, 0.58);
                    ctx.beginPath();
                    ctx.arc(0, 0, p.s, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            ctx.globalAlpha = 1;
            rafId = window.requestAnimationFrame(frame);
        }

        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) {
                last = performance.now();
                rafId = window.requestAnimationFrame(frame);
            } else if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
        });

        window.addEventListener('resize', resize, { passive: true });
        resize();
        rafId = window.requestAnimationFrame(frame);
    }

    /* ---------- CUSTOM CURSOR ---------- */
    function initCursor() {
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        if (!dot || !ring || !finePointer || prefersReduced) return;

        document.body.classList.add('has-cursor');

        let mx = -100;
        let my = -100;
        let rx = -100;
        let ry = -100;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';
        }, { passive: true });

        function loop() {
            rx += (mx - rx) * 0.22;
            ry += (my - ry) * 0.22;
            ring.style.transform = 'translate(' + (rx - 17) + 'px,' + (ry - 17) + 'px)';
            window.requestAnimationFrame(loop);
        }
        window.requestAnimationFrame(loop);

        const interactive = 'a, button, .proj, .tag, .tl-item, .edu-card, .mini-btn, .cookie-btn, .theme-toggle';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactive)) ring.classList.add('hovering');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactive)) ring.classList.remove('hovering');
        });
    }

    /* ---------- EMAIL REVEAL ---------- */
    function initEmail() {
        const btn = document.getElementById('reveal-email-btn');
        const display = document.getElementById('email-display');
        if (!btn || !display) return;

        btn.addEventListener('click', () => {
            display.textContent = ['janczurasergiusz', '@protonmail.com'].join('');
            btn.remove();
        });
    }

    /* ---------- CURRENT YEAR ---------- */
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- COOKIE CONSENT BANNER ---------- */
    function initCookie() {
        const banner = document.getElementById('cookie-banner');
        if (!banner) return;

        const CONSENT_KEY = 'cookie-consent';

        function readConsent() {
            try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
        }
        function saveConsent(value) {
            try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* page-view only */ }
        }
        function hideBanner() {
            banner.classList.remove('visible');
            setTimeout(() => { banner.hidden = true; }, 500);
        }
        function decide(value) {
            saveConsent(value);
            if (value === 'granted' && typeof window.gtag === 'function') {
                window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
            }
            hideBanner();
        }

        const stored = readConsent();
        if (stored !== 'granted' && stored !== 'denied') {
            banner.hidden = false;
            // let the hero breathe before the banner slides in
            setTimeout(() => banner.classList.add('visible'), 2400);
        }

        const accept = document.getElementById('cookie-accept');
        const decline = document.getElementById('cookie-decline');
        if (accept) accept.addEventListener('click', () => decide('granted'));
        if (decline) decline.addEventListener('click', () => decide('denied'));
    }

    /* ---------- BOOT ---------- */
    initNav();
    initReveal();
    initTyping();
    initPetals();
    initCursor();
    initEmail();
    initCookie();
})();
