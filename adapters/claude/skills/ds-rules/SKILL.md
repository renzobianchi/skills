---
name: ds-rules
description: "Rules for building components in a shadcn-based design system with a Figma or Paper kit. Fires when editing a file under the namespace in ds.config.json, adding stories, editing a parity or legacy manifest, writing a Code Connect mapping, or answering PR review on that repo. Triggers: shadcn, parity, manifest, kit-first, data-slot, ds.config.json."
---

Read `ds.config.json` at the repo root first; every branch below depends on it. Then apply, in full:

@../../../../core/rules.md

Consult when a symptom looks like a component bug:

@../../../../core/traps.md

If the repo has its own `skills/<system>/SKILL.md` (written in the foundations phase), its project rules add to these and never replace them.
