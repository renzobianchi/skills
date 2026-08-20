# Medium: Figma (Figma Console with Desktop Bridge, or the official Figma MCP)

Either MCP runs the arena on its own. **Detection order**: probe Figma Console first (`figma_get_status` or any cheap call); if it is installed and the Desktop Bridge responds, use it for the whole run. Otherwise fall back to the official MCP (`figma`). State in the grounding memo which one is driving the run. When both are present, Console drives writes and either may read/verify.

## Candidate separation (both MCPs)

One **Section per candidate**, named `arena/<slug>/<direction>`, all on the same page (create the `Arena <slug>` page if absent, checking for an existing one first to avoid duplicates). The parent creates the sections before the fan out and passes each candidate its section's nodeId.

## Path A: Figma Console (preferred)

Writes via `figma_execute` (Plugin API):

- **NodeIds are stale across sessions**: re-search with `figma_search_components`/`figma_execute` at the start; never reuse IDs from another conversation.
- Kit components first: `figma_search_components`, then instantiate (`figma_instantiate_component`); a candidate that draws rects where the kit has components loses system-rubric points.
- Auto-layout deliberately: explicit hug vs fill on every frame; "hug contents" where "fill container" belonged is the most common layout defect.
- Mandatory validation loop per candidate: create → `figma_take_screenshot` → fix (max 3 iterations) → final screenshot.
- File tokens/variables over loose values: `figma_get_variables` on the frame.

Judge render: `figma_take_screenshot` per section, N images with direction labels.

## Path B: official Figma MCP (fallback)

Reads with `get_design_context` / `get_metadata` / `get_variable_defs`; generates through its design-generation tools where available (the `figma-generate-design` flow). Constraints to respect:

- Generation is coarser than the Plugin API: candidates describe complete sections and regenerate whole, rather than patching nodes incrementally.
- Pull tokens with `get_variable_defs` before generating so candidates cite real variables, not loose values.
- If the available official toolset on this session is read-only (no generation tools), the medium cannot host the fan out: say so and offer to run the arena in code or Paper instead, keeping Figma for verify-by-screenshot only.

Judge render: `get_screenshot` per section, N images with direction labels.

## Verify (both)

The synthesized artifact goes in its own `arena/<slug>/synthesis` section, assembled from real kit components, with a final screenshot against the rubric. If the work targets a design-system kit, also run whatever parity check the repo requires.
