function initVideo(streamUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("play-cover");

    if (!video || !cover || !streamUrl) {
        return;
    }

    var hlsObject = null;
    var prepared = false;

    function tryPlay() {
        video.controls = true;
        var result = video.play();

        if (result && typeof result.catch === "function") {
            result.catch(function () {
                cover.classList.remove("is-hidden");
            });
        }
    }

    function prepareVideo() {
        if (prepared) {
            tryPlay();
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", tryPlay, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsObject = new Hls();
            hlsObject.loadSource(streamUrl);
            hlsObject.attachMedia(video);
            hlsObject.on(Hls.Events.MANIFEST_PARSED, tryPlay);
            return;
        }

        video.src = streamUrl;
        video.addEventListener("loadedmetadata", tryPlay, { once: true });
        video.load();
    }

    function start() {
        cover.classList.add("is-hidden");
        prepareVideo();
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!prepared || video.paused) {
            start();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsObject) {
            hlsObject.destroy();
        }
    });
}
