# Children’s Magazine and Book Editorial Model

Version 0.1.0 · 1 November 2026

This is the working domain model for preparing children’s magazines and books under Ahimanikya Satapathy’s direction as Creative Editor. It combines editorial knowledge, reusable production workflows, private work records and dependency checks. It is not a newly trained language or image model. The model does not start agents, generate content or publish automatically.

## Start a task

Read this guide, [workflows](workflows.md), [quality and learning](quality-and-learning.md), and the project’s current instructions. The machine-readable definitions are in [model.json](model.json). Use [templates.json](templates.json) for structured briefs, author research and corrections.

From the active `site/` repository:

```sh
node scripts/editorial/model.mjs init magazine next-edition
node scripts/editorial/model.mjs init book next-book
node scripts/editorial/model.mjs check editorial-private/editorial-model/next-edition.json
node scripts/editorial/model.mjs check editorial-private/editorial-model/next-edition.json --release
```

Initialization creates a private, empty planning record and never overwrites a record. Replace the example names with the task’s identifier. Real manuscripts, research notes and work records remain under ignored `editorial-private/`; templates and rules are versioned in Git. There is no network or model-provider dependency in this tool.

## Record the work

Each artifact has an ID, kind, revision, private workspace-relative file and SHA-256, dependencies pinned to their revisions, and actual reviews. Record a source, author profile, article, illustration, translation, cover, editorial, contents or layout as separate artifacts. A rendered article depends on its author and source; an illustration depends on its approved article; each translation depends directly on its approved original. Cover and editorial depend on contents and the contributions that informed them. Book layout depends on all selected chapters and illustrations.

Use `node scripts/editorial/model.mjs hash <file>` to compute a fingerprint. After an edit, update its revision and fingerprint, then review affected dependents. Never update a dependency revision just to silence a stale warning: compare and revise the dependent first.

Ordinary `check` reports incomplete drafts as warnings and rejects broken records or stale dependencies. `--release` additionally requires every artifact selected in `required_artifacts` to be ready, current, free of open findings and covered by a recorded passing review. Its dependencies are checked recursively. Run `node scripts/editorial/model.mjs candidate-hash <record.json>` on the reviewed record and store the result as `authorization.candidate_sha256` with the actual human instruction. This does not create approval. Any change to the candidate invalidates this recorded fingerprint. The check also requires human authorization matching the exact release candidate and visibility/destination. Use the relevant human review requirements in workflows.md; this structural check cannot determine literary quality or authenticate an approval quote.

The tool does not control the existing publisher. Run it as a preparation check alongside the site’s required tests/build; retain the existing private submission and publication process. A passing check cannot grant permission, certify research, or mark a page as published.

## Organization

Human editors are peers. All AI agents report directly to Ahimanikya Satapathy, Creative Editor. Disha coordinates scope and handoffs; Anvesha researches identity, source meaning and cultural context; Samanta prepares design and technical delivery; Drishti reviews the candidate. Assign translation and visual drafting tasks explicitly to a capable worker and record the actual executor. A persona name is not evidence that a separate worker ran. Human language review is distinct from AI review.

For execution, follow [agent working arrangements](../team/working-arrangements.md): Disha reserves work, separate Anvesha/Samanta workers return results, and Drishti reviews the integrated candidate. Link production handoffs to this model’s artifact IDs and candidate fingerprint.

## Shared knowledge and publication profiles

Keep portable literary, translation and visual principles in this model. Keep Sishu-specific navigation, fonts, artwork treatment, authority and release boundaries in the `sishu-kishore` profile and project instructions. Other publications need an explicit profile; do not copy their manuscripts, permissions or editorial authority into this project.

Load the installed Human Natural Translation skill for translations, Human Natural Image for poetic imagery, Sishu Cartoon Natural for this magazine, and Modern Web Guidance before frontend changes. Follow current project rules when an older skill conflicts: all current articles appear on the randomized homepage; routes are root-level; disclosure stays on `/credits/`; covers follow current full-height and localized-softening rules.

## First evaluation cycle

Use [evaluation-cases.json](evaluation-cases.json) as review scenarios, not claimed passed tests. Select a small authorized sample spanning a poem, story, informational article, uncertain author identity and scanned book page. Record the baseline, human corrections and accepted result. Hold back different works for evaluation; avoid placing drafts or translations of the same work on both sides. Assess meaning, voice, culture, anatomy, completeness, revisions and editorial effort separately.

The initial implementation changes no magazine content, author profile, translation, image or publishing access. No model training or paid service is started.
