(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var currentIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(currentIndex + 1);
    }, 5200);
  }

  var forms = document.querySelectorAll('[data-search-form]');

  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function () {
      var input = form.querySelector('input[name="q"]');

      if (input && input.value.trim()) {
        form.action = form.getAttribute('action') + '#q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = document.querySelector('[data-search-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var activeFilter = 'all';

    function getHashQuery() {
      var hash = decodeURIComponent(window.location.hash || '');
      var match = hash.match(/q=([^&]+)/);
      return match ? match[1].trim() : '';
    }

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var region = card.getAttribute('data-region') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === 'all' || activeFilter === type || activeFilter === region;

        card.classList.toggle('is-hidden', !(matchKeyword && matchFilter));
      });
    }

    if (searchInput) {
      var initialQuery = getHashQuery();

      if (initialQuery) {
        searchInput.value = initialQuery;
      }

      searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    if (filterButtons.length) {
      filterButtons[0].classList.add('is-active');
    }

    applyFilters();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var shell = player.closest('.player-shell');
    var playButton = document.querySelector('[data-play-button]');
    var source = player.getAttribute('data-src');
    var initialized = false;
    var hlsInstance = null;

    function startPlayer() {
      if (!source) {
        return;
      }

      if (!initialized) {
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
          player.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(player);
        } else {
          player.src = source;
        }

        initialized = true;
      }

      if (shell) {
        shell.classList.add('is-playing');
      }

      var playPromise = player.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (shell) {
            shell.classList.remove('is-playing');
          }
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayer);
    }

    player.addEventListener('click', function () {
      if (player.paused) {
        startPlayer();
      } else {
        player.pause();
      }
    });

    player.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    player.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
