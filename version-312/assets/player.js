var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video]'));

shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var source = shell.getAttribute('data-video');
    var mounted = false;
    var hls = null;

    function mount() {
        if (!video || !source || mounted) {
            return;
        }
        mounted = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        mount();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        var result = video.play();
        if (result && result.catch) {
            result.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!mounted) {
                play();
                return;
            }
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
});
