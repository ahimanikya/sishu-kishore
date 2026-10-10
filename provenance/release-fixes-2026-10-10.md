# Sishu Kishore release fixes — 10 October 2026

All three technical blockers from the deep review have been repaired and deployed.

- Approved publication sync now uses published-only queries, 100 records per request, and stable cursor pagination.
- Firestore denies anonymous reads of withdrawn records. The static site removes withdrawn pages, edition entries, sitemap entries and plain-text exports at the next publishing run (scheduled twice hourly).
- New approved articles use the reading tools and edition reader, retain paragraph breaks, include compact edition navigation, and enter the search/discovery catalogue. Artwork follows reader sizing rules.
- Publishing validates the complete generated site before committing. Retrying a failed deployment also works when the source content is unchanged.

## Evidence

- 39 backend tests passed, including REST pagination across 103 published records while excluding a withdrawn record.
- 6 root tests passed, including a full publish/build/withdraw round-trip in an isolated copy.
- Static delivery, social previews, discovery and ebook verification passed.
- A generated fixture article was checked in Chrome: reading controls, edition sidebar, reader display and exit. The fixture was never published.
- [Pages deployment](https://github.com/ahimanikya/sishu-kishore/actions/runs/38016092204) passed.
- [Hosted security checks](https://github.com/ahimanikya/sishu-kishore/actions/runs/38016092231) passed.
- [Approved-writing workflow](https://github.com/ahimanikya/sishu-kishore/actions/runs/38016202788) passed after the tightened rules were deployed.
- Live published-only and approved-comment queries returned HTTP 200; an unfiltered publication query returned HTTP 403. The live approved feed was empty, so publication and withdrawal of non-empty records were validated with isolated fixtures and emulators.
- The live anonymous comments panel loaded without console errors.

## Remaining before full release sign-off

- Production authenticated sign-in, like/unlike, comment submission, moderation and withdrawal acceptance test.
- Source-compare and approve 128 remaining ebook pages; readers continue to receive original scans for these pages.
- Child/parent usability, screen-reader and real slow-device checks.
- Owner registration of App Check provider, then valid-request monitoring and enforcement rollout.
- Final domain migration; Search Console verification and submission only afterward, as requested.

The three technical findings are closed. These remaining acceptance and owner tasks are recorded, not claimed as completed.
