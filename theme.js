/** Persistent light/dark theme switch. Independent of application data and feature modules. */
(function () {
    const root = document.documentElement;
    const button = document.getElementById('themeToggle');
    if (!button) return;

    let savedTheme = null;
    try { savedTheme = localStorage.getItem('er175-theme'); } catch (_) {}
    // New visitors start in light mode; an explicit saved choice always takes precedence.
    const preferred = 'light';

    function applyTheme(theme) {
        const dark = theme === 'dark';
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
        button.setAttribute('aria-pressed', String(dark));
        button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        const icon = button.querySelector('.theme-toggle-icon');
        const label = button.querySelector('.theme-toggle-label');
        if (icon) icon.textContent = dark ? '☀' : '☾';
        if (label) label.textContent = dark ? 'Light mode' : 'Dark mode';
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute('content', dark ? '#111417' : '#f3f4f6');
    }

    applyTheme(savedTheme || preferred);
    button.addEventListener('click', function () {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('er175-theme', next); } catch (_) {}
    });
})();
