(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function() {
                panel.classList.toggle("is-open");
            });
        }

        document.addEventListener("error", function(event) {
            var target = event.target;
            if (target && target.tagName === "IMG") {
                target.classList.add("image-hidden");
            }
        }, true);

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var current = 0;
            var show = function(index) {
                current = index;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            };
            dots.forEach(function(dot, index) {
                dot.addEventListener("click", function() {
                    show(index);
                });
            });
            window.setInterval(function() {
                show((current + 1) % slides.length);
            }, 5200);
        }

        var catalogInput = document.querySelector("[data-catalog-search]");
        var genreFilter = document.querySelector("[data-genre-filter]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var applyCatalogFilter = function() {
            var keyword = catalogInput ? catalogInput.value.trim().toLowerCase() : "";
            var genre = genreFilter ? genreFilter.value : "";
            var year = yearFilter ? yearFilter.value : "";
            cards.forEach(function(card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardGenre = card.getAttribute("data-genre") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var visible = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (genre && cardGenre.indexOf(genre) === -1) {
                    visible = false;
                }
                if (year && cardYear !== year) {
                    visible = false;
                }
                card.style.display = visible ? "" : "none";
            });
        };
        [catalogInput, genreFilter, yearFilter].forEach(function(item) {
            if (item) {
                item.addEventListener("input", applyCatalogFilter);
                item.addEventListener("change", applyCatalogFilter);
            }
        });

        var searchInput = document.querySelector("[data-search-input]");
        var searchGrid = document.querySelector("[data-search-results]");
        var searchEmpty = document.querySelector("[data-search-empty]");
        if (searchInput && searchGrid && window.movieSearchIndex) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            searchInput.value = initial;
            var render = function() {
                var keyword = searchInput.value.trim().toLowerCase();
                searchGrid.innerHTML = "";
                if (!keyword) {
                    if (searchEmpty) {
                        searchEmpty.style.display = "block";
                        searchEmpty.textContent = "输入片名、地区、年份或标签即可搜索。";
                    }
                    return;
                }
                var results = window.movieSearchIndex.filter(function(item) {
                    return item.text.toLowerCase().indexOf(keyword) !== -1;
                }).slice(0, 80);
                if (searchEmpty) {
                    searchEmpty.style.display = results.length ? "none" : "block";
                    searchEmpty.textContent = results.length ? "" : "未找到相关影片。";
                }
                results.forEach(function(item) {
                    var article = document.createElement("article");
                    article.className = "movie-card";
                    article.innerHTML = '<a class="movie-thumb" href="' + item.url + '" aria-label="' + item.title + '"><img src="' + item.cover + '" alt="' + item.title + ' 在线观看" loading="lazy"><span class="play-corner">▶</span></a><div class="movie-info"><a class="movie-title" href="' + item.url + '">' + item.title + '</a><p class="movie-meta">' + item.year + ' · ' + item.region + '</p><p class="movie-desc">' + item.oneLine + '</p><div class="movie-tags"><span>' + item.type + '</span><span>' + item.genre + '</span></div></div>';
                    searchGrid.appendChild(article);
                });
            };
            searchInput.addEventListener("input", render);
            render();
        }
    });
})();
