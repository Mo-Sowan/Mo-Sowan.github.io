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
    // Types a line and waits for the ENTER button. Clicks anywhere else do nothing.
    // Shown once per browser session; skipped entirely for reduced motion.
    const preload = document.querySelector('.preload');
    const loadingText = document.getElementById('loading-text');
    const enterBtn = document.getElementById('enter-btn');
    const hero = document.querySelector('.hero');
    const textToType = 'INITIALIZING PORTFOLIO...';
    let entered = false;

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
            }
        })();

        enterBtn.addEventListener('click', enter);
        // Keyboard users can press Enter to go in, same as clicking the button
        document.addEventListener('keydown', (e) => {
            if (!entered && e.key === 'Enter') {
                e.preventDefault();
                enter();
            }
        });
    }

    // --- TOUCH SCREENS: the row in the middle of the screen lights up like a hover ---
    const canHover = window.matchMedia('(hover: hover)').matches;

    if (!canHover) {
        const rowObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => entry.target.classList.toggle('active', entry.isIntersecting));
        }, { rootMargin: '-49% 0px -49% 0px' });

        document.querySelectorAll('.case-item').forEach((row) => rowObserver.observe(row));
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
