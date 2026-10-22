# Children’s art gallery

Source: https://www.shishukishora.com/activity_children.php, downloaded 10 October 2026.

All 20 drawings from issues 30–34 were fetched and matched byte-for-byte to existing local assets. Original image files, children’s names, school/class credits and issue labels are retained. Source snapshots are preserved here.

The user requested decorative frames and brief captions. Frames are CSS only: no crop, repaint, AI replacement or alteration of the drawings. The short Odia display captions describe visible subjects and are newly added gallery captions, not claimed as original artwork titles. See artworks.json for source URLs, checksums, original credits and captions.

Gallery: /shishu/activity_children.html retains all 20 drawings from issues 30–34. Per the user's 20 October 2026 direction, the homepage shows only the five drawings from the current October 2026 issue (34), in the existing compact style with full names. Its count and section label identify the current-issue selection. The gallery link still opens all preserved artwork. All magazine footers link to the gallery. Original images are available by selecting their frames. Images load lazily, have intrinsic dimensions and alternative text; the gallery works without JavaScript. A local JPEG sharing preview is associated with the gallery.

To rebuild: python3 scripts/build-children-art.py, then npm run build. The gallery generator requires Pillow; ordinary site builds do not.

For homepage-only changes, run `scripts/build-children-art.py --home-only`. `artworks.json` contains explicit `homepage_issue` metadata connecting source issue number 34 to the current reader edition title. Update that metadata when the current edition changes; the generator checks the title against `public/edition-reader.json` and stops on a mismatch rather than presenting the latest archived drawings as current. The preserved `artworks` entries, source snapshots and image files are unchanged.

There is no fixed artwork count or preview limit. The homepage includes every artwork whose source issue number matches the current edition mapping; its displayed count is calculated from that complete selection. Five is only the number of drawings available for issue 34, not a layout rule.
