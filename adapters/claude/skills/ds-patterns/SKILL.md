---
name: ds-patterns
description: "Post-migration phase: inventory reused layouts, name them in the kit, write rules beside them, run the drift test, set up the product knowledge base and living specs."
disable-model-invocation: true
argument-hint: "<inventory|canonize|rules|drift-test|knowledge-base>"
---

Read `${CLAUDE_PLUGIN_ROOT}/core/phases/patterns.md` with the Read tool (it lives in the plugin, outside the repo; grant the permission for the session if asked) and execute the step named by `$ARGUMENTS`.

This phase is a plan that has not been run to completion. On the first run, record every deviation from the written steps as a Tier 1 finding back into `core/phases/patterns.md` in the plugin source.
