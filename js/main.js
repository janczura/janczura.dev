// ============================================
// CYBERPUNK DRAGON PORTFOLIO — MAIN JS
// ============================================

(function () {
    'use strict';

    // === FLOATING CHINESE CHARACTERS ===
    const chars = ['龙', '火', '福', '道', '武', '风', '雷', '电', '光', '影', '剑', '魂', '天', '地', '水', '山', '海', '月', '星', '云', '梦', '力', '气', '神'];

    function createFloatingChar() {
        const el = document.createElement('span');
        el.className = 'float-char';
        el.textContent = chars[Math.floor(Math.random() * chars.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (Math.random() * 40 + 20) + 'px';
        const duration = Math.random() * 20 + 15;
        el.style.animationDuration = duration + 's';
        el.style.animationDelay = Math.random() * 5 + 's';
        document.getElementById('floating-chars').appendChild(el);

        setTimeout(() => {
            el.remove();
        }, (duration + 6) * 1000);
    }

    for (let i = 0; i < 18; i++) {
        setTimeout(createFloatingChar, i * 400);
    }
    setInterval(createFloatingChar, 2000);

    // === SCREEN SHAKE ON LOAD ===
    const container = document.querySelector('.container');
    let shakeStart = performance.now();
    const shakeDuration = 500;

    function shake(now) {
        const elapsed = now - shakeStart;
        if (elapsed < shakeDuration) {
            const progress = elapsed / shakeDuration;
            const intensity = (1 - progress) * 4;
            const dx = (Math.random() - 0.5) * intensity * 2;
            const dy = (Math.random() - 0.5) * intensity * 2;
            document.body.style.transform = `translate(${dx}px, ${dy}px)`;
            requestAnimationFrame(shake);
        } else {
            document.body.style.transform = '';
        }
    }
    setTimeout(() => requestAnimationFrame(shake), 300);

    // === STAGGERED HEADER REVEAL ===
    const introItems = document.querySelectorAll('.intro-item');
    introItems.forEach((item, i) => {
        setTimeout(() => {
            item.classList.add('revealed');
        }, 800 + i * 250);
    });


    // === FIREWORKS CANVAS ===
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#ff2d55', '#ffd700', '#00f0ff', '#ff00aa', '#ff6b35', '#ffffff'];

    class Particle {
        constructor(x, y, color, opts = {}) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = (opts.speed || Math.random() * 4 + 1);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = opts.alpha || 1;
            this.decay = opts.decay || Math.random() * 0.015 + 0.008;
            this.color = color;
            this.size = opts.size || Math.random() * 2.5 + 0.5;
            this.trail = opts.trail || false;
            this.history = [];
        }

        update() {
            if (this.trail) {
                this.history.push({ x: this.x, y: this.y, alpha: this.alpha * 0.5 });
                if (this.history.length > 6) this.history.shift();
            }
            this.x += this.vx;
            this.y += this.vy;
            this.vy += opts_gravity || 0.03;
            this.vx *= 0.99;
            this.alpha -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            if (this.trail && this.history.length > 1) {
                for (let i = 0; i < this.history.length; i++) {
                    const h = this.history[i];
                    const t = i / this.history.length;
                    ctx.globalAlpha = Math.max(h.alpha * t, 0);
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(h.x, h.y, this.size * t * 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = Math.max(this.alpha, 0);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    let opts_gravity = 0.03;
    let particles = [];

    function launchFirework(x, y) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = Math.floor(Math.random() * 60) + 40;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x || Math.random() * W, y || Math.random() * H * 0.5, color));
        }
    }

    function launchMegaFirework(x, y) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 120; i++) {
            particles.push(new Particle(x, y, color, {
                speed: Math.random() * 7 + 2,
                size: Math.random() * 3 + 1,
                decay: Math.random() * 0.01 + 0.005,
                trail: true
            }));
        }
    }

    // Initial mega burst on load — cinematic opening
    setTimeout(() => launchMegaFirework(W * 0.25, H * 0.3), 600);
    setTimeout(() => launchMegaFirework(W * 0.75, H * 0.25), 900);
    setTimeout(() => launchMegaFirework(W * 0.5, H * 0.15), 1100);
    setTimeout(() => launchMegaFirework(W * 0.35, H * 0.45), 1400);
    setTimeout(() => launchMegaFirework(W * 0.65, H * 0.4), 1600);
    setTimeout(() => { launchFirework(W * 0.2, H * 0.3); launchFirework(W * 0.8, H * 0.35); }, 1900);

    // Click to launch fireworks
    document.addEventListener('click', (e) => {
        launchFirework(e.clientX, e.clientY);
    });

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles = particles.filter(p => p.alpha > 0);
        for (const p of particles) {
            p.update();
            p.draw(ctx);
        }
        requestAnimationFrame(animate);
    }
    animate();


    // === SCROLL REVEAL ===
    const sections = document.querySelectorAll('.card-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(s => observer.observe(s));


    // === EMAIL REVEAL ===
    const emailBtn = document.getElementById('reveal-email-btn');
    const emailDisplay = document.getElementById('email-display');

    if (emailBtn && emailDisplay) {
        emailBtn.addEventListener('click', () => {
            const parts = ['janczurasergiusz', '@protonmail.com'];
            emailDisplay.textContent = parts.join('');
            emailDisplay.style.color = '#00f0ff';
            emailDisplay.style.textShadow = '0 0 8px rgba(0,240,255,0.5)';
            emailBtn.remove();
        });
    }


    // === CURRENT YEAR ===
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }


    // === SMOOTH SCROLL FOR NAV ===
    document.querySelectorAll('.site-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // === NAV ACTIVE STATE ON SCROLL ===
    const navLinks = document.querySelectorAll('.site-nav a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 200;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '#8a8780';
            if (link.dataset.section === current) {
                link.style.color = '#fff';
            }
        });
    }, { passive: true });


    // === PERIODIC FIREWORKS ===
    setInterval(() => {
        if (Math.random() > 0.6) {
            launchFirework();
        }
    }, 5000);

})();
