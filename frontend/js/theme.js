/**
 * Monarch Banking - Theme Management
 * Persists dark/light preference in localStorage and toggles [data-theme="dark"] on <html>
 */
(function() {
    // 1. Apply theme immediately on initial script parse to prevent flash of unstyled content
    const savedTheme = localStorage.getItem("monarch_theme") || "light";
    if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }

    // 2. Global helper
    window.MonarchTheme = {
        getTheme: function() {
            return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        },
        toggleTheme: function() {
            const current = this.getTheme();
            const next = current === "dark" ? "light" : "dark";
            this.setTheme(next);
            return next;
        },
        setTheme: function(theme) {
            if (theme === "dark") {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("monarch_theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("monarch_theme", "light");
            }
            this.updateButtonUI();
        },
        updateButtonUI: function() {
            const btn = document.getElementById("theme-toggle-btn");
            if (!btn) return;
            const isDark = this.getTheme() === "dark";
            const label = btn.querySelector(".theme-toggle-label");
            if (label) {
                label.textContent = isDark ? "Light Mode" : "Dark Mode";
            }
            btn.setAttribute("title", isDark ? "Switch to Light Theme" : "Switch to Dark Theme");
            btn.setAttribute("aria-label", isDark ? "Switch to Light Theme" : "Switch to Dark Theme");
        }
    };

    // 3. Bind click listener when DOM is loaded
    document.addEventListener("DOMContentLoaded", function() {
        const btn = document.getElementById("theme-toggle-btn");
        if (btn) {
            MonarchTheme.updateButtonUI();
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                MonarchTheme.toggleTheme();
            });
        }
    });
})();
