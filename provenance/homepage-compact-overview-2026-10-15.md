# Compact homepage overview — 15 October 2026

Following editor Paresh Patnaik's feedback and the user's approval of the proposed strategy, the homepage now presents all contributions as small glimpses. This is a local preview; it has not been published.

- All 25 current-issue articles retain their exact titles, bylines, original illustration references and destinations. Each uses an 88-pixel uncropped thumbnail beside the full title and byline, with no excerpt or separate read row. No title or credit is truncated.
- All 20 preserved children's drawings retain their captions, artist names and original image links. Small framed thumbnails show the whole drawing; both thumbnail and caption link to the original. The separate gallery retains larger drawings, school/source credits and issue groupings. These drawings span five source issues.
- The two contribution sections sit together below the cover, before the browsing shortcuts. Section links show article/drawing counts. Desktop uses three columns, tablet two, and narrow phones one compact row per item.
- The homepage shuffles every article once per tab session using Fisher–Yates. It retains that order on reload, Back/Forward and return through the homepage link. A new independent tab session gets a new random arrangement. This is random discovery order, not a ranking or a guarantee of equal exposure. Children's art retains its existing order.
- The saved order is checked against all current article links. New or removed articles, invalid JSON, duplicate IDs or obsolete links cause a complete fresh shuffle. Session storage failures are caught, and page history provides a return-order fallback. With JavaScript disabled, all articles remain available in their static editorial order.
- Actual cards are moved in the DOM, so keyboard and screen-reader order matches the visual order. The current-issue page, article content, writer pages and cover-to-back-page reader sequence are unchanged.

## Verification

- Compared the 25 article route/title/byline/original-image tuples and the 20 drawing image/caption/artist tuples to the published commit: exact preservation, no missing local targets.
- Home-only art generator is idempotent. Current-issue HTML, standalone gallery HTML, reader data, reader script and page-turn script are byte-identical to the published versions.
- Five focused shuffle tests pass: complete unique inclusion, different fresh arrangements, retained return/reload order, unavailable storage/history fallback, corrupt or changed contents, and no changes on non-home pages.
- Full repository suite: 24 tests passed. Full build and delivery, sharing, discovery, ebook and writer checks passed.
- Chrome visual checks at 1114px desktop, 768px tablet, 390px phone and 320px narrow phone: all content present, no horizontal document overflow or clipped text. Local Odia font loaded. Full titles wrap naturally; artwork uses contain sizing. This is browser viewport testing, not a physical-device/Safari claim.
- Browser navigation verified a new independent tab has a different complete order; refresh, Back from an article and homepage-link return retain the prior order. Issue illustrations remain about 300px wide; full gallery frames remain about 337×304px. No broken loaded homepage images.

Preview: http://127.0.0.1:8816/shishu/#home-articles

Screenshots are saved outside the public site under `business-review/sishu-kishore/2026-10-15/compact-homepage/`: `homepage-desktop.png`, `articles-desktop.png`, `art-desktop.png`, `articles-phone.png`, `art-phone.png`.

No literary text or original image files were modified. Unrelated pending backend/workflow changes were left intact.

## Follow-up: explicit Home and edition navigation

The user clarified that the magazine homepage and edition page should be separate. Both routes already existed, but the shared navigation misleadingly labelled the homepage link as “ଚଳିତ ସଂଖ୍ୟା”. It now has two explicit entries:

- “ମୂଳ ପୃଷ୍ଠା” → `/shishu/`: complete compact overview, with the retained session shuffle.
- “ଚଳିତ ସଂଖ୍ୟା” → `/shishu/current_issue.html`: larger illustrated contents in editorial order and reader entry.

The correct page is highlighted in each header. The shared-header fix covers 1,067 existing pages and is maintained by `scripts/build-magazine-navigation.py` in the normal build. A second run changes zero files. All 1,066 affected non-homepage bodies were compared with the published version and are byte-identical after excluding the navigation block. The earlier compact homepage changes are retained. No extra duplicate edition was created.

The full build/delivery checks pass. Browser navigation from Home to the current edition resolves correctly; the edition retains 25 cards with roughly 300px-wide illustrations. The five navigation items fit at desktop and 390px phone widths without horizontal overflow, with separate active Home/edition states. Additional screenshots: `home-edition-navigation-desktop.png`, `home-edition-navigation-phone.png`, `edition-page-desktop.png`, `edition-large-cards-desktop.png`. Still a local preview, not published.


## Follow-up: shuffle each homepage visit — 20 October 2026

The user requested random article order again while reviewing the homepage. The homepage now runs a fresh Fisher–Yates shuffle on each ordinary visit or refresh, replacing the former tab-session persistence. All current-issue article cards remain present exactly once, with their titles, bylines, images and destinations together. Browser Back/Forward restores the arrangement left behind, including a history-state fallback when the browser cannot restore its cached page. No reordering occurs while the reader stays on the page. The edition contents and reader sequence remain in editorial order. The separate current-issue children's-art filter is retained.

Validation: all six focused homepage-order tests pass, including fresh visits, reloads, history restoration, invalid saved orders and unavailable history storage. The scoped preview build passes. Chrome refresh verification found all 25 current articles exactly once in both orders, with a changed arrangement and identical membership. Screenshot and order evidence are saved in `business-review/sishu-kishore/2026-10-20/random-home-articles/`. This remains a local preview; it has not been published.
