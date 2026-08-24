---
name: <system>
description: "Rules for building components in <package>. Use when editing files under <namespace>, adding stories, reconciling manifests, or answering review on <repo>. Triggers on: <namespace>, <primitives>, shadcn, parity, kit, cn(), data-slot, <reviewer handles>."
---

# <system> component engineering

Read `ds.config.json` at the repo root, then `<path-to>/core/rules.md`. Every rule there applies; this file adds only what is specific to this repository.

Before composing a screen from namespace components, read `<manifests.usage>/<key>.md` for each one; before touching a component, its manifest `note`.

## Repository facts

- Namespace: `<namespace>`; legacy: `<legacyPath>` (bug-fix only).
- Primitives: `<primitives>`. Generated CSS: `<path>` (run `<script>` after every new class).
- Design tool: `<figma|paper>`; kit: `<name>`; bridge check: `<how>`.
- Code Connect: `<on|off>`. Tracker: `<linear project|none>`.
- Commit subject prefix: `<prefix>`. Reviewers: `<handles>`.

## Reviewer profiles

- `<handle>`: pushes on ___ (e.g. simplicity over abstraction; will accept a documented deviation).
- `<handle>`: pushes on ___ (e.g. conformance to existing patterns; prefers less code).

Answer feedback with: what was done, deviations with a one-line why, what was not done.

## Project rules (Tier 1, accumulated)

Add one entry per closed component when a finding generalizes within this repo but not beyond it. Format: rule, the failure it prevents, the date.

1. …
