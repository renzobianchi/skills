# Trap catalog

Each fails silently and masquerades as a component bug or a design decision. Check the method before blaming the component.

| Trap | Symptom | Rule |
|---|---|---|
| Namespace CSS compiled once, not watched | new class renders unstyled | recompile after every new class; grep the generated file |
| Bare `git stash` in a shared worktree | someone else's stash pops onto your tree | `git stash push -u -m <tag>`, apply by SHA, or a WIP commit |
| Tokens equal in light, different in dark | surface vanishes only in dark | resolve both modes; nothing automated renders dark unless you make it |
| Cached kit screenshots of new nodes | render contradicts data | screenshot the parent frame; vary the scale; data wins until a third method decides |
| Synthesizing a state with a scripted click | measurements from a transient DOM | use the story that has the state; if none, add it and say so |
| Tree walk omits text truncation | free-wrapping text documented as intentional | read `textTruncation` and `maxLines` per TEXT node |
| Radix selectors under Base UI | animation or state style never applies | selector table; grep per component; confirm attributes in the DOM |
| `motion-reduce` vs `data-*` animation | animation runs under reduced motion | `motion-safe:` on the animation; measure the cycle |
| `[data-slot]` font guard | `font-mono` renders sans | requalify: `data-[slot=x]:font-mono` |
| React 18 ref drop | popups anchored wrong or never open | `forwardRef` on every composable part; console probe; reason about call sites |
| Unlayered legacy preflight | buttons transparent | compile utilities unlayered |
| Placeholder passes the axe label rule | inputs unnamed in the app | `aria-label` in story args; Field in app usage |
| Upstream icon buttons unnamed | `button-name` violations | default `aria-label` before the props spread; record the deviation |
| Hand-copied counts in docs | doc says 20 of 20, manifests say 23 | generate docs; guard equality |
| Shared manifest file across PRs | every merge conflicts the other approved PRs | one manifest file per component; no shared edits |
| Storybook `networkidle` never resolves | probe hangs | `domcontentloaded` + `waitForSelector` on a concrete control |
| Stale build cache after branch switch | phantom syntax errors in stories | clear the cache before diagnosing |
| Instance modes | set-level mode does not protect instances | unbind and rename the layers |
| Diagnosing by flipping a collection mode | frames resize, bindings lost | test on a throwaway instance |
| Hidden node measured in auto-layout | stale geometry | show, measure, hide |
| Unanchored `.gitignore` entry | a source folder silently ignored | anchor paths (`/lib/`) |
| Merge commits with a body in a stacked chain | commitlint fails every PR above | native `Merge branch 'x' into y`, no body |
| Two merges seconds apart | two publish runs compute the same version; every later release fails | merge one, wait for green publish, merge the next; concurrency group on the workflow |
| Deleting a stacked PR's base branch by API | the stacked PR auto-closes and cannot reopen after a force-push | retarget to main before merging the base |
| Rerun of a PR check after main moved | tests the old merge ref | synchronize event: empty commit or close/reopen |
| Docs-only PR under conventional commits | a release ships with an empty changelog | expect it; tell people |
| Self-review finding taken on faith | a fix for a jump that does not exist | measure the finding frame by frame before fixing |
| Definition-of-done living in a status update | the artifact is forgotten for weeks (36 mappings for 55 modules) | turn it into a guard that fails per component |
