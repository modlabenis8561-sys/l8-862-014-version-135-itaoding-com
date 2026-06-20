let hlsModule = null;

async function loadHls() {
  if (!hlsModule) {
    hlsModule = await import('./hls.js');
  }
  return hlsModule.H;
}

function initMobileNav() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  if (slides.length < 2) {
    return;
  }
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(active + 1), 5200);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(active - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(active + 1);
      restart();
    });
  }

  start();
}

function initFilters() {
  const lists = Array.from(document.querySelectorAll('[data-card-list]'));
  if (!lists.length) {
    return;
  }
  const searchInputs = Array.from(document.querySelectorAll('[data-card-search]'));
  const typeSelects = Array.from(document.querySelectorAll('[data-card-type]'));
  const categorySelects = Array.from(document.querySelectorAll('[data-card-category]'));
  const emptyStates = Array.from(document.querySelectorAll('[data-empty-state]'));

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    searchInputs.forEach((input) => {
      input.value = query;
    });
  }

  const apply = () => {
    const terms = searchInputs.map((input) => input.value.trim().toLowerCase()).filter(Boolean);
    const type = typeSelects.map((select) => select.value).find(Boolean) || '';
    const category = categorySelects.map((select) => select.value).find(Boolean) || '';
    let visibleTotal = 0;

    lists.forEach((list) => {
      const cards = Array.from(list.querySelectorAll('[data-card]'));
      cards.forEach((card) => {
        const haystack = card.getAttribute('data-search') || '';
        const cardType = card.getAttribute('data-type') || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const matchesText = terms.every((term) => haystack.includes(term));
        const matchesType = !type || cardType === type;
        const matchesCategory = !category || cardCategory === category;
        const visible = matchesText && matchesType && matchesCategory;
        card.hidden = !visible;
        if (visible) {
          visibleTotal += 1;
        }
      });
    });

    emptyStates.forEach((state) => {
      state.hidden = visibleTotal !== 0;
    });
  };

  searchInputs.forEach((input) => input.addEventListener('input', apply));
  typeSelects.forEach((select) => select.addEventListener('change', apply));
  categorySelects.forEach((select) => select.addEventListener('change', apply));
  apply();
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const hlsSrc = player.getAttribute('data-hls-src');
    let attached = false;
    let hls = null;

    if (!video || !hlsSrc) {
      return;
    }

    const attachSource = async () => {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc;
      } else {
        try {
          const Hls = await loadHls();
          if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(hlsSrc);
            hls.attachMedia(video);
          } else {
            video.src = hlsSrc;
          }
        } catch (error) {
          video.src = hlsSrc;
        }
      }
      attached = true;
    };

    const play = async () => {
      if (button) {
        button.classList.add('is-hidden');
      }
      await attachSource();
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
      if (!attached) {
        play();
      }
    });

    video.addEventListener('play', () => {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('emptied', () => {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
      attached = false;
    });
  });
}

function initYear() {
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHero();
  initFilters();
  initPlayers();
  initYear();
});
