(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var targetId = panel.getAttribute("data-target");
            var target = document.getElementById(targetId);
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
            var input = panel.querySelector(".site-search");
            var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
            var empty = target.parentElement ? target.parentElement.querySelector(".empty-state") : null;
            var state = {
                text: "",
                filter: "all",
                value: ""
            };

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var type = card.getAttribute("data-type") || "";
                    var textMatch = !state.text || haystack.indexOf(state.text) !== -1;
                    var typeMatch = state.filter === "all" || type === state.value;
                    var show = textMatch && typeMatch;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", function () {
                    state.text = input.value.trim().toLowerCase();
                    apply();
                });
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    state.filter = chip.getAttribute("data-filter") || "all";
                    state.value = chip.getAttribute("data-value") || "";
                    apply();
                });
            });
            apply();
        });
    }

    function attachStream(video, stream) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(stream);
            hlsPlayer.attachMedia(video);
            return hlsPlayer;
        }
        video.src = stream;
        return null;
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var triggers = Array.prototype.slice.call(document.querySelectorAll(options.triggerSelector || ""));
        var stream = options.stream;
        var prepared = false;
        var hlsPlayer = null;
        if (!video || !stream) {
            return;
        }

        function play() {
            if (!prepared) {
                hlsPlayer = attachStream(video, stream);
                prepared = true;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            video.play().catch(function () {});
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function () {
                var shell = video.closest(".player-shell");
                if (shell) {
                    shell.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
                play();
            });
        });

        video.addEventListener("click", function () {
            if (!prepared || video.paused) {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsPlayer && typeof hlsPlayer.destroy === "function") {
                hlsPlayer.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
