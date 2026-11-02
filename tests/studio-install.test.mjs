import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../public/editorial/studio-install.js', import.meta.url), 'utf8');
function fixture({standalone = false, iosStandalone = false} = {}) {
  const handlers = {}, nodes = {};
  for (const id of ['studio-install', 'studio-install-button', 'studio-install-status']) {
    nodes[id] = {hidden: false, disabled: false, textContent: '', addEventListener(type, fn) {this[type] = fn;}};
  }
  const media = {matches: standalone, addEventListener(type, fn) {this[type] = fn;}};
  vm.runInNewContext(source, {
    document: {getElementById: id => nodes[id]}, navigator: {standalone: iosStandalone},
    window: {matchMedia: () => media, addEventListener(type, fn) {handlers[type] = fn;}}
  });
  return {handlers, media, panel: nodes['studio-install'], button: nodes['studio-install-button'], status: nodes['studio-install-status']};
}
function offer(f, outcome = 'accepted') {
  const prompt = {prevented: false, calls: 0, preventDefault() {this.prevented = true;}, async prompt() {this.calls++;}, userChoice: Promise.resolve({outcome})};
  f.handlers.beforeinstallprompt(prompt);
  return prompt;
}
test('unsupported install API keeps manual help visible without a dead install button', () => {
  const f = fixture();
  assert.equal(f.panel.hidden, false); assert.equal(f.button.hidden, true);
});
test('install prompt requires a click, is consumed once and hides after installed', async () => {
  const f = fixture(), prompt = offer(f);
  assert.equal(prompt.prevented, true); assert.equal(prompt.calls, 0); assert.equal(f.button.hidden, false);
  await f.button.click();
  assert.equal(prompt.calls, 1); assert.equal(f.button.hidden, true); assert.match(f.status.textContent, /requested/);
  await f.button.click(); assert.equal(prompt.calls, 1);
  f.handlers.appinstalled(); assert.equal(f.panel.hidden, true);
});
test('cancel and prompt failure preserve browser instructions and permit a new event', async () => {
  const f = fixture(); offer(f, 'dismissed'); await f.button.click();
  assert.match(f.status.textContent, /cancelled/); assert.equal(f.button.hidden, true); assert.equal(f.panel.hidden, false);
  const prompt = offer(f); prompt.prompt = async () => {throw new Error('unavailable');};
  await f.button.click(); assert.match(f.status.textContent, /could not open/); assert.equal(f.button.disabled, false);
  offer(f); assert.equal(f.button.hidden, false);
});
test('standalone modes and runtime display change suppress redundant installation controls', () => {
  assert.equal(fixture({standalone: true}).panel.hidden, true);
  assert.equal(fixture({iosStandalone: true}).panel.hidden, true);
  const f = fixture(); f.media.matches = true; f.media.change(); assert.equal(f.panel.hidden, true);
});
test('manifest opens the editor within editorial scope and ships correctly sized PNG icons', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../public/editorial/studio.webmanifest', import.meta.url)));
  assert.equal(manifest.id, '/editorial/studio.html'); assert.equal(manifest.start_url, manifest.id);
  assert.equal(manifest.scope, '/editorial/'); assert.equal(manifest.display, 'standalone');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(i => i.sizes === `${size}x${size}`); assert.ok(icon);
    const data = fs.readFileSync(new URL(`../public${icon.src}`, import.meta.url));
    assert.equal(data.subarray(1, 4).toString(), 'PNG'); assert.equal(data.readUInt32BE(16), size); assert.equal(data.readUInt32BE(20), size);
  }
});
