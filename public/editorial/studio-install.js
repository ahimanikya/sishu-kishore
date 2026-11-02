// Installation is progressive enhancement: editorial authentication stays in studio.js.
(() => {
  const panel = document.getElementById('studio-install');
  const button = document.getElementById('studio-install-button');
  const status = document.getElementById('studio-install-status');
  if (!panel || !button || !status) return;
  const standalone = window.matchMedia('(display-mode: standalone)');
  let pendingPrompt = null;
  let installed = false;
  const inApp = () => standalone.matches || navigator.standalone === true;
  function update() {
    panel.hidden = installed || inApp();
    button.hidden = !pendingPrompt || panel.hidden;
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingPrompt = event;
    status.textContent = '';
    update();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    pendingPrompt = null;
    update();
  });
  standalone.addEventListener?.('change', update);
  button.addEventListener('click', async () => {
    const prompt = pendingPrompt;
    if (!prompt) return;
    // A browser prompt can only be used once; wait for a fresh event to retry.
    pendingPrompt = null;
    button.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      status.textContent = choice.outcome === 'accepted'
        ? 'Installation requested. Follow your browser’s instructions to finish.'
        : 'Installation cancelled. You can install later from your browser menu.';
    } catch {
      status.textContent = 'The install prompt could not open. Use the instructions under “Install on your device”.';
    } finally {
      button.disabled = false;
      update();
    }
  });
  update();
})();
