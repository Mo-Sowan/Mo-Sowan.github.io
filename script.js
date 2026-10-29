const root = document.documentElement;

// Theme toggle: remembers the choice, otherwise follows the OS setting
const themeToggle = document.getElementById('theme-toggle');

function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function savedTheme() {
    try {
        return localStorage.getItem('theme');
    } catch (e) {
        return null;
    }
}

root.dataset.theme = savedTheme() || systemTheme();

themeToggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
        localStorage.setItem('theme', next);
    } catch (e) {}
});

// Mobile menu
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

function setMenu(open) {
    nav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') setMenu(false);
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
});

document.getElementById('year').textContent = new Date().getFullYear();
