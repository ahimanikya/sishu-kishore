# Baloo Bhaina 2 throughout Sishu Kishore

User request: use [Baloo Bhaina 2](https://fonts.google.com/specimen/Baloo+Bhaina+2) for Sishu Kishore.

The shared identity stylesheet now uses this family for navigation, cards, article prose, legacy prose containers, form controls, magazine-reader text and verified ebook text. Reading text remains Regular (400), headings and navigation use SemiBold (600), and existing emphasized controls can use 700. Existing sizes, line spacing, poem breaks, source text, scans and artwork are preserved.

Four official variable WOFF2 subsets supply weights 400–800 without synthesized bold. They are locally hosted; source URLs, sizes and SHA-256 hashes are in `children-identity/baloo-variable-fonts.json`. The existing SIL OFL license and former semibold files are preserved. The build fingerprints `children-identity.css` and redirects the former Odia heading-font preload to the variable Odia face, including extensionless aliases.

## Verification

- Built a clean snapshot of `b1d8285f` with only this typography change overlaid, leaving unrelated working-tree backend/research changes out of verification.
- `npm run build` passed all public-delivery, sharing, discovery, ebook and writer-merge checks: 1,199 static pages; 1,203 sharing pages; 905 discovery URLs; 131 ebook pages.
- All 2,348 built magazine pages and aliases loading the identity stylesheet reference its current fingerprint and variable Odia preload.
- Chrome reports an actual custom **Baloo Bhaina 2** font for an Odia homepage byline, not merely a requested CSS family. Computed styles confirm 400 story/ebook text and 600 heading/navigation weights.
- Desktop homepage checked at 1,522px; phone homepage, article, reader, writers, archive and ebook text checked at 390px. Narrow homepage checked at 320px. No horizontal document overflow was observed. The narrow homepage retains all 25 articles and all 20 children's drawings, with no hidden/clipped title elements.
- The magazine reader displays two desktop columns, advances with ArrowRight, and reflows to one column at phone width. Story text retains 22px/1.95 in the reader and adjustable 24px/1.95 on the article page.
- Verified ebook text on `books/ketejami_loda/page-5.html` uses Baloo Bhaina 2 Regular. Original scan views remain unchanged.
- Visual evidence: `business-review/sishu-kishore/2026-10-20/baloo-font/` in the parent workspace, including desktop homepage, phone article/reader and ebook-text captures.

This is a local preview, not a published release. Chrome viewport checks are not physical-device, Safari, native-reader or calibrated print validation.
