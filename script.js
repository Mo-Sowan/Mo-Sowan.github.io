document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const body = document.body;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Start at the top on refresh so the hero entrance always plays from the beginning
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    if (!location.hash) {
        window.scrollTo(0, 0);
    }

    // --- PRELOADER ---
    // Types a line, then opens by itself. The button skips the wait.
    // Shown once per browser session; skipped entirely for reduced motion.
    const preload = document.querySelector('.preload');
    const loadingText = document.getElementById('loading-text');
    const enterBtn = document.getElementById('enter-btn');
    const hero = document.querySelector('.hero');
    const textToType = 'INITIALIZING PORTFOLIO...';
    let entered = false;
    let autoEnterTimer;

    function seenThisSession() {
        try {
            return sessionStorage.getItem('entered') === '1';
        } catch (e) {
            return false;
        }
    }

    function enter() {
        if (entered) return;
        entered = true;
        clearTimeout(autoEnterTimer);
        try {
            sessionStorage.setItem('entered', '1');
        } catch (e) {}

        preload.classList.add('hidden');
        body.classList.remove('loading');

        // Let the preloader start fading before the hero rushes in
        setTimeout(() => {
            hero.classList.add('revealed');
            document.querySelector('.shockwave').classList.add('explode');
        }, 300);
    }

    if (reducedMotion || seenThisSession()) {
        preload.remove();
        body.classList.remove('loading');
        hero.classList.add('revealed');
        entered = true;
    } else {
        let i = 0;
        (function typeWriter() {
            if (i < textToType.length) {
                loadingText.textContent += textToType.charAt(i++);
                setTimeout(typeWriter, 50);
            } else {
                autoEnterTimer = setTimeout(enter, 1400);
            }
        })();

        enterBtn.addEventListener('click', enter);
        document.addEventListener('keydown', (e) => {
            if (!entered && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
                e.preventDefault();
                enter();
            }
        });
    }

    // --- MOBILE MENU ---
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');

    function setMenu(open) {
        body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    menuToggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    nav.addEventListener('click', (e) => {
        if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenu(false);
    });

    // --- SCROLL REVEAL (about section only) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.anim-text').forEach((el) => observer.observe(el));

    // --- PARALLAX ---
    const heroBg = document.querySelector('.hero-bg');
    let parallaxQueued = false;

    if (!reducedMotion) {
        window.addEventListener('scroll', () => {
            if (parallaxQueued) return;
            parallaxQueued = true;
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                if (scrolled < window.innerHeight) {
                    heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
                }
                parallaxQueued = false;
            });
        }, { passive: true });
    }

    // --- CUSTOM CURSOR (precise pointers only) ---
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');

    if (finePointer && !reducedMotion) {
        root.classList.add('has-cursor');

        let mouseX = -100, mouseY = -100;
        let ringX = mouseX, ringY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        }, { passive: true });

        // The outline eases toward the pointer each frame for a smooth trail
        (function follow() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            outline.style.transform = `translate(${ringX}px, ${ringY}px)`;
            requestAnimationFrame(follow);
        })();

        document.addEventListener('mouseover', (e) => {
            outline.classList.toggle('hovering', !!e.target.closest('a, button, .case-item'));
        });
    }

    document.getElementById('year').textContent = new Date().getFullYear();
});
