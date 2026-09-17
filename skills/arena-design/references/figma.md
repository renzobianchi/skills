# Medium: Figma (Figma Console with Desktop Bridge, or the official Figma MCP)

Either MCP runs the arena on its own. **Detection order**: probe Figma Console first (`figma_get_status` or any cheap call); if it is installed and the Desktop Bridge responds, use it for the whole run. Otherwise fall back to the official MCP (`figma`). State in the grounding memo which one is driving the run. When both are present, Console drives writes and either may read/verify.

## Candidate separation (both MCPs)

One **Section per candidate**, named `arena/<slug>/<direction>`, all on the same page (create the `Arena <slug>` page if absent, checking for an existing one first to avoid duplicates). The parent creates the sections before the fan out and passes each candidate its section's nodeId.

## Canvas contract

The section is the candidate's whole footprint. Every node a candidate creates (frames, screens, rationale text, sticky notes, annotations) is a child of its section: `figma.createFrame()` then `section.appendChild(frame)` in the same `figma_execute` call, never `figma.currentPage.appendChild`. A node dropped on the page reads as nobody's and ends up judged with the wrong direction.

**Note card.** Every note (the rationale, annotations, callouts, the `VERDICT`) is a text node inside its own card: an auto-layout frame with white fill (`#FFFFFF`), a 1px stroke at low contrast (`#E5E5E5` or the file's border token), corner radius 12, padding 24, hug height, and a fixed width around 480 so lines stay readable. The card is named after the note (`rationale`, `VERDICT`) and sits at the top-left of the section, above the screens, so the judge screenshot carries it. Text laid directly on the section gets lost against the section fill.

Orphan sweep, run by the parent right after the fan out and again after Graft: `figma.currentPage.children` filtered to nodes that are not a section named `arena/<slug>/...`. Each orphan is reparented into the section whose direction it belongs to (by its name or the candidate that reported it); an orphan nobody claims goes into `arena/<slug>/unsorted`, never deleted. The sweep is closed when the page's top-level children are exactly N direction sections plus, after Verify, the synthesis section.

Synthesis is marked so it never reads as one more direction: section `arena/<slug>/synthesis`, placed one section-width to the right of the last direction, with a white section fill (`section.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}]`, `#FFFFFF`) and a `VERDICT` note card at its top-left stating base, grafts with source, and the judge's scores. Direction sections keep the default fill, so the white one reads as the verdict at a glance.

**Layout sweep**, run by the parent in Verify after the orphan sweep, in one `figma_execute`:

1. For every `arena/<slug>/...` section, every child's `absoluteBoundingBox` lies fully inside the section's own box; a child that spills out is moved back in.
2. Inside each section, the children's boxes are compared pairwise; two that intersect are re-laid out in a row or a column with a gap of at least 80, note card first, then screens in the candidate's order.
3. The sections themselves are compared pairwise the same way; two that intersect are pushed apart along x, keeping the synthesis section last on the right.

Fix, then run the sweep again; it is closed when a pass finds no spill and no intersection, and a final `figma_take_screenshot` of the page confirms it.

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

The synthesized artifact goes in the marked `arena/<slug>/synthesis` section (Canvas contract), assembled from real kit components, with a final screenshot against the rubric. Run the orphan sweep once more, then the layout sweep; Verify is closed only when the page's top level is exactly the N direction sections plus synthesis and the layout sweep finds nothing. If the work targets a design-system kit, also run whatever parity check the repo requires.
