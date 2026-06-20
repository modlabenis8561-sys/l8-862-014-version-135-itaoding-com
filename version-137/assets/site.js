(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = all("[data-hero-slide]");
        var dots = all("[data-hero-dot]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            });
        });

        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var grid = document.querySelector("[data-card-grid]");
        if (!input || !grid) {
            return;
        }
        var cards = all("[data-filter-card]", grid);
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            input.value = query;
        }

        function apply() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                card.classList.toggle("is-hidden", value !== "" && text.indexOf(value) === -1);
            });
        }

        input.addEventListener("input", apply);
        apply();
    }

    function setupSorting() {
        var select = document.querySelector("[data-sort-select]");
        var grid = document.querySelector("[data-card-grid]");
        if (!select || !grid) {
            return;
        }
        var initial = all("[data-filter-card]", grid);
        select.addEventListener("change", function () {
            var cards = all("[data-filter-card]", grid);
            if (select.value === "year-desc") {
                cards.sort(function (a, b) {
                    return (b.getAttribute("data-year") || "").localeCompare(a.getAttribute("data-year") || "");
                });
            } else if (select.value === "title-asc") {
                cards.sort(function (a, b) {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                });
            } else {
                cards = initial;
            }
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    function setupPlayers() {
        all("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-cover");
            if (!video || !button) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var attached = false;
            var hls = null;

            function attach() {
                if (attached || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function start() {
                attach();
                shell.classList.add("is-playing");
                video.controls = true;
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {
                        video.controls = true;
                    });
                }
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSorting();
        setupPlayers();
    });
})();
