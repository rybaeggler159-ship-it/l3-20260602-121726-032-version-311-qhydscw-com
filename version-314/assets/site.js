(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var menu = document.querySelector("[data-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchPage = document.querySelector("[data-search-page]");

  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var keywordInput = searchPage.querySelector("[data-filter-keyword]");
    var regionSelect = searchPage.querySelector("[data-filter-region]");
    var typeSelect = searchPage.querySelector("[data-filter-type]");
    var yearSelect = searchPage.querySelector("[data-filter-year]");
    var status = searchPage.querySelector("[data-filter-status]");
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
    var initialKeyword = params.get("q") || "";

    if (keywordInput) {
      keywordInput.value = initialKeyword;
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.type,
          card.textContent
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || normalize(card.dataset.region) === region;
        var matchType = !type || normalize(card.dataset.type) === type;
        var matchYear = !year || normalize(card.dataset.year) === year;
        var matched = matchKeyword && matchRegion && matchType && matchYear;

        card.classList.toggle("is-filter-hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible > 0 ? "匹配影片 " + visible : "暂无匹配内容";
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    var filterForm = searchPage.querySelector("[data-filter-form]");

    if (filterForm) {
      filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });
    }

    applyFilters();
  }
})();
