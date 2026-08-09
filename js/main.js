// ============================================
// MODERN IDE TERMINAL PORTFOLIO — MAIN JS
// ============================================

(function () {
    'use strict';

    // === PARTICLE GRID BACKGROUND (replaces floating chars + scanlines) ===
    const gridContainer = document.getElementById('particle-grid');

    if (!gridContainer) {
        console.warn('particle-grid element not found, skipping particle grid');
    } else {
        const cols = 18;
        const rows = Math.floor(window.innerHeight / 40);

        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            const line = document.createElement('div');
            line.className = 'particle-line';
            line.style.top = (i * 40) + 'px';
            line.style.left = '0';
            line.style.width = '100%';
            line.style.height = '1px';
            const delay = Math.random() * 8;
            line.style.animationDelay = (-delay) + 's';
            gridContainer.appendChild(line);
        }

        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            const xPos = (i / cols) * 100;
            const line = document.createElement('div');
            line.className = 'particle-line';
            line.style.left = xPos + '%';
            line.style.top = '0';
            line.style.width = '1px';
            line.style.height = '100%';
            const delay = Math.random() * 8;
            line.style.animationDelay = (-delay) + 's';
            gridContainer.appendChild(line);
        }

        // Occasional nodes at intersections (sparse)
        function spawnNode(x, y) {
            const node = document.createElement('div');
            node.className = 'particle-node';
            node.style.left = x + 'px';
            node.style.top = y + 'px';
            gridContainer.appendChild(node);

            setTimeout(() => node.remove(), 3000 + Math.random() * 2000);
        }

        setInterval(() => {
            if (Math.random() > 0.4) return; // sparse nodes
            const x = Math.floor(Math.random() * window.innerWidth);
            const y = Math.floor(Math.random() * window.innerHeight);
            spawnNode(x, y);
        }, 800);
    }

    // === SCREEN SHAKE ON LOAD ===
    let shakeStart = performance.now();
    const shakeDuration = 500;

    function shake(now) {
        const elapsed = now - shakeStart;
        if (elapsed < shakeDuration) {
            const progress = elapsed / shakeDuration;
            const intensity = (1 - progress) * 3;
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


    // === CODE GLITCH REVEAL — terminal-style code wall that dissolves to reveal the page ===
    const glitchOverlay = document.getElementById('code-glitch');

    if (glitchOverlay) {
        // One big Java stack trace as a single variable — displayed character-by-character
        const javaStackTrace = [
            'Exception in thread "main" java.lang.NullPointerException: Cannot invoke',
            '"dev.janczura.model.Order.getTotalAmount()" because the return value of',
            '"dev.janczura.dao.OrderRepository.findById(Long)" is null',
            '',
            '  at dev.janczura.service.OrderService.processPayment(OrderService.java:127)',
            '  at java.base/java.util.ArrayList.forEach(ArrayList.java:1543)',
            '  at dev.janczura.controller.CheckoutController.lambda$processCheckout$0(CheckoutController.java:89)',
            '',
            'Caused by: org.springframework.dao.InvalidDataAccessApiUsageException:',
            'No value specified for parameter 2',
            '',
            '  at org.hibernate.sql.ast.spi.SqlSelectionImpl.<init>(SqlSelectionImpl.java:74)',
            '  at org.hibernate.sql.ast.spi.SqlAstProcessingStateImpl.registerSqlSelection(SqlAstProcessingStateImpl.java:109)',
            '  at org.hibernate.sql.ast.tree.select.QuerySpec.forEachSelectExpression(QuerySpec.java:253)',
            '',
            'Caused by: java.sql.SQLException: ORA-01788:',
            'CONNECT BY cannot be specified when NO TABLE SAMPLE is used',
            '',
            '  at oracle.jdbc.driver.OracleDatabaseErrorRecoveryCallback.parseErrors(OracleDatabaseErrorRecoveryCallback.java:596)',
            '  at org.hibernate.exception.internal.SQLExceptionTypeDelegate$1.convert(SQLExceptionTypeDelegate.java:82)',
            '',
            'org.springframework.transaction.TransactionSystemException:',
            'Could not commit JDBC transaction; nested exception is',
            'java.sql.SQLTransientConnectionException: Connection is not available, request timed out',
            '',
            '  at com.zaxxer.hikari.pool.HikariTransactionObject.commit(HikariTransactionObject.java:96)',
            '  at org.springframework.jdbc.datasource.DataSourceTransactionManager.doCommit(DataSourceTransactionManager.java:571)',
            '',
            'java.lang.StackOverflowError',
            '',
            '  at java.base/java.util.HashMap.hash(HashMap.java:324)',
            '  at java.base/java.util.LinkedHashMap.get(LinkedHashMap.java:468)',
            '  at dev.janczura.session.ShoppingCart.getSessionCart(ShoppingCart.java:156)',
            '',
            'java.lang.OutOfMemoryError: Java heap space',
            '',
            '  at java.base/java.lang.String.substring(String.java:2703)',
            '  at org.apache.logging.log4j.util.StackLocator.getCallerClass(StackLocator.java:128)',
            '  at dev.janczura.bootstrap.ApplicationBootstrap.onStartup(ApplicationBootstrap.java:67)',
        ];

        // Combine into one big string with newlines for sequential character-by-character display
        const fullStackTraceText = javaStackTrace.join('\n');

        console.log('code-glitch: typing stack trace', window.innerWidth, window.innerHeight);

        // Single line in the center of screen — type out the entire stack trace char by char
        const traceLine = document.createElement('div');
        traceLine.className = 'code-wall-line';
        traceLine.style.color = '#ff5f5f';
        traceLine.style.position = 'absolute';
        traceLine.style.left = '24px';
        traceLine.style.top = '8vh';
        traceLine.style.transform = '';
        traceLine.style.whiteSpace = 'pre-wrap';
        traceLine.style.maxWidth = Math.min(window.innerWidth * 0.8, 1000) + 'px';
        glitchOverlay.appendChild(traceLine);

        // Add a blinking cursor element for typing visibility
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor-inline';
        traceLine.appendChild(cursor);

// Type out the entire stack trace in fast chunks — 8 chars per tick for maximum speed
let charIndex = 0;
const typeInterval = setInterval(() => {
    if (charIndex < fullStackTraceText.length) {
        // Insert 8 characters at once before the cursor for blazing-fast typing effect
        const chunk = Math.min(8, fullStackTraceText.length - charIndex);
        const fragment = document.createDocumentFragment();
        for (let c = 0; c < chunk; c++) {
            const charSpan = document.createElement('span');
            charSpan.textContent = fullStackTraceText.charAt(charIndex + c);
            fragment.appendChild(charSpan);
        }
        traceLine.insertBefore(fragment, cursor);
        charIndex += chunk;
            } else {
                clearInterval(typeInterval);
                cursor.remove();
                traceLine.classList.add('revealed');

                // Wait 1 second after full display, then fade out to reveal the page
                setTimeout(() => {
                    glitchOverlay.style.transition = 'opacity 1.5s ease';
                    glitchOverlay.style.opacity = '0';
                    setTimeout(() => {
                        if (glitchOverlay.parentNode) {
                            glitchOverlay.remove();
                        }
                    }, 2000);
                }, 1000);
            }
        }, 0.5); // maksymalna prędkość — 8 znaków na tick co 0.5ms (z chunkami)
    }


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
            if (link.dataset.section === current) {
                link.classList.add('active');
                link.style.color = '#fff';
            } else {
                link.classList.remove('active');
                link.style.color = '#8a8780';
            }
        });
    }, { passive: true });


    // === CUSTOM CURSOR (terminal block cursor) ===
    const cursorEl = document.getElementById('custom-cursor');
    const trail = document.getElementById('cursor-trail');
    let mouseX = -100, mouseY = -100;
    let trailX = -100, trailY = -100;

    if (cursorEl && trail) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorEl.style.transform = `translate(${mouseX - 4}px, ${mouseY - 8}px)`;
        });

        function animateTrail() {
            trailX += (mouseX - trailX) * 0.32;
            trailY += (mouseY - trailY) * 0.32;
            trail.style.transform = `translate(${trailX - 7}px, ${trailY - 7}px)`;
            requestAnimationFrame(animateTrail);
        }
        animateTrail();

        const interactiveEls = 'a, button, .project-card, .tag, .timeline-item, .edu-card';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveEls)) {
                cursorEl.classList.add('hovering');
                trail.classList.add('hovering');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveEls)) {
                cursorEl.classList.remove('hovering');
                trail.classList.remove('hovering');
            }
        });
    }


    // === TYPING EFFECT ===
    const typingTexts = document.querySelectorAll('.typing-text[data-typing]');
    const typingCursor = document.querySelector('.typing-cursor');

    function typeElement(el, callback) {
        const text = el.getAttribute('data-typing');
        el.textContent = '';
        el.style.visibility = 'visible';
        let i = 0;

        function type() {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(type, 60 + Math.random() * 40);
            } else {
                if (callback) callback();
            }
        }
        type();
    }

    typingTexts.forEach((el, idx) => {
        setTimeout(() => {
            const isLast = idx === typingTexts.length - 1;
            typeElement(el, () => {
                if (isLast && typingCursor) {
                    typingCursor.classList.add('done');
                }
            });
        }, 1300 + idx * 900);
    });


    // === THEME TOGGLE (terminal escape button — removes itself after 3 "escapes") */
    const toggleBtn = document.getElementById('theme-toggle');

    if (toggleBtn) {
        let escapeCount = 0;
        const messages = [
            '_ LIGHT MODE',
            '_ NOPE',
            '_ CATCH ME IF YOU CAN',
        ];

        function escapeBtn() {
            escapeCount++;

            if (escapeCount >= 3) {
                toggleBtn.style.transition = 'opacity 1.5s ease';
                toggleBtn.style.opacity = '0';
                setTimeout(() => toggleBtn.remove(), 1600);
                return;
            }

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const btnW = toggleBtn.offsetWidth;
            const btnH = toggleBtn.offsetHeight;

            let newX, newY;
            let attempts = 0;

            do {
                newX = Math.random() * (vw - btnW - 40) + 20;
                newY = Math.random() * (vh - btnH - 40) + 20;
                attempts++;
            } while (
                attempts < 50 &&
                Math.abs(newX - mouseX) < 150 &&
                Math.abs(newY - mouseY) < 150
            );

            toggleBtn.style.left = newX + 'px';
            toggleBtn.style.top = newY + 'px';
            toggleBtn.style.right = 'auto';

            toggleBtn.textContent = messages[escapeCount];
        }

        toggleBtn.addEventListener('mouseenter', escapeBtn);
        toggleBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            escapeBtn();
        });
    }


    // === COOKIE CONSENT BANNER ===
    const banner = document.getElementById('cookie-banner');

    if (banner) {
        const CONSENT_KEY = 'cookie-consent';

        function readConsent() {
            try {
                return localStorage.getItem(CONSENT_KEY);
            } catch (e) {
                return null;
            }
        }

        function saveConsent(value) {
            try {
                localStorage.setItem(CONSENT_KEY, value);
            } catch (e) {
                // storage blocked — decision holds for this page view only
            }
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
            // let the intro animation breathe before sliding in
            setTimeout(() => banner.classList.add('visible'), 2500);
        }

        document.getElementById('cookie-accept').addEventListener('click', () => decide('granted'));
        document.getElementById('cookie-decline').addEventListener('click', () => decide('denied'));
    }

})();