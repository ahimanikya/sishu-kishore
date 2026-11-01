# Editor Studio adoption

Sishu adapts Kabita Live's publication-workspace pattern at `/editorial/studio.html`: separate magazine and book working copies, ordered contents, author identities, illustration preparation, cover/editorial work, whole-text proof, readiness checks and revision history. The existing submission/publication desk remains at `/editorial/manage.html`; existing submissions and books are not automatically migrated or republished.

The Studio interface is in English, as requested on 1 November 2026. Original English/Odia literary text keeps its language and line breaks. Public author names and canonical profile paths come from `studio-catalog.json`, generated from public profile pages. Previous monthly author snapshots use the same canonical-identity extractor as the author-selection checker, and only dated published editions are included. Unlisted reviews and private sources are not indexed. Missing preceding issues need explicit evidence; publication must recheck actual preceding contents.

## Workflow and scope

1. Open a new magazine or book workspace, or an existing private shared draft.
2. Define the month or book audience/languages/formats. Keep magazine rotation separate from book authorship.
3. Add complete contributions and source references, select canonical author profiles, preserve original wording and credits. Unknown profiles still require the established identity-research workflow.
4. Arrange contents, prepare illustration briefs, and link reviewed existing artwork. Source comparison, permissions, language, anatomy and story continuity are explicit preparation checks.
5. Prepare cover and editorial from the full contents. Use whole-text proof to read the sequence; this is not a print-layout preview.
6. Save shared revisions and resolve conflicts. Request review only after preparation checks pass. Any editing returns the working copy to draft and invalidates affected checks.
7. Export the private working copy for the normal domain-model review and publication process. Studio review state neither grants publication permission nor validates the complete v0.2.0 release record. The original `model.mjs --release` checks and actual human approval remain necessary.

Book language and output checkboxes are preparation declarations, not automatically measured quality. Keep the detailed source-fidelity, translator/adaptor credits, per-language/per-output evidence and publication authorization in the domain-model record. Illustration generation, translation generation, author research and final PDF/EPUB production remain explicit editorial tasks outside this interface. No paid AI service or upload facility is enabled.

## Private persistence

Studio reuses Sishu's verified editor custom claim and session-only Google sign-in, with its own Firebase configuration. No Kabita accounts, email allowlists, buckets or manuscripts are copied. `editorStudios/{id}` stores a private current envelope and serialized working copy. Each transactional save writes the identical immutable snapshot at `history/{revision}` and requires the expected current revision. History cannot be deleted or overwritten; recovery starts a new revision. The schema supports draft/review states only and is separate from the public `publications` feed.

The browser does not persist manuscripts to localStorage. Unsaved-change prompts protect navigation; an explicit JSON download provides a private backup. Backups contain unpublished text and must be stored accordingly. Import validates the whole backup before opening it under a new identity. Conflict errors retain the current editor's working copy for export; they do not overwrite the server's newer revision. Lists show the latest 200 workspaces and history shows the latest 20 revisions; older history remains preserved in the backend.

Rules enforce editor identity, envelope size/type, revision sequence and paired immutable snapshots. Payload field semantics and readiness are application checks, not a server-side literary certification. Server credentials and account enrollment remain administrative and unchanged.

## Delivery and activation

Build the browser bundle with `npm run build` in `backend/`, then run the site checks and build. Run backend security tests with Java 21+ and the Firebase emulators. Activation requires deploying the reviewed Firestore rules to the **sishu-kishore** project and delivering the matching site bundle. Until then the current live rules correctly deny the new collection. Do not copy another project's deployment configuration or treat a local Studio screenshot as a live editor acceptance test.

This adoption prepares code and review evidence locally. No live rules deployment, account changes or publication is performed by this implementation task. The existing publisher does not consume Studio drafts; this deliberately preserves review and publication boundaries.

## Source pattern

Reviewed local Kabita source: `output/kabitalive-design-proposal-2026-09-29/site/data/editor-workspace.html.template`, `assets/editor-workspace-model.mjs`, `assets/editor-workspace.mjs`, `assets/editor-preparation.mjs`, `assets/editor-recovery.mjs`, and `src/editor-workspace-service.mjs`. Adopted principles include contents-first work, separate publication identities, explicit preparation, review reset after edits, transactional revisions and preserved conflicts. Kabita's issue numbers, anthology defaults, language requirements and permissions were not adopted.

## Author birthdays and writing intake

Author catalog entries have a `birthday` attribute, either null or a sourced day/month with optional year and an acknowledgement approval flag. The Studio’s English “Authors and birthdays” form saves private revisioned records in `editorAuthors`; conflict protection and immutable history match publication drafts. Only verified adult-author dates are eligible. Unknown years stay blank. The automatic list uses the chosen edition month, includes approved writers independently of literary contributions, and never changes an old issue according to today’s calendar. Books have no monthly birthday list.

The versioned public source is `data/author-birthdays.json`. `scripts/build-author-birthdays.py` renders author attributes, dated editions, current issue/home and the directory. Existing legacy issues remain preserved. The directory alone filters by the current India calendar month. Sources from older captures are recorded in `provenance/author-birthdays/older-issue-audit-2026-11-01.json`; unresolved identities remain excluded.

To carry reviewed Studio changes into a release, use “Download author records”, save that private JSON under `editorial-private/`, then preview with `node scripts/editorial/import-author-birthdays.mjs editorial-private/author-records.json`. After reviewing the proposed changes, rerun with `--apply`, build and follow normal release approval. Null or an unapproved record clears the public attribute without copying private unapproved dates or deleting their private history; no import publishes automatically. Workspace backups contain a saved birthday snapshot for the edition, not unsaved author-form fields.

`/write.html` now embeds the existing private writing intake; `/editorial/submit.html` remains supported. Public labels are Odia, original writing stays unchanged, preview is text-only, and submitting never publishes. Verified sign-in, consent and server quotas remain required. Uploads remain disabled.

## Direct editor access

Editor Studio is an app for editors, reached directly at `/editorial/studio.html`. Do not add Studio or the publishing desk to public magazine navigation, footers or contributor forms. Studio navigation connects editorial tools; keep public identity/process links out of its app footer. Public writing submission remains available at `/write.html`. Existing editor authentication and private data rules remain required.
