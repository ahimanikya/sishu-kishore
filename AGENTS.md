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
