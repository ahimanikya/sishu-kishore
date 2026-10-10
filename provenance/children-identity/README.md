# Sishu Kishore children's identity

The magazine's own cheerful identity, using its existing cartoon artwork and Odia writing.

## Colour roles
- Deep story ink: #173F5F — all long reading text and high-contrast outlines.
- Sky blue: #1767A1 — headings, selected navigation and links.
- Sunshine: #FFD45B — primary reading actions, with deep ink lettering.
- Watermelon: #B8433F — occasional secondary headings, never long text.
- Leaf green: #26705B — small labels and bylines.
- Light papers: #FFF8DF, #E5F3FC, #FFF0E9, #E6F5EB — sections, cards and navigation.

## Typography
Use locally hosted Noto Sans Oriya for Odia, DM Sans fallback for Latin. Baloo Bhaina 2 SemiBold (600) for titles and section headings; Noto Sans Oriya 600 navigation; 400 story text. No artificial spacing between Odia letters. Main headings 30–48px, article headings 26–36px, card headings 21–23px, body text retains adjustable reading size and generous 1.95 line-height. Preserve original paragraph and poem breaks.

## Shapes and restraint
Rounded 14–20px controls and cards, 44px minimum controls, simple flat colours and shallow printed shadows. Use three-colour section markers and existing corner kite/leaf drawings. No animation or new imagery needed. Do not recolour printed covers. Keep night-mode contrast and the plain-paper choice. A colour is never the only signal for an action or current state.

Implementation: public/children-identity.css. Existing story-wash palettes remain tied to each article. Public prose is unchanged.

Baloo Bhaina 2 SemiBold is locally hosted as WOFF2 subsets, with its SIL Open Font License in public/fonts/baloo-bhaina-2-OFL.txt. Source: Google Fonts / Ek Type. Story text and navigation retain Noto Sans Oriya.

The web-page colour wash now spans the full document, with transparent header, issue introduction, editorial section and footer. Article text uses the shared canvas; plain-paper and night controls still disable the wash. Cards retain their quiet solid surfaces and the fullscreen reader retains its printed paper treatment.
