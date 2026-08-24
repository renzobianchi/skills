---
name: ds-migrate
description: "Run one phase of a design-system migration to shadcn (AI-ready): triage, foundations, kit, parity, component <key>, cleanup."
disable-model-invocation: true
argument-hint: "<triage|foundations|kit|parity|component <key>|cleanup>"
---

Phase router. Read `ds.config.json` at the repo root (if absent, the only valid phase is `foundations`, which writes it). Then read exactly one phase file for `$ARGUMENTS` with the Read tool and execute it end to end, stopping at every "Done when" to verify before continuing. The files live in the plugin, outside the repo; if the Read asks for permission, grant it for the session.

- `triage` → `${CLAUDE_PLUGIN_ROOT}/core/phases/triage.md`
- `foundations` → `${CLAUDE_PLUGIN_ROOT}/core/phases/foundations.md`
- `kit` → `${CLAUDE_PLUGIN_ROOT}/core/phases/kit.md`
- `parity` → `${CLAUDE_PLUGIN_ROOT}/core/phases/parity.md`
- `component <key>` → `${CLAUDE_PLUGIN_ROOT}/core/phases/component.md`, with the `ds-rules` skill loaded
- `cleanup` → `${CLAUDE_PLUGIN_ROOT}/core/phases/cleanup.md`

Phase files reference `templates/...`; those resolve to `${CLAUDE_PLUGIN_ROOT}/core/templates/...`.

With no argument: read the manifests, report the queue (`kit-ready` sorted by dependency), the open gaps, and which phase applies next. Never start a component whose kit page is not at the ready marker.

Background for any phase, read only when a step points at it: `${CLAUDE_PLUGIN_ROOT}/PLAYBOOK.md`
