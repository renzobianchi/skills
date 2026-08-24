# Phase: cleanup

Runs when `kit-ready` and `kit-wip` are empty and every legacy export is `replaced`, `absorbed`, `deprecated` or `kept`.

## 1. Canary and consumers (start earlier, finish here)

- The canary (one real screen in the heaviest consumer on the new namespace) starts before the queue is half drained. Expect cosmetic snapshot churn from transitive dependency bumps (an icon library changing SVG path serialization is byte-different, semantically identical); refresh snapshots deliberately. A canary allowed to stay red loses its signal: compare exact failure counts against the known baseline.
- Scope each consumer migration from **call sites**, not from the legacy spec: two wrapper files reaching eleven screens is a two-file migration; a legacy state no importer reaches is dead code and is not migrated.
- Derive `MIGRATION.md` from the legacy map once `undecided` is empty: find/replace recipes per export, including absorbed (`Grid` → `grid-cols-12`/`col-span-*`) and deprecated entries.

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
- Tag `1.0.0` with a `BREAKING CHANGE:` footer on the legacy-removal commit.

## 4. Hand over to `patterns`

The system is now a component library with a contract. `phases/patterns.md` is what makes it a design system agents can speak.

**Done when:** the package ships only the namespace, `1.0.0` is published, and the RFC has its closing addendum with the fidelity-test results.
