# Component rules

Rules for every component in the new namespace. Each carries the failure it prevents, so an uncovered case is decided by extending the reasoning. Project specifics (paths, primitive library, reviewers, tool flags) come from `ds.config.json`; read it first.

## Route by path

- File under `namespace` (default `src/next/`): these rules. Legacy conventions (CSS-in-JS macros, Radix, old token names) do not exist here.
- File under `legacyPath`: bug-fix only. Legacy is frozen from the moment the component rollout starts.

## Hard rules

1. **Build visuals with the live kit open, every time.** A written spec carries parts and decisions; shape is read only from the canvas. A component built from the spec alone with the design bridge disconnected came out structurally wrong (a bordered box where the kit was a muted tray holding an inset card) with every listed part present. If the bridge is down (`designTool: figma` → MCP status probe; `designTool: paper` → the Paper project open), stop and ask; the rewrite costs more than the wait.

2. **One kit variant axis = one union prop.** Mutually exclusive variants (`Type = Simple | CLI | Editor`) become `type: 'simple' | 'cli' | 'editor'`. Two booleans make a combination the design does not have representable, and a caller will ship it.

3. **Kit "Show X" boolean layers become composition.** A canvas cannot omit a layer; code omits the child. Incorrect: `<Block showHeader={false} />`. Correct: `<Block><Body /></Block>`.

4. **Raw Tailwind with `cn()`, theme tokens only.** Every color, radius and spacing resolves to a `theme.css` token: the kit binds `base/card`, code writes `bg-card`, and the shared name is what keeps dark mode and theming free. Hex lives in `theme.css` and nowhere else; a `var(--x, #fallback)` is a token that can silently stop being one, so tokens are written without fallbacks.

5. **Resolve every token in both modes before accepting it.** `background`/`card`, `accent`/`muted`, `secondary`/`muted` are equal in light and different in dark; the wrong pick is invisible until dark. A surface that reads as a card is `bg-card`.

6. **New Tailwind class ⇒ recompile the namespace CSS.** If the stylesheet compiles once at Storybook start, a class written afterward does not exist and the element renders unstyled, masquerading as a component bug. Verify: `grep -c '<class>' <generated css>`; zero means absent.

7. **State selectors belong to the primitive library in `ds.config.json`.** Under Base UI, Radix's `data-[state=open]` matches nothing; use `data-open`, `data-closed`, `data-pressed`, `data-starting-style`, `data-ending-style`. Before declaring a selector dead, check who renders the attribute: a consumer-spread `data-invalid={true}` is alive. Grep per component before the PR: `grep -rn "data-\[state=\|data-\[motion" <namespace>` returns zero.

8. **Requalify utilities the base layer guards.** With `[data-slot] { font-family: sans }` in `theme.css`, plain `font-mono` loses by source order. Incorrect: `<div data-slot="x" className="font-mono">`. Correct: `data-[slot=x]:font-mono`, on every slotted mono element.

9. **`React.forwardRef` on every part a consumer could compose or pass a ref to** while the library ships to React 18. The ref drops silently: the component renders, the downstream behavior (tooltip opening, popup anchoring) disappears. The test is not "does it use the primitive library inside" but "could a consumer wrap it in a trigger". Tag every shim "remove on the React 19 upgrade".

10. **Motion: `motion-safe:` on the animation itself**, transform and opacity only, `ease-out` for user-initiated enters, paired elements share duration and easing. `motion-reduce:animate-none` loses by source order to a `data-*` variant animation. Measure the cycle (close, reopen), never the resting state.

11. **Icon-only controls get `aria-label` before the props spread.** Upstream registries do not name icon buttons; the accessibility gate fails per story. Scroll containers get `tabIndex={0}`, `role="region"`, a label. Repeated landmarks get distinct labels. A Select's visible value is not its name.

12. **Truncation in fixed-height rows:** `truncate` on the cell as the safety net plus `<span className="truncate">` around the value. `truncate` on a flex container does not ellipsize bare text, and the anonymous item never yields width. If a story needs a hand-added class to look right, the component is missing it.

13. **Header actions:** constant meaning → icon-only with tooltip (copy, download); meaning that inverts with state → visible label (`Show all` ↔ `Show less`), because touch has no hover. A leading glyph flips with the label or contradicts it.

