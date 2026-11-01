# Agent working arrangements

Adopted 1 November 2026 following the user’s request to use Project Odisha’s agent working process. This replaces the earlier optional role-pass arrangement for substantive authorized production work. The domain model remains the editorial standard; these arrangements define how actual workers execute it.

## Authority and execution

Ahimanikya Satapathy is Creative Editor. Human editors remain peers. All four AI agents report directly to him. Disha coordinates tasks and integrates results; this creates no managerial reporting line over other agents. Actual publication instructions, privacy boundaries and editorial decisions remain authoritative.

The root assistant acts as Disha. For substantive research and production tasks, spawn or reuse separate task-scoped Anvesha and Samanta workers where their scopes are needed. After integrating a candidate, assign Drishti as a separate reviewer, distinct from its implementer. For a trivial correction that needs no parallel workers, use a clearly labelled self-review and record that choice. If separate agents are unavailable, report that limitation and do not claim independent review.

These are on-demand executions, not continuously running staff. No recurring schedule, new credential, spending or permission is created. Resume only authorized work; a new user stop instruction stops the affected work and leaves a handoff.

## One bounded work unit

Keep one active unit under this coordinator: an article, author profile, book section, translation section, illustration batch, edition assembly or bounded maintenance task. Independent subtasks within that unit may run in parallel. A whole issue can contain many sequential article units followed by edition assembly. A book can contain chapter units followed by book assembly. A completed component is not evidence that the whole edition/book passed review.

Before starting, inspect Git changes, current assignments, the active handoff and actual worker status. Preserve other contributors’ reservations; a timestamp alone does not mean work is abandoned. The handoff is a coordination record, not an atomic cross-worktree lock. If another chat owns a scope, reconcile explicitly before writing there.

## Assignment and handoff loop

1. **Disha records scope.** Save the actual user direction, input revision, work-unit ID/type, dependencies and next action. Reserve exact non-overlapping file paths before workers edit. Disha alone writes shared records and performs Git integration or publication within the user’s scope.
2. **Anvesha establishes evidence.** Inspect existing sources first, then research missing author identity, meanings or cultural details. Read-only by default; reserve specific evidence files if writing is useful. Literary/visual drafting requires an explicit brief and the applicable skill, regardless of the worker’s name.
3. **Samanta produces the candidate.** Work only in reserved files; preserve original literature, images and access boundaries. Return actual changed paths and focused checks. Do not edit shared coordination records or publish.
4. **Workers return a structured result.** Include input revision, runtime identity, changed files or findings, checks, unresolved issues, limitations and next action. Mark reservations released when finished. Disha records observed results; do not infer completion from silence.
5. **Disha integrates.** Resolve conflicting findings, run the required tests/build and identify the candidate by commit or a SHA-256 manifest of exact files. Connect the task to the editorial model’s artifact IDs, revisions and candidate fingerprint when available.
6. **Drishti reviews that candidate.** Review read-only, independently of implementation. Account for source/author identity, literary fidelity, translation voice, images/anatomy, Odisha details, typography, links and visibility according to scope. Record pass, pass with limitations, fail or not tested, with concrete evidence. Separate AI review is not human language, cultural or editorial approval.
7. **Resolve and recheck.** Retain findings and their dispositions. If code/content changes after review, return the affected candidate to Drishti; do not carry approval forward merely because a filename is unchanged. Mechanical post-review receipts may be recorded separately from the reviewed implementation.
8. **Deliver under actual authorization.** For public releases, check the exact reviewed revision, existing publication jobs and access mode, then record deployment and live verification. For internal model/process work, record local checks and why publication is not required. Only then complete the unit and release ownership.

## Records and privacy

`assignments.json` defines role supervision and execution mode. `operations.json` points to the active handoff; after delivery it clears that pointer and retains `latest_handoff`. Safe process-adoption evidence may live in `kb/team/handoffs/`. Manuscript-bearing production handoffs belong in ignored `editorial-private/editorial-model/`, alongside the domain model’s private work record. Never copy private source text or identity research into public Git for the sake of a dashboard.

For a trivial correction or unavailable separate workers, record `review.kind: self_review`, Disha’s actual coordinator runtime, `exception_reason: trivial_change` or `separate_agents_unavailable`, and a concrete `limitation`. Preserve candidate fingerprints and actual review evidence. This is an explicit exception, never a separate-review claim. All assigned workers must still finish and release their files before readiness.

Handoffs record `status`, `workers`, `coordinator_files`, `review`, `delivery` and `next_action`. Workers record `role`, `runtime`, `status`, `mode`, `reserved_files`, `reservations_released` and `result`. Retain released file lists as history; they are no longer active reservations. The reviewer records exact candidate evidence and unresolved findings. On restart, load the saved record, inspect actual files and reconcile worker existence; recreate missing workers without claiming their old runtime is alive.

Run `node scripts/editorial/team.mjs` to check the active or latest handoff, or pass its workspace-relative path explicitly. The checker validates record consistency and active candidate fingerprints, not the authenticity of human approval, literary quality or operating-system access controls. Use `model.mjs check ... --release` as well for an edition/book release record. Neither tool publishes or grants authority.

## Evidence for this adoption

Project Odisha’s local source at commit `4ba1104626120d74f36c911995754e0361ea01bd` supplies the operating pattern: `kb/team/operations.json`, `kb/records/team-activation-2026-10-19.json` and `kb/records/odia-dhaga-unified-art-2026-10-26.json`. The saved records contain separate-worker returns, revision-specific review, findings, limitations and delivery receipts. They do not establish current live workers. Its research quotas, programmes, Founder title, character collection and prior approvals are not adopted here.
