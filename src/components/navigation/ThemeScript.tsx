"use client";

// Injects an inline script as early as possible to set the initial theme
// before React hydrates, preventing a flash of incorrect theme.
// Prefers localStorage("theme") when present, falling back to media query.
export function ThemeScript() {
    const code = `(() => { try { const ls = localStorage.getItem('theme'); const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; const theme = ls === 'dark' || ls === 'light' ? ls : (prefersDark ? 'dark' : 'light'); const root = document.documentElement; if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark'); } catch {} })();`;
    return (
        <script
            // Important: inline, no hydration, executes before paint
            dangerouslySetInnerHTML={{ __html: code }}
        />
    );
}
