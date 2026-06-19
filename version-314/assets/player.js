function initMoviePlayer(video, button, streamUrl) {
  if (!video || !button || !streamUrl) {
    return;
  }

  function loadStream() {
    if (video.dataset.ready === "1") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
    } else {
      video.src = streamUrl;
    }

    video.dataset.ready = "1";
  }

  function startPlay() {
    loadStream();
    button.classList.add("is-hidden");
    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  button.addEventListener("click", startPlay);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlay();
    }
  });
}
