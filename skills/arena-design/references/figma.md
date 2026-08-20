# Medium: Figma (official MCP + Figma Console with Desktop Bridge)

Two MCPs with distinct roles: the **official** one (`figma`) reads (get_design_context, get_screenshot, get_variable_defs); **Figma Console** (`figma-console`) writes via `figma_execute` (Plugin API) with Desktop Bridge. The arena writes with Console and reads/verifies with either.

## Candidate separation

One **Section per candidate**, named `arena/<slug>/<direction>`, all on the same page (create the `Arena <slug>` page if absent: `figma.root.children.find(p => p.name === ...)` before creating, to avoid duplicates). The parent creates the sections before the fan out and passes each candidate its section's nodeId.

## Writing (Figma Console rules)

- **NodeIds are stale across sessions**: re-search with `figma_search_components`/`figma_execute` at the start; never reuse IDs from another conversation.
- Kit components first: `figma_search_components`, then instantiate (`figma_instantiate_component`); a candidate that draws rects where the kit has components loses system-rubric points.
- Auto-layout deliberately: explicit hug vs fill on every frame; "hug contents" where "fill container" belonged is the most common layout defect.
- Mandatory validation loop per candidate: create → `figma_take_screenshot` → fix (max 3 iterations) → final screenshot.
- File tokens/variables over loose values: `figma_get_variables` / `get_variable_defs` on the frame.

## Rendering for the judge

`figma_take_screenshot` per section (or the official MCP's `get_screenshot`). The judge receives the N images with their direction labels.

## Verify

The synthesized artifact goes in its own `arena/<slug>/synthesis` section, assembled from real kit components, with a final screenshot against the rubric. If the work targets a design-system kit, also run whatever parity check the repo requires.
