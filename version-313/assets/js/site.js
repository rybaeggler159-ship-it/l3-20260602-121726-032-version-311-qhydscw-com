(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function formatTime(value) {
        if (!Number.isFinite(value)) {
            return "0:00";
        }
        var minutes = Math.floor(value / 60);
        var seconds = Math.floor(value % 60).toString().padStart(2, "0");
        return minutes + ":" + seconds;
    }

    function setupHeader() {
        var header = document.querySelector("[data-site-header]");
        if (!header) {
            return;
        }
        var toggle = header.querySelector("[data-menu-toggle]");
        var sync = function() {
            header.classList.toggle("is-scrolled", window.scrollY > 48);
        };
        sync();
        window.addEventListener("scroll", sync, { passive: true });
        if (toggle) {
            toggle.addEventListener("click", function() {
                header.classList.toggle("is-open");
            });
        }
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function cardText(card) {
        return [
            card.dataset.title || "",
            card.dataset.region || "",
            card.dataset.type || "",
            card.dataset.year || "",
            card.dataset.category || "",
            card.dataset.tags || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-card-list]");
        if (!panel || !list) {
            return;
        }
        var keyword = panel.querySelector("[data-filter-keyword]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var status = panel.querySelector("[data-filter-status]");
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (keyword && initial) {
            keyword.value = initial;
        }
        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var r = region ? region.value : "";
            var t = type ? type.value : "";
            var y = year ? year.value : "";
            var shown = 0;
            list.querySelectorAll("[data-card]").forEach(function(card) {
                var matchesKeyword = !q || cardText(card).indexOf(q) !== -1;
                var matchesRegion = !r || card.dataset.region === r;
                var matchesType = !t || card.dataset.type === t;
                var matchesYear = !y || card.dataset.year === y;
                var visible = matchesKeyword && matchesRegion && matchesType && matchesYear;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
            if (status) {
                status.textContent = q || r || t || y ? "筛选结果已更新" : "输入片名、题材或标签，快速定位想看的内容。";
            }
        }
        [keyword, region, type, year].forEach(function(input) {
            if (input) {
                input.addEventListener("input", apply);
                input.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function(player) {
            var video = player.querySelector("video");
            var stream = player.getAttribute("data-stream");
            var overlay = player.querySelector("[data-play-button]");
            var toggle = player.querySelector("[data-play-toggle]");
            var progress = player.querySelector("[data-progress]");
            var time = player.querySelector("[data-time]");
            var mute = player.querySelector("[data-mute-toggle]");
            var fullscreen = player.querySelector("[data-fullscreen]");
            var hls;
            if (!video || !stream) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            function updatePlaying() {
                var active = !video.paused && !video.ended;
                player.classList.toggle("is-playing", active);
                if (toggle) {
                    toggle.textContent = active ? "暂停" : "▶";
                }
            }
            function play() {
                var task = video.play();
                if (task && typeof task.catch === "function") {
                    task.catch(function() {});
                }
            }
            function togglePlay() {
                if (video.paused || video.ended) {
                    play();
                } else {
                    video.pause();
                }
            }
            if (overlay) {
                overlay.addEventListener("click", togglePlay);
            }
            if (toggle) {
                toggle.addEventListener("click", togglePlay);
            }
            video.addEventListener("click", togglePlay);
            video.addEventListener("play", updatePlaying);
            video.addEventListener("pause", updatePlaying);
            video.addEventListener("ended", updatePlaying);
            video.addEventListener("loadedmetadata", function() {
                if (progress) {
                    progress.max = video.duration || 0;
                }
                if (time) {
                    time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
                }
            });
            video.addEventListener("timeupdate", function() {
                if (progress && Number.isFinite(video.currentTime)) {
                    progress.value = video.currentTime;
                }
                if (time) {
                    time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
                }
            });
            if (progress) {
                progress.addEventListener("input", function() {
                    video.currentTime = Number(progress.value) || 0;
                });
            }
            if (mute) {
                mute.addEventListener("click", function() {
                    video.muted = !video.muted;
                    mute.textContent = video.muted ? "静音" : "音量";
                });
            }
            if (fullscreen) {
                fullscreen.addEventListener("click", function() {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (player.requestFullscreen) {
                        player.requestFullscreen();
                    }
                });
            }
            window.addEventListener("beforeunload", function() {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function() {
        setupHeader();
        setupSearchForms();
        setupFilters();
        setupPlayers();
    });
})();
