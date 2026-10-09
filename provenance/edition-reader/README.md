# Edition and reader adaptation, 10 October 2026

Reference: local Kabita Live website-rulebook.md (Edition page family and READ-03/04), templates/quiet-reader.html and edition design preview. Kabita Live files were read only.

Sishu retains its existing issue titles, story order, grouped contents and cartoon artwork. All 34 editions receive a cover/art-led introduction, contents link and quiet-reader entry. The reader uses the original article HTML, preserves verse breaks, and provides previous/next articles, a contents selector, adjustable type, illustration toggle, paper/night themes and device-local saved place. It uses scrolling within each article, rather than simulated paper pagination. No translations, page-turn animation, sound, analytics or login were added.

Seven legacy young-writer pages use their original text block in the reader. Existing regular-page comment forms are not cloned into the quiet reader. Original article prose was compared before/after and unchanged. Regular page links remain available if loading fails. Reader preferences and saved places tolerate unavailable browser storage.

Writer initial badges removed from directory and profiles; existing photos and generic artwork remain. Mobile reader checked at 390px, including night theme and enlarged type, with no dialog overflow. Navigation, contents, text sizing, close/reopen resume and original-content checks passed.

## Facing-page reader revision

Replaced within-article scrolling with browser-flowed pagination. At desktop widths of 1000px and above with at least 500px height, display two facing pages; smaller viewports display one. Arrows and keyboard navigation turn the spread, then move between articles at its bounds. Reflow on viewport changes, font loading, type-size changes, artwork toggling and opening settings. The original DOM text, paragraph breaks and verse breaks remain intact. Last odd-numbered spreads retain a blank facing page. Paper/night themes, contents selection and device-local saved spread remain available. No animation or sound added.

## Playful page-turn sounds (10 October 2026)
User requested varied child-friendly page-flip sounds. Magazine and ebook arrow turns now play one of five short original Web Audio cues (spring, bells, bubbles, whistle and descending notes), with no consecutive repeat. Audio starts only on a reader action, never on loading, resizing or restoring a place. A visible sound button remembers mute across both readers; hidden pages and rapid repeat clicks do not accumulate sound. No audio downloads or third-party requests. Unit checks cover silent startup, variation, rapid-turn suppression, persisted mute and hidden pages.

## Printed children's-magazine reader (10 October 2026)
User requested a decorated printed-magazine feel instead of a plain divider. The full-screen edition reader now sits on a soft green desk with cream paper, layered page edges, a shaded binding, small original vector kite/leaf margin ornaments, running issue/magazine headers, and page folios. Decorations are outside the text viewport and excluded from accessibility output. One-page mobile and night surfaces are retained. Pagination measures the actual inset viewport rather than the window width. Original text and article art remain unchanged. Desktop, mobile, spread navigation and night mode checked in browser.

## Continuous Odia pagination (10 October 2026)
The edition is now one continuous text flow, so folios and the counter never restart at article boundaries. Digits are explicitly mapped to Odia (୦–୯). All issue articles are fetched with at most four concurrent requests, cached during the reader session, and artwork remains lazy-loaded with declared dimensions. Article starts require room for at least five current-font lines; otherwise they move to the next column. Empty source paragraph wrappers are removed only in the reader clone. An odd final leaf has no dummy facing page. Settings overlay the paper without altering pagination. Saved positions use a versioned edition-wide spread and older saved article positions migrate. Checked desktop/mobile article starts, continuous numbering, absence of blank columns, final single page, article jumps and font reflow; public text is unchanged.
