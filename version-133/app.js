const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
if (toggle && header) {
    toggle.addEventListener('click', () => header.classList.toggle('open'));
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let heroIndex = 0;
const showHero = (index) => {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroIndex));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === heroIndex));
};
dots.forEach((dot, i) => dot.addEventListener('click', () => showHero(i)));
if (slides.length > 1) {
    setInterval(() => showHero(heroIndex + 1), 5200);
}

const homeSearch = document.querySelector('[data-home-search]');
if (homeSearch) {
    homeSearch.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = homeSearch.querySelector('input[name="q"]');
        const q = input ? input.value.trim() : '';
        window.location.href = q ? `./all-movies.html?q=${encodeURIComponent(q)}` : './all-movies.html';
    });
}

const panel = document.querySelector('[data-filter-panel]');
if (panel) {
    const search = panel.querySelector('[data-filter-search]');
    const region = panel.querySelector('[data-filter-region]');
    const year = panel.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const apply = () => {
        const q = (search?.value || '').trim().toLowerCase();
        const r = region?.value || '';
        const y = year?.value || '';
        cards.forEach((card) => {
            const text = card.getAttribute('data-search') || '';
            const okSearch = !q || text.includes(q);
            const okRegion = !r || card.getAttribute('data-region') === r;
            const okYear = !y || card.getAttribute('data-year') === y;
            card.classList.toggle('is-hidden', !(okSearch && okRegion && okYear));
        });
    };
    [search, region, year].forEach((item) => item && item.addEventListener('input', apply));
    const params = new URLSearchParams(window.location.search);
    if (search && params.get('q')) {
        search.value = params.get('q');
    }
    apply();
}
