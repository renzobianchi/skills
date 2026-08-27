# Medium: Paper (MCP)

Running the arena in a Paper file via the Paper MCP (`paper-desktop`).

## Candidate separation

One **artboard per candidate**, named `arena/<slug>/<direction>`, laid out in a row on the canvas with `update_styles` (`left`/`top`). The parent creates the N empty artboards BEFORE the fan out and passes each candidate its artboard's nodeId; candidates write only inside their own.

## Canvas contract

The artboard is the candidate's whole footprint. Every `write_html` targets the candidate's artboard as parent (verify with `get_children` after each write, because of the flattening gotcha below); the rationale is a text block at the top of the artboard, above the screens, so a canvas screenshot carries it. Nothing is written to the canvas root.

Orphan sweep, run by the parent right after the fan out and again after Graft: `get_children` on the root, filtered to nodes that are not an artboard named `arena/<slug>/...`. Each orphan is reparented with `move_nodes` into the artboard of the direction it belongs to; one nobody claims goes into a new artboard `arena/<slug>/unsorted`, never deleted. The sweep is closed when the root's children are exactly N direction artboards plus, after Verify, the synthesis artboard.

Synthesis is marked so it never reads as one more direction: artboard `arena/<slug>/synthesis`, placed two artboard-widths to the right of the last direction, with a distinct background and a text block `VERDICT` at its top stating base, grafts with source, and the judge's scores.

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

The synthesized artifact is built on the marked `arena/<slug>/synthesis` artboard (Canvas contract); candidates remain as the exploration record. Run the orphan sweep once more; Verify is closed only when the root holds exactly the N direction artboards plus synthesis.
