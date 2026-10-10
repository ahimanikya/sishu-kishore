# Sishu Kishore children's identity

The magazine's own cheerful identity, using its existing cartoon artwork and Odia writing.

## Colour roles
- Deep story ink: #173F5F — all long reading text and high-contrast outlines.
- Sky blue: #1767A1 — headings, selected navigation and links.
- Sunshine: #FFD45B — primary reading actions, with deep ink lettering.
- Coral spark: #F18F7B — small decorative accents; never body text.
- Coral ink: #A63732 — active like state on pale peach.
- Leaf green: #26705B — small labels and bylines.
- Light papers: #FFF8DF, #E5F3FC, #FFF0E9, #E6F5EB — quiet supporting surfaces; never separate section gradients.

## Typography
Use locally hosted Noto Sans Oriya for Odia, DM Sans fallback for Latin. Baloo Bhaina 2 SemiBold (600) for titles and section headings; Noto Sans Oriya 600 navigation; 400 story text. No artificial spacing between Odia letters. Main headings 30–48px, article headings 26–36px, card headings 21–23px, body text retains adjustable reading size and generous 1.95 line-height. Preserve original paragraph and poem breaks.

## Shapes and restraint
Rounded 14–20px controls and cards, 44px minimum controls, simple flat colours and shallow printed shadows. Use three-colour section markers and existing corner kite/leaf drawings. No animation or new imagery needed. Do not recolour printed covers. Keep night-mode contrast and the plain-paper choice. A colour is never the only signal for an action or current state.

Implementation: public/children-identity.css. Existing story-wash palettes remain tied to each article. Public prose is unchanged.

Baloo Bhaina 2 SemiBold is locally hosted as WOFF2 subsets, with its SIL Open Font License in public/fonts/baloo-bhaina-2-OFL.txt. Source: Google Fonts / Ek Type. Story text and navigation retain Noto Sans Oriya.

The web-page colour wash now spans the full document, with transparent header, issue introduction, editorial section and footer. Article text uses the shared canvas; plain-paper and night controls still disable the wash. Cards retain their quiet solid surfaces and the fullscreen reader retains its printed paper treatment.

## Identity: sunshine and stories
Sishu Kishore is a warm, curious Odia children's magazine. Its signature is blue rounded Odia headings, sunshine reading controls, a small coral spark and the existing kite drawing. The original masthead stays recognisable. This identity belongs to Sishu Kishore; it does not reproduce another magazine's branding.

### Colour hierarchy
- Keep most of the page pale cream, with one continuous soft wash through the document.
- Blue identifies headings, links and keyboard focus; yellow identifies the main read action, browse arrows and the current navigation item.
- Coral appears only in small accents, card edges and selected reactions. Green is supplementary, not a competing brand colour.
- Story cards stay near-white. Never place long text on saturated yellow, coral or an illustration.
- Contrast pairings: navy on yellow, blue on cream, navy on cream, dark coral on pale peach. Never use white text on yellow or pastel coral.

### Components and states
- One primary reading action per introduction; other links remain visually secondary.
- Navigation uses quiet unselected links and a yellow selected item with a blue outline and aria-current.
- Browse arrows use 48px circles; other controls have at least 44px targets. Disabled arrows are subdued and remain disabled semantically.
- Cards use consistent rounded corners and blue/yellow/coral top edges. Their title, author and read link remain in the same order.
- Keyboard focus uses a 3px blue outline with 4px offset. Current state is indicated through a border and semantics as well as colour.
- Section signatures use a short sunshine stroke and coral dot. The existing kite marks the issue introduction; avoid adding decoration beside every paragraph.

### Reading and artwork
Baloo Bhaina 2 600 is display-only. Noto Sans Oriya remains the reading and control font. Keep generous line spacing, original poems and paragraphs, and adjustable reader type. The fullscreen reader retains quiet paper, continuous Odia folios, night mode and the plain-paper option. Use culturally grounded outlined 2D cartoons, expressive gestures and flat colours. Printed covers and editorial content remain untouched.

### Maintenance
`public/children-identity.css` is the shared identity layer; all magazine pages load the same version. Add future colour and component rules there, using its semantic tokens. Keep this guide with the repository so future issues follow the same system. Check desktop and 390px phone layouts, focus states, reading contrast and the site build before publishing.

## Little-reader UX
Primary navigation has four labelled outline icons. Submission links remain in the footer. The homepage and issue introductions offer a clear start action; saved magazine progress on this device changes it to a continue action. The homepage can return to the last magazine read. No sign-in is required for reading. Reader arrows carry visible Odia Previous/Next labels; sound joins the collapsed reading settings. Controls use 48px targets where practical and spaced navigation. Existing article next/previous links are prominent; social actions remain after the story. No editorial prose, story titles or printed covers were changed.

## Readiness and deferred work — 10 October 2026
Completed: static image/accessibility checks, ebook source-order and transcription gate, side-by-side proofreading queue, nonvisual ebook headings, Odia reading controls and folios, ebook night-mode background repair, and optional App Check client integration (disabled until registration). See `provenance/readiness-audit.json` for scope and the outstanding list.

- [ ] Human: compare and approve 128 ebook pages in `provenance/ebook-review/index.html`. Three pages have existing source-compared text; all other pages still show their original scans. No new transcription is claimed as approved.
- [ ] Human: test story discovery, reading and exit with children and a parent/teacher.
- [ ] Owner: register the Firebase App Check provider, accept its Google Cloud terms and supply the production reCAPTCHA Enterprise site key. No terms were accepted by the agent.
- [ ] Technical follow-up after registration: set `appCheckConfig`, deploy, inspect valid-request metrics, test authenticated actions, then enable enforcement. App Check is NOT active today.
- [ ] Owner: verify or grant access to the Search Console URL-prefix property. The signed-in account currently has no access. Submit `/sitemap.xml` after access is available. Public robots/sitemap/structured data already work.
- [ ] Human/field: real screen-reader testing and slower physical phones; Core Web Vitals need real traffic and are not established by static checks.
