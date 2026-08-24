# Phase: foundations

Run once. Output: `ds.config.json`, the namespace scaffolded with one seed component rendering in light and dark, the manifest scripts and guards installed, the project's own rules skill written, the RFC.

Steps marked *(legacy)* exist to win a fight against an existing toolchain. A library from zero skips them and records the skip with its reason; copying a justification for a blocker nobody can find is the failure to avoid.

## 1. Write `ds.config.json`

Copy `templates/ds.config.json` to the repo root and fill it. Every later phase branches on these keys:

- `designTool`: `figma` or `paper`. Paper forces `codeConnect: false` (Code Connect is a Figma feature).
- `codeConnect`: whether `<key>.figma.tsx` is required per component and guarded.
- `tracker`: `linear` or `none`. With `linear`, set `trackerProject`.
- `primitives`: `base-ui` or `radix`. Pick what shadcn currently defaults to; never mix.
- `manifests.commitDocs`: whether generated `PARITY.md`/`LEGACY-MAP.md` are committed (guarded for equality) or only rendered.
- Unknown values (`design.figmaFileKey`, `design.kitName`, `reviewers`) stay empty, never invented. Nothing validates them, but rule 1 cannot be honoured until the kit fields are filled, so say so in the hand-off (step 6).
- From zero: keep `legacyPath` as a declaration even if the directory never exists; triage and cleanup read the key, and an absent key is a different claim from an empty one.

**Done when:** the file exists, `node scripts/ds-manifest.mjs docs` then `check` both exit 0 with `0 parity, 0 legacy`. Order matters: with `commitDocs: true`, `check` compares against the committed doc, so on a repo with no doc yet it fails as "stale" until `docs` has run once (Tier 1, first run).

## 2. Write the RFC

`RFC.md` at the repo root (a tracker document can be edited silently; a file in git cannot), with: the thesis (diffable shadcn sources, closed tokens, decisions as text, named patterns later), the phase order below, the governance rule (kit owns what exists; registry owns how core is built; composites from core parts), the release policy (stable `0.x` releases, no pre-release channel), the React-version constraint if any. Later changes are dated **addenda**, never edits.

Phase order, and why Tailwind consolidation is last: the legacy styling toolchain has no v4 path, so the repo-wide dependency cannot flip until every legacy file is gone. From zero that reason is absent; the weaker one that holds is keeping the standalone-CLI fallback until the component set stops moving. Write the reason that applies, as an addendum if the body already states the other.

1. scaffolding + seed components
2. tokens live from day one
3. component rollout (this loop)
4. cleanup
5. Tailwind consolidation + `1.0.0`

## 3. Scaffold the namespace

- `components.json` with `css` at `<namespace>/theme.css`, aliases into the namespace, style per config. The schema has no primitives field: the CLI picks primitives by registry. Confirm the registry URL for `primitives` against the current shadcn docs before the first `shadcn add`; a guessed URL looks configured and fails on first use. Base UI's package is `@base-ui/react` (the `@base-ui-components/react` name is deprecated).
- Dual toolchain: namespace compiled by the standalone Tailwind v4 CLI (*(legacy)* v4 under an npm alias so both majors coexist; from zero, install under its own name). Scripts: `next:css` (one-shot, to the Storybook folder, gitignored), `next:css:watch`, `next:css:dist` (minified, shipped as a package artifact so consumers need no Tailwind). `next:css` must exit, because `storybook` and `build-storybook` scripts run it first and the probe below runs it too.
- Source detection off (`@import "tailwindcss" source(none)`) plus one explicit `@source` per folder (namespace, `.storybook`). Auto-detection makes a class appear in the output because of where a file sits.
- Dark variant: if the dark class goes on a story wrapper rather than `<html>`, upstream's `&:is(.dark *)` leaves the wrapper's own background light. Use `&:where(.dark, .dark *)` and comment it so a diff against a fresh install does not revert it.
- Hand-written CSS in `theme.css` references raw tokens (`var(--background)`), never the `--color-*` aliases from `@theme inline`: the alias computes once on `:root` to the light value and inherits into `.dark` unchanged. Utilities are unaffected, so the symptom (white dark wrapper, dark children) reads as a component bug.
- Base layer (background, foreground, font) scoped to the namespace wrapper attribute the decorator adds, not `body`; the scope is what keeps legacy stories byte-identical and costs one selector now against an audit later.
- *(legacy)* Utilities compile **unlayered** when legacy preflight is unlayered. From zero, plain `@import` with layers.
- Storybook imports the generated CSS; a preview decorator scopes the namespace font and dark wrapper to namespace stories only, so legacy stories keep byte-identical DOM for visual regression. Namespace stories declare themselves with a tag (`tags: ['next']` in meta); path sniffing breaks the first time a file moves, and a story that forgets the tag renders unstyled, which is loud.
- ESLint overrides for the namespace so files stay diffable against upstream (off: empty object types, explicit any, only-export-components). On, namespace only: a `no-restricted-syntax` rule rejecting hex literals, so rule 4 is enforced continuously rather than checked once.
- Tokens: seed shadcn's neutral set, overlay brand (primary light/dark, ring, fonts). Token names stay shadcn's own so every `npx shadcn add` pastes with zero remap. No kit yet: placeholder brand values under a marked block, in a different notation from the neutral set, so "not from the kit" is visible at a glance. A `[data-slot]` font guard is *(legacy)*; it is the cause rule 8 fixes, not a requirement.
- React 18 while the registry assumes 19: `forwardRef` policy recorded as a standing deviation in the `deviation` field of every manifest (rendered into `PARITY.md` by the generator), in the RFC, and in the project skill. Two probes: a static pass (every exported namespace component that renders JSX is `forwardRef`-wrapped) and a runtime pass over every story in both modes. The runtime pass starts `storybook dev` itself: a static `storybook build` compiles React in production mode, which strips every warning, and the probe reports green on a broken component.
- Seed component: Button from the registry. Its status is `gap-kit` until something has been read from a canvas (`kit-ready` is a claim about the kit, `parity` a claim rule 1 forbids). Leave `axes.*.figma` empty for the same reason. Where an upstream value is a color literal (`text-white`), the token wins and the manifest `note` records it; upstream wins on structure.

