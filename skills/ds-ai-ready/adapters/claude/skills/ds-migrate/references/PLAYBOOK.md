# Migrating a design system to shadcn, AI-ready

A playbook for taking an existing component library (or none) to a shadcn-based design system that agents can build with reliably. Written for the person driving the migration and for the agent working beside them: the steps are in order, each ends on a completion criterion, and the reference sections are consulted on demand.

Every rule here was paid for once. Where a rule looks strict, the strictness is the receipt.

## How to read this

- **Steps** are numbered and end on a criterion that tells you done from not-done.
- **Reference** sections (manifest schemas, trap catalog, skill template) sit at the end; the steps point at them when a branch needs them.
- Terms in *italics* on first use are **leading words**: compact concepts the whole document reuses. Learn them once.

The leading words: *kit-first*, *manifest*, *parity*, *guard*, *one-per-PR*, *pre-flight*, *hand-off list*, *budget*, *tier*, *vocabulary*, *drift test*, *living spec*, *surface*, *second consumer*.

---

## 0. The thesis

"AI-ready" is not a property of components. It is a property of the whole loop: what agents can find, what they can verify, and what stops them from inventing.

Four ideas carry the playbook:

1. **Build on the base models already know.** shadcn is the most-seen component code in any model's training data. A component that is a diffable adaptation of a shadcn source is one an agent can read, extend, and fix without a manual. A generator-produced or bespoke component is not, however good it is. Any tool that would replace diffable shadcn sources with generated output is trading the one asset that makes the system AI-ready for a feature.
2. **Close the token set.** Tailwind v4's `@theme` makes a utility exist only if its token exists. An agent cannot type `bg-blue-500` into a closed system and have it work; it has to use `bg-primary`, which is what the kit binds. Enforcement for free.
3. **Record decisions as text in the repository.** Design decisions that live in heads, Slack threads, or a kickoff deck are invisible to an agent and decay for humans. A decision written beside the code it governs is inherited by every builder, human or agent, on every run. (Futurice, "Spec-driven design": the bottleneck moved from writing code to articulating intent; unwritten rationale is *intent debt*.)
4. **Name the recurring decisions.** A component library gives parts. A design system gives names for decisions the team should not reopen: `Overview`, `PageHeader with no actions`, `SettingsFrame`. An agent can follow a name into the code, the guidance beside it, and the shipped examples, then assemble a screen the team evaluates instead of drafts. (Rothenberg, "Speaking design at scale".) Components come first because names need something to point at; the vocabulary layer is the phase after the component queue drains.

The rest of this document is the machinery for those four ideas.

---

## 1. Phase 0: triage before touching anything

**Goal:** know what the legacy library is actually used for, so the migration scope comes from evidence and not from the component list.

### Step 1.1 Scan every consumer

Find every codebase that depends on the package (org-wide code search for the package name in `package.json`, then every named import). Count **importing files per component per consumer**. Files, not render sites: the number you want is "how many places break if this export disappears".

Expect surprises. A consumer nobody listed will turn up (an internal GUI, a marketing site pinned to an old version). Every one changes canary planning.

**Done when:** a `TRIAGE.md` exists with a table of consumers (ref, date, importing-file count, pinned version) and a per-component usage table across all of them.

### Step 1.2 Bucket the components

From the counts, four buckets:

| Bucket | Rule | Action |
|---|---|---|
| **Dead** | zero imports in every consumer | delete, no replacement |
| **Near-dead** | 1–2 importing files total | absorb at the call site during that page's migration; no module |
| **Alive** | including "suspects" the plan wanted to delete | migrate |
| **Heavy hitters** | top of the funnel by imports | these set priority and canary order |

Two categories always need an explicit decision rather than a component: **utility-ish components absent from shadcn** (a `Grid`, a date-formatting wrapper). Decide "dies by recipe" (plain Tailwind classes, documented find/replace) or "kept as-is".

**Done when:** every legacy export sits in exactly one bucket and the heavy-hitter order is written down.

### Step 1.3 Write the legacy map

A machine-readable `legacy-map.json` keyed by **exported name** (the unit consumers import), with a derived human `LEGACY-MAP.md`. Statuses:

- `replaced`: a new module is the successor; `next` names it.
- `absorbed`: no module; composed from new parts or inlined at the call site.
- `deprecated`: will not migrate, no replacement (may still have call sites; each notes how they get rewritten).
- `kept`: survives unchanged.
- `undecided`: a proposal lives in `note` and `proposedNext`; nothing is decided.

