# Complete homepage contribution lists — 15 October 2026

The user requested that all articles and all children's artwork appear on the magazine front page so contributors receive comparable visibility.

- The existing homepage already held all 25 current-issue articles, but its horizontal carousel exposed only three at once. It now uses ordinary grid rows in the same publication order. Each title, byline, illustration and article link is preserved.
- The children's section now includes all 20 original drawings in the preserved artwork manifest, with their existing captions and artist names. These span five source issues; the section does not label them as all belonging to the current issue.
- Two section links near the cover lead directly to the articles or children's art. Cards use three columns on desktop, two on tablets and one on phones. Images retain contain sizing and load lazily.
- The gallery generator now includes every item rather than its former three-item subset. Its new `--home-only` option updates the homepage without rewriting the standalone gallery, footer links or sharing manifest.
- The project instructions record this user-directed replacement of the previous three-preview convention.

Verification: all 25 article routes, titles and bylines match `public/edition-reader.json` exactly and in order. All 20 image routes, captions and artist names match `provenance/children-art/artworks.json` exactly. No duplicates or missing local targets; section links resolve; the home-only generator is idempotent. Chrome desktop and phone layout checks show every card has a visible layout box and no horizontal document overflow. Site delivery, sharing, discovery, ebook and writer-merge checks pass; JavaScript syntax and diff whitespace checks pass.

This is a local website update, not a publication. Original literary text and image files were not changed. Preview: `http://127.0.0.1:8816/shishu/`.
