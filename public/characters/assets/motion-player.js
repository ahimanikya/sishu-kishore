(() => {
  const videos = [...document.querySelectorAll('.motion-video')];
  function captions() {
    const language = document.documentElement.lang === 'en' ? 'en' : 'or';
    videos.forEach(video => {
      for (const track of video.textTracks) track.mode = track.language === language ? 'showing' : 'disabled';
    });
  }
  videos.forEach(video => {
    video.addEventListener('loadedmetadata', captions);
    video.addEventListener('play', () => {
      videos.forEach(other => { if (other !== video) other.pause(); });
    });
  });
  new MutationObserver(captions).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
  captions();
})();
