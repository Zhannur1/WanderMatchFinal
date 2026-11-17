(function () {
    const storageKey = "wanderMatchTheme";

    function normalizeTheme(theme) {
        return theme === "dark" ? "dark" : "light";
    }

    function readStoredTheme() {
        try {
            return localStorage.getItem(storageKey);
        } catch (error) {
            return null;
        }
    }

    function applyTheme(theme, saveChoice) {
        const safeTheme = normalizeTheme(theme);
        document.documentElement.setAttribute("data-theme", safeTheme);
        document.documentElement.setAttribute("data-bs-theme", safeTheme);

        if (saveChoice !== false) {
            try {
                localStorage.setItem(storageKey, safeTheme);
            } catch (error) {
                // The page can still use the selected theme for this session.
            }
        }

        return safeTheme;
    }

    const initialTheme = normalizeTheme(readStoredTheme());
    applyTheme(initialTheme, false);

    window.WanderTheme = {
        get: function () {
            return normalizeTheme(document.documentElement.getAttribute("data-theme"));
        },
        set: function (theme) {
            return applyTheme(theme, true);
        },
        toggle: function () {
            return applyTheme(this.get() === "dark" ? "light" : "dark", true);
        }
    };
})();
