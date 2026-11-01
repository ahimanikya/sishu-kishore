# Components and variants

Use existing production components and their markup contracts. This inventory is a reference for future edits, not permission to rewrite literary pages.

| Pattern | Existing implementation | Contract and states |
| --- | --- | --- |
| Header and navigation | `.ia-header`, shared navigation builder | Full single-line logo without cropping; wrapping navigation; visible current page with `aria-current`; keyboard focus. No Studio link |
| Article card | `.ia-article-card`, `.ia-card-title`, byline and read link | Image, complete title, linked author, reading action in consistent order. Keep a visible gap around byline; long Odia titles wrap. Do not nest interactive links |
| Author identity | Writer pages and shared bylines | One canonical profile per verified person. Preserve original literary bylines; never invent a portrait. Student artist credits are not replaced by AI credits |
| Primary action | `.ia-button`, `.mag-read-button` | Verb-led label, readable ink on sunshine, sufficient target, hover, keyboard focus and actual disabled semantics |
| Secondary action | Ordinary underlined links or existing neutral controls | Distinguishable from primary action and body text; adequate spacing between adjacent targets |
| Form | Existing writing form / Studio controls | Persistent label, help before errors, visible required state, associated error text and keyboard access. Specimen forms never submit manuscripts |
| Status | Existing Studio state and validation messages | Distinct success, pending, error and disabled states using words as well as colour. Do not announce a draft as published |
| Magazine cover | Shared issue layout and per-cover palette | Full-height reviewed artwork, restrained tilt, flat mobile treatment. Readable lettering with fine outline and softening limited to actual text; no cover-wide mask |
| Reading tools | Article and book reader controls | Previous/next, reading size, settings and clear exit. Preserve plain-paper/night modes; no forced sound or autoplay |
| Section and prose | `.ia-prose`, shared headings | Comfortable reading width, consistent vertical rhythm, heading hierarchy and original line breaks. No decorative border around every paragraph |
| Birthday list | Existing automatic birthday builder | Canonical author links and verified dates; issue month controls inclusion. No invented dates |
| Informational page | `/our-brand/`, `.colour-story` | One home for brand/process/credits. Keep public explanation in Odia; concise sections with unique purposes |

## State review

For interactive components inspect default, hover where relevant, focus-visible, selected/current, disabled, loading, success and error. Only include states the component actually supports. Use native elements and semantics; visual dimming alone does not disable an action. Focus must remain visible on both light and dark surfaces.

## Density and layout

Magazine discovery may use compact cards; book reading must retain comfortable text spacing. Studio may use denser grouping, with labels and targets still readable. Use shared spacing values within each variant rather than one universal padding override. Preserve existing responsive breakpoints until an explicit layout change is reviewed.

## Illustration and source fidelity

The design system governs placement and review, not literary meaning. Before approving art, compare it to the source: characters, action, mood, age, setting and culturally relevant Odisha details. Count limbs and joints; check hands, feet, trunks, tails and occlusion. An unseen limb can be natural, but ambiguous anatomy warrants correction. Never replace original children's drawings or archival scans with generated art. Follow the editorial model for image revision, provenance and source dependencies.

## Narrative ownership

`/our-brand/` owns brand, editorial process and central disclosure; `/whoweare.html` preserves academy history and roster; `/editorial.html` preserves editorial writing. Do not copy their full narratives into every issue. A short contextual link is enough. Infographic captions summarize colour meaning; supporting prose should add practical information rather than repeat it verbatim. Historical literature requires an editorial decision before deletion.