14. **Page shell is a grid row, never a viewport subtraction.** Incorrect: `h-[calc(100vh-81px)]`. Correct: `grid h-dvh grid-rows-[auto_1fr]` with `<main className="overflow-y-auto">`.

15. **Code-highlighting themes are chosen by measured contrast against your backgrounds**, scoped to the component (`[data-slot=code-block-pre]`, `data-language`), never by taste and never with a global `language-*` class a legacy stylesheet also matches.

16. **Manifest edits go to the component's own file** (`manifests.parity/<key>.json`), by targeted string replacement. Generated docs (`PARITY.md`, `LEGACY-MAP.md`) are regenerated with `node scripts/ds-manifest.mjs docs`; a hand edit is overwritten by the next run and fails `check` until then.

17. **Read the usage doc before composing with a namespace component; write it before declaring parity.** `manifests.usage/<key>.md` is the caller's contract (when, which variant, what to compose, the owner's warnings); the manifest is the builder's. A screen built from prop names alone picks the variant that compiles, not the one the product means. When the usage doc and the code disagree, fix the doc in the same PR; a stale contract is the one agents follow with confidence.

## Build procedure (kit-first)

1. Read `manifests.parity/<key>.json` (the `note` carries the decisions) and the tracker issue if `tracker != none`.
2. Audit the live set. Figma: analyze the component set, walk the tree resolving tokens (fills, strokes, radii, padding, text styles), and read `textTruncation` and `maxLines` on every TEXT node by name (the tree walk omits them). Paper: open the component, read every property and the applied tokens, export one image per variant. Record measurements in the PR description draft; do not eyeball.
3. Core component: `npx shadcn add <name>` then adapt, keeping the file diffable. Composite: compose from namespace parts. Zero raw `<button>`/`<select>`.
4. Verify computed styles in the running Storybook, light and dark: fonts, colors, row heights, scroll behavior, every state via its story (never a scripted `click()`).
5. Update the component's manifest file to `parity` only after step 4 matches per axis; write the usage doc (`phases/component.md`, step 5); run the generator; run the guards.

**Done when:** every recorded measurement matches in both modes in the browser.

## Confidence gate

Score each decision. High confidence: decide silently, record in the manifest `note`. Low confidence: bring the design owner a tradeoff in design language ("the primitive's Menu gives keyboard navigation free but has no nested submenus; a custom part covers them and puts a11y on us. Which?"), never a technical question ("should I use the primitive's Menu?"). Bringing every decision equals bringing none.

## Budgets

- Visual match: 5 iterations max. An iteration that moves no recorded measurement ends the loop; report the delta.
- Same failure twice: stop. The model of the problem is wrong.
- a11y P1: 3 attempts, then leave it red and say so. A finding downgraded to green a check is worse than a red check.
- A fix that breaks a passing measurement is reverted, never layered on.

## Pre-flight (before "ready for review")

- [ ] Kit audit against the live set; computed styles verified, light and dark
- [ ] CSS recompiled after the last new class; greps > 0
- [ ] Type check and lint clean on touched files
- [ ] a11y gate items (rule 11); inputs in stories carry `aria-label` in meta `args` (a placeholder is not a label)
- [ ] Stories demonstrate behavior for real (an overflow story overflows; every state has a story)
- [ ] Dead-selector grep zero; console free of ref warnings across stories
- [ ] `codeConnect: true` → `<key>.figma.tsx` written and `npx figma connect parse --dir <namespace>` passes
- [ ] Manifest file updated; usage doc filled, Owner notes answered; generator run; guards green
- [ ] Every commit passes commitlint locally; subject starts with `commitSubjectPrefix`
- [ ] Self-review pass on the diff (see `phases/component.md`, step 7)
- [ ] Design-owner preview in Storybook, handed off with the hand-off list

## Hand-off list (what no gate reaches)

Deliver with the preview, every time: screen-reader announcement; hover with a real pointer; whether motion feels right; 2x pixel check on custom indicators; detached frames in the kit (customization or drift?); anything the kit visuals do not disambiguate (single vs multi select).

## Closing: classify every finding

- Tier 1, the agent needed a rule: into this file if it generalizes, into the manifest `note` if not.
- Tier 2, a tooling gap: into the tracker as an issue. This is the tier teams lose.
- Tier 3, resists automation: onto the hand-off list, never into a rule.
