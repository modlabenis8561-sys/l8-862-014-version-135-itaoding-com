
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }
    fn();
  };

  const initMenu = () => {
    const button = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', () => {
      panel.classList.toggle('open');
    });
  };

  const initHero = () => {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const next = carousel.querySelector('[data-hero-next]');
    const prev = carousel.querySelector('[data-hero-prev]');
    if (!slides.length) {
      return;
    }
    let current = 0;
    let timer = null;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    const restart = () => {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => show(current + 1), 5000);
    };
    next?.addEventListener('click', () => {
      show(current + 1);
      restart();
    });
    prev?.addEventListener('click', () => {
      show(current - 1);
      restart();
    });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });
    show(0);
    restart();
  };

  const initSearch = () => {
    const input = document.querySelector('[data-site-search]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    if (!input || !cards.length) {
      return;
    }
    const empty = document.querySelector('[data-empty-state]');
    const clear = document.querySelector('[data-clear-search]');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
    let activeFilter = 'all';
    const apply = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const text = card.dataset.search || '';
        const tags = card.dataset.filterTags || '';
        const matchText = !query || text.includes(query);
        const matchFilter = activeFilter === 'all' || tags.includes(activeFilter.toLowerCase());
        const isVisible = matchText && matchFilter;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };
    input.addEventListener('input', apply);
    clear?.addEventListener('click', () => {
      input.value = '';
      input.focus();
      apply();
    });
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        filterButtons.forEach((item) => item.classList.toggle('active', item === button));
        apply();
      });
    });
    apply();
  };

  const initPlayers = () => {
    const players = Array.from(document.querySelectorAll('.js-player'));
    players.forEach((player) => {
      const video = player.querySelector('video');
      const button = player.querySelector('.video-play-button');
      if (!video) {
        return;
      }
      const stream = video.dataset.stream;
      let loaded = false;
      const load = () => {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      };
      const play = () => {
        load();
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
      };
      player.addEventListener('click', (event) => {
        if (event.target === video && !video.paused) {
          return;
        }
        play();
      });
      button?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
      video.addEventListener('play', () => button?.classList.add('is-hidden'));
      video.addEventListener('pause', () => button?.classList.remove('is-hidden'));
      video.addEventListener('ended', () => button?.classList.remove('is-hidden'));
    });
  };

  ready(() => {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
