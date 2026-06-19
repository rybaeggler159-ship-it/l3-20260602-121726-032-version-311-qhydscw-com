(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-search-input]');
    var categoryFilter = filterRoot.querySelector('[data-category-filter]');
    var yearFilter = filterRoot.querySelector('[data-year-filter]');
    var typeFilter = filterRoot.querySelector('[data-type-filter]');
    var resultCount = filterRoot.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (queryFromUrl && searchInput) {
      searchInput.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = visible;
      }
    }

    [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
}());