Full schema in [Appendix A](#appendix-a-manifests).

Resolve `undecided` entries **in batches with the design owner**, each batch a commit. Defaults taken while waiting are fine as long as they are labeled reversible and confirmed later.

**Done when:** the map exists, its guard test passes (every export has an entry, statuses are valid, every `next` reference exists in the parity manifest), and the undecided count is on a downward path with named owners.

### Step 1.4 Decide the token strategy: freeze, don't migrate

If the legacy library has a token pipeline (Tokens Studio, Style Dictionary), retiring it is a project only if you migrate it. Instead:

1. One final sync and build. Verify the output is **byte-identical** to the last release.
2. Promote the generated artifacts to committed source. They stop being build output.
3. Legacy tokens become bug-fix-only, edited by hand under review, snapshot-gated.
4. All new styling goes to the new namespace's `theme.css` only.
5. A CI checksum on the frozen files, so a drive-by regeneration cannot reach consumers.
6. The frozen files die with the legacy components in cleanup. Retirement finishes itself.

Why not the alternatives: pointing the designer sync tool at the new `theme.css` wires sync risk into the one file that must stay boring; a hybrid is two sources of truth during the exact period you are converging to one.

**Done when:** the freeze PR is merged with the byte-identical diff attached, and the tool is disconnected.

---

## 2. Phase 1: foundations

**Goal:** a new namespace that coexists with legacy, is shadcn-diffable, Tailwind v4-native, and ships compiled CSS so consumers need no toolchain.

### Step 2.1 Sequence the plan correctly

The naive order is "upgrade Tailwind first". It fails when the legacy styling toolchain (twin.macro, CSS-in-JS macros) has no v4 path: the repo-wide `tailwindcss` dependency cannot flip until every legacy file is gone. The order that works:

1. shadcn scaffolding plus seed components
2. tokens live from day one (below)
3. component-by-component rollout
4. cleanup: delete legacy components, the old styling toolchain, the old token pipeline
5. Tailwind toolchain consolidation and `1.0.0`

Consumer apps that consume **precompiled CSS artifacts** can upgrade their own Tailwind at any time, decoupled from the library.

**Done when:** the plan is written as an RFC with the order above and the reasons. Later corrections go in as dated **addenda** to the same RFC, never as edits that erase the original reasoning.

### Step 2.2 Scaffold the namespace

- `src/next/` (or equivalent) with `components.json` pointing `css` at `src/next/theme.css` and aliases into the namespace. Pick the **primitive library shadcn currently defaults to** (Base UI as of mid-2026; Radix remains supported). Mixing is a migration of its own; choose once.
- A **dual toolchain** during transition: the new namespace compiled by the standalone Tailwind v4 CLI (install v4 under an npm alias so two majors coexist), legacy untouched on its old version.
- Compiled CSS ships as a package artifact (`next.css`). Consumers import it; no Tailwind required on their side.
- Storybook imports the same compiled file. A `preview` decorator scopes the new font and dark-mode wrapper classes to the new namespace's stories only, so legacy stories keep byte-identical DOM for visual regression.
- Utilities compile **unlayered** if legacy preflight is unlayered: a layered rule loses to an unlayered one (symptom: buttons render transparent).
- ESLint overrides for the namespace so sources stay **diffable against upstream**. Every local lint preference you impose on a shadcn file is a line you will re-apply on every upstream refresh.

**Done when:** one seed component renders in Storybook from the new namespace, in light and dark, with zero legacy imports.

### Step 2.3 Tokens: stock neutral plus brand overlay

Seed from shadcn's canonical neutral token set and overlay only the brand: primary (light and dark), ring, fonts. Because the token **names** are shadcn's own, every `npx shadcn add` pastes in with zero remap, and every agent already knows the names.

Rules that follow:

- **Design binds the same names.** The kit's variables are `base/foreground`, `base/card`; code writes `text-foreground`, `bg-card`. That shared naming is what makes dark mode and future theming free.
- No raw hex outside `theme.css`. No `var(--x, #fallback)` fallbacks (a fallback is a token that can silently stop being one).
- **Some tokens only diverge in dark.** `background` and `card` are both white in light and different surfaces in dark; `accent`/`muted`, `secondary`/`muted` behave the same way. Choosing the wrong one is invisible in light. Before accepting a token, resolve its value in both modes.

**Done when:** `theme.css` is the single place a color literal appears, and a grep for hex across the namespace returns only that file.

### Step 2.4 Know the runtime constraint you are carrying

If the library publishes to consumers on React 18 while the registry assumes React 19 (`ref` as an ordinary prop), **every part that the primitive library composes needs `React.forwardRef`** or the ref drops silently. The failure is invisible: the component renders and looks right; what disappears is downstream behavior (a tooltip that never opens, a popup anchored to the wrong element).

The criterion is not "does it use the primitive library inside" but "**could a consumer compose it with the primitive library or pass it a ref**". A plain `<code>` element fails that test the day someone wraps it in a tooltip trigger. Shim every part, tag each shim with the same comment ("remove on the React 19 upgrade") so they leave together, and keep the upgrade as its own track with its own RFC addendum written **at the end** of the migration.

**Done when:** the constraint is written in the parity document as a standing deviation from the registry, and a console-warning probe over the stories runs in CI or in pre-flight.

---

## 3. Phase 2: the kit

**Goal:** a Figma kit that is the design surface for the post-migration world, never mixed with legacy, with a lifecycle the manifest can mirror.

### Step 3.1 Start from a shadcn kit, split off what you do not own

Start from a shadcn-based Figma kit and rebrand it. Move the generic blocks (vendor "Pro Blocks", "Official Blocks") to a **separate file** subscribed to the kit's library; they are references, not your design system, and they dominate file weight. Verify the split by node count and by exporting the same block from both files and hashing the PNG.

**Done when:** the kit holds only components you intend to own, and a named version marks the split.

### Step 3.2 Governance: who owns what

The rule that reconciles "design governs" with "stay diffable against shadcn":

- **The kit owns WHAT exists and what it can do**: catalog, variants, capabilities. A new variant axis is added in the kit, bound to the same tokens code ships, documented at the deviation site.
- **The registry owns HOW core primitives are built**: file structure, slots, accessibility. Core stays diffable.
- **Composites are built FROM core parts per the kit's anatomy**, never by modifying core.
- **Sequencing falls out of dependencies**: a composite is authored in the kit only from core components already in parity. No upfront ordering needed.

**Done when:** the rule is in the RFC and both the design owner and the engineering reviewers have agreed to it in writing.

### Step 3.3 Page markers: the lifecycle the manifest mirrors

Every kit page carries a marker. It runs one way:

| Marker | Meaning | Manifest status |
|---|---|---|
| 🟡 | the kit still owes the design | `kit-wip` |
| 🟢 | design done, ready to build (the green light) | `kit-ready` |
| 🔄 | built, merged, kit and code agree (the finish line) | `parity` |

🔄 looks like a spinner and means the opposite. Code starts on 🟢 and ends on 🔄. The design owner flips the marker; **code never moves a marker, it moves the manifest to match one.**

Authority is split, and knowing which side wins avoids the argument: the marker decides whether something **exists**; the manifest decides what **code owes it**. When they disagree about existence, the manifest is wrong.

A component found in the kit without a manifest row **gets its row in the same turn it is found**, including 🟡 pages. Deferring the row to "the build PR" is how the manifest lags the kit and stops answering the one question it exists for.

**Done when:** every kit page has a marker and every marker has a manifest row.

### Step 3.4 Kit hygiene that code will inherit

- **One variant axis per mutually exclusive choice.** If the kit models "line numbers" and "CLI prompt" as `Type = Simple | CLI | Code Editor`, code gets one `type` prop. Two independent booleans make a combination the design does not have representable, and a caller will ship it.
- **"Show X" boolean layers are canvas artifacts.** A canvas cannot omit a layer; code omits the child. They become composition (`<Block><Body/></Block>`), never `showHeader` props.
- **State axes** (Hover/Focus/Pressed/Disabled) are CSS states, excluded from parity. Loading is the exception: it is a capability.
- Component set descriptions carry constraints code must honor; the manifest note points at them.
- **Instances inherit modes from their own position in the tree, not from the main component.** Setting a density mode on the set does not protect instances. Unbind what must not vary and rename layers so nobody rebinds them.
- Measuring a hidden node in auto-layout returns stale geometry: show, measure, hide.
- Flipping a collection mode to diagnose resizes frames and blows away bindings; test modes on a throwaway instance, never on the set.

---

## 4. Phase 3: the parity contract

**Goal:** a single machine-readable statement of what code owes the kit, guarded so it cannot drift silently, with the level of "parity" explicitly defined.

### Step 4.1 The manifest

One manifest **file per module** (`parity/<key>.json`), never one shared JSON. Fields: Figma page and component set ids, `status`, `axes` (code values vs kit values per variant axis, with a note when they were reconciled), `composeOnly` (kit axes that are composition in code), `deviation` (where code departs from upstream and why), `note` (the per-component decisions). Schema in [Appendix A](#appendix-a-manifests).

Statuses: `parity` · `gap-code` (code must add) · `gap-kit` (design must add) · `code-only` (deliberately no kit counterpart; not a gap) · `decision-needed` · `kit-ready` · `kit-wip`.

Why per file, and the rule that came out of the most expensive lesson of the whole migration: with one shared `parity.json`, every component PR edited the same file, so each merge conflicted every other approved PR, and each conflict resolution was a push that dismissed an approval. A seven-component queue cost seven re-reviews. One file per component cannot conflict with another component's PR. The legacy map follows the same layout (`legacy/<Export>.json`), and the namespace index stays one export per line, sorted, so concurrent adds land on different lines. Check the branch-protection setting "dismiss stale approvals" on day one; if it is on, any push (a merge from main included) kills the approval, and you want to know that before PR five.

Three mechanical rules:

- **Edit with targeted string replacement, never a JSON round-trip.** A reformat turns a one-note change into a hundred-line diff.
- **Manifest changes travel with the component, in the same PR:** the component's manifest file, the affected legacy files, the regenerated docs.
- **Docs are generated, never edited.** `node scripts/ds-manifest.mjs docs` writes `PARITY.md` and `LEGACY-MAP.md`; `check` fails when the committed copy is stale. A conflict on a generated doc is resolved by regenerating, never by hand.

**Done when:** the manifest exists, every module has a row, and the human `PARITY.md` declares "when they disagree, the JSON wins".

### Step 4.2 Derive, then guard

Anything a human copies by hand from the manifest into a document goes stale within three merges. So:

- The human doc's lists (in parity, kit-ready, kit-wip) are **derived** from the manifest and **guarded** by a test that fails naming the module that drifted.
- Lists are **one module per line, sorted, no count in the heading**. Two concurrent PRs then add lines in different slots and git merges them without help. A wrapped paragraph with "(N of M)" makes every component PR collide, and every conflict resolution is a push that dismisses an approval.
- Guard against **duplicate sections** too: a branch written before a format change leaves both copies in the file and every other assertion still passes.
- The legacy-map guard: every export has an entry, no orphan entries, valid statuses, `next` non-empty iff `replaced`, every reference exists in the parity manifest, snapshot line matches.
- The Code Connect guard (below).

A guard you have never seen fail is not a guard. Break it deliberately once.

**Done when:** `npm test` runs every guard and a deliberate break of each one turns red with the offending module named.

### Step 4.3 Define what "parity" means, by level

"Parity" unqualified reads as total parity. An axis audit (variant props vs component property definitions) only proves the same variants **exist**, not that they look the same. Declaring parity from an axis audit alone produced real visual gaps (icon glyphs, radius scale, description styles) and cost trust.

Levels:

1. **Axis parity**: variant maps match. Necessary, cheap, automatable from the REST API.
2. **Visual parity**: per-variant digest through the plugin bridge (fills and strokes with their variables, radii, text styles, visible icon slots) compared against the code's classes, plus computed styles in the browser.
3. **The rubric**: nine axes (layout, typography, color, spacing, shadows, borders, radius, icons, states) graded PASS / MINOR / MODERATE / CRITICAL. This is the operational definition `status: "parity"` needs. Decide early whether it is the bar from day one; redefining it after forty entries forces a re-audit-or-freeze decision that belongs to the design owner.

When you declare parity, **say which level you verified**.

**Done when:** the manifest comment states which level `parity` means and the rubric is written down, even if it is applied gradually.

### Step 4.4 Code Connect per component, guarded (Figma only, optional)

Skip this step when the design tool is Paper or the project opts out (`codeConnect: false`); the guard is then not installed. Otherwise, one `<component>.figma.tsx` per module mapping kit properties to code props, written **when the component reaches parity** (both sides stable; node ids churn while the kit is being restructured, so a big-bang mapping pass is wasted work).

Rules:

- Map a composition axis to JSX (`figma.enum('Type', { Default: <A/>, ... })`), never to an invented prop.
- An axis with no code counterpart goes in a comment, unmapped, so the parity gap stays visible.
- The parser rejects `flag && <Child />` inside `example`; the conditional belongs in `figma.boolean('Show X', { true: <Child />, false: undefined })`.
- `npx figma connect parse --dir src/next` validates without a token; run it in pre-flight.
- **Guard it**: a test that fails per component when an entry is `parity`, names a kit component, and has no `.figma.tsx`. Derive the rule from the manifest so deliberate exceptions (`code-only`, accepted asymmetries) fall out of the data. A definition-of-done that lives in a status update and is checked by nobody reopens silently: an audit found 36 mappings for 55 modules, three of the gaps shipped that same week.

**Done when:** the guard exists and passes, and the accepted exceptions each carry their reason in the manifest note.

---

### Step 4.5 Usage docs: the caller's contract, per component

The manifest tells a builder what the component is; nothing so far tells a caller when to reach for it. An agent composing a screen from prop names picks the variant that compiles. So every component at `parity` carries `usage/<key>.md`, next to the manifests, one file per component so it inherits the no-conflict property of Step 4.1.

Sections, in this order: Use when · Use something else when (the boundary with the nearest component; the most valuable lines in the file) · Variants (each axis value mapped to an intent) · Composition (each `composeOnly` entry mapped to the child that renders it) · Decisions (from the manifest note) · Owner notes.

Sources, in order of authority: the registry's docs page for a core component (shadcn documents usage and examples per component, and the kit was built from that registry); the parts' usage docs for a composite; the call-site audit from triage for what the product actually does with it; then the design owner, asked one question: what do callers get wrong with this component, and what do they ask for that it should refuse? Their sentences go in verbatim under Owner notes. The owner's perspective is the part no registry has and the reason the file exists in the repo rather than as a link to the docs.

Scaffolded, never retyped: `scripts/ds-manifest.mjs usage <key>` writes the skeleton from the manifest with `<fill>` markers; `check` fails while a marker survives or the file is missing for a `parity` component. Kept honest the same way as the manifest: a change to an axis changes the usage doc in the same PR, and a caller who finds the doc and the code disagreeing fixes the doc first, because a stale contract is the one agents follow with confidence.

## 5. Phase 4: the component loop, one-per-PR

**Goal:** drain the `kit-ready` queue, one component per branch and PR, each landing with stories, manifest updates, and Code Connect, through normal review, without breaking the release pipeline.

This loop starts as soon as two or three components are `kit-ready`. It does not wait for the kit to finish.

### Step 5.1 Definition of Ready

A component enters the code queue when:

- its kit page is 🟢 and its manifest row is `kit-ready`;
- its dependencies (the core parts a composite composes) are `parity`;
- the manifest note carries the decisions already taken (composition model, accepted asymmetries, deviations from upstream);
- the design owner has answered the low-confidence questions (below).

**Done when:** an issue exists per component with those four checked, sized, and ordered by dependency and usage.

### Step 5.2 Build procedure, kit-first

The kit may live in Figma or in Paper; the procedure is the same and only the bridge changes (Figma MCP vs the Paper project open with its design-to-code path). Code Connect exists only for Figma.

1. Read the manifest note and the parity doc section.
2. **Open the live kit.** Audit the set through the bridge: analyze the component set, walk the tree resolving tokens (fills, strokes, radii, padding, text styles), render an image per variant. Record measurements; do not eyeball.
3. Core component: `npx shadcn add` then adapt. Composite: compose from existing namespace parts (Button, Tooltip, Select). Zero raw `<button>` or `<select>`.
4. Verify **computed styles in the running Storybook**: fonts, colors, row heights, scroll behavior, in light **and dark**. "Verified in the browser, not reasoned" is the bar.
5. Update the manifest set in the same PR; `parity` only after step 4 matches the kit per axis.

The hard rule behind step 2: **never build or modify visuals without the live kit open.** A written spec carries the parts and the decisions but not the shape. A component was once built entirely from the written spec with the bridge disconnected and came out structurally wrong (a bordered box with three bands, where the kit is a muted tray holding an inset card). Every part was listed; the shape was missed. If the bridge is down, wait; the rewrite costs more than the wait.

Read the text properties explicitly: a tree walk returns layout, tokens, typography and fills and feels exhaustive, but `textTruncation` and `maxLines` live in the REST `style` object and are absent unless asked for by name. A component shipped with free-wrapping text documented as an intentional decision when the kit had said "one line" from day one.

**Done when:** every recorded measurement matches, in both modes, in the browser.

### Step 5.3 Hard rules while building

The authoritative copy is `core/rules.md` in the package; the agent loads that one. This section keeps the same rules with more of their history for a human reader. Each rule is paired with the failure it prevents. Pairs of incorrect/correct where a shape helps.

1. **One variant axis becomes one union prop.** Incorrect: `showLineNumbers` + `prompt`. Correct: `type: 'simple' | 'cli' | 'editor'`.
2. **Raw Tailwind with `cn()`, theme tokens only.** No styled wrappers, no legacy token names, no palette colors.
3. **New Tailwind class ⇒ recompile the CSS.** If the namespace stylesheet is compiled once at Storybook start, a class written afterward does not exist; the element renders unstyled and masquerades as a component bug. Verify with a grep against the generated file: zero means absent.
4. **State selectors belong to the primitive library you chose.** Radix's `data-[state=open]` matches nothing under Base UI (`data-open`, `data-closed`, `data-pressed`, `data-starting-style`, `data-ending-style`). Registry sources built on the other library carry dead selectors; grep them out per component before the PR, and before declaring a selector dead, check who renders the attribute (consumer-spread `data-invalid={true}` is alive).
5. **Requalify utilities the base layer guards.** If `theme.css` sets `[data-slot] { font-family: sans }` at (0,1,0), the plain `font-mono` utility loses by source order. Incorrect: `<div data-slot="x" className="font-mono">`. Correct: `data-[slot=x]:font-mono`.
6. **`forwardRef` on every part** (Step 2.4).
7. **Kit "Show X" switches become composition** (Step 3.4).
8. **Motion gated with `motion-safe:` on the animation itself.** `motion-reduce:animate-none` loses by source order to a `data-*` variant animation at equal specificity; `motion-safe:data-open:animate-x` is the form that works. Measure the **cycle** (close and reopen), not the resting state. Transform and opacity only; `ease-out` for user-initiated enters; paired elements share duration and easing.
9. **Icon-only actions get `aria-label` before the props spread** so callers can override. Upstream registries do not name their icon buttons; the accessibility gate will.
10. **Truncation contract for fixed-height rows:** `truncate` on the cell as the safety net, and a `<span className="truncate">` around the value for the real ellipsis. `truncate` on a flex container does not ellipsize bare text (anonymous flex item), and the anonymous item never yields width, pushing siblings out of the cell. If a story needs a hand-added class to look right, the class is probably missing from the component.
11. **Header action rule:** an action whose meaning is constant is icon-only with a tooltip (copy, download); an action that inverts with state carries a visible label (`Show all` ↔ `Show less`), because a tooltip only reveals meaning on hover and touch has none. A leading glyph flips with the label or contradicts it.
12. **Page shell is a grid row, never a viewport subtraction.** Incorrect: `h-[calc(100vh-81px)]` (the nav's height copied into the content well, `h-` instead of `min-h-`, `vh` on iOS). Correct: `grid h-dvh grid-rows-[auto_1fr]` with `<main className="overflow-y-auto">`.
13. **Choosing a code-highlighting theme means measuring contrast against your backgrounds**, never by taste; and scope it to the component (`[data-slot=code-block-pre]`, `data-language`) so legacy stylesheets matching `code[class*="language-"]` stay out.

### Step 5.4 Surface the low-confidence decisions, keep the rest silent

Score confidence per decision. High-confidence decisions are taken silently and recorded in the manifest note. Low-confidence ones go to the design owner **framed as a tradeoff in design language**: "the primitive's Menu gives keyboard navigation for free but has no nested submenus or toggle rows; a custom part covers them and puts the accessibility burden on us. Which tradeoff?" is answerable. "Should I use the primitive's Menu?" is not. Bringing every decision is the same as bringing none.

### Step 5.5 Budgets: when to stop

A checklist says what must be true; budgets say when to stop trying. Without them a loop grinds forever on a half-pixel or quits at random.

- **Visual match: five iterations max.** If an iteration moves none of the recorded measurements, stop and report the remaining delta.
- **Same failure twice = stop.** The model of the problem is wrong, not the attempt.
- **Accessibility P1: three remediation attempts**, then leave it failing and say so. A finding quietly downgraded to make a check green is worse than a red check.
- **A fix that breaks a passing measurement gets reverted, not layered on.**

### Step 5.6 Pre-flight before "ready for review"

Declaring "ready" on a green CI and then pushing corrections dismisses approvals and burns reviewer trust. The complete pre-flight:

- [ ] Kit audit done against the live set; computed styles verified in the browser, light and dark
- [ ] CSS recompiled after the last new class; class greps > 0
- [ ] Type check and lint clean on touched files
- [ ] Accessibility gate: every icon-only control has `aria-label`; every scroll container has `tabIndex={0}`, `role="region"`, and a label; repeated same-role landmarks carry distinct labels; a Select's visible value is not its name (the trigger needs `aria-label`); inputs in stories have `aria-label` in the meta `args` (a placeholder is not a label)
- [ ] Stories demonstrate the behavior for real (an overflow story actually overflows; a placement story has headroom both ways; every state the component has exists as a story, so nobody synthesizes it with a scripted click)
- [ ] `.figma.tsx` written and parsing
- [ ] Manifest set updated; every guard green locally
- [ ] Every commit passes commitlint locally
- [ ] Console free of ref warnings across stories
- [ ] Dead-selector grep returns zero
- [ ] Self-review (Step 5.8a) done and its findings measured
- [ ] Storybook preview by the design owner, handed off **with the hand-off list**, then open the PR

### Step 5.7 The hand-off list: what you could not verify

The preview is the only place these get caught, so name them instead of leaving the reviewer to guess where to look. Standing members, none reachable by an automated gate:

- **Screen reader.** axe catches 30–50% of violations; what the component announces is not among them.
- **Hover with a real pointer.** Intent, travel and dwell need a mouse moving through space.
- **Whether the motion feels right.** Duration and easing are verifiable as numbers and unverifiable as experience.
- **Pixel verification at 2x** on custom indicators.
- **Detached frames in the kit**: deliberate customization or drift? Only the design owner knows.
- **Anything the kit's visuals do not disambiguate** (a checkmark that does not say single vs multi select).

"I checked everything I can check; here are the things I cannot, will you look at them?" buys more trust than confident silence, and it costs one paragraph.

### Step 5.8 The PR

- **One component per branch and PR.** Bundles are refused at review. Each PR carries: the component, stories, the manifest set, Code Connect.
- Conventional commit subjects, every commit linted (not just the tip). If the linter rejects PascalCase-start subjects, start with a namespace token (`feat: /next Button …`), which also makes the log greppable.
- PR body: direct to the what, no process narrative, 1500–2500 characters. Detail goes to the manifest note, not the body.
- Post-approval changes go to a **follow-up PR**, never pushed onto the approved branch (a push dismisses the approval).
- A PR that changes a component's status in the legacy map moves the row between sections **and** renumbers the headings; the guard only checks the snapshot line.

### Step 5.8a Self-review before a human reviewer

Mandatory, after the PR is open and before anyone is assigned:

1. Run the tool's code-review command on the diff (Claude Code `/code-review`, Codex `codex review`, Cursor Bugbot, or a bug-only review request in Grok).
2. Measure every finding in Storybook or the DOM before fixing. A reported 4px jump did not exist frame by frame; a reported truncation overlap measured at five lines painting over neighbors did. Every automated gate had passed both.
3. Fix confirmed findings in new commits (no approval exists yet, so pushes are free here); reject unconfirmed ones in a comment with the measurement.
4. Then the design-owner preview with the hand-off list, then assign reviewers.

### Step 5.8b Tracker moves (optional, per project)

If the project tracks issues (Linear or similar), every state change happens in the same turn as the event it mirrors: issue created when the kit page is found (🟡 or 🟢) → Ready on 🟢 → In Progress on branch → In Review on PR open → Merged on merge → Released when publish is green, version in a comment. A tracker that lags reality by a day is a tracker nobody trusts.

### Step 5.9 Merge and release discipline

- **Squash merge, subject forced to the PR title with `(#N)`.** The squash subject is what the release tool reads for the version bump; an autocompleted first-commit message loses the `feat:` and the release mis-versions or does not fire.
- **Merge one at a time and wait for the publish run to finish green** before the next. Two merges seconds apart start two runs that compute the same next version; the first publishes, the second's push bounces, and every subsequent release fails against an already-published version. Add a concurrency group and a "skip if superseded" step to the publish workflow, and still space merges.
- **Do not rebase by reflex.** If the branch protection does not require "up to date", a behind-but-mergeable PR merges as-is and keeps its approval. Rebase only on a real conflict. A stale merge ref from a rerun does not pick up main; generate a synchronize event (empty commit, or close/reopen).
- **Small change first** when two are ready: it is the canary for the release pipeline.
- **Stacked PRs:** retarget the stacked PR to main **before** merging its base; deleting the base branch by API auto-closes the stacked one and a force-pushed closed PR cannot reopen.
- **Docs-only PRs still cut a release** under conventional-commit automation; tell people what to expect.
- Keep the new namespace in **stable releases**. `0.x` already signals an unstable API; pre-release channels add a second stream nobody consumes. Do not add `preMajor` guards that would demote a future legacy-removal to a minor.

### Step 5.10 Closing a component: classify every finding

Sort what went wrong into three tiers. The tier is a destination, not a label:

- **Tier 1: the agent needed a rule.** Said once, never recurs. Goes in the skill if it generalizes, in the component's manifest note if it does not.
- **Tier 2: a tooling gap.** The bridge was down, an API could not expand instance children, a screenshot came back cached. Goes to an issue. This is the tier teams lose: it reads as friction in the moment, nobody writes it down, and the next component pays for it again.
- **Tier 3: resists automation.** Needs human judgement every time. Goes on the hand-off list, never into a rule (a rule for it is a rule that cannot be followed).

Update the manifest, the legacy map, the tracker (in the same turn reality changes: PR opened → in review, merged → merged, published → released), and the skill.

**Phase 4 done when:** `kit-ready` and `kit-wip` are empty, every legacy export is `replaced`, `absorbed`, `deprecated` or `kept`, and every `parity` entry has its Code Connect mapping.

---

## 6. Phase 5: consumers and cleanup

### Step 6.1 Canary early

Adopt the new namespace in one real screen of the heaviest consumer before the queue is half drained. Expect cosmetic snapshot churn from transitive dependency bumps (an icon library changing SVG path serialization is byte-different and semantically identical) and refresh snapshots deliberately, not silently. If a canary branch is allowed to stay red, its red/green stops being a signal: compare exact failure counts against the known baseline instead.

### Step 6.2 Scope migrations from call sites, not from the spec

Before building a replacement, audit the legacy component's actual importers. Two wrapper files reaching eleven screens means the migration touches two files. An `uploading` state in the legacy that no importer ever reaches is dead code and does not get migrated.

### Step 6.3 Migration recipes

Once `undecided` is empty, derive a consumer-facing `MIGRATION.md` from the legacy map: find/replace recipes per export (`FormControl` → `Field` + `FieldLabel`, `Grid` → `grid-cols-12`/`col-span-*`, `Modal` confirmations → `AlertDialog`). Recipes for absorbed and deprecated entries, too.

### Step 6.4 The fidelity test

The metric for the whole endeavor: the design owner designs a **real screen** with the kit; an agent reproduces it with the new namespace through the Figma MCP; compare screenshots. Run it early, not at the end.

### Step 6.5 Cleanup

Delete legacy components, the old styling toolchain, the frozen tokens, the retired primitive packages. Consolidate the Tailwind toolchain. Tag `1.0.0`. Write the React upgrade addendum and remove the ref shims together.

---

## 7. The agent skill

**Goal:** rules the agent inherits on every component instead of rediscovering. This playbook ships as a package (`ds-ai-ready/`) with a tool-agnostic core and one adapter per tool; a project adds one thin skill of its own on top.

### Step 7.1 Structure

```
ds-ai-ready/
  core/rules.md        universal component rules (model-invoked through the adapters)
  core/traps.md        disclosed reference, reached when a symptom looks like a component bug
  core/phases/*.md     one file per phase, user-invoked (/ds-migrate <phase>)
  core/templates/      ds.config.json, per-component manifests, generator, guards, project skill
  adapters/            claude/skills, codex/AGENTS.md, cursor/rules/*.mdc, grok/AGENTS.md
skills/<system>/SKILL.md   the project's own: repo facts, reviewer profiles, Tier 1 rules
```

Two invocation kinds, on purpose. `core/rules.md` fires by itself when a namespace file is touched (a description with the trigger words in Claude, a `globs` line in Cursor, an `AGENTS.md` under the namespace folder for Codex and Grok). The phases fire only by name: nobody runs `triage` by accident, and their pointers cost no context on ordinary turns.

The project skill's description front-loads its triggers: namespace path, primitive library, kit name, reviewer handles.

### Step 7.2 Route by path first

If the repository holds two libraries with opposite conventions (legacy CSS-in-JS vs raw classes; Radix vs Base UI), the first line of the skill routes by file path and the two chapters never mix. Applying legacy conventions to the new namespace is the number-one way to write a component that looks right and is wrong.

### Step 7.3 What goes in, what stays out

In:

- **Hard rules with their why**, each paired with the failure it prevents, as Incorrect/Correct pairs where a shape helps (Step 5.3 is the model).
- **Tool-gating as a rule**: "never build without the live kit open; check the bridge with a probe; if down, wait." A rule, not a memory.
- The build procedure, the pre-flight, the hand-off list, the budgets, the tier classification.
- The lifecycle table (markers ↔ manifest statuses) and the authority rule.
- Reviewer profiles: what each reviewer pushes on, so the first draft already conforms.
- Rules that are **written, not shipped** (a page-shell rule waiting for the pattern phase), marked as such with the reason.

Out (it lives elsewhere and a cache would go stale):

- Anything `package.json` scripts, config files, or `--help` already state.
- Per-component decisions: those are manifest notes; the skill says "read the note before touching a component".
- Session state: that is memory, not skill.

### Step 7.4 Keep it live

- After every component, Tier 1 findings land in the skill the same day.
- Every rule is a positive instruction: state the target behavior; a ban drags the banned behavior into context.
- Prune: a sentence the agent already obeys by default is a no-op and pays load to say nothing.
- **Evals**, once the queue drains: reformulate each critical rule as a prompt → expectation pair and run agents against **unseen** components, scored against the rubric, not against similarity to shipped code. "Did not load the skill" and "loaded it and broke a rule" are different failures; test them separately.
- **Live context at load**: inject a summary of the manifest (counts per status, the current queue) when the skill loads, so the agent starts from the real state.
- A **review loop**: a collector gathers evidence from reviews and chat without proposing; a judge validates and groups; a human decides the destination artifact (rule, reference, exemplar, lint rule, eval, coverage gap, nothing).

### Step 7.5 Deterministic rules go to linters, not prose

Anything checkable without judgement moves out of the skill and into a lint rule or a guard: icon buttons without an accessible name, a Select with two or three static options where a radio group belongs, spacing off the grid, dead state selectors, a missing Code Connect file. "Build it, then say it": structural rules live in templates, composed components, and tests; explanatory rules live in prose.

### Step 7.6 Project config: the branches every phase reads

`ds.config.json` at the repo root, written once in foundations. Every optional path in this playbook is a key here, so a phase file never asks "does this project use X"; it reads the flag.

| Key | Values | Branch it controls |
|---|---|---|
| `designTool` | `figma` / `paper` | which bridge the kit-first audit opens; Paper forces `codeConnect: false` |
| `codeConnect` | bool | `<key>.figma.tsx` required and guarded per `parity` component |
| `tracker` | `linear` / `none` | issue creation and state moves per component (Step 5.8b) |
| `primitives` | `base-ui` / `radix` | which state selectors are alive (Step 5.3, rule 4) |
| `manifests.commitDocs` | bool | generated docs committed and guarded for equality, or only rendered |
| `markers` | emoji triple | kit page lifecycle, default 🟡 → 🟢 → 🔄 |
| `commitSubjectPrefix` | string | the token every commit subject starts with |
| `reviewers` | handles | who gets assigned after the self-review and the preview |

---

## 8. Beyond components: vocabulary and specs

The component queue drains and the system is still a component library. Two more layers turn it into a design system agents can speak.

### 8.1 Name the recurring decisions (the vocabulary layer)

Give the same ticket and the same component library to independent builders, human or agent, and you get plausible but divergent pages. The divergence sits above components: page layouts, where primary actions go, whether settings auto-save, how destructive actions confirm.

1. **Inventory** the layouts the product already reuses, across the kit and shipped screens. Start from what exists, not from invented archetypes.
2. **Canonize** each into the kit (your kit, not the generic blocks file): one canonical example per page archetype. Give each a name: `Overview`, `SettingsFrame`, `DetailPage`.
3. **Write the rules beside the patterns**, machine-readable, with the why: what problem the pattern solves, what rules it follows, when not to use it. "No tabs on settings" with the reason, not "keep settings simple".
4. **Point every name at code, guidance, and an example.** A name alone tells an agent where to look; the rationale tells it when the pattern fits and when it does not.
5. **Run a drift test**: give the same ticket to fresh agents blind, compare the outputs. Whatever diverges is a decision you have not captured yet. Repeat until the divergence is taste, not structure.

The payoff is the shape of a request changing from "can we get 30 minutes with design engineering to figure out how to build the projects page?" to "the system recommends `Overview`: metric row, chart card, table with name/status/usage/plan, no actions in the header. Sound right?" The agent does the assembly; the team makes the call. If a request fits nothing named, the gap is visible instead of buried in an improvised page.

Documentation lives as an RFC addendum until the work starts, then its own RFC. The vehicle (skill, docs, templates) is open; pick whatever captures the decisions best, from a single source compiled to every surface, to avoid fragmentation across N agent files.

### 8.2 Spec-driven design (the knowledge base)

The other half is upstream of components: how intent reaches the builder. Handoff by walkthrough meeting leaks intent at every step, and mockups show happy paths while hiding edge cases (the "Figma trap"). The fix is a **product knowledge base in the repository**, plain text in git, that agents query at task time rather than humans remembering it exists:

- an agent instructions file that points to the rest;
- the product vision as the standard for coherence;
- **decision logs**: what was chosen and why, so reversals are visible;
- **atomic insights**: individual, tagged, source-linked research findings, reusable across features;
- product-level standards: the design system and accessibility contracts (this document's manifest and skill are those);
- **one living spec per feature**, born at problem definition, carrying the problem, success criteria, requirements, open questions with owners, chosen flows, rejected directions and their reasons, and acceptance criteria. It evolves through discovery, craft, evaluation and handover, and by development intake it already carries what builders need.

Evaluation splits: agents check conformance to the system deterministically (the guards, the rubric); humans handle meaning (usability, consequent decisions), with findings landing back in the spec. Design's irreplaceable value in this loop is judgement applied to accumulated knowledge, which is exactly what the knowledge base makes retrievable.

Start small: one knowledge base, one spec for the next feature, inside the repository so engineers and agents read it directly.

---

## 9. Phase 6: steward, when the system outlives the migration

Every phase before this one assumed one team building against one kit. That assumption expires the moment `1.0.0` publishes: the system is now a dependency other teams have opinions about, and the failure mode changes shape. Migration failures are visible (a component does not match the kit). Stewardship failures are quiet: a fork nobody announced, a request backlog nobody is servicing, a deprecation warning everyone has learned to scroll past.

### 9.1 The model is a measurement, not a choice

Ownership models get chosen aspirationally ("we want to be federated") and then contradicted by what actually merges. Count instead: teams outside the owners that merged into the namespace in the last 90 days. Zero is centralized, one or two is hybrid, three or more is federated whether or not anyone wrote it down.

The count has one override. With no named person whose job includes the system, the model is centralized regardless, because contributions need a reviewer who is accountable for them. Without one, contributions become the contributing team's fork, and a fork is always discovered later than it started.

Recount quarterly. A model that has drifted from its count shows the same symptom in both directions: work queued against people who are not servicing it.

The `governance` block ships empty from foundations and stays empty through the migration, because a model written before anyone has contributed is a guess about teams that do not exist yet. `model` going non-empty is what marks the system as live.

### 9.2 Semver needs a surface before it means anything

A version number describes a surface. Undefined, every release argument becomes a taste argument. This package's surface is three things and nothing else: the namespace's exports, the props on them including types, and the token names in `theme.css`. File layout, slot structure, class strings and which primitive a component wraps are internal, and a consumer reaching past the surface has accepted that.

The bump that gets argued every time is a visual change touching no API. It ships `minor`, never `patch`. Both turn a consumer's snapshot tests red; the difference is whether they were told before it happened, and patch releases are the ones teams auto-merge.

### 9.3 Deprecation is a manifest state, not a comment

The legacy map already proved the shape: a retiring export carries its status, its replacement, and a recipe, and a guard refuses the incomplete version. Post-1.0 deprecations reuse it exactly. A `deprecated` parity manifest names `supersededBy` and `removeIn`, and `ds-manifest.mjs check` fails without both.

The reason is the same one that put the legacy map under a guard. A deprecation with no replacement and no removal date is a permanent warning, consumers learn to ignore permanent warnings, and the ignored warning is then evidence that deprecation does not work here.

While deprecated, the component stays exported, tested and storied. Removal lands in the major named by `removeIn`, announced `noticeMajor` ahead.

### 9.4 Contributions gate on the guards that already exist

Nothing new to remember: `ds-manifest.mjs check`, the guard test, a kit page at the ready marker per rule 1, and a filled usage doc. A contribution with no kit page is a request, and saying so early costs less than saying it at review.

One rule applies only to contributions: a contributed component needs a **second consumer** before the owners absorb it. One caller means it belongs to that caller, and absorbing it makes the owners maintain a private component indefinitely, which they discover the first time they try to change it. Until a second consumer exists it stays in the contributing team's code and the manifest carries it as `code-only` with the reason in `note`.

**Phase 6 done when:** `ds.config.json` carries `governance`, `CONTRIBUTING.md` states the surface, the bump table and the gates, the deprecation guard has been seen red and green, and the RFC addendum records the model with the count behind it.

---

## Appendix A: manifests

### parity/<key>.json (one file per module)

```json
{
  "design": { "tool": "figma", "fileKey": "…", "page": "<page-id>", "componentSet": "Alert", "componentSetId": "<set-id>" },
      "status": "parity",
      "axes": {
        "variant": {
          "code": ["default", "destructive", "info", "success", "warning"],
          "figma": ["Default", "Destructive", "Info", "Success", "Warning"],
          "note": "Kit gained the axis on <date>; every fill bound to the status tokens code ships."
        }
      },
      "composeOnly": ["Show Icon (icon child)"],
      "deviation": "Where code departs from upstream and the review that decided it.",
  "note": "Per-component decisions. Read before touching the component."
}
```

For Paper: `"design": { "tool": "paper", "projectPath": "…", "component": "Alert" }`.

Status values: `parity` · `gap-code` · `gap-kit` · `code-only` · `decision-needed` · `kit-ready` · `kit-wip`.

### legacy/<Export>.json (one file per legacy export)

Named by exported name. Fields: `status` (`replaced` | `absorbed` | `deprecated` | `kept` | `undecided`) · `next` (module keys, only when replaced) · `proposedNext` (candidates while undecided or absorbed) · `usage` (importing files per consumer, from triage) · `aliases` · `note`.

### usage/<key>.md (one file per module at parity)

The caller's contract (Step 4.5). Scaffolded by `scripts/ds-manifest.mjs usage <key>`; sections Use when · Use something else when · Variants · Composition · Decisions · Owner notes.

### Guards (`npm test`, `scripts/ds-manifest.mjs check`)

- Every manifest file has a valid status; `next` non-empty iff `replaced`; every referenced module exists; every `parity` entry with a Figma component set has its `.figma.tsx` when Code Connect is on.
- Committed `PARITY.md` and `LEGACY-MAP.md` equal the generated output; exactly one copy of each section.
- Every export in the package index has a legacy file or alias.
- Every `parity` module has a usage doc with no `<fill>` marker left.

---

## Appendix B: trap catalog

Each of these fails silently and masquerades as a component bug or a design decision. Verify the method before blaming the component.

| Trap | Symptom | Rule |
|---|---|---|
| Namespace CSS compiled once, not watched | new class renders unstyled | recompile after every new class; grep the generated file |
| Bare `git stash` in a shared worktree | someone else's stash pops onto your tree | `git stash push -u -m <tag>`, apply by SHA, or use a WIP commit |
| Tokens equal in light, different in dark | surface vanishes only in dark | resolve both modes before accepting a token; nothing automated renders dark unless you make it |
| Cached kit screenshots of new nodes | render contradicts data | screenshot the parent frame; vary the scale; data wins until a third method decides |
| Synthesizing a state with a scripted click | measurements from a transient DOM | use the story that has the state; if none, add it, and say so |
| Tree walk omits text truncation | free-wrapping text documented as intentional | read `textTruncation` and `maxLines` per TEXT node |
| Radix selectors under Base UI | animation or state style never applies | selector table; grep per component; confirm attributes in the DOM |
| `motion-reduce` vs `data-*` animation | animation runs under reduced motion | `motion-safe:` on the animation; measure the cycle |
| `[data-slot]` font guard | `font-mono` renders sans | requalify: `data-[slot=x]:font-mono` |
| React 18 ref drop | popups anchored wrong or never open | `forwardRef` on every composable part; console probe; reason about call sites too |
| Unlayered legacy preflight | buttons transparent | compile utilities unlayered |
| Placeholder passes the axe label rule | inputs unnamed in the app | `aria-label` in story args; Field in app usage |
| Upstream icon buttons unnamed | `button-name` violations | default `aria-label` before the props spread; record the deviation |
| Hand-copied counts in docs | doc says 20 of 20 while JSON says 23 | derive and guard; one line per module, sorted |
| Storybook `networkidle` never resolves | probe hangs | `domcontentloaded` + `waitForSelector` on a concrete control |
| Stale build cache after branch switch | phantom syntax errors in stories | clear the cache before diagnosing |
| Instance modes | set-level mode does not protect instances | unbind and rename |
| Diagnosing by flipping a collection mode | frames resize, bindings lost | test on a throwaway instance |
| Unanchored `.gitignore` entry | a source folder silently ignored | anchor paths (`/lib/`) |
| Merge commits with a body in a stacked chain | commitlint fails every PR above | native `Merge branch 'x' into y`, no body |

---

## Appendix C: project skill skeleton

The file `core/templates/system-skill.md` in the package is the source; this is its shape.

```markdown
---
name: <system>
description: "Patterns and prior-feedback rules for <system>. Use when working in
<repo> or any folder importing <package>: building <namespace> modules against the
Figma kit, refactoring legacy components, adding stories, addressing review. Triggers
on: <namespace>, <primitive lib>, shadcn, parity.json, kit, cn(), data-slot, <reviewer
handles>."
---

# <system> component engineering

Every rule here is reviewer- or CI-ratified.

## Which chapter applies
Route by path: <namespace> → new chapter; <legacy path> → legacy chapter.

# <namespace>: the shadcn library
Machine-readable contract: parity.json; read the entry's note before touching a component.

## Hard rules (numbered, each with its why, Incorrect/Correct where a shape helps)
## Kit page markers (lifecycle table + authority rule)
## Build procedure (kit-first, 5 steps)
## Surface low-confidence decisions as design tradeoffs
## Written-not-shipped rules (with the reason they wait)
## Budgets
## Pre-flight checklist
## Hand-off list
## Closing a component: tiers 1/2/3

# Legacy chapter (conventions that are inverted above; reviewer profiles)
```

---

## Appendix D: revision notes

Changes folded into this revision after the first draft, so a reader of an older copy knows what moved:

- **Manifests split per component** (`parity/<key>.json`, `legacy/<Export>.json`), docs generated and guarded. Replaces the single shared `parity.json` whose every edit conflicted the other approved PRs (§4.1, §4.2, Appendix A).
- **Self-review as its own step** between PR open and reviewer assignment, with the rule to measure every finding before fixing it (§5.8a).
- **Tracker moves** as an optional, per-project step, in the same turn as the event (§5.8b).
- **Code Connect optional** and Figma-only; the guard installs only when `codeConnect: true` (§4.4).
- **Figma or Paper** as the kit surface; same procedure, different bridge (§5.2, Appendix A).
- **Kit-wip marker is 🟡** (was ⚪️); markers configurable (§3.3, §7.6).
- **Multi-tool packaging**: tool-agnostic core plus adapters for Claude Code, Codex, Cursor and Grok (§7.1).
- **`ds.config.json`** as the single place every optional branch is decided (§7.6).
- **Usage docs per component** (`usage/<key>.md`): the caller's contract beside the manifest, scaffolded from it, filled from the registry docs or the parts, closed by the design owner's notes; guarded at `parity` (Step 4.5, Appendix A). A repo that updates the script with components already at `parity` scaffolds one doc per component before `check` goes green again; fill them in the order of the legacy map's usage counts.
- **First real run (2026-08-24)**: foundations executed from zero in a fresh repo. Legacy-only steps are now marked, `ds-rules` ships self-contained because a plugin skill cannot read outside the working directory, the generator renders `deviation`, and the probe runs against a dev build (`phases/foundations.md`, `traps.md`, Appendix A).

## Appendix E: sources

- Matt Rothenberg, "Speaking design at scale" (design-system-language) and "You don't have a design system": the vocabulary layer, decisions above components, agents as translators from a request into the system's names.
- Futurice, "Spec-driven design": knowledge base in the repo, atomic insights, decision logs, the living spec, intent debt and cognitive debt, evaluation split between agents (conformance) and humans (meaning).
- Vercel, "Teaching agents product design": the three-part system (skill, linters, review loop), observable rules with stable ids, evals against unseen interfaces.
- Kaelig, "Design system components with AI agent teams": budgets and exit criteria, the list of what could not be verified, front-loading hard questions before code, separating creation from evaluation.
- shadcn's own agent tooling (committed evals, audit checklists, live context on skill load, migrate-radix-to-base: "a clean merge is not proof of a clean file").
- State of AI in Design Systems report (2026): the catalog of techniques the priorities above were chosen from.
