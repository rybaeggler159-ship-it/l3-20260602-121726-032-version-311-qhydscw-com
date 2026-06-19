import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
  var frame = document.querySelector('[data-video-frame]');

  if (!frame) {
    return;
  }

  var video = frame.querySelector('video');
  var playButton = frame.querySelector('[data-video-play]');
  var tip = frame.querySelector('[data-video-tip]');
  var source = frame.getAttribute('data-video-src');
  var hlsInstance = null;

  function setTip(message) {
    if (tip) {
      tip.textContent = message;
    }
  }

  function startPlayback() {
    if (!source) {
      setTip('当前影片没有可用播放源。');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else {
      setTip('当前浏览器不支持 HLS 播放。');
      return;
    }

    frame.classList.add('is-playing');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        frame.classList.remove('is-playing');
        setTip('浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }
}());
