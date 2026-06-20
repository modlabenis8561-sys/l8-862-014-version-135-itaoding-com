(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll(".site-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var keyword = input.value.trim();
                if (!keyword) {
                    event.preventDefault();
                    window.location.href = "all-movies.html";
                    return;
                }
                event.preventDefault();
                window.location.href = "all-movies.html?q=" + encodeURIComponent(keyword);
            });
        });
    }

    function setupFiltering() {
        var grids = document.querySelectorAll("[data-filterable]");
        if (!grids.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        var inputs = document.querySelectorAll(".filter-input");
        inputs.forEach(function (input) {
            input.value = initial;
        });
        function apply(value) {
            var keyword = value.trim().toLowerCase();
            grids.forEach(function (grid) {
                grid.querySelectorAll(".movie-card").forEach(function (card) {
                    var haystack = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
                    card.classList.toggle("is-hidden", keyword.length > 0 && haystack.indexOf(keyword) === -1);
                });
            });
        }
        apply(initial);
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                apply(input.value);
            });
        });
    }

    function setupHero() {
        var carousel = document.querySelector(".hero-carousel");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupPlayers() {
        var players = document.querySelectorAll(".video-player");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            if (!video || !cover) {
                return;
            }
            var started = false;
            var streamUrl = video.getAttribute("data-stream");
            function startPlayback() {
                if (!streamUrl) {
                    return;
                }
                cover.classList.add("is-hidden");
                if (!started) {
                    started = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = streamUrl;
                        video.play().catch(function () {});
                    } else {
                        video.src = streamUrl;
                        video.play().catch(function () {});
                    }
                } else {
                    video.play().catch(function () {});
                }
            }
            cover.addEventListener("click", startPlayback);
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupFiltering();
        setupHero();
        setupPlayers();
    });
})();
