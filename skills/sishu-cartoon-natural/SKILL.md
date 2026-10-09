---
name: sishu-cartoon-natural
description: Organize and illustrate Sishu Kishore as a simple Odia monthly children's magazine, including issue and writer navigation, cartoon story art, and accessible ebook conversion. Use for this magazine and its design guide, not Shalandi bookstore redesigns.
---

# Sishu Cartoon Natural

Use the illustrated warmth of classic Chandamama children's magazines as a broad reference. Keep Sishu Kishore's own identity and original writing. The reader should encounter stories and characters, not a production dashboard.

## Magazine structure

Primary navigation: This month, Past issues, Books, Writers, Write. Use short Odia labels. Put Editor's note, About and Contact in the footer and provide a visible editor's-note link on the homepage.

- Home: current issue, its cover, three article previews and a clear link to full contents. Do not repeat the entire contents on the homepage.
- Issue: month/year, grouped contents with each article's title, writer and illustration. Past issues are grouped by year; exclude the current issue from the past-issue list.
- Article: title, linked byline, source issue, supporting illustration and one comfortable reading column. Preserve punctuation and poem line breaks. Keep a clear return to the issue.
- Writer: derive contributions from published bylines. Normalize Unicode and whitespace, but do not merge different spellings or invent biographies or portraits. Use source-backed identity evidence for any later merge.
- Write: a clear submission entry and the existing editorial-review workflow. Submissions must not appear publicly on submission. Younger children can use a parent or teacher's help.
- Editor's note: retain the real text and its actual context. Never present the first issue's introduction as a newly written monthly note. Do not manufacture missing monthly editorials.

## Clean-up and preservation

Remove exact duplicates from indexes and redirect duplicate destinations to their canonical article. Retain issue relationships. Confirm duplicate identity with title, byline and complete body, not title alone.

Retire stale birthday notices, announcements, visitor counters, repeated promotional modules and overlapping hubs from ordinary reading paths. Preserve original snapshots and source assets for recovery. Do not discard worthwhile stories merely because they are old. Proposed substantive changes to editorial writing still require the user's approval unless the user specifically authorizes them.

## Illustration

Use expressive 2D cartoon drawing: confident dark outlines, simple faces and noses, readable gestures, broad colour shapes and restrained flat shadows. Avoid photographic skin, realistic hair/fur detail, glossy 3D, airbrushing and ornate decorative clutter. Human Natural means believable relationships and purposeful visual storytelling here, not photographic realism.

Read the complete text before choosing a scene. Match the mood: adventure, humour, tenderness, suspense or seasonal wonder. Do not turn every story into the same smiling family or village scene. Retain Odia cultural context where supported. No invented author likenesses.

Use landscape 3:2 art for article cards and the same illustration on the reading page. Preserve the full composition with contain sizing. The approved web cover is portrait 2:3; its only lettering is the live Odia title **ଶିଶୁ କିଶୋର**. Preserve printed covers. For Durga artwork, check exactly ten arms, clear attachments and respectful characterization.

Use the image generation tool for raster generation and edits. Keep local versioned assets and exact prompts. Be honest that generated images are AI-generated; a hand-drawn aesthetic is not a claim of human authorship.

## Ebook conversion

Separate scans, raw OCR, reviewed transcription and rendered HTML. Preserve covers and source-page order. Never replace uncertain Odia with guessed prose or silently claim OCR is a faithful edition.

Provide responsive real text, page navigation, adjustable type and access to each original scan. Preserve poetry line breaks; join scan-imposed line wraps only after identifying prose structure. Detecting text inside drawings is a common OCR failure: review illustrations and low-confidence pages especially carefully. Confidence scores are review aids, not proof of accuracy. Keep incomplete conversions explicitly marked as drafts until every page is proofread. State any remaining proofreading honestly at handoff.

## Readability and verification

Keep static pages, obvious links, large touch targets, comfortable Odia type and no autoplay or moving backgrounds. Retain the approved cartoon assets rather than regenerating them unnecessarily. Check phone and desktop layouts, writer search, issue-to-article links, ebook navigation and source-text preservation.

The project stores its reusable art guide in `scripts/build-storybook-guide.py`, content model in `data/shishu-architecture.json`, art prompts in `data/article-art.json`, and ebook review state in `data/ebook-conversion-review.json`. Run `organize_site.py` before `scripts/organize-shishu.py`, then `scripts/build-ebook-readers.py` when rebuilding all pages. Publishing follows the existing Sites workflow and audience.

Writer directories must strip structural “ଲେଖା :” labels, exclude dates accidentally stored as bylines, and merge only exact normalized names. Preserve the original byline on each article; do not merge similar names without identity evidence.

## Book-reader correction (October 2026)
Use a quiet dedicated reader, inspired by Kabita Live and Singhasan: facing original pages on desktop, one page on phones, simple previous/next, page jump, local saved place, paper/night surface, adjustable verified text, and an exit back to the book. Preserve all original artwork and covers. Never feed raw OCR into the public text view. Keep data/ebook-ocr immutable; data/ebook-text holds candidates and source-compared transcription. A confidence threshold is never approval. Until each page is checked, show its original scan in text mode with a short honest notice. Review comic speech panels in visual reading order and poetry line by line.

Writer images: original named author pages first, identity-backed web sources second; otherwise an empty image area without an invented face. Store evidence in data/writer-portraits.json. Reject stock silhouettes and images reused for unrelated people. Archive previews use large uncropped 3:2 illustrations grounded in a story from that edition, with readable live month/year labels. The user authorized regeneration of all 33 past-edition previews in October 2026. Preserve original source assets and printed covers. Record source story, exact prompt, versioned local asset and visual review in data/archive-art.json. Use the same preview on its edition contents page.

After the existing generators, run scripts/refine-library.py; run scripts/prepare-ebook-text.py before scripts/build-ebook-readers.py. Keep public access when republishing this Site.

After refining the library, run scripts/apply-archive-art.py to restore reviewed archive artwork. Read all .subject paragraphs in the immutable source HTML; data/source-articles.json may contain only the opening paragraph of a poem.

## Delivery and performance
After all content generators, run `scripts/optimize-public-delivery.py` (Pillow, BeautifulSoup and fonttools with WOFF2 support), then the architecture verifier. Keep full Odia font coverage and shaping; compress to WOFF2 without subsetting. Retain original scans and art, provide responsive content-hashed illustration derivatives, reserve image dimensions, prioritize the opening illustration and defer later images. Keep public reading pages static with usable native links. Cache only immutable asset URLs long-term; revalidate editorial pages. Preserve keyboard focus and test phone/desktop layouts and book navigation. Record byte savings separately from measured loading times; do not claim production Core Web Vitals from local checks.
