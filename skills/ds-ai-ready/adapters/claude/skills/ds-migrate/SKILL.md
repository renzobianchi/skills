---
name: ds-migrate
description: "Run one phase of a design-system migration to shadcn (AI-ready): triage, foundations, kit, parity, component <key>, cleanup."
disable-model-invocation: true
argument-hint: "<triage|foundations|kit|parity|component <key>|cleanup>"
---

Phase router. Read `ds.config.json` at the repo root (if absent, the only valid phase is `foundations`, which writes it). Then read exactly one phase file for `$ARGUMENTS` from this skill's `references/` folder with the Read tool and execute it end to end, stopping at every "Done when" to verify before continuing. The folder lives with the skill, outside the repo; if the Read asks for permission, grant it for the session.

- `triage` → `references/phases/triage.md`
- `foundations` → `references/phases/foundations.md`
- `kit` → `references/phases/kit.md`
- `parity` → `references/phases/parity.md`
- `component <key>` → `references/phases/component.md`, with the `ds-rules` skill loaded
- `cleanup` → `references/phases/cleanup.md`

Phase files name `templates/...`; those live at `references/templates/...`. Background for any phase, read only when a step points at it: `references/PLAYBOOK.md`.

With no argument: read `../ds-help/SKILL.md` (sibling of this skill's folder), follow it, and stop. Never start a component whose kit page is not at the ready marker.

Tier 1 findings from a run go to the package source (`core/phases/*.md`, `core/rules.md`), never to `references/`, which is regenerated.
