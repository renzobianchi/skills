# Medium: Paper (MCP)

Running the arena in a Paper file via the Paper MCP (`paper-desktop`).

## Candidate separation

One **artboard per candidate**, named `arena/<slug>/<direction>`, laid out in a row on the canvas with `update_styles` (`left`/`top`). The parent creates the N empty artboards BEFORE the fan out and passes each candidate its artboard's nodeId; candidates write only inside their own.

## Canvas contract

The artboard is the candidate's whole footprint. Every `write_html` targets the candidate's artboard as parent (verify with `get_children` after each write, because of the flattening gotcha below). Nothing is written to the canvas root.

**Note card.** Every note (the rationale, annotations, callouts, the `VERDICT`) is written as a card with its text inside, in one `write_html`: `<div style="background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;padding:24px;width:480px"><p>…</p></div>`. Writing the container together with its text also sidesteps the empty-div gotcha below. The card is named after the note (`rationale`, `VERDICT`) with `rename_nodes` and sits at the top of the artboard, above the screens, so a canvas screenshot carries it. Text laid directly on the artboard gets lost against its background.

Orphan sweep, run by the parent right after the fan out and again after Graft: `get_children` on the root, filtered to nodes that are not an artboard named `arena/<slug>/...`. Each orphan is reparented with `move_nodes` into the artboard of the direction it belongs to; one nobody claims goes into a new artboard `arena/<slug>/unsorted`, never deleted. The sweep is closed when the root's children are exactly N direction artboards plus, after Verify, the synthesis artboard.

Synthesis is marked so it never reads as one more direction: artboard `arena/<slug>/synthesis`, placed two artboard-widths to the right of the last direction, with a white background (`update_styles` with `background: #FFFFFF`) and a `VERDICT` note card at its top stating base, grafts with source, and the judge's scores. Direction artboards keep the default background, so the white one reads as the verdict at a glance.

**Layout sweep**, run by the parent in Verify after the orphan sweep, from `get_children` on the root and on each artboard (`left`, `top`, `width`, `height`):

1. For every `arena/<slug>/...` artboard, every child lies fully inside the artboard's box; a child that spills out is moved back in with `update_styles`.
2. Inside each artboard, the children's boxes are compared pairwise; two that intersect are re-laid out in a column with a gap of at least 80, note card first, then screens in the candidate's order.
3. The artboards themselves are compared pairwise the same way; two that intersect are pushed apart along `left`, keeping the synthesis artboard last on the right.

Fix, then run the sweep again; it is closed when a pass finds no spill and no intersection, and a final canvas screenshot confirms it. Batch the moves into one `update_styles` call per artboard, because of the quota.

## Writing (known Paper gotchas)

- Paper **flattens single-child wrappers**: the div gets hoisted and the returned IDs do NOT follow HTML order. Verify the real parent with `get_children` before each chained `write_html`.
- An empty `<div>` is created as a `Rectangle` and **accepts no children**: always write the container together with at least one child.
- Text nodes are single-style: an inline `<span>` gets flattened; for partial styling, split the paragraph into nodes.
- `repeating-linear-gradient` does not tile (renders smooth). `radial-gradient` + `background-size` and `mask-image` do work.
- Remote images by URL work (`<img src="https://...">`).
- Signatures: `update_styles({updates:[{nodeIds, styles}]})`, `set_text_content({updates:[{nodeId, textContent}]})`, `rename_nodes({updates:[{nodeId, name}]})`. `move_nodes` is reparenting only; moving artboards = `update_styles` with `left`/`top`.
- **Weekly MCP call quota**: batch large writes (one `write_html` per candidate, not twenty small ones). If the quota runs out mid-arena, leave the remaining work specified in `.context/` and say so.

## Rendering for the judge

Screenshot of the canvas with the N artboards in a row (or a per-artboard export when the MCP exposes one). The judge receives the image, not the HTML.

## Verify

The synthesized artifact is built on the marked `arena/<slug>/synthesis` artboard (Canvas contract); candidates remain as the exploration record. Run the orphan sweep once more, then the layout sweep; Verify is closed only when the root holds exactly the N direction artboards plus synthesis and the layout sweep finds nothing.
