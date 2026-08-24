# AGENTS.md (design-system migration)

Append this file's content to the repo's `AGENTS.md`, or copy it there if none exists. Codex reads `AGENTS.md` from the repo root and from the directory of the file being edited; place a copy under the namespace folder (`src/next/AGENTS.md`) so the rules load whenever a file there is touched.

## Always

- Read `ds.config.json` at the repo root before any design-system work.
- For any file under the namespace named in `ds.config.json`, apply every rule in `ds-ai-ready/core/rules.md`. When a symptom looks like a component bug, read `ds-ai-ready/core/traps.md` first.
- Manifests are per component (`<manifests.parity>/<key>.json`); edit only the file of the component you are working on. Regenerate docs with `node scripts/ds-manifest.mjs docs`; never edit `PARITY.md` or `LEGACY-MAP.md` by hand.

## Phases (on request)

When asked to run a migration phase, load exactly one of `ds-ai-ready/core/phases/{triage,foundations,kit,parity,component,cleanup,patterns}.md` and execute it end to end, stopping at every "Done when". For `component <key>`, load `core/rules.md` too.

## Self-review

Before a human reviewer is assigned to a component PR, run `codex review` on the diff, measure each finding in Storybook or the DOM before fixing, and fix confirmed findings in new commits.
