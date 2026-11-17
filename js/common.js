$(function () {
    function updateHeaderOffset() {
        const headerHeight = $(".site-header").outerHeight() || 0;
        document.documentElement.style.setProperty("--site-header-height", headerHeight + "px");
    }

    function updateThemeButton() {
        const theme = window.WanderTheme ? window.WanderTheme.get() : "light";
        const isDark = theme === "dark";

        $(".theme-toggle")
            .attr("aria-pressed", String(isDark))
            .attr("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode")
            .text(isDark ? "☀ Light mode" : "☾ Dark mode");
    }

    $(".theme-toggle").on("click", function () {
        if (window.WanderTheme) {
            window.WanderTheme.toggle();
            updateThemeButton();
        }
    });

    function closeMobileMenu() {
        $(".site-links").removeClass("open");
        $(".nav-toggle")
            .attr("aria-expanded", "false")
            .attr("aria-label", "Open navigation menu");
    }

    $(".nav-toggle").on("click", function () {
        const $button = $(this);
        const $links = $button.siblings(".site-links");
        const willOpen = !$links.hasClass("open");

        $links.toggleClass("open", willOpen);
        $button
            .attr("aria-expanded", String(willOpen))
            .attr("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
    });

    $(".site-links a").on("click", function () {
        if (window.innerWidth <= 980) {
            closeMobileMenu();
        }
    });

    $(document).on("keydown", function (event) {
        if (event.key === "Escape") {
            closeMobileMenu();
            $(".temporary-message:visible")
                .stop(true, true)
                .fadeOut(150);
        }
    });

    $(window).on("resize.wanderHeader", function () {
        if (window.innerWidth > 980) {
            closeMobileMenu();
        }
        updateHeaderOffset();
    });
    updateHeaderOffset();
    updateThemeButton();
});
