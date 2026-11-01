# Visual review checklist

Record page, viewport, candidate revision, reviewer, result, screenshot and unresolved finding. A check below is a required review question, not a claim that it already passed across the site.

## Representative surfaces

Review the homepage, current issue, one older issue, an article with a long Odia title, a writer profile, `/our-brand/`, one illustrated book and the signed-out Studio. Add a signed-in Studio check when authenticated behavior is changed and authorized. Use real published content; do not transmit sample submissions while testing.

## Layout and type

- Inspect at 320px, 390px, 768px and desktop width; include enlarged text and 200% browser zoom. No horizontal page overflow, clipped controls or overlapping text.
- Verify full logo, cover lettering and author names. Odia marks and conjuncts must remain intact; preserve original verse breaks.
- Compare title/byline/action gaps, card padding, section spacing and reading width against the shared scale. Responsive reductions must not eliminate byline separation.
- Check empty, long-title, long-author and missing-image cases. Keep a readable identity without a fabricated image.
- Confirm image proportions, intended crop and reserved loading space. An infographic or source scan must remain fully accessible.

## Interaction and accessibility

- Tab through links, menus and controls: logical sequence, visible focus, no traps and clear exit from reading mode.
- Check primary reading controls against the 44px minimum / 48px preferred target convention. Check inline prose links for useful separation in their context.
- Test supported disabled/current/error states with semantics and text, not colour alone.
- Check body text contrast (4.5:1), large text (3:1) and essential control boundaries/focus (3:1) for the actual foreground/background pair. Do not infer contrast from colour names.
- Inspect reduced motion, night/plain-paper modes and forced colours where supported. Preserve source art in these modes; the UI must remain usable.
- Confirm accessible names for icon controls and meaningful alternative text for informative images. Decorative art should not repeat surrounding text to screen readers.

## Editorial and privacy

- Compare story art to its source and inspect anatomy, gestures, scene and Odisha details. Screenshots alone cannot certify cultural or literary fidelity.
- Keep source scans, original wording, credits and intentional reading order. No automatic archival deletion to satisfy a deduplication rule.
- Public UI stays Odia; Studio UI stays English. Original English book text remains English.
- Private reference, manuscripts and editor notes must be absent from `dist/`; unlisted books and drafts retain their existing boundaries. No public Studio navigation links.

## Evidence and release

- Run relevant checks plus `npm test` and `npm run build` with Node 24 and configured Python dependencies.
- Inspect generated changes; do not mix unrelated regeneration into a design change.
- Record separate review of exact candidate files and resolve material findings. Note untested screen-reader, physical-device or child usability conditions honestly.
- Publish only when the actual user instruction authorizes it; verify changed live pages after deployment.

Future field work: review with children and a parent/teacher, real screen-reader use, slow mobile devices and real-traffic performance. These remain distinct from automated regression tests.
