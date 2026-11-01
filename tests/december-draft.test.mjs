import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const prefix = '/review/2026-12/';
const poemRoute = prefix + 'shita-ra-parashe.html';
const read = route => fs.readFileSync('public/' + route.replace(/^\//, ''), 'utf8');

test('December poem is an unlisted draft with preserved wording and independent navigation', () => {
  const poem = read(poemRoute);
  for (const route of [prefix + 'index.html', poemRoute]) {
    const html = read(route);
    assert.match(html, /<html lang="or"/);
    assert.match(html, /<meta[^>]*content="noindex, follow"[^>]*name="robots"|<meta[^>]*name="robots"[^>]*content="noindex, follow"/);
    assert.match(html, /ସମ୍ପାଦକୀୟ ସମୀକ୍ଷା ଓ ଅନୁମୋଦନ ଅପେକ୍ଷାରେ/);
    assert.ok(html.includes('/writers/57b2cccb4266.html'));
    assert.doesNotMatch(html, /data-reading-issue|data-reader-article|data-quiet-reader|editorial-private/);
    assert.doesNotMatch(html, /<a[^>]+href="\/editions\/2026-11\//);
  }
  assert.ok(poem.includes('href="' + prefix + '"'));
  const prose = poem.match(/<div class="ia-prose nov-poem">[\s\S]*?<\/div>/)?.[0];
  assert.ok(prose);
  // Fingerprint of the preserved original poem block, including line breaks.
  assert.equal(crypto.createHash('sha256').update(prose).digest('hex'), 'e46d771c209f67e8b62ad500a49cebc880a1fd8c481ce654bbcb837624a7802b');
  for (const route of ['index.html', 'current_issue.html', 'old_issues.html', 'writers/57b2cccb4266.html', 'edition-reader.json', 'reader-catalog.json', 'content-index.json', 'sitemap.xml']) {
    assert.ok(!read(route).includes(prefix), route + ' must not list the draft');
  }
});
