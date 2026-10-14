# Smooth reader page turns — 15 October 2026

User request: make the magazine page-flip animation smoother, like Kindle. The preceding request also makes the homepage cover open the magazine reader.

## Local implementation

- Replaced the rotating, fading whole-spread effect with a 460 ms eased leaf turn around the centre fold on desktop. The reverse face contains the correct destination page; the stationary page stays in place until covered.
- The entire paper area, including page furniture, participates in the turn. Nested reading offsets and inherited palette variables are preserved in snapshots without overriding headings' or cover lettering's own colours.
- Single-page layouts use an opaque directional slide with a soft paper edge. Front/back covers use the existing cover geometry; arriving at a closing cover reveals it beneath opaque paper rather than fading article text through it.
- Rapid inputs cannot interrupt an active turn or create overlapping overlays. Direct jumps, settings that alter layout, closing, resize and reduced-motion changes clean up transient pages. Reduced motion navigates immediately.
- The generic book reader retains the same three-argument animation API with a slide fallback.
- Homepage cover points to `/shishu/current_issue.html#reader` and has a reading-action accessible label.
- No literary text, illustration, publication or deployment was changed.

## Verification

Chrome local preview, desktop and 390×844 phone viewport:

- Inspected forward and reverse intermediate frames with a temporary slow duration, then restored 460 ms and inspected normal-speed rendering.
- Confirmed centre-fold alignment, retained coloured headings/bylines, page furniture and scroll positions; phone slide keeps upright, opaque lettering.
- Fullscreen turn and keyboard navigation work. Two rapid right-arrow presses advance one spread while the first turn is active. Overlay disappears on completion.
- Reduced-motion emulation advances immediately with no overlay; emulation was reset.
- End reaches the back cover; previous opens pages 91–92, then next reveals the back cover without transparent article text. Home reaches the front cover.
- All 19 tests passed, including nine new animation lifecycle tests. JavaScript syntax, diff whitespace and all public-delivery/sharing/discovery/ebook/writer checks passed.
- Browser cache, motion and viewport overrides were temporary and reset. Validation is Chrome desktop plus an emulated phone, not a physical mobile/Safari or frame-rate benchmark.

Preview: http://127.0.0.1:8816/shishu/current_issue.html#reader

Screenshots in the parent workspace's `business-review/sishu-kishore/2026-10-15/reader-update`: `smooth-reader-page-turn.png`, `smooth-reader-phone.png`, and `cover-click-opens-reader.jpg`.

## Publication preparation

The user authorized publication on 15 October 2026. The release build now fingerprints the six changed reader/home CSS and JavaScript assets on regular pages and extensionless aliases, so updated HTML requests fresh assets. A clean release snapshot excluding unrelated local editorial/backend work passed all 17 included tests and the complete production build. Its generated homepage retains exactly 25 articles, 20 drawings, and the reader cover link; generated asset URLs match their content hashes.
