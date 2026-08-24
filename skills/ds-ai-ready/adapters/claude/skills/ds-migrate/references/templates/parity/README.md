# Parity manifests

One file per module in the new namespace, named by the module key (`button.json`, `alert-dialog.json`). A component PR edits **only its own file**; that is what keeps approved PRs mergeable after another merges.

`status` values: `parity` · `gap-code` · `gap-kit` · `code-only` · `decision-needed` · `kit-ready` · `kit-wip`.

`parity` means level ___ (fill in: axis / visual / rubric; see `phases/parity.md` §3). Say the level whenever you declare parity elsewhere.

`design.tool` is `figma` (fields: `fileKey`, `page`, `componentSet`, `componentSetId`) or `paper` (fields: `projectPath`, `component`).

State axes (Hover/Focus/Pressed/Disabled) are excluded; Loading is included as a capability.

`deviation` is one line per standing divergence from upstream or from the kit; the generator renders it under Deviations in the parity doc, so it never needs a hand edit there.

Edit with targeted string replacement; never round-trip through a formatter. Regenerate docs with `node scripts/ds-manifest.mjs docs`; validate with `check`.
