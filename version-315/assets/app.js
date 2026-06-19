(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setMobileMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setHeroCarousel() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
        start();
      });
    });

    start();
  }

  function setCardTools() {
    var inputs = qsa('.card-search');
    var chips = qsa('.filter-chip');
    var activeFilter = 'all';

    function currentQuery() {
      for (var i = 0; i < inputs.length; i += 1) {
        if (document.activeElement === inputs[i]) return inputs[i].value.trim().toLowerCase();
      }
      return inputs.length ? inputs[0].value.trim().toLowerCase() : '';
    }

    function apply() {
      var query = currentQuery();
      qsa('.movie-card').forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var group = card.getAttribute('data-filter') || '';
        var okText = !query || text.indexOf(query) !== -1;
        var okFilter = activeFilter === 'all' || group === activeFilter;
        card.classList.toggle('hidden', !(okText && okFilter));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        inputs.forEach(function (other) {
          if (other !== input) other.value = input.value;
        });
        apply();
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
  }

  window.initPlayer = function (streamUrl) {
    var video = qs('.movie-video');
    var layer = qs('.play-layer');
    var playButtons = qsa('.play-trigger');
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) return;

    function attach() {
      if (attached) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      video.controls = true;
      if (layer) layer.classList.add('is-hidden');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function toggle() {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    });

    if (layer) {
      layer.addEventListener('click', start);
    }

    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
      if (layer) layer.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      if (layer) layer.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setMobileMenu();
    setHeroCarousel();
    setCardTools();
  });
}());
