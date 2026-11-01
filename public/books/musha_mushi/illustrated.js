(() => {
  const key = 'musha-mushi-illustrated-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch {}
  const root = document.documentElement;
  const body = document.body;
  const select = document.querySelector('#poems');
  const poems = [...document.querySelectorAll('.poem')];
  const garden = body.classList.contains('story-garden');
  let size = Math.max(17, Math.min(35, Number(saved.size) || 23));
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(saved)); } catch {} };
  const apply = () => { root.style.setProperty('--reading-size', `${size}px`); saved.size = size; persist(); };
  if (saved.size) apply();
  for (const [id, delta] of [['smaller', -2], ['larger', 2]]) {
    document.getElementById(id).onclick = () => { size = Math.max(17, Math.min(35, size + delta)); apply(); };
  }
  const theme = document.querySelector('#theme');
  const night = on => {
    body.classList.toggle('night', on);
    theme.setAttribute('aria-pressed', String(on));
    theme.textContent = on ? 'ଦିନ' : 'ରାତି';
    saved.night = on; persist();
  };
  night(!!saved.night);
  theme.onclick = () => night(!body.classList.contains('night'));
  const previous = document.getElementById('garden-previous');
  const next = document.getElementById('garden-next');
  const setCurrent = id => {
    const index = poems.findIndex(poem => poem.id === id);
    if (index < 0) return;
    select.value = id;
    saved.poem = id; persist();
    if (!garden) return;
    previous.disabled = index === 0;
    next.disabled = index === poems.length - 1;
    for (const link of document.querySelectorAll('.garden-contents a')) {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const go = id => {
    const poem = poems.find(item => item.id === id);
    if (!poem) return;
    location.hash = id;
    setCurrent(id);
    poem.querySelector('h2')?.focus({ preventScroll: true });
  };
  select.onchange = () => go(select.value);
  const sync = () => setCurrent(location.hash.slice(1));
  window.addEventListener('hashchange', sync);
  setCurrent(poems[0]?.id); sync();
  if (garden) {
    for (const [button, delta] of [[previous, -1], [next, 1]]) {
      button.onclick = () => {
        const index = poems.findIndex(poem => poem.id === select.value);
        const target = poems[index + delta];
        if (target) go(target.id);
      };
      button.hidden = false;
    }
    for (const [id, className, setting] of [
      ['garden-focus', 'garden-focus', 'focus'],
      ['garden-paper', 'garden-paper', 'paper']
    ]) {
      const button = document.getElementById(id);
      const update = on => {
        body.classList.toggle(className, on);
        button.setAttribute('aria-pressed', String(on));
        if (setting === 'focus') button.textContent = on ? 'ଚିତ୍ର ସହ ପଢ଼ା' : 'କେବଳ ପଢ଼ା';
        saved[setting] = on; persist();
      };
      update(!!saved[setting]);
      button.onclick = () => update(!body.classList.contains(className));
      button.hidden = false;
    }
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
    }, { rootMargin: '-15% 0px -60% 0px' });
    poems.forEach(poem => observer.observe(poem));
  }
})();
