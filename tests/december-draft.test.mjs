import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const december = '/review/2026-12/';
const january = '/review/2027-01/';
const read = route => fs.readFileSync('public/' + route.replace(/^\//, ''), 'utf8');
const poems = [
  { prefix: december, slug: 'shita-ra-parashe', title: 'ଶୀତ ର ପରଶେ ଜଗତ ହସେ', author: '/writers/57b2cccb4266.html', november: 'article-16', hash: 'e46d771c209f67e8b62ad500a49cebc880a1fd8c481ce654bbcb837624a7802b' },
  { prefix: january, slug: 'tiki-bachhuri', title: 'ଟିକି ବାଛୁରୀ', author: '/writers/b98810c4015c.html', november: 'article-14', hash: '72798ebe692e7f025f13f7fe886e8a858b97a421dc33c098b955d8f59b07ddd9' },
  { prefix: january, slug: 'chaiti-khara', title: 'ଚଇତି ଖରା', author: '/writers/9b2a83434590.html', november: 'article-09', hash: 'd3843b527cbfbfc77e283f8919b8e8e3427404bb77132850a6853ec3b0f45414' },
  { prefix: january, slug: 'jahnmamu', title: 'ଜହ୍ନମାମୁ', author: '/writers/fb5e637ed769.html', november: 'article-20', hash: '3dd26a0531718d0b45c4de387e7cd332039cfacc04daa89dbb10bfa20fe5244a' },
];

test('December and January drafts retain original poems with independent navigation', () => {
  for (const [prefix,count] of [[december,1],[january,3]]) {
    const landing=read(prefix+'index.html');
    assert.equal((landing.match(/class="ia-article-card"/g)||[]).length,count);
  }
  for (const route of [december+'index.html',january+'index.html',...poems.map(p=>p.prefix+p.slug+'.html')]) {
    const html=read(route);
    assert.match(html, /<html lang="or"/);
    assert.match(html, /<meta[^>]*content="noindex, follow"[^>]*name="robots"|<meta[^>]*name="robots"[^>]*content="noindex, follow"/);
    assert.match(html, /ସମ୍ପାଦକୀୟ ସମୀକ୍ଷା ଓ ଅନୁମୋଦନ ଅପେକ୍ଷାରେ/);
    assert.doesNotMatch(html, /data-reading-issue|data-reader-article|data-quiet-reader|editorial-private/);
    assert.doesNotMatch(html, /<a[^>]+href="\/editions\/2026-11\//);
  }
  for (const poem of poems) {
    const prefix = poem.prefix;
    const landing=read(prefix+'index.html');
    const route = prefix + poem.slug + '.html';
    const html = read(route);
    assert.ok(landing.includes('href="' + route + '"'));
    assert.ok(landing.includes(poem.author));
    assert.ok(html.includes('<h1>' + poem.title + '</h1>'));
    assert.ok(html.includes('href="' + poem.author + '"'));
    assert.ok(html.includes('href="' + prefix + '"'));
    const prose = html.match(/<div class="ia-prose nov-poem">[\s\S]*?<\/div>/)?.[0];
    assert.ok(prose);
    assert.equal(crypto.createHash('sha256').update(prose).digest('hex'), poem.hash);
  }
});

test('deferred poems are excluded from public author contributions and issue discovery', () => {
  for (const poem of poems) {
    const author = read(poem.author);
    for(const prefix of [december,january])assert.ok(!author.includes(prefix), poem.author + ' must not list draft pages');
    assert.ok(!author.includes('/editions/2026-11/' + poem.november + '.html'), poem.author + ' must not list a deferred November poem');
  }
  for (const route of ['index.html', 'current_issue.html', 'old_issues.html', 'edition-reader.json', 'reader-catalog.json', 'content-index.json', 'sitemap.xml']) {
    for(const prefix of [december,january])assert.ok(!read(route).includes(prefix), route + ' must not list the draft');
  }
});
