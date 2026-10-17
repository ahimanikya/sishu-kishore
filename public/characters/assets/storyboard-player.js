(() => {
  const player = document.querySelector('.storyboard-player');
  const source = document.getElementById('storyboard-data');
  if (!player || !source) return;
  const data = JSON.parse(source.textContent);
  const controls = player.querySelector('.storyboard-controls');
  const play = player.querySelector('[data-player-play]');
  const previous = player.querySelector('[data-player-previous]');
  const next = player.querySelector('[data-player-next]');
  const seek = player.querySelector('input[type=range]');
  const clock = player.querySelector('[data-player-clock]');
  const stage = player.querySelector('.storyboard-stage');
  const heading = player.querySelector('[data-player-scene]');
  const dialogue = player.querySelector('[data-player-dialogue]');
  let elapsed = 0, playing = false, last = 0, frame = -1, raf = 0;
  const starts = [];
  let sum = 0;
  data.scenes.forEach(scene => { starts.push(sum); sum += scene.seconds; });
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'or';
  const time = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  function paired(node, or, en) {
    node.dataset.or = or;
    node.dataset.en = en;
    node.textContent = language() === 'en' ? en : or;
  }
  function currentFrame() {
    let found = 0;
    starts.forEach((start, i) => { if (elapsed >= start) found = i; });
    return found;
  }
  function render(force = false) {
    const index = currentFrame();
    const scene = data.scenes[index];
    seek.value = String(elapsed);
    clock.textContent = `${time(elapsed)} / ${time(data.duration)}`;
    paired(play, playing ? 'ଥାମନ୍ତୁ' : elapsed >= data.duration ? 'ପୁଣି ଚଳାନ୍ତୁ' : 'ଚଳାନ୍ତୁ', playing ? 'Pause' : elapsed >= data.duration ? 'Replay' : 'Play');
    play.setAttribute('aria-pressed', String(playing));
    previous.disabled = index === 0;
    next.disabled = index === data.scenes.length - 1;
    if (frame !== index || force) {
      frame = index;
      stage.style.backgroundPosition = `${(index % 2) * 100}% ${Math.floor(index / 2) * 100}%`;
      stage.dataset.ariaLabelOr = scene.action.or;
      stage.dataset.ariaLabelEn = scene.action.en;
      stage.setAttribute('aria-label', scene.action[language()]);
      paired(heading, `ଦୃଶ୍ୟ ${index + 1} · ${starts[index]}–${starts[index] + scene.seconds} ସେକେଣ୍ଡ`, `Scene ${index + 1} · ${starts[index]}–${starts[index] + scene.seconds} seconds`);
      dialogue.replaceChildren();
      scene.lines.forEach(line => {
        const p = document.createElement('p');
        const name = document.createElement('strong');
        const words = document.createElement('span');
        paired(name, line.speaker.or, line.speaker.en);
        paired(words, line.text.or, line.text.en);
        p.append(name, document.createElement('br'), words);
        dialogue.append(p);
      });
      if (!scene.lines.length) {
        const p = document.createElement('p');
        paired(p, 'ଏହି ଦୃଶ୍ୟରେ ସଂଳାପ ନାହିଁ।', 'No dialogue in this scene.');
        dialogue.append(p);
      }
    }
  }
  function pause() {
    playing = false;
    cancelAnimationFrame(raf);
    render();
  }
  function tick(now) {
    if (!playing) return;
    elapsed = Math.min(data.duration, elapsed + (now - last) / 1000);
    last = now;
    if (elapsed >= data.duration) playing = false;
    render();
    if (playing) raf = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => {
    if (playing) return pause();
    if (elapsed >= data.duration) elapsed = 0;
    playing = true; last = performance.now(); render();
    raf = requestAnimationFrame(tick);
  });
  function jump(index) {
    pause(); elapsed = starts[index]; render();
  }
  previous.addEventListener('click', () => jump(Math.max(0, currentFrame() - 1)));
  next.addEventListener('click', () => jump(Math.min(data.scenes.length - 1, currentFrame() + 1)));
  seek.addEventListener('input', () => { const value = Number(seek.value); pause(); elapsed = value; render(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  new MutationObserver(() => render(true)).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  controls.hidden = false;
  render(true);
})();
