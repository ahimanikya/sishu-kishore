# English and Odia children's book production

Version 0.2.0 extends the operational editorial model using [documented book lessons](book-lessons.json). It is a workflow and evidence system, not newly trained model weights. Existing books retain their text, credits, typography and access boundaries; adopting these rules does not retrospectively certify them.

## Plan before production

Identify the intended age range and reading mode: read-aloud, shared or independent. Inventory the preserved source, rights and exact creator credits. Choose prose, poetry, comic or bilingual structure before planning artwork. Keep source scans and manuscripts unchanged. Record chapters, stanzas and panels in intentional reading order, including intentional repetition.

Initialize a private book record with `node scripts/editorial/model.mjs init book <id>`. Complete `book_plan` using `newBookPlan()` in `scripts/editorial/book-production.mjs` and the examples in `tests/book-production.test.mjs`. Each section ID must match a selected `book-text` artifact; each artifact links its source and central author record. Resolve existing author identity before creating a new profile. Research missing biography with attributable sources; never invent identity or credentials.

Magazine author rotation and the one-contribution limit do not apply to books. A single author can contribute every chapter or poem. A book's reading order is deliberate, not the magazine homepage's randomized presentation.

## Text and language

Distinguish born-digital text, transcription and unchanged facsimiles. Keep unresolved readings visible in private review records. Uncertain OCR is not approved literary text. An unchanged facsimile can retain unclear source lettering with an evidenced preservation review; this does not claim new proofreading.

Each requested English (`en`) or Odia (`or`) edition records its mode: original, translation or adaptation. Translation requires translator credit; adaptation requires adapter credit and explicit authorization. Standalone translated editions do not have to publish the source language. A bilingual book needs separate language reviews and explicit language coverage in its output records.

Follow Human Natural Translation, with Poetic Natural review for verse: compare meaning, voice, imagery, rhythm, idiom, cultural context and emotional effect against the original. Read aloud for naturalness and age suitability. Do not silently simplify, rewrite or replace culturally specific language. Distinguish authorized adaptation from translation. A passing record documents a review claim; automated validation cannot judge literary quality or substitute for human editorial approval.

## Pictures and continuity

Read the full section before composing its illustration brief. Specify the story moment, required characters, actions, setting and meaningful props. Use Cartoon Natural for children's story art and relevant Odisha details without adding unrelated motifs to English or other settings. Maintain a book-level character and prop reference, emotional continuity and age-appropriate tone. Never generate an author likeness without identified source evidence.

Review pictures at full size: limb counts, joints, faces, hands, feet, paws, tails, trunks, wings, interactions and occlusion. Also check the intended character count and scene meaning. Record rejected versions and corrections; carry every approved replacement into all requested outputs. Covers derive from the complete book's themes and must not misrepresent one isolated scene as the entire book.

## Typography and outputs

Keep readable text outside raster illustrations where possible. Check Odia shaping, conjuncts, line breaks and punctuation as well as English spacing and punctuation. Live website text uses locally hosted Baloo Bhaina 2. Preserve approved historical PDF typography unless a redesign is authorized. Test readable size, contrast, full-height artwork, restrained cover perspective and text placement that preserves the picture.

Every requested format needs its own QA record. Web: responsive reading, navigation, keyboard use and accessible text. PDF: render and inspect pages, reading order, embedded fonts, clipping and selectable text. EPUB: package validation, reading order and representative reader checks. Print: trim, margins, resolution and proof pages. Only request formats intended for delivery; evidence for one does not approve another.

## Review, authorization and learning

Keep manuscripts and real production records in ignored `editorial-private/`. Unlisted links are public by direct link, not authenticated privacy. Keep unlisted digital outputs out of discovery and indexing; protected reviews retain their authentication boundary.

Run `model.mjs check <record>`, then `--release` only against the exact intended candidate with fresh authorization. Source changes invalidate dependent artifacts and their review. Record candidate-specific separate-agent review and actual human decisions. Migration from 0.1.0 creates a new private record, retains evidence, adds pending workflow stages and clears prior release authorization.

After correction, save a bounded lesson with source references, failure, correction, affected outputs and remaining uncertainty. The existing lesson library records prior production evidence, not a fresh audit. Build future English/Odia evaluation pairs only from authorized material and human-reviewed source/target passages; no bilingual quality benchmark has yet been established by these records.
