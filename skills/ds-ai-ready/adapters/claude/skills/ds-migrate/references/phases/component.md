# Phase: component (the one-per-PR loop)

Runs once per component in the `kit-ready` queue. Input: a component key. Output: a merged PR, the component's manifest at `parity`, tracker issue closed. Read `ds.config.json` first; steps marked *(tracker)*, *(codeConnect)*, *(figma)* or *(paper)* run only when the config enables them.

The queue is `manifests.parity/*.json` filtered to `status: kit-ready`, ordered by dependency (a composite waits for its core parts) then by usage from the legacy map. Pick the first; never batch two.

## 1. Definition of Ready

Check, in order. Any miss stops the phase and reports which.

- Kit page carries the ready marker and the manifest file says `kit-ready`. If the kit says ready and no file exists, create the file now (a component found without a row gets its row in the same turn; deferring to "the build PR" is how manifests lag the kit).
- Every part the component composes is `parity`.
- The manifest `note` carries the decisions already taken (composition model, accepted asymmetries, deviations).
- Every part the component composes has a usage doc, so the composite's doc can point at them instead of restating.
- Open low-confidence questions have answers from the design owner.
- *(tracker)* An issue exists for the component in `trackerProject`, state Ready or Todo. If not, create it: title `<Component>`, description = the manifest note plus the DoR checklist, estimate by composite vs core, blocked-by links to unfinished parts.

**Done when:** all four (five) hold.

## 2. Branch and issue

- Branch from an up-to-date `main`: `<user>/<prefix>-<key>` (e.g. `next-button`). Never stack on another component branch; stacked PRs auto-close when their base merges.
- *(tracker)* Move the issue to In Progress and attach the branch. Do it in this turn, not at PR time.

**Done when:** the branch exists on the remote from current `main` and, *(tracker)*, the issue shows In Progress with the branch attached.

## 3. Build

Follow `rules.md` → Build procedure, kit-first, under its budgets. *(figma)* the bridge is the MCP; *(paper)* the Paper project is open and its design-to-code path is the audit source. In both, measurements are recorded before code is written.

**Done when:** the build procedure's own criterion holds: every recorded measurement matches in both modes in the browser.

## 4. Stories and tests

- One story per variant axis value and per state the kit models; one story per behavior the component claims (overflow, placement, truncation), demonstrated for real.
- Story `aria-label`s distinct when a component repeats.
- Unit tests only for logic hooks (a file-upload reducer, a pagination calculator); rendering is covered by Storybook's test runner and the a11y gate.

**Done when:** every axis value, state and claimed behavior has a story, and the story test runner is green locally including a11y.

## 5. Manifest, docs, mappings

- Edit `manifests.parity/<key>.json` only: status `parity`, axes reconciled, `deviation` and `note` current. Never touch another component's file.
- Legacy map: if this component replaces legacy exports, edit `manifests.legacy/<Export>.json` for each: status `replaced`, `next: ["<key>"]`.
- Run `node scripts/ds-manifest.mjs docs` to regenerate `PARITY.md` and `LEGACY-MAP.md`; commit the result if `commitDocs: true`.
- *(codeConnect)* Write `<key>.figma.tsx` (see `phases/parity.md` → Code Connect rules); `npx figma connect parse --dir <namespace>` passes.
- Usage doc, the component's contract for callers (the manifest `note` is for builders; an agent composing a screen reads the usage doc, never the manifest): `node scripts/ds-manifest.mjs usage <key>` scaffolds `manifests.usage/<key>.md` from the manifest. Fill every `<fill>`: core component, from the registry's docs page for that component (usage, examples, the "when" the docs give) plus the call-site audit from triage (what the product actually does with it); composite, from the usage docs of its parts plus the kit page description. Boundaries are the valuable lines ("a `Dialog` interrupts; for a side task that keeps the page usable, `Sheet`"), so write at least one per component. Then hand the doc to the design owner with one question: what do callers get wrong with this component, and what do they ask for that it should refuse? Their answer goes under Owner notes in their own sentences, or "none yet".
- Run the guards: `npm test -- ds-manifest`.

**Done when:** `node scripts/ds-manifest.mjs check` prints `ok` (usage doc present, zero placeholders), Owner notes is filled or says "none yet", and the diff touches no manifest file other than this component's and the legacy exports it replaces.

## 6. Pre-flight

Run the full pre-flight in `rules.md`. Then push and open the PR:

- Title: `<type>: <prefix> <Component> <one-line what>` (commitlint rejects PascalCase-first subjects; the prefix also makes the log greppable).
- Body, 1500–2500 characters, direct to the what: what landed, the axes reconciled, deviations from upstream with their reason, what was not migrated and why (from the call-site audit), the hand-off list. No process narrative.
- *(tracker)* Issue → In Review, PR linked.

**Done when:** the PR is open with every CI check green (visual-regression baselines accepted, not pending) and no reviewer assigned yet.

## 7. Self-review before a human reviewer

Mandatory, in this order, before assigning anyone:

1. Run the tool's code-review command on the diff (Claude Code: `/code-review`; Codex: `codex review`; Cursor: Bugbot or the review chat on the PR; Grok: request a review of the diff in the same session).
2. For every finding, **measure before fixing**: reproduce it in Storybook or in the DOM. A reported 4px jump measured frame by frame did not exist; a reported truncation overlap measured at five lines painting over neighbors did. Automated gates passed both.
3. Fix confirmed findings in new commits on the branch (the branch has no approval yet, so pushes cost nothing here). Reject unconfirmed ones in a PR comment with the measurement.
4. Check the docs the guards do not see: a status change in the legacy map moves the row between sections and renumbers headings; the generator does that, but confirm the diff reads right.
5. Design-owner preview in Storybook with the hand-off list. Only after their ok, assign the reviewers from `ds.config.json`.

Self-review caught two real defects on one component after every automated gate went green; it is a step, not an option.

**Done when:** every finding is either fixed in a commit or rejected with a measurement, the design owner has previewed, and reviewers are assigned.

## 8. Review

- Answer feedback specifically: what was done, deviations with a one-line why, what was not done. No overselling.
- A change requested on an already-approved PR goes to a **follow-up PR**; a push dismisses the approval.
- *(tracker)* Comments that become decisions get copied into the manifest `note`; the issue stays In Review.

**Done when:** every review thread is resolved or answered with a one-line why, and the PR carries the approvals the repo requires.

## 9. Merge and release

Because every component PR edits only its own manifest files and adds sorted lines to the namespace index, approved PRs stay mergeable after another merges. Do not rebase by reflex; check `mergeStateStatus` first and rebase only on a real conflict.

- Squash merge, subject forced to the PR title with `(#N)`: `gh pr merge N --squash --subject "<title> (#N)"`. The squash subject drives the version bump.
- One merge at a time. Wait for the publish workflow to finish green before the next merge; two runs seconds apart compute the same version and every later release fails.
- Small change first when two are ready: it is the canary for the pipeline.
- Expect a release from every merge, docs-only included.
- *(tracker)* Issue → Merged on merge, → Released when the publish run is green, with the version in a comment. Same turn as the event.

## 10. Close

- Kit page marker → done, by the design owner (code never moves a marker).
- Classify findings into tiers (`rules.md` → Closing). Tier 1 into `rules.md` or the manifest note; Tier 2 into the tracker as its own issue; Tier 3 onto the hand-off list.
- Next component: back to step 1.

**Phase done when:** PR merged, version published, manifest `parity`, docs regenerated, *(codeConnect)* mapping published by the Code Connect workflow, *(tracker)* issue Released, tiers filed.
