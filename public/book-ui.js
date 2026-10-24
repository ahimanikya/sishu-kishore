// Keep chapter jumps and keyboard focus below the wrapping reader toolbar.
(() => {
  const toolbar = document.querySelector('.reader-tools');
  if (!toolbar) return;
  const measure = () => document.documentElement.style.setProperty(
    '--book-toolbar-offset', `${Math.ceil(toolbar.getBoundingClientRect().height) + 16}px`
  );
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(toolbar);
  else window.addEventListener('resize', measure);
})();
