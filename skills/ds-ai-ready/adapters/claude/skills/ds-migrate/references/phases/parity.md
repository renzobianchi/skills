# Phase: parity (the contract)

Runs once to set up, then continuously through the component loop. Output: per-component manifests that state what code owes the kit, generated docs, guards that fail naming the drifted module, and a written definition of what `parity` means.

## 1. One manifest file per component

`manifests.parity/<key>.json` (template in `templates/parity/`). Fields:

- `design`: `{ tool, fileKey, page, componentSet, componentSetId }` for Figma; `{ tool: "paper", projectPath, component }` for Paper.
- `status`: `parity` · `gap-code` · `gap-kit` · `code-only` (deliberately no kit counterpart; not a gap) · `decision-needed` · `kit-ready` · `kit-wip`.
- `axes`: per variant axis, `code` values vs kit values, plus a `note` when reconciled.
- `composeOnly`: kit axes that are composition in code.
- `deviation`: where code departs from upstream and the review that decided it.
- `note`: the per-component decisions. Read before touching the component.

Why per file: a single shared manifest made every component PR edit the same file, so each merge conflicted every other approved PR, and each resolution was a push that dismissed an approval. One file per component cannot conflict with another component's PR. The only shared file left is the namespace index; keep it one export per line, sorted, so concurrent adds land on different lines.

## 2. Generate, then guard

`scripts/ds-manifest.mjs`:

- `docs`: writes `PARITY.md` (sections In parity / Kit-ready / Kit-wip / Gaps, one module per line, sorted, no counts in headings) and `LEGACY-MAP.md` (sections per status, snapshot line derived).
- `check`: validates every manifest file (schema, statuses, references), and when `commitDocs: true`, that the committed docs equal the generated ones. Nonzero exit names the file.

Tests (`templates/tests/`) wrap `check` for the test runner and add: exactly one section per heading (a stale copy from an older branch otherwise ships), every `parity` entry with a kit component has `<key>.figma.tsx` when `codeConnect: true`, every legacy `next` reference exists.

Rule for humans and agents: never edit a generated doc; run `docs`. If two PRs regenerate the same doc and conflict, resolve by running `docs` again, never by hand.

**Done when:** each guard has been seen failing once with the module named.

## 3. Define what "parity" means

Unqualified "parity" reads as total parity. An axis audit only proves the same variants exist; declaring parity from it alone produced real visual gaps (icon glyphs, a whole radius scale) and cost trust. Levels:

1. **Axis**: variant maps match. Cheap; automatable from the design API.
2. **Visual**: per-variant digest (fills and strokes with variables, radii, text styles, icon slots) vs the code's classes, plus computed styles in the browser.
3. **Rubric**: nine axes (layout, typography, color, spacing, shadows, borders, radius, icons, states) graded PASS / MINOR / MODERATE / CRITICAL.

Decide now which level `status: parity` requires and write it into the manifest README. Changing it after forty entries forces a re-audit-or-freeze decision that belongs to the design owner. When declaring parity anywhere, say which level was verified.

## 4. Code Connect *(codeConnect)*

Write `<key>.figma.tsx` when the component reaches `parity` (both sides stable; node ids churn while the kit is restructured, so a big-bang pass is wasted).

- Map a composition axis to JSX: `figma.enum('Type', { Default: <A/>, ... })`, never to an invented prop.
- An axis with no code counterpart goes in a comment, unmapped, so the gap stays visible.
- The parser rejects `flag && <Child />` in `example`; use `figma.boolean('Show X', { true: <Child />, false: undefined })`.
- `npx figma connect parse --dir <namespace>` validates without a token; a `code-connect-publish` workflow publishes on merge to main.
- Accepted asymmetries (`code-only`, a kit-side label that lives inside another component) carry their reason in the manifest `note`; the guard derives exceptions from the data.

The guard exists because a definition-of-done that lived in a status update was checked by nobody: 36 mappings for 55 modules, three gaps shipped the same week.

## 5. Fidelity test

Early, not at the end: the design owner designs a real screen with the kit; an agent reproduces it from the namespace through the design tool's MCP; compare screenshots. This is the metric for the whole migration. Record the result in the RFC as an addendum and repeat at each quarter of the queue.
