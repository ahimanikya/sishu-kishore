# Sishu Kishore development

Read PROJECT.txt before changing the magazine. Preserve original literary wording, source scans, publication credits, locally hosted Baloo Bhaina 2 typography, book contents, legacy bookmarks, and private proof/review controls. The character collection belongs to Project Odisha and must not be restored here, including redirects.

## Modern Web Guidance

Use Google's Modern Web Guidance skill before implementing or changing HTML, CSS, or client-side JavaScript, including layout, accessibility, browser compatibility, and performance fixes.

- Official guidance: https://developer.chrome.com/docs/modern-web-guidance
- Skill source: https://github.com/GoogleChrome/modern-web-guidance
- In the current local workspace, the installed skill is at /Users/ahimanikya/.codex/skills/modern-web-guidance/SKILL.md. On other machines, locate the installed skill by name; do not assume this absolute path exists.
- Read the skill instructions, search for the specific UI or browser capability, and retrieve the relevant guides before implementation. Check the resulting changes against those guides and identify the guidance applied in the delivery note.
- Prefer Baseline Widely available features. For newer features, follow the guide's compatibility and fallback recommendations so reading and navigation remain usable in unsupported browsers.
- Apply guidance within the requested scope. Preserve the magazine's editorial direction and access boundaries; do not add dependencies or change literary content merely to adopt a suggested pattern.
- If the skill cannot be used, report that limitation and consult the official documentation. Do not claim a guidance audit was completed.

This adoption is a development workflow, not evidence of a completed accessibility, browser compatibility, or Core Web Vitals audit. Record any later audit's scope, measurements, and limitations separately.

Use Node 24. For implementation changes, run the relevant checks and the project's required `npm test` and `npm run build` checks. Documentation-only changes do not require rebuilding the website. Publishing must follow the actual user request; adoption of this guidance alone does not authorize deployment.

Routing: publish directly at the site root. Never recreate public/shishu, public/sishu or corresponding deployment directories. Known legacy bookmarks use the root 404 handler; unlisted paths are hashed in its lookup so the compatibility file does not expose a directory of review URLs. Preserve historical archives outside public delivery.

Cover direction (1 November 2026, latest user correction): Keep lettering directly on the illustration. Do not place broad light/dark washes, gradients, panels or masks behind cover text. Use a compact masthead and small date with a fine contrasting outline around the glyphs only. Preserve original artwork and characters, restrained desktop tilt, flat mobile covers and Baloo Bhaina 2. Older covers use reviewed full-height portrait adaptations; retain their original landscape sources and story illustrations. Do not restore blurred filler extensions. This supersedes earlier overlay-based cover directions.

Cover readability refinement (1 November 2026): The user permits softening immediately behind the lettering, but not across the cover width. Keep each feathered backdrop tied to the actual title/subtitle/date text width; retain transparent cover-wide text containers and the glyph outline fallback.

Cover colour refinement (1 November 2026): Select lettering colours to complement each illustration, using scripts/cover-palettes.json. Do not force white/cream type on every issue. Keep opacity/blur local to the words, preserve full-height artwork, and verify the same palette in archive, issue and reader views.

Artwork disclosure (1 November 2026): Keep the AI artwork disclosure and Ahimanikya Satapathy’s illustration-direction/digital-design credit on /credits/, linked from the magazine footer. Do not restore repeated AI-generated notices on individual pages. Preserve original author/artist credits, printed artwork, and editorial-review status.

## AI team structure

Read `kb/team/roles.md` for the Project Odisha Blueprint team structure adapted to Sishu Kishore. Disha coordinates; Samanta handles design and engineering; Anvesha handles research and archives; Drishti handles quality review. Ahimanikya Satapathy is Creative Editor, at the same organizational level as the other human editors. All AI agents report directly to him; Disha coordinates tasks without a managerial reporting line over other agents. Follow task-scoped assignments and explicit file reservations; record actual execution and distinguish self-review from separate-agent review. Preserve existing human editorial roles and publication boundaries. Adoption creates no autonomous schedule or additional access.

## Children’s editorial model

For magazine or book production, author-profile research, illustration, covers, editorials and literary translation, start with `kb/editorial-model/README.md` and follow its workflow and quality records. Version 0.1.0 is an operational domain model, not trained model weights. Keep real work records in ignored `editorial-private/editorial-model/`; use `scripts/editorial/model.mjs` to initialize and check them. Follow current user authorization and project-specific rules; the checker does not grant release permission or replace literary/human review. Preserve the homepage’s complete randomized current-article list and the edition/book’s intentional reading order.

## Separate agent operation

The user requested adoption of Project Odisha’s actual agent working process. Read `kb/team/assignments.json`, `kb/team/operations.json`, `kb/team/working-arrangements.md` and the active/latest handoff before substantive production work. The root acts as Disha; delegate needed research to Anvesha and implementation to Samanta in separate task-scoped agents with reserved file paths. After integration, obtain separate read-only Drishti review of the exact candidate. Record actual workers and limitations; use honest self-review for trivial work or when separate workers are unavailable. Keep one bounded production unit active under the coordinator, reconcile other worker ownership, and never infer a saved runtime is still running. All agents report directly to Ahimanikya Satapathy, Creative Editor. Run `node scripts/editorial/team.mjs` after changing assignment/handoff records. Publication requires the actual user scope; this operating model grants no new schedules, accounts or access.
