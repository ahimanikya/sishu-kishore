# Sishu Design System

Version 1.0 · 2 November 2026 · implementation and local review, not publication approval.

This is the working design reference for Sishu Kishore. It formalizes the existing sunshine, sky, leaf and paper identity; it does not select a new book-reader theme or change literary content. Public readers see the Odia brand story at `/our-brand/`. Technical specifications and specimens stay outside public delivery.

## Sources of truth

| Concern | Maintained source |
| --- | --- |
| Shared colours, spacing, typography, shapes and control dimensions | `public/children-identity.css`, the `--kid-*` custom properties |
| Magazine structure and articles | `public/ia.css`, `public/shishu-magazine.css`, `public/article-tools.css` with the shared identity layer |
| Edition covers and contents | `public/issue-layout.css`, `scripts/build-issue-layout.py`, `scripts/cover-palettes.json` |
| Book readers | Existing book-specific styles plus `public/book-reader.css` and `public/book-ui.css` |
| English editor application | `public/editorial/studio.css` |
| Component contract | [Components and variants](components.md) |
| Release review | [Visual review checklist](review-checklist.md) |
| Rebuildable private reference | `node scripts/design-system-preview.mjs` |

The CSS values are authoritative; do not maintain a second independent token table in JavaScript or JSON. The private reference must load production styles and show actual components where supported. Label proposed or illustrative specimens clearly. No new framework is required.

## Foundations

- Keep `--kid-*` names. Base palette values feed semantic roles and component values. Add a token only when its meaning is reusable; do not convert every unique illustration measurement into a token.
- Use the shared spacing scale for new layouts and touched components. Migrate legacy layouts in bounded, visually checked steps. Version 1 is not a claim that every historical inline style has been replaced.
- Baloo Bhaina 2 remains locally hosted. Body text uses regular 400; shared heading and navigation treatment is semibold 600, with stronger control/emphasis weights where already used. The final shared heading override takes precedence over earlier 700 declarations; review the computed result, not just the first matching rule. Preserve the 400–800 variable font and original lettering within scans.
- Preserve Odia shaping: no artificial letter spacing, no clipped ascenders/descenders, generous line height, original poem and paragraph breaks. Reading text remains adjustable in readers.
- Deep ink is for text, blue for headings and links, sunshine for primary actions, green for supporting labels, coral for restrained accents. Do not use white on yellow or pastel coral. A colour or icon alone must not communicate state.
- Quiet cream surfaces support reading. A story's illustration and cover palette may differ from UI colours. Do not force every image into the brand palette.
- Prefer logical spacing properties for directional layout. Keep existing cascade behavior; do not introduce a global reset or layer existing legacy rules without checking their priority.

## Three related experiences

| Experience | Language and visual behavior | Boundaries |
| --- | --- | --- |
| Magazine | Odia, warm illustrated discovery, compact homepage cards, larger edition contents | Homepage shuffles all current contributions; edition order stays fixed |
| Books | Original Odia or English literary language; quiet adjustable reading surface, playful optional framing | Preserve section order, scans, credits and proof controls. Garden/Theatre/Notebook are review concepts, not approved production themes |
| Studio | English controls, task-oriented forms and clear status | Direct editor app; no public navigation entry and no change to editor access rules |

All variants share recognizable identity and accessible controls. Do not apply a magazine decorative treatment to every Studio form or force the same page composition on poetry and prose.

## Using the reference

Run `node scripts/design-system-preview.mjs` from `site/`. The generated `editorial-private/design-system/` is ignored by Git and excluded from the publishing package. Follow the generator's preview instructions; bind local preview servers to `127.0.0.1`. Never place the private reference under `public/` or link it from the magazine.

For a new component: choose the closest existing pattern, use the shared values, add a specimen and its states, then review against the checklist. Record intentional exceptions with a reason and affected pages. Avoid copying a whole stylesheet into a new book.

## Ownership and change control

Ahimanikya Satapathy is Creative Editor. Human editors retain literary authority. Disha coordinates; Samanta implements; Drishti independently reviews the actual candidate. Follow `kb/team/working-arrangements.md`; the design system does not grant publication authority.

Patch changes correct implementation or documentation without changing the visual contract. Minor changes add compatible tokens or patterns. Major changes alter the shared visual contract and require representative migration review. Record actual scope and evidence in `provenance/design-system-v1.json` and the dated team handoff.

## Known boundaries

Legacy styles still contain local values and stronger overrides. Book themes have not been unified. Browser screenshots and automated checks do not establish full WCAG compliance, human Odia proofreading, child usability or real-device performance. Keep these as explicit review work rather than declaring the entire site certified.
