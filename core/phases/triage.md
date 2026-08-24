# Phase: triage

Run once, before any code. Output: `TRIAGE.md`, `manifests.legacy/*.json`, `LEGACY-MAP.md`, the legacy guard green. Skip this phase entirely when starting a design system from zero (no legacy exports); go to `foundations`.

## 1. Scan every consumer

1. Org-wide code search for the package name in `package.json`. Every hit is a consumer, including the ones nobody listed (an internal GUI, a marketing site pinned to an old version).
2. Per consumer, parse every named import of the package. Count **importing files per component**, not render sites: the number that matters is "how many places break if this export disappears".
3. Record consumer ref, date, importing-file count, pinned package version.

**Done when:** `TRIAGE.md` has the consumer table and the per-component usage table across all consumers.

## 2. Bucket

| Bucket | Rule | Action |
|---|---|---|
| Dead | zero imports everywhere | delete, no replacement |
| Near-dead | 1–2 importing files total | absorb at the call site during that page's wave |
| Alive | including suspects the plan wanted to delete | migrate |
| Heavy hitters | top of the funnel | set priority and canary order |

Utility-ish exports absent from shadcn (a `Grid`, a date wrapper) get an explicit decision: "dies by recipe" or "kept as-is".

**Done when:** every export is in exactly one bucket.

## 3. Legacy map, one file per export

Write `manifests.legacy/<ExportName>.json` per public export (template in `templates/legacy/`). Statuses: `replaced` (`next` names the module keys) · `absorbed` · `deprecated` · `kept` · `undecided` (`proposedNext` + `note` carry the proposal; nothing is decided).

Aliases (`TextLinkLarge` → `TextLink`) go in the canonical export's `aliases`, never as their own file.

Resolve `undecided` entries in batches with the design owner, one commit per batch. Defaults taken while waiting are labeled reversible in the `note`.

Run `node scripts/ds-manifest.mjs docs` to generate `LEGACY-MAP.md`; `npm test -- ds-manifest` runs the legacy guard: every export in the index has a file or alias, no orphan files, valid statuses, `next` non-empty iff `replaced`, every referenced module key exists in `manifests.parity/`.

**Done when:** guard green and the undecided count has named owners.

## 4. Tokens: freeze, don't migrate

If a token pipeline exists (Tokens Studio, Style Dictionary):

1. Final sync and build; `diff` the output against the last release. Byte-identical or stop.
2. Promote generated artifacts to committed source.
3. Legacy tokens become bug-fix-only, snapshot-gated. New styling goes to the namespace `theme.css` only.
4. CI checksum on the frozen files.
5. Disconnect the tool. The frozen files die in `cleanup`.

Never point the designer sync tool at the new `theme.css`; never run two token sources during convergence.

**Done when:** freeze PR merged with the diff attached and the tool disconnected.

*(tracker)* Create one issue per bucket outcome that implies work (each `replaced` heavy hitter, the freeze PR), in Backlog, linked to `TRIAGE.md`.
