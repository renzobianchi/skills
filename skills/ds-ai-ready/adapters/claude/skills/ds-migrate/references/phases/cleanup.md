# Phase: cleanup

Runs when `kit-ready` and `kit-wip` are empty and every legacy export is `replaced`, `absorbed`, `deprecated` or `kept`.

## 0. Re-audit every parity manifest before deleting anything

The queue drained over months; the kit did not stand still and some entries were never at mirror. Cleanup deletes the legacy that would have hidden both, so the sweep comes first:

1. Read the kit's current version id from the bridge. `node scripts/ds-manifest.mjs check --kit-version <v>` lists every `parity` entry verified against an older kit; `node scripts/ds-manifest.mjs audit code` lists every manifest whose axes no longer match the source.
2. For each listed entry, and for every entry whose `verified.at` predates the last kit restructure, rerun the build procedure's audit (rules.md, steps 2 and 4) at `parityLevel`: axes, per-variant digest, computed styles in both modes. Same budgets as a build.
3. Mirror holds: `verify <key> <v>`. Mirror broken: status → `gap-code` (code owes the kit) or `gap-kit` (kit owes code), the gap in `note`, an issue if `tracker != none`. A difference the design owner declares deliberate goes into `asymmetries` with their reason, not into the note.
4. Regenerate docs. `PARITY.md` now shows every parity line with its level, date and kit version; the RFC addendum for cleanup quotes the count re-verified and the count demoted.

**Done when:** `check --kit-version <current>` prints `ok`, `audit code` prints `ok`, and every demoted entry is back in the queue.

## 1. Canary and consumers (start earlier, finish here)

- The canary (one real screen in the heaviest consumer on the new namespace) starts before the queue is half drained. Expect cosmetic snapshot churn from transitive dependency bumps (an icon library changing SVG path serialization is byte-different, semantically identical); refresh snapshots deliberately. A canary allowed to stay red loses its signal: compare exact failure counts against the known baseline.
- Scope each consumer migration from **call sites**, not from the legacy spec: two wrapper files reaching eleven screens is a two-file migration; a legacy state no importer reaches is dead code and is not migrated.
- `MIGRATION.md` is generated from the legacy map by `ds-manifest.mjs docs` from the first `replaced` entry on, not once `undecided` is empty: the canary and every consumer migration that follows it run on the recipes that exist, and an `undecided` entry rendered as "do not migrate yet" is what stops an agent from migrating it on a guess. Each legacy manifest carries its `recipe` (the find/replace a caller applies: `FormControl` → `Field` + `FieldLabel`, `Grid` → `grid-cols-12`/`col-span-*`, `Modal` confirmations → `AlertDialog`); `note` stays the builder's reasoning. Absorbed and deprecated entries get recipes too.
- The hand-off to a consumer is the published package (rule 18): a consumer with hundreds of legacy-importing files is migrated by agents, reading what `ship` put in `node_modules/<pkg>`. Before the canary starts, install the released version in the consumer, confirm `llms.txt`, `MIGRATION.md`, the usage docs and `parity.json` are there, and point the consumer's agent instructions at `node_modules/<pkg>/llms.txt`.

## 2. Delete

In one PR per item, each releasing on its own:

1. Legacy components and their tests.
2. The legacy styling toolchain (CSS-in-JS macros, old Tailwind major, its config).
3. Frozen token artifacts and the retired token pipeline.
4. Retired primitive packages.
5. Legacy manifest files (`manifests.legacy/`) and `LEGACY-MAP.md`; the guard is retired with them.

## 3. Consolidate

- Single Tailwind toolchain; the npm alias goes away.
- React upgrade if a version constraint was carried: remove every shim tagged for it in one PR, write the RFC addendum.
- Tag `1.0.0` with a `BREAKING CHANGE:` footer on the legacy-removal commit, once §0 is green against that day's kit version: `1.0.0` is the version consumers read as "done".

## 4. Hand over to `patterns`

The system is now a component library with a contract. `phases/patterns.md` is what makes it a design system agents can speak.

**Done when:** the package ships only the namespace, `1.0.0` is published, and the RFC has its closing addendum with the fidelity-test results.
