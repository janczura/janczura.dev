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
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.008;
            this.color = color;
            this.size = Math.random() * 2.5 + 0.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.03;
            this.vx *= 0.99;
            this.alpha -= this.decay;
        }

        draw(ctx) {
            ctx.save();
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

    let particles = [];

    function launchFirework(x, y) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = Math.floor(Math.random() * 60) + 40;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x || Math.random() * W, y || Math.random() * H * 0.5, color));
        }
    }

    // Initial burst on load
    setTimeout(() => launchFirework(W * 0.3, H * 0.25), 400);
    setTimeout(() => launchFirework(W * 0.7, H * 0.2), 800);
    setTimeout(() => launchFirework(W * 0.5, H * 0.15), 1200);

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
