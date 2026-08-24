---
name: ds-migrate
description: "Run one phase of a design-system migration to shadcn (AI-ready): triage, foundations, kit, parity, component <key>, cleanup."
disable-model-invocation: true
argument-hint: "<triage|foundations|kit|parity|component <key>|cleanup>"
---

Phase router. Read `ds.config.json` at the repo root (if absent, the only valid phase is `foundations`, which writes it). Then load exactly one phase file for `$ARGUMENTS` and execute it end to end, stopping at every "Done when" to verify before continuing:

- `triage` → @../../../../core/phases/triage.md
- `foundations` → @../../../../core/phases/foundations.md
- `kit` → @../../../../core/phases/kit.md
- `parity` → @../../../../core/phases/parity.md
- `component <key>` → @../../../../core/phases/component.md (with `ds-rules` loaded)
- `cleanup` → @../../../../core/phases/cleanup.md

With no argument: read the manifests, report the queue (`kit-ready` sorted by dependency), the open gaps, and which phase applies next. Never start a component whose kit page is not at the ready marker.

Background for any phase, read only when a step points at it: @../../../../PLAYBOOK.md
