(() => {
  const data = document.getElementById('shared-article-context');
  if (!data) return;
  const contexts = JSON.parse(data.textContent);
  const requested = new URL(location.href).searchParams.get('issue');
  // Only known memberships may change navigation or the reader collection.
  if (!Object.hasOwn(contexts, requested)) return;
  const edition = contexts[requested];
  const index = edition.items.findIndex(item => item.href === location.pathname);
  if (index < 0) return;
  const oldIssue = document.body.dataset.readingIssue;
  document.body.dataset.readingIssue = requested;
  for (const anchor of document.querySelectorAll('.ia-breadcrumb a, .mag-toc-all')) {
    const url = new URL(anchor.href);
    if (url.pathname === oldIssue) anchor.href = requested + url.hash;
  }
  const makeLink = (href, text) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    return a;
  };
  const nav = document.querySelector('.mag-web-reading');
  if (nav) {
    const links = [];
    if (index > 0) links.push(makeLink(edition.items[index - 1].href, '← ପୂର୍ବ ଲେଖା'));
    links.push(makeLink(requested, 'ସୂଚୀପତ୍ର'));
    if (index + 1 < edition.items.length) links.push(makeLink(edition.items[index + 1].href, 'ପର ଲେଖା →'));
    nav.replaceChildren(...links);
  }
  const list = document.querySelector('.mag-article-sidebar ol');
  if (list) {
    const entries = edition.items.slice(Math.max(0, index - 2), index + 3).map(item => {
      const li = document.createElement('li');
      const a = makeLink(item.href, '');
      const number = document.createElement('span');
      number.className = 'mag-toc-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(edition.items.indexOf(item) + 1).padStart(2, '0');
      const label = document.createElement('span');
      const title = document.createElement('span');
      title.className = 'mag-toc-title';
      title.textContent = item.title;
      const author = document.createElement('small');
      author.textContent = item.byline || '';
      label.append(title, author);
      a.append(number, label);
      if (item.href === location.pathname) {
        a.setAttribute('aria-current', 'page');
        a.href = location.pathname + '?issue=' + encodeURIComponent(requested);
      }
      li.append(a);
      return li;
    });
    list.replaceChildren(...entries);
  }
})();
