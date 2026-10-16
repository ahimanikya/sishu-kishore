(() => {
  const allowed = ['or', 'en'];
  let stored;
  try { stored = localStorage.getItem('character-language'); } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  const named = /(?:page|finished)-english/.test(location.pathname) ? 'en' : /(?:page|finished)-odia/.test(location.pathname) ? 'or' : null;
  const initial = allowed.includes(requested) ? requested : named || (allowed.includes(stored) ? stored : 'or');
  function apply(lang, updateUrl = false) {
    if (!allowed.includes(lang)) return;
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    window.characterLanguage = lang;
    for (const node of document.querySelectorAll('[data-or][data-en]')) node.textContent = node.dataset[lang];
    for (const attr of ['alt', 'aria-label', 'title']) {
      for (const node of document.querySelectorAll(`[data-${attr}-or]`)) node.setAttribute(attr, node.getAttribute(`data-${attr}-${lang}`));
    }
    for (const node of document.querySelectorAll('.art[data-alt-or]')) node.setAttribute('aria-label', node.getAttribute(`data-alt-${lang}`));
    for (const button of document.querySelectorAll('[data-collection-language], [data-language]')) {
      button.setAttribute('aria-pressed', String((button.dataset.collectionLanguage || button.dataset.language) === lang));
    }
    for (const reader of document.querySelectorAll('.language-reader')) {
      const img = reader.querySelector('.reader-image');
      if (img?.dataset[lang]) {
        img.src = img.dataset[lang];
        img.alt = lang === 'or' ? 'ବର୍ଷା ପରର ବାଟ — ଓଡ଼ିଆ ଗଳ୍ପ' : 'The Path After Rain — English story';
        const a = reader.querySelector('.reader-link');
        if (a) a.href = img.dataset[lang === 'or' ? 'downloadOr' : 'downloadEn'];
      }
    }
    try { localStorage.setItem('character-language', lang); } catch {}
    if (updateUrl) {
      const url = new URL(location.href); url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
  }
  document.querySelectorAll('[data-collection-language], [data-language]').forEach(button => {
    button.addEventListener('click', () => apply(button.dataset.collectionLanguage || button.dataset.language, true));
  });
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || a.hasAttribute('download') || a.getAttribute('href').startsWith('#')) return;
    const url = new URL(a.href, location.href);
    if (url.origin === location.origin && (url.pathname.includes('/characters/') || url.protocol === 'file:') && /(?:\.html|\/)$/i.test(url.pathname)) {
      url.searchParams.set('lang', window.characterLanguage); a.href = url.href;
    }
  });
  apply(initial);
})();
