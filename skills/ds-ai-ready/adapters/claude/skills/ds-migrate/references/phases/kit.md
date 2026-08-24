# Phase: kit

Owned by the design owner, in Figma or Paper. Output: a design surface for the post-migration world, never mixed with legacy, with a lifecycle marker per component page that the manifest mirrors.

## 1. Start from shadcn, drop what you do not own

*(figma)* Start from a shadcn-based kit and rebrand. Move generic blocks (vendor "Pro Blocks", "Official Blocks") to a separate file subscribed to the kit library: they are references, not your system, and dominate file weight. Verify the split by node count and by exporting the same block from both files and hashing the PNG. Name a version at the split.

*(paper)* Start from the shadcn components available in Paper; keep block references in a separate project.

**Done when:** the kit holds only components you intend to own.

## 2. Governance

- The kit owns **what exists and what it can do**: catalog, variants, capabilities. A new axis is added in the kit, bound to the same tokens code ships, documented at the deviation site.
- The registry owns **how core primitives are built**. Core stays diffable.
- Composites are built **from core parts per the kit anatomy**, never by modifying core.
- A composite is authored only from core components already `parity`. Dependencies order the work.

## 3. Markers

Every component page carries one marker from `ds.config.json.markers`, moving one way:

| Marker | Meaning | Manifest status |
|---|---|---|
| 🟡 (`wip`) | the kit still owes the design | `kit-wip` |
| 🟢 (`ready`) | design done, ready to build | `kit-ready` |
| 🔄 (`done`) | built, merged, kit and code agree | `parity` |

🔄 looks like a spinner and is the finish line. Code starts on 🟢 and ends on 🔄. The design owner flips markers; code moves the manifest to match. The marker decides whether something **exists**; the manifest decides what **code owes**. When they disagree about existence, the manifest is wrong; fix it in the same turn, including 🟡 pages.

*(paper)* Paper has no page markers; use the component's name suffix or a status property with the same three values, and the same rule.

## 4. Kit hygiene code will inherit

- One variant axis per mutually exclusive choice. Two booleans in the kit become two booleans in code and a combination the design never drew.
- "Show X" boolean layers are canvas artifacts; document them as composition in the set description.
- State axes (Hover/Focus/Pressed/Disabled) are CSS states, excluded from parity. Loading is a capability, included.
- Constraints code must honor go in the component set description; the manifest note points at them.
- Every text node that must not wrap carries explicit truncation (`textTruncation`/`maxLines` or a fixed-height box on mobile). Unset means "wraps", and code will read it that way.
- *(figma)* Instances resolve variable modes from their own tree position, not from the main component. Unbind what must not vary and rename the layers so nobody rebinds them. Measure hidden nodes by showing them. Test modes on a throwaway instance, never on the set.

## 5. Per-component ready check (before flipping to 🟢)

- Every axis named and exclusive; every token bound (no detached fills); text truncation set; anatomy of composites points at existing core components; description carries constraints.
- Playground/docs frame: title, description, light and dark previews.
- *(codeConnect)* the component set id is stable (no planned restructure).

**Done when:** the marker flips to 🟢 and the manifest file exists as `kit-ready` (create it in the same turn). *(tracker)* the issue moves Backlog → Ready.
