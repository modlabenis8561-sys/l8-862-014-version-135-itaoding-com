(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function getRoot() {
        return document.body.getAttribute('data-root') || './';
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHeaderSearch() {
        var forms = document.querySelectorAll('[data-site-search]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = getRoot() + 'search.html?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = getRoot() + 'search.html';
                }
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                play();
            });
        });
        show(0);
        play();
    }

    function setupFilters() {
        var scopes = document.querySelectorAll('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var reset = scope.querySelector('[data-filter-reset]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var empty = scope.querySelector('[data-no-results]');

            function apply() {
                var keyword = normalize(input && input.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                    var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
                    var shouldShow = matchKeyword && matchYear && matchType;
                    card.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query && !input.value) {
                    input.value = query;
                }
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }
            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    if (typeSelect) {
                        typeSelect.value = '';
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function attachMedia(panel) {
        var video = panel.querySelector('video');
        var mediaUrl = panel.getAttribute('data-video-url');
        if (!video || !mediaUrl || panel.getAttribute('data-ready') === '1') {
            return video;
        }
        panel.setAttribute('data-ready', '1');
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(mediaUrl);
            hls.attachMedia(video);
            panel._hls = hls;
        } else {
            video.src = mediaUrl;
        }
        return video;
    }

    function setupPlayers() {
        var panels = document.querySelectorAll('.player-panel');
        panels.forEach(function (panel) {
            var button = panel.querySelector('.player-overlay');
            function start() {
                var video = attachMedia(panel);
                if (!video) {
                    return;
                }
                panel.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
            panel.addEventListener('click', function (event) {
                if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                    return;
                }
                start();
            });
            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
