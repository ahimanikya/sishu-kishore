# Google-protected proofreading

Three book review snapshots were moved out of the static public directory on 2026-10-24. Their public URLs now serve only a Google sign-in shell. The footer has the sole review link on each book's public reading pages. The public reader remains freely accessible.

Administrative source snapshots and original extraction files are stored under the ignored local `editorial-private/book-review/` directory and in the protected `bookReviews` Firestore collection. They are excluded from Git and static deployment. Never add reviewer identities or corrections to the public repository.

Security rules allow individual review reads only with verified Google authentication, deny collection listing and deny client writes. All 41 backend tests passed, including anonymous/non-Google/unverified denial and verified Google read-only access. Corrections stay in per-account local browser storage and export as JSON. Old browser corrections can be explicitly imported after sign-in; they are not deleted.

The shared book normalization runs when authoring book pages; CI verifies its committed output before publication. It keeps the same brand, back button, reading/download controls and font across the book landing pages, original-page readers and HTML readers; sharing and duplicate top Books labels are removed. Public original-book entry links and proofreading notices are removed. The remaining footer review link opens sign-in. Original scans, published text and PDF contents are preserved.
