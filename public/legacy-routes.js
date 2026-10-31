// Compatibility stays at the root; the lookup does not disclose unlisted URLs.
(async () => {
  if (!/^\/shishu(?:\/|$)/.test(location.pathname)) return;
  try {
    const response = await fetch('/legacy-routes.json');
    if (!response.ok) return;
    const routes = await response.json();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(location.pathname));
    const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const mode = Object.hasOwn(routes, key) && routes[key];
    const tail = location.pathname.slice('/shishu'.length);
    const destination = mode === 'home' ? '/' : mode === 'same' ? tail :
      mode === 'html' ? tail + '.html' : mode === 'trim-html' ? tail.replace(/\/$/, '') + '.html' : null;
    if (destination && /^\/(?!\/)[A-Za-z0-9_./-]*$/.test(destination) && !destination.includes('..')) {
      location.replace(destination + location.search + location.hash);
    }
  } catch {
    // Keep the ordinary not-found page and homepage link available offline.
  }
})();
