// This event fires when the HTML document has been completely parsed
document.addEventListener("DOMContentLoaded", () => {
    
    // Prevent the browser from automatically scrolling down on refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Always start at the very top
    window.scrollTo(0, 0);

    // --- PRELOADER LOGIC ---
    const preload = document.querySelector('.preload');
    const loadingText = document.getElementById('loading-text');
    const enterBtn = document.getElementById('enter-btn');
    const body = document.body;

    // Listen for a click on the 'ENTER THE UNIVERSE' button
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Double-check we are at the top before revealing the site
            window.scrollTo(0, 0);
            
            preload.classList.add('hidden');
            body.classList.remove('loading');
            startHeroAnimation();
        });
    }

    // The text that will be typed out
    const textToType = "INITIALIZING PORTFOLIO...";
    let i = 0;
    
    // Typewriter effect function
    function typeWriter() {
        if (i < textToType.length) {
            loadingText.innerHTML += textToType.charAt(i);
            i++;
            setTimeout(typeWriter, 50); // Original fast typing speed
        }
    }
    
    // Start the typing animation if the element exists
    if(loadingText) {
        typeWriter();
    }

    // --- HERO TEXT ENTRANCE ANIMATION ---
    function startHeroAnimation() {
        // Wait just a moment for the preloader to fully clear the screen
        setTimeout(() => {
            const heroTitle = document.querySelector('.hero-title');
            const shockwave = document.querySelector('.shockwave');
            
            if (heroTitle) {
                // Set initial state: both words move together, starting small (further away)
                heroTitle.style.opacity = '0';
                heroTitle.style.transform = 'scale(0.5)';
                // Extremely slow and dramatic cinematic transition
                heroTitle.style.transition = 'all 3.5s cubic-bezier(0.16, 1, 0.3, 1)';
                
                // Immediately after setting transition, trigger the animation to final state
                setTimeout(() => {
                    heroTitle.style.opacity = '1';
                    heroTitle.style.transform = 'scale(1)'; // Gets bigger / comes closer
                }, 50);
            }
            
            // Trigger the explosion effect ring
            if (shockwave) {
                shockwave.classList.add('explode');
            }

        }, 400); // 400ms delay after button click
    }

    // --- SCROLL ANIMATIONS (INTERSECTION OBSERVER) ---
    // This allows us to detect when an element enters the screen
    const observerOptions = {
        root: null,      // Observes relative to the browser viewport
        rootMargin: '0px',
        threshold: 0.2   // Triggers when 20% of the element is visible
    };

    // Create the observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the element is currently visible on screen
            if (entry.isIntersecting) {
                // Add the 'visible' class, which triggers the CSS fade/slide up transition
                entry.target.classList.add('visible');
                // Stop observing it so the animation only happens once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Find all elements that need to animate in and observe them
    const animElements = document.querySelectorAll('.anim-text');
    animElements.forEach(el => observer.observe(el));

    // --- PARALLAX SCROLL EFFECT ---
    // Listens for every time the user scrolls the page
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY; // How far down we've scrolled in pixels
        const heroBg = document.querySelector('.hero-bg');
        
        // If the hero background exists and is still somewhat in view
        if (heroBg && scrolled < window.innerHeight) {
            // Move the background down slightly slower than the user scrolls (0.4 multiplier)
            // This creates the 3D parallax depth effect
            heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
    });

    // --- CUSTOM CURSOR LOGIC ---
    const dot = document.getElementById("cursor-dot");
    const outline = document.getElementById("cursor-outline");
    
    if (dot && outline) {
        window.addEventListener("mousemove", function(e) {
            const posX = e.clientX;
            const posY = e.clientY;
            
            // The small dot follows instantly
            dot.style.left = `${posX}px`;
            dot.style.top = `${posY}px`;
            
            // The larger outline follows with a smooth delayed trailing effect via Web Animations API
            outline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 1500, fill: "forwards" }); // Slower, more fluid trailing effect
        });
        
        // Add hover effects for interactive elements
        const hoverElements = document.querySelectorAll("a, button, .case-item");
        hoverElements.forEach(el => {
            el.addEventListener("mouseenter", () => {
                outline.style.width = "60px";
                outline.style.height = "60px";
                
                // If it's the enter button, fill the cursor with the exact color of the button
                if(el.id === 'enter-btn') {
                    outline.style.backgroundColor = "rgba(225, 217, 193, 0.4)";
                    outline.style.borderColor = "transparent";
                } else {
                    outline.style.backgroundColor = "rgba(225, 217, 193, 0.1)";
                }
            });
            
            el.addEventListener("mouseleave", () => {
                outline.style.width = "40px";
                outline.style.height = "40px";
                outline.style.backgroundColor = "transparent";
                
                if(el.id === 'enter-btn') {
                    outline.style.borderColor = "rgba(225, 217, 193, 0.5)";
                }
            });
        });
    }
});
