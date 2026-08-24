---
name: ds-help
description: "Where the migration stands, what blocks it, and the next command. Run it whenever you are lost."
disable-model-invocation: true
---

Orientation for a design-system migration run with this plugin. Read the repo, never memory: the artifacts below are the only state. Commands are written namespaced (plugin install); a flat install drops the `ds-ai-ready:` prefix.

## 1. Detect the phase

Evaluate every row top to bottom; the current phase is the **last** row whose signal holds (rows are cumulative, so a later row holding with an earlier one missing still counts). Every path is relative to the repo root or to `ds.config.json` (`manifests.*`, `namespace`).

| Signal | Phase reached | Next command |
|---|---|---|
| nothing below holds | before foundations | `/ds-ai-ready:ds-migrate foundations` |
| `ds.config.json` exists | foundations started | `/ds-ai-ready:ds-migrate foundations` |
| `scripts/ds-manifest.mjs` exists and `node scripts/ds-manifest.mjs check` exits 0 | foundations: guards installed | `/ds-ai-ready:ds-migrate foundations` (finish steps 3 to 6) |
| a `.tsx` and a `.stories.tsx` under `namespace` | foundations done | existing library: `/ds-ai-ready:ds-migrate triage`; from zero: kit alignment (`phases/kit.md`, design owner) |
| `TRIAGE.md` and `manifests.legacy/*.json` exist (skip when `legacyPath` is empty or absent) | triage done | kit alignment |
| at least one `manifests.parity/*.json` at `kit-ready` | kit producing | `/ds-ai-ready:ds-migrate component <key>` on the first `kit-ready` by dependency order |
| every `manifests.parity/*.json` at `parity` or `code-only`, no `kit-ready`/`kit-wip`/`gap-*` | component queue drained | `/ds-ai-ready:ds-migrate cleanup` |
| `legacyPath` gone and every legacy manifest `replaced`/`absorbed`/`deprecated` | cleanup done | `/ds-ai-ready:ds-patterns inventory` |

A component in progress: a branch named `<prefix>-<key>` or a manifest whose `note` mentions an open PR. Report it as "in flight" with the step of `phases/component.md` it appears to be at, judged by what exists (branch, stories, manifest at `parity`, PR open, reviewers assigned).

## 2. Find what blocks

Check each; list only the ones that hold:

- `design.figmaFileKey` or `design.kitName` empty with `designTool: figma` (or `paperProjectPath` empty with `paper`): rule 1 forbids building any component. Owner: design.
- `node scripts/ds-manifest.mjs check` failing: quote its output verbatim; each line names the module and the fix.
- A `parity` component without `manifests.usage/<key>.md`: `node scripts/ds-manifest.mjs usage <key>`, then fill it.
- `kit-ready` manifests whose composed parts are not yet `parity`: name the part.
- `FINDINGS.md` present: count the entries marked **Open** and name the oldest.

## 3. Report

Print, in this order, nothing else:

1. **Phase**: the row from step 1, one line, plus the in-flight component if any.
2. **Blocked by**: the list from step 2, or "nothing".
3. **Next**: the single command or hand-off from the table, with the key filled in.
4. **Skills**: `ds-migrate <phase>` (runs one phase end to end), `ds-patterns <step>` (after cleanup), `ds-rules` (fires on its own under the namespace; ask it to state rule 1 to confirm it loaded), `ds-help` (this).
5. **Read next**: the absolute path of the one phase file for the next command, resolved from this skill's folder: `../ds-migrate/references/phases/<phase>.md` (`kit.md` for a design hand-off), or `../ds-patterns/references/patterns.md` after cleanup.

Done when every line above is backed by a file or command output you read this turn.
