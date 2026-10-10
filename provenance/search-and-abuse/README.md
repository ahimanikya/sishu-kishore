# Public discovery and abuse controls

## Search / AI retrieval
- Public, original article HTML remains the canonical source. No login or bot challenge on reading.
- robots.txt allows crawlers and advertises sitemap.xml; it is discovery guidance, not a security boundary.
- Sitemap includes canonical public pages and preview images. Redirects, editor screens, errors and individual scanned-book leaves are omitted; book landing pages remain indexable.
- JSON-LD describes Website/WebPage, Article with author and issue relationships, PublicationIssue, Book and breadcrumbs. No invented publication dates, biographies or ratings.
- /llms.txt is an optional guide, not a guarantee of AI indexing. /content-index.json links canonical articles, image assets and /reading-text/*.txt equivalents of published text. No unreviewed ebook OCR is exported.
- Build regenerates these from public HTML. Private backend submissions and drafts are never read by the generator.

## Server-enforced abuse limits
- Verified account required for submissions and likes.
- Submissions: one per minute, ten per rolling one-hour window, linked atomic quota update, contact must match authenticated email.
- Like/unlike: at least two seconds between changes, sixty changes per rolling one-hour window, atomic marker/count/quota updates.
- Quotas cannot be independently rewritten or reset early. Legacy submission quota records migrate on the next valid submission.
- Public comment queries must specify a limit of at most 100. Public enumeration of like aggregates is denied; individual article counts remain readable.
- Comments remain privately moderated before publication. Existing default-deny rules and attachment protections remain.
- These limits mitigate account-based write abuse. They do not provide a network WAF or stop every scraper/account farm. Firebase App Check/reCAPTCHA enforcement is not configured; it requires a registered site/provider and a staged rollout. GitHub Pages does not expose per-IP edge rules here.

## Verification
Firebase emulator exercises valid requests, anonymous/forged requests, private-data access, atomic counters, throttling, quota expiry/reset tampering and query bounds. Discovery verification checks sitemap targets, schema JSON, canonical URLs, article text alternatives and editor noindex.

References:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots
- https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider
