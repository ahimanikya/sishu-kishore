# Children’s art gallery

Source: https://www.shishukishora.com/activity_children.php, downloaded 10 October 2026.

All 20 drawings from issues 30–34 were fetched and matched byte-for-byte to existing local assets. Original image files, children’s names, school/class credits and issue labels are retained. Source snapshots are preserved here.

The user requested decorative frames and brief captions. Frames are CSS only: no crop, repaint, AI replacement or alteration of the drawings. The short Odia display captions describe visible subjects and are newly added gallery captions, not claimed as original artwork titles. See artworks.json for source URLs, checksums, original credits and captions.

Gallery: /shishu/activity_children.html. Three drawings also appear in a home-page preview. All magazine footers link to the gallery. Original images are available by selecting their frames. Images load lazily, have intrinsic dimensions and alternative text; the gallery works without JavaScript. A local JPEG sharing preview is associated with the gallery.

To rebuild: python3 scripts/build-children-art.py, then npm run build. The gallery generator requires Pillow; ordinary site builds do not.
