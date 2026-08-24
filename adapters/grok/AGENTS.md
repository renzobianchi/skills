# AGENTS.md (design-system migration), Grok

Paths below assume the package is vendored at `ds-ai-ready/` in the repo root (copy or git submodule). If it lives elsewhere, replace the prefix.

Grok Build / Grok Code reads `AGENTS.md` from the repo root. Copy this file there (or append to the existing one). The content is identical to the Codex adapter except for the review command.

## Always

- Read `ds.config.json` at the repo root before any design-system work.
- For any file under the namespace named in `ds.config.json`, apply every rule in `ds-ai-ready/core/rules.md`. When a symptom looks like a component bug, read `ds-ai-ready/core/traps.md` first.
- Manifests are per component (`<manifests.parity>/<key>.json`); edit only the file of the component you are working on. Regenerate docs with `node scripts/ds-manifest.mjs docs`; never edit `PARITY.md` or `LEGACY-MAP.md` by hand.

## Phases (on request)

When asked to run a migration phase, load exactly one of `ds-ai-ready/core/phases/{triage,foundations,kit,parity,component,cleanup,patterns}.md` and execute it end to end, stopping at every "Done when". For `component <key>`, load `core/rules.md` too.

## Self-review

Before a human reviewer is assigned to a component PR, ask for a bug-focused review of the full diff in the same session ("review this diff for correctness bugs only; list file, line, failure scenario"), measure each finding in Storybook or the DOM before fixing, and fix confirmed findings in new commits.
