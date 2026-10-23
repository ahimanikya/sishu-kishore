# Kete Jami Loda — comic edition

Source: the 25 original scans in `public/shishu/books/ketejami_loda/`. Scan 2 credits Leo Tolstoy, Odia transcreation by Dash Benhur, illustrations by Tapan and layout by Gyana. Printed page numbers are scan number minus one. No edition date or publisher was invented.

The user clarified that this is a comic, not an illustrated prose collection. All 107 captions on scans 4–25 were compared with the scans and retained in panel order. The preface on scan 3 is included. Writer proofreading is pending; the public reader and PDF say so. Review edits are stored locally and exported for a later editorial update.

`reviewed-pages.json` is the source-compared working transcription; `ocr-source.json` retains the raw extraction. `comic-scenes.json` pairs each caption with its illustration brief. `comic-prompts.json` and the three repair-prompt files retain generation instructions. Art was generated with the image-generation tool; `generated-comics.json` records original output paths. Original PNGs and revised versions remain under `comic-originals/`. The earlier prose illustration experiment is retained privately under `art-originals/`; none of its story images are used in the comic. Its cover is used only for the bookshelf/social preview.

Pages 7, 8, 12, 13, 19, 21, 24 and 25 use v2 repairs for character identity, scene continuity or the chief’s hat after it becomes the boundary marker. Grids are measured before display; SVG and PDF clip each panel from the unchanged sheet. Layout-only JPEG exports are used online. No dialogue was rasterized into the art.

## Build

Use Python with Pillow, fpdf2, fontTools, uharfbuzz and pypdf installed:

1. `python scripts/books/prepare-kete-text.py` (only when updating transcription)
2. `python scripts/books/measure-kete-panels.py`
3. `python scripts/books/build-kete-book.py`
4. `python scripts/books/build-kete-pdf.py`
5. Refresh social metadata for the new reader and review pages; preserve original scan-page HTML and existing social manifest entries.
6. `npm run build` and `npm test`

Baloo Bhaina 2 is embedded with HarfBuzz Odia shaping. The PDF provides logical ActualText for every caption. `pdf-build-report.json` verifies all 107 captions, 25 pages, and panel bounds. All 25 rendered PDF pages were visually inspected, including dense dialogue and the ending. Reader panel count, controls, page navigation and local art links were checked. Original scans and credits are unchanged.
