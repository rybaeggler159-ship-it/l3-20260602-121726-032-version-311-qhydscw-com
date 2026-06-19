import { H as Hls } from "./hls-vendor-dru42stk.js";

const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });
}

const slider = document.querySelector("[data-hero-slider]");

if (slider) {
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;

  const activateSlide = (index) => {
    activeIndex = index % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => activateSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => activateSlide(activeIndex + 1), 5200);
  }
}

const filterScope = document.querySelector("[data-filter-scope]");

if (filterScope) {
  const searchInput = filterScope.querySelector("[data-search-input]");
  const categoryFilter = filterScope.querySelector("[data-category-filter]");
  const sortSelect = filterScope.querySelector("[data-sort-select]");
  const grid = document.querySelector(".filter-grid");
  const cards = grid ? Array.from(grid.querySelectorAll(".movie-card")) : [];

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const applyFilters = () => {
    const query = normalize(searchInput ? searchInput.value : "");
    const category = categoryFilter ? categoryFilter.value : "";
    const sortMode = sortSelect ? sortSelect.value : "year-desc";

    cards.forEach((card) => {
      const haystack = normalize(card.textContent);
      const categoryMatched = !category || card.dataset.category === category;
      const queryMatched = !query || haystack.includes(query);
      card.classList.toggle("hidden-by-filter", !(categoryMatched && queryMatched));
    });

    const sortedCards = [...cards].sort((a, b) => {
      if (sortMode === "views-desc") {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }
      if (sortMode === "title-asc") {
        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
      }
      return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    });

    sortedCards.forEach((card) => grid.appendChild(card));
  };

  [searchInput, categoryFilter, sortSelect].forEach((control) => {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  applyFilters();
}

const setupHlsPlayer = () => {
  const video = document.querySelector("video[data-hls]");
  if (!video) {
    return;
  }

  const source = video.dataset.hls;
  if (!source) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  }
};

setupHlsPlayer();
