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
    // Shown on every visit, so the entrance (and its sound) always plays.
    const preload = document.querySelector('.preload');
    const loadingText = document.getElementById('loading-text');
    const enterBtn = document.getElementById('enter-btn');
    const hero = document.querySelector('.hero');
    const textToType = 'INITIALIZING PORTFOLIO...';
    let entered = false;

    // Cinematic entrance sound, synthesized with Web Audio (no audio file to download).
    // A rising whoosh, an impact as the name lands with the shockwave, then a bright chord.
    // Pitched so laptop and phone speakers can play it, not just headphones.
    function playEntranceSound() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const audio = new AudioCtx();
        audio.resume();
        const now = audio.currentTime;
        const impact = now + 0.35; // matches the 300ms delay before the hero reveal

        const master = audio.createGain();
        master.gain.value = 1;
        const limiter = audio.createDynamicsCompressor();
        limiter.threshold.value = -10;
        master.connect(limiter).connect(audio.destination);

        function noiseBuffer(seconds) {
            const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate);
            const samples = buffer.getChannelData(0);
            for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
            return buffer;
        }

        function envelope(gainNode, start, peak, attack, release) {
            gainNode.gain.setValueAtTime(0.0001, start);
            gainNode.gain.exponentialRampToValueAtTime(peak, start + attack);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
        }

        // Whoosh: noise sweeping upward into the impact
        const whoosh = audio.createBufferSource();
        whoosh.buffer = noiseBuffer(2);
        const sweep = audio.createBiquadFilter();
        sweep.type = 'bandpass';
        sweep.Q.value = 0.9;
        sweep.frequency.setValueAtTime(400, now);
        sweep.frequency.exponentialRampToValueAtTime(4500, impact);
        sweep.frequency.exponentialRampToValueAtTime(500, impact + 1.4);
        const whooshGain = audio.createGain();
        envelope(whooshGain, now, 0.6, 0.35, 1.4);
        whoosh.connect(sweep).connect(whooshGain).connect(master);
        whoosh.start(now);

        // Impact: a falling tone plus an overtone an octave up that small speakers can reproduce
        [['sine', 180, 48, 1.0], ['triangle', 360, 96, 0.45]].forEach(([type, from, to, peak]) => {
            const osc = audio.createOscillator();
            osc.type = type;
            osc.frequency.setValueAtTime(from, impact);
            osc.frequency.exponentialRampToValueAtTime(to, impact + 1.2);
            const gain = audio.createGain();
            envelope(gain, impact, peak, 0.01, 1.6);
            osc.connect(gain).connect(master);
            osc.start(impact);
            osc.stop(impact + 1.8);
        });

        // Thump: a short burst of noise for the hit's attack
        const thump = audio.createBufferSource();
        thump.buffer = noiseBuffer(0.4);
        const thumpFilter = audio.createBiquadFilter();
        thumpFilter.type = 'lowpass';
        thumpFilter.frequency.value = 1500;
        const thumpGain = audio.createGain();
        envelope(thumpGain, impact, 0.7, 0.005, 0.3);
        thump.connect(thumpFilter).connect(thumpGain).connect(master);
        thump.start(impact);

        // Chord: a bright A-major shimmer that rings out as the name settles
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
            const tone = audio.createOscillator();
            tone.type = 'triangle';
            tone.frequency.value = freq;
            const gain = audio.createGain();
            envelope(gain, impact + 0.05, 0.14 / (1 + i * 0.5), 0.35, 3.2);
            tone.connect(gain).connect(master);
            tone.start(impact + 0.05);
            tone.stop(impact + 3.8);
        });

        setTimeout(() => audio.close(), 5000);
    }

    function enter() {
        if (entered) return;
        entered = true;

        try {
            playEntranceSound();
        } catch (e) {}

        preload.classList.add('hidden');
        body.classList.remove('loading');

        // Let the preloader start fading before the hero rushes in
        setTimeout(() => {
            hero.classList.add('revealed');
            document.querySelector('.shockwave').classList.add('explode');
        }, 300);
    }

    let typed = 0;
    (function typeWriter() {
        if (typed < textToType.length) {
            loadingText.textContent += textToType.charAt(typed++);
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

    // --- TOUCH SCREENS: the row in the middle of the screen lights up like a hover ---
    const canHover = window.matchMedia('(hover: hover)').matches;

    if (!canHover) {
        const rowObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => entry.target.classList.toggle('active', entry.isIntersecting));
        }, { rootMargin: '-49% 0px -49% 0px' });

        document.querySelectorAll('.case-item, .stack-row').forEach((row) => rowObserver.observe(row));
    }

    // --- STAGGERED ROW REVEALS ---
    const rows = document.querySelectorAll('.stack-row, .case-item, .contact-column');

    if (!reducedMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

        rows.forEach((row) => {
            // Delay grows with the row's position in its list, capped so long lists don't drag
            const index = [...row.parentElement.children].indexOf(row);
            row.style.setProperty('--delay', `${Math.min(index, 4) * 0.09}s`);
            row.classList.add('reveal');
            revealObserver.observe(row);
        });
    }

    // --- GHOST WORDS drift sideways as their section passes ---
    const headings = document.querySelectorAll('.section-heading[data-ghost]');

    function driftGhosts() {
        const mid = window.innerHeight / 2;
        headings.forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
            heading.style.setProperty('--drift', `${((rect.top - mid) * -0.25).toFixed(1)}px`);
        });
    }

    // --- STARFIELD ---
    // Slow twinkling stars with a little scroll depth, and a rare shooting star.
    const canvas = document.getElementById('stars');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shooter = null;
    let width = 0, height = 0, dpr = 1;

    function buildStars() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(160, Math.round((width * height) / 9000));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.1 + 0.25,
            depth: Math.random() * 0.25 + 0.05,   // how strongly it moves with scroll
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.0015 + 0.0005,
        }));
    }

    function drawStars(time) {
        ctx.clearRect(0, 0, width, height);
        const scroll = window.scrollY;

        for (const s of stars) {
            const y = (((s.y - scroll * s.depth) % height) + height) % height;
            const twinkle = reducedMotion ? 0.6 : 0.35 + 0.35 * Math.sin(time * s.speed + s.phase);
            ctx.globalAlpha = twinkle;
            ctx.fillStyle = '#E1D9C1';
            ctx.beginPath();
            ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        if (shooter) {
            const progress = (time - shooter.start) / shooter.duration;
            if (progress >= 1) {
                shooter = null;
            } else {
                const x = shooter.x + shooter.dx * progress;
                const y = shooter.y + shooter.dy * progress;
                const tail = ctx.createLinearGradient(x, y, x - shooter.dx * 0.18, y - shooter.dy * 0.18);
                tail.addColorStop(0, 'rgba(255, 248, 230, 0.9)');
                tail.addColorStop(1, 'rgba(255, 248, 230, 0)');
                ctx.globalAlpha = Math.sin(progress * Math.PI);
                ctx.strokeStyle = tail;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - shooter.dx * 0.18, y - shooter.dy * 0.18);
                ctx.stroke();
            }
        } else if (!reducedMotion && Math.random() < 0.0025) {
            shooter = {
                x: Math.random() * width * 0.7,
                y: Math.random() * height * 0.4,
                dx: width * 0.35,
                dy: height * 0.25,
                start: time,
                duration: 1100,
            };
        }
        ctx.globalAlpha = 1;
    }

    buildStars();
    window.addEventListener('resize', buildStars);

    (function frame(time) {
        drawStars(time);
        if (!reducedMotion) driftGhosts();
        requestAnimationFrame(frame);
    })(0);

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
});
