import { H as Hls } from "./hls-dru42stk.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

function initImageFallbacks() {
  document.querySelectorAll("img[data-fallback-title]").forEach((image) => {
    image.addEventListener("error", () => {
      const frame = image.closest(".cover-frame");
      if (frame) {
        frame.classList.add("image-missing");
      }
    }, { once: true });
  });
}

function initHeroSlider() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const previous = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

  const show = (index) => {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  const schedule = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(activeIndex + 1), 5600);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      schedule();
    });
  });

  if (previous) {
    previous.addEventListener("click", () => {
      show(activeIndex - 1);
      schedule();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(activeIndex + 1);
      schedule();
    });
  }

  schedule();
}

function initPageFilters() {
  document.querySelectorAll("[data-filter-page]").forEach((panel) => {
    const scope = panel.parentElement || document;
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const input = panel.querySelector("[data-page-search]");
    const chips = Array.from(panel.querySelectorAll("[data-filter-kind]"));
    const counter = panel.querySelector("[data-filter-count]");
    let activeKind = "all";
    let activeValue = "all";

    const apply = () => {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.dataset.search || "").toLowerCase();
        const matchesKeyword = !keyword || text.includes(keyword);
        let matchesFilter = true;

        if (activeKind === "type") {
          matchesFilter = (card.dataset.type || "").includes(activeValue);
        }

        if (activeKind === "region") {
          matchesFilter = (card.dataset.region || "").includes(activeValue);
        }

        const shouldShow = matchesKeyword && matchesFilter;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = `当前显示 ${visible} 部内容`;
      }
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((item) => item.classList.remove("is-active"));
        chip.classList.add("is-active");
        activeKind = chip.dataset.filterKind || "all";
        activeValue = chip.dataset.filterValue || "all";
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }
  });
}

function movieCardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("");
  const description = escapeHtml(movie.oneLine || movie.summary || "").slice(0, 110);
  return `
    <article class="movie-card card-hover">
      <a class="movie-card__poster" href="video/${movie.id}.html" aria-label="观看 ${escapeHtml(movie.title)}">
        <span class="cover-frame" data-cover-title="${escapeHtml(movie.title)}">
          <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" data-fallback-title="${escapeHtml(movie.title)}">
        </span>
        <span class="poster-badge">${escapeHtml(movie.region || "精选")}</span>
        <span class="play-float">▶</span>
      </a>
      <div class="movie-card__body">
        <a class="movie-card__title" href="video/${movie.id}.html">${escapeHtml(movie.title)}</a>
        <div class="movie-card__meta">
          <span>${escapeHtml(movie.type || "影片")}</span>
          <span>${escapeHtml(movie.year || "年份")}</span>
          <span>${escapeHtml(movie.genre || "精选")}</span>
        </div>
        <p>${description}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initSearchPage() {
  const app = document.querySelector("[data-search-app]");
  if (!app || !window.SEARCH_INDEX) {
    return;
  }

  const form = app.querySelector("[data-search-form]");
  const input = app.querySelector("[data-search-input]");
  const summary = app.querySelector("[data-search-summary]");
  const results = app.querySelector("[data-search-results]");
  const parameters = new URLSearchParams(window.location.search);

  if (input && parameters.get("q")) {
    input.value = parameters.get("q");
  }

  const runSearch = () => {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    if (!results || !summary) {
      return;
    }

    if (!keyword) {
      results.innerHTML = "";
      summary.textContent = "请输入关键词开始搜索。";
      return;
    }

    const matched = window.SEARCH_INDEX
      .filter((movie) => (movie.searchText || "").toLowerCase().includes(keyword))
      .slice(0, 120);

    summary.textContent = `关键词“${keyword}”找到 ${matched.length} 个结果，最多展示前 120 条。`;
    results.innerHTML = matched.map(movieCardTemplate).join("");
    initImageFallbacks();
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const keyword = input ? input.value.trim() : "";
      const nextUrl = new URL(window.location.href);
      if (keyword) {
        nextUrl.searchParams.set("q", keyword);
      } else {
        nextUrl.searchParams.delete("q");
      }
      window.history.replaceState({}, "", nextUrl.toString());
      runSearch();
    });
  }

  if (input) {
    input.addEventListener("input", runSearch);
  }

  runSearch();
}

function initPlayers() {
  document.querySelectorAll(".player-shell[data-video-url]").forEach((shell) => {
    const video = shell.querySelector("video");
    const toggle = shell.querySelector("[data-player-toggle]");
    const source = shell.dataset.videoUrl;
    let initialized = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    const initialize = () => {
      if (initialized) {
        return;
      }
      initialized = true;

      if (source.endsWith(".m3u8") && Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
    };

    const play = async () => {
      initialize();
      try {
        await video.play();
        shell.classList.add("is-playing");
      } catch (error) {
        shell.classList.remove("is-playing");
        video.controls = true;
      }
    };

    if (toggle) {
      toggle.addEventListener("click", play);
    }

    video.addEventListener("play", () => shell.classList.add("is-playing"));
    video.addEventListener("pause", () => shell.classList.remove("is-playing"));
    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

ready(() => {
  initImageFallbacks();
  initHeroSlider();
  initPageFilters();
  initSearchPage();
  initPlayers();
});
