# Magazine reader update — 15 October 2026

User request: update the Sishu Kishore magazine reader with full-screen mode, arrow-key navigation, front-to-back cover order, and a 3D cover-opening animation on entry. The user clarified that “3rd video” meant a 3D animation.

## Delivered locally

- Every entry starts on the front cover. A separate Resume button preserves the saved reading place.
- Front cover → existing article spreads → digital back cover, with bounded previous/next controls. Contents follows the same order.
- Left/right arrows work from reader buttons as well as the page. Editing controls retain native keyboard behavior. Home/End reach the covers.
- A full-screen button uses the reader's inner frame. Escape exits full-screen without closing the reader; closing the reader exits its full-screen mode.
- A short perspective cover-opening animation runs on entry, can be skipped, and respects reduced motion.
- Current composed cover artwork and live Odia masthead are reused. Older issues use their existing illustration in a matching cover. The digital back cover is a new closing design, not a claim to reproduce an unavailable printed back cover.
- No literary text, source illustrations, publications, or live deployment changed.

## Verification

Browser checks in Chrome against the local preview:

- Current October issue: front cover, arrows from buttons, first article, last spread (91–92), back cover, boundary disabling.
- Full-screen entry/exit and Escape preserve the displayed reading place. Closing while full-screen returns to the issue page.
- Reopening starts on the cover; Resume restores the checked spread (3–4).
- Entry from `/shishu/article-781.html#reader` fetches the correct October cover.
- September archive opens with its own artwork; its last single page (105) remains reachable immediately before the back cover.
- Contents starts with front cover and ends with back cover. Arrow keys on the artwork checkbox do not turn pages.
- 390×844 phone layout: cover and controls fit, with the original masthead visible. Desktop uses two article columns; phone uses one.
- Skip control appears during the entry animation and cancels it. Emulated reduced motion suppresses it. Temporary browser emulation was reset.
- Existing ten-test suite passed. JavaScript syntax and diff whitespace checks passed. `npm run check` passed all public delivery, sharing, discovery, ebook and writer-merge checks.

Preview: `http://127.0.0.1:8816/shishu/current_issue.html#reader`.

Screenshots are saved under `business-review/sishu-kishore/2026-10-15/reader-update` in the parent workspace. Browser verification covers Chrome desktop and an emulated phone viewport; no physical iOS/Safari test is claimed. Browsers without the Fullscreen API keep the viewport-sized reader and hide that button.
