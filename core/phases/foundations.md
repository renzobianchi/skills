# Phase: foundations

Run once. Output: `ds.config.json`, the namespace scaffolded with one seed component rendering in light and dark, the manifest scripts and guards installed, the project's own rules skill written, the RFC.

## 1. Write `ds.config.json`

Copy `templates/ds.config.json` to the repo root and fill it. Every later phase branches on these keys:

- `designTool`: `figma` or `paper`. Paper forces `codeConnect: false` (Code Connect is a Figma feature).
- `codeConnect`: whether `<key>.figma.tsx` is required per component and guarded.
- `tracker`: `linear` or `none`. With `linear`, set `trackerProject`.
- `primitives`: `base-ui` or `radix`. Pick what shadcn currently defaults to; never mix.
- `manifests.commitDocs`: whether generated `PARITY.md`/`LEGACY-MAP.md` are committed (guarded for equality) or only rendered.

**Done when:** the file exists and `node scripts/ds-manifest.mjs check` runs (on an empty manifest dir it reports zero components, not an error).

## 2. Write the RFC

One document with: the thesis (diffable shadcn sources, closed tokens, decisions as text, named patterns later), the phase order below, the governance rule (kit owns what exists; registry owns how core is built; composites from core parts), the release policy (stable `0.x` releases, no pre-release channel), the React-version constraint if any. Later changes are dated **addenda**, never edits.

Phase order, and why Tailwind consolidation is last: the legacy styling toolchain has no v4 path, so the repo-wide dependency cannot flip until every legacy file is gone.

1. scaffolding + seed components
2. tokens live from day one
3. component rollout (this loop)
4. cleanup
5. Tailwind consolidation + `1.0.0`

## 3. Scaffold the namespace

- `components.json` with `css` at `<namespace>/theme.css`, aliases into the namespace, style and primitives per config.
- Dual toolchain: namespace compiled by the standalone Tailwind v4 CLI (v4 installed under an npm alias so both majors coexist); legacy untouched. Scripts: `next:css` (dev, to the Storybook folder, gitignored) and `next:css:dist` (minified, shipped as a package artifact so consumers need no Tailwind).
- Utilities compile **unlayered** when legacy preflight is unlayered.
- Storybook imports the generated CSS; a preview decorator scopes the namespace font and dark wrapper to namespace stories only, so legacy stories keep byte-identical DOM for visual regression.
- ESLint overrides for the namespace so files stay diffable against upstream.
- Tokens: seed shadcn's neutral set, overlay brand (primary light/dark, ring, fonts). Token names stay shadcn's own so every `npx shadcn add` pastes with zero remap.
- React 18 while the registry assumes 19: `forwardRef` policy written into the parity doc as a standing deviation; console-warning probe script added.

**Done when:** one seed component renders from the namespace in Storybook, light and dark, zero legacy imports, hex appears only in `theme.css`.

## 4. Install manifests and guards

Copy `templates/scripts/ds-manifest.mjs` and `templates/tests/*.test.ts` into the repo; add `"ds:docs": "node scripts/ds-manifest.mjs docs"` and `"ds:check": "node scripts/ds-manifest.mjs check"` to `package.json`; wire the tests into the existing runner. Create the first `manifests.parity/<seed>.json`.

Break each guard deliberately once (rename a status, delete a doc line) and watch it fail naming the module. A guard never seen failing is not a guard.

**Done when:** `npm test` runs the guards and each has been seen red once.

## 5. Write the project's rules skill

From `templates/system-skill.md`: the project's namespace, primitives, generated-CSS path, reviewers and their review profiles, commit prefix, the tool flags. It includes `core/rules.md` by reference (Claude: `@path`; Cursor: `@file`; Codex/Grok: a "read `core/rules.md` first" line). Project-specific Tier 1 rules accumulate here; universal ones go upstream to `core/rules.md`.

Install the adapter for each tool the team uses (`adapters/`).

**Done when:** opening a file under the namespace in each tool loads the rules (verify by asking the agent to state rule 1).

## 6. Kit alignment

Hand `phases/kit.md` to the design owner. Code work starts as soon as two or three components are `kit-ready`; it does not wait for the kit to finish.

*(tracker)* Create the project in the tracker with states Backlog → Ready → In Progress → In Review → Merged → Released; one issue for foundations itself, closed at the end of this phase.