**Done when:** one seed component renders from the namespace in Storybook, light and dark, zero legacy imports, hex appears only in `theme.css`.

## 4. Install manifests and guards

Copy `templates/scripts/ds-manifest.mjs` to `scripts/` and `templates/tests/*.test.ts` to the test folder the runner already scans (the test imports `../scripts/ds-manifest.mjs`, so keep them one level apart or fix the import). The test uses bare `describe`/`it`: under Vitest set `test.globals: true` in the config or run with `--globals`; under Jest nothing to do (Tier 1, first run). Add `"ds:docs": "node scripts/ds-manifest.mjs docs"` and `"ds:check": "node scripts/ds-manifest.mjs check"` to `package.json`; wire the tests into the existing runner. Create the first `manifests.parity/<seed>.json`.

If tests are type-checked, add a `ds-manifest.d.mts` beside the script instead of editing either file, so both stay re-copyable from the template.

Break each guard deliberately once (rename a status, delete a doc line, paste a second section, export an unmapped legacy name from `src/index.ts`, put a hex literal in a component, unwrap the seed from `forwardRef`, hand a ref to a plain function in a story) and watch it fail naming the module. A guard never seen failing is not a guard; the first run caught a probe that could never fail this way. The legacy-map guard is vacuous from zero; break it anyway so it is known live for the day a legacy surface appears.

**Done when:** `npm test` runs the guards and each has been seen red once.

## 5. Write the project's rules skill

From `templates/system-skill.md`: the project's namespace, primitives, generated-CSS path, reviewers and their review profiles, commit prefix, the tool flags. One tool-neutral source at `skills/<system>/SKILL.md`; every adapter is a pointer to it and holds no rules of its own, so a rule added for one tool cannot go missing in another. Unknown reviewers: keep the section with an explicit "not known yet", since an absent section claims there are none. Project-specific Tier 1 rules accumulate here; universal ones go upstream to `core/rules.md`.

Install the adapter for each tool the team uses (`adapters/`). Cursor, Codex and Grok resolve `ds-ai-ready/core/...` from the repo root, so vendor `core/` there (copy or submodule; nothing keeps a copy current, note it as Tier 2). Claude: install the plugin, or copy `adapters/claude/skills/*` into `.claude/skills/`; all three are self-contained (rules inlined, phases under `references/`).

With `tracker: none`, Tier 2 findings go to a `FINDINGS.md` at the repo root, and the project skill says so; a gap with nowhere to go is the one teams lose.

**Done when:** opening a file under the namespace in each tool loads the rules (ask the agent to state rule 1; expected: "Build visuals with the live kit open, every time"). A tool that is configured but not run is listed as unverified, with that one-line check next to it.

## 6. Kit alignment

Hand `phases/kit.md` to the design owner. Code work starts as soon as two or three components are `kit-ready`; it does not wait for the kit to finish. No design owner yet: write `KIT-HANDOFF.md` at the repo root naming what code needs back, in order (file key and kit name first, since they block rule 1), and what it owes in return.

*(tracker)* Create the project in the tracker with states Backlog → Ready → In Progress → In Review → Merged → Released; one issue for foundations itself, closed at the end of this phase.
