(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    roots.forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(root.querySelectorAll("[data-filter-select]"));
      var section = root.parentElement || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card='movie']"));
      var empty = root.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }
      function textOf(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
      }
      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var ok = true;
          var searchable = textOf(card);
          if (term && searchable.indexOf(term) === -1) {
            ok = false;
          }
          selects.forEach(function (select) {
            var value = select.value;
            var key = select.getAttribute("data-filter-select");
            if (value && (card.getAttribute("data-" + key) || "").indexOf(value) === -1) {
              ok = false;
            }
          });
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function setupPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-box[data-play]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-overlay");
      var source = box.getAttribute("data-play");
      var initialized = false;
      var hls = null;
      function attach() {
        if (initialized || !video || !source) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function play() {
        attach();
        box.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
