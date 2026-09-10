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
| every `manifests.parity/*.json` at `parity` or `code-only`, no `kit-ready`/`kit-wip`/`gap-*` | component queue drained | `/ds-ai-ready:ds-migrate cleanup` (starts with §0, the re-audit) |
| `node scripts/ds-manifest.mjs check --kit-version <current>` and `audit code` both exit 0 | re-audit done | `/ds-ai-ready:ds-migrate cleanup` (§1 onward; `1.0.0` unblocked) |
| `legacyPath` gone and every legacy manifest `replaced`/`absorbed`/`deprecated` | cleanup done | `/ds-ai-ready:ds-patterns inventory`, then `/ds-ai-ready:ds-migrate steward` |
| `governance.model` non-empty in `ds.config.json` | steward done, the system is live | rerun the count in `phases/steward.md` step 1 every quarter |

A component in progress: a branch named `<prefix>-<key>` or a manifest whose `note` mentions an open PR. Report it as "in flight" with the step of `phases/component.md` it appears to be at, judged by what exists (branch, stories, manifest at `parity`, PR open, reviewers assigned).

## 1a. Parity health

Read the kit's current version id from the bridge (Figma: file version; Paper: project commit), then put every `status: parity` manifest in exactly one bucket, by the first test that holds:

- **verified**: `verified.kitVersion` equals the current id and `verified.level` is at or above `parityLevel` in `ds.config.json`;
- **stale**: `verified` present with a different `kitVersion`;
- **unverified**: no `verified` field, or `verified.level` below `parityLevel`;
- **code drift**: the key appears in the output of `node scripts/ds-manifest.mjs audit code`.

The procedure for the last three buckets is `../ds-migrate/references/phases/cleanup.md` §0.

With the bridge down, read the kit version as unknown, say so in the report, and fill the last three buckets from the files.

## 2. Find what blocks

Check each; list only the ones that hold:

- `design.figmaFileKey` or `design.kitName` empty with `designTool: figma` (or `paperProjectPath` empty with `paper`): rule 1 forbids building any component. Owner: design.
- `node scripts/ds-manifest.mjs check` failing: quote its output verbatim; each line names the module and the fix.
- Any stale, unverified or code-drift entry from §1a: quote the `check --kit-version <current>` and `audit code` output verbatim, name cleanup §0 as the fix, and report `1.0.0` as blocked until the three buckets are empty.
- A `parity` component without `manifests.usage/<key>.md`: `node scripts/ds-manifest.mjs usage <key>`, then fill it.
- `kit-ready` manifests whose composed parts are not yet `parity`: name the part.
- `FINDINGS.md` present: count the entries marked **Open** and name the oldest.
- A `deprecated` parity manifest without `supersededBy` or `removeIn`: the guard names it; `phases/steward.md` step 4 has the fix.
- `manifests.ship` set and `npm pack --dry-run` missing `llms.txt`, `<ship>/usage/*.md`, or (from the first `replaced` legacy export) `<ship>/MIGRATION.md`: a consumer's agent gets compiled JS only. `check` names the missing `files` entry or script; `phases/foundations.md` step 4 has the wiring.

## 3. Report

Print, in this order, nothing else:

1. **Phase**: the row from step 1, one line, plus the in-flight component if any.
2. **Parity**: `<n> verified against kit <v> · <n> stale · <n> unverified · <n> code drift`, then the stale and unverified keys on one line when they are ten or fewer together. When any of the three is non-zero, print this glossary line unchanged: `stale = the kit moved after the stamp · unverified = parity claimed, never proven · code drift = the source moved away from its manifest`.
3. **Blocked by**: the list from step 2, or "nothing".
4. **Next**: the single command or hand-off from the table, with the key filled in.
5. **Skills**: `ds-migrate <phase>` (runs one phase end to end, `steward` last), `ds-patterns <step>` (after cleanup), `ds-rules` (fires on its own under the namespace; ask it to state rule 1 to confirm it loaded), `ds-help` (this).
6. **Read next**: the absolute path of the one phase file for the next command, resolved from this skill's folder: `../ds-migrate/references/phases/<phase>.md` (`kit.md` for a design hand-off), or `../ds-patterns/references/patterns.md` after cleanup.

Done when every line above is backed by a file or command output you read this turn.
