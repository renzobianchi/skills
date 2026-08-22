---
name: arena-design
description: "Design-exploration arena: N parallel candidates with assigned directions attack the same UX+UI problem in Paper, Figma, or code; visual cross-judge, base + grafts."
disable-model-invocation: true
---

# Arena design

Fan out N parallel candidates that attack the same design problem from **assigned, distinct directions**. Cross-judge on what renders, not on the write-up. Pick a base, graft the best of the losers into it, verify with eyes.

Sibling of `arena` (code). The structural difference: in code, divergence between candidates signals a loose frame; here divergence **is the goal** and is forced in the frame. Two candidates that converge mean the directions were poorly split.

## Phases

Open a todolist with one entry per phase before launching anything.

0. Intake (only when the context leaves gaps)
1. Frame
2. Research & craft layer
3. Fan out
4. Cross-judge
5. Pick
6. Graft
7. Verify

## Presets

Two presets set how much the arena spends. The dial is **coverage**, not quality: more candidates produce a better pick only when the problem has more real axes, so neither preset raises N by decree. This table is the single source for what each preset runs; later phases point back here.

| | `quick` | default |
|---|---|---|
| Candidates | 2-3, directions on UX axes only | 3-4 |
| Research | local catalog only | Mobbin / web + local catalog |
| Judge | parent judges from screenshots | separate readonly agent, different model |
| Convergence | report it, pick from what exists, recommend a default run | reframe and re-run once |

`quick` for early exploration, a small component, or a read before committing more. Default otherwise. The preset is set in Intake, shown in the frame, and declared in the synthesis note together with the rows it skipped, so a `quick` result never passes as a full arena.

## 0. Intake

One round of questions, before anything else, only when the context leaves a gap that would change the frame. Ask only what the repo, the open file, and the conversation leave unanswered; a question whose answer you could have read is spent attention. Hard cap: 4 questions plus the preset, in a single `AskUserQuestion` call.

Gaps, in order of how much they change the frame:

1. **Medium**: Paper, Figma, or code. One medium per arena; it decides how each candidate is delivered, viewed, and verified. Offer the three with a recommendation drawn from context (a Figma file open → Figma; a repo with the target surface → code; early ideation with no repo → Paper). The fan out is the expensive step; running it in the wrong medium wastes the whole arena.
2. **Real content**: where it lives, or confirmation that placeholders are all there is.
3. **Fixed vs open**: which parts of the surface are off limits (tokens, nav, scale, an existing component) and which the candidates may rethink.
4. **Context of use**: primary breakpoint, first-time vs recurring user, anything that reweights the rubric.

Last question, always: the preset, one of the two marked recommended with a one-line reason drawn from the answers (small surface or early ideation → `quick`; a real surface with system constraints and real content → default).

When the context answers every gap, skip the questions and confirm the preset inside the frame instead. Intake is closed when every gap has an answer and the preset is set.

## 1. Frame

The shared prompt is the contract. Before spawning:

1. **State the design problem**, not the solution: what the user must accomplish on this surface, with what context and constraints (tokens, system, breakpoints). Attach the real content: a candidate working with lorem ipsum explores typography, not design, and a layout picked on placeholders is invalidated when the real content arrives.
2. **Read the medium's reference**: [Paper](references/paper.md), [Figma](references/figma.md), or [code](references/code.md).
3. **Derive the UX+UI rubric**: 3-6 gradeable criteria where at least one is UX (does the user complete the task with fewer steps / less load?) and at least one is UI (hierarchy, rhythm, use of the system). Concrete: "the empty state distinguishes first use from filtered-to-zero." Vague: "looks good."
4. **Assign directions**: one per candidate, named and mutually exclusive. Useful axes: density (airy editorial vs data-dense), structure (linear vs progressive disclosure vs spatial), reference pattern (table vs cards vs timeline), tone (systematic vs expressive). N per the preset table; more only when the problem has more real axes. In `quick`, spend the slots on the axes that change the UX (structure, pattern); tone waits for a default run.
5. **Assign separate outputs** per candidate according to the medium (own artboards, own sections, own routes or files). Two candidates writing to the same nodes clobber each other; quotas and write gotchas live in each medium's reference.

Frame is closed when every numbered step above is satisfied. **Then show the frame in six lines** (problem, medium, rubric, directions, N, preset with the rows it skips) before spawning: it is the last cheap moment to correct course; every phase after it spends N agents.

## 2. Research & craft layer

One short pass BEFORE the fan out whose output is a shared **grounding memo** with two halves:

**Patterns.** Which patterns exist in production for this problem, by name. Candidates receive them as vocabulary, with the instruction to diverge from them rather than copy the first reference. Source ladder, highest available first; `quick` starts at step 3 and the memo says so:

1. **Mobbin MCP**: `search_screens`/`search_flows`/`search_sections` on the problem's pattern.
2. **Web search** (when a search tool exists): pattern references in real products.
3. **Local catalog**: [references/patterns.md](references/patterns.md), bundled with the skill; works with no connection at all.
4. Model memory, stated as such.

**Craft skills.** Detect which craft skills exist in the skills directory (`ls`) and assign them by role:

- **Candidates**: each reads `design-foundations` (hierarchy/spacing/copy floor) plus the one relevant to the problem (`typography`, `color`, `better-layout`, `forms-and-inputs`, `animate` when there is motion). Reference by direct path (`~/.claude/skills/<skill>/SKILL.md`); reading it is part of the candidate's prompt.
- **Judge**: audits with the `impeccable` craft-floor lens (or `design-foundations` when impeccable is absent) on top of the arena rubric. Craft is the shared floor; the rubric decides between directions that already clear the floor.
- **Synthesis**: the Graft step honors the user's system rules (tokens, scale, repo conventions) over any candidate preference.

Research is closed when the memo exists and states which pattern source ran and which craft skills were found. Absences degrade the memo, never block the arena.

## 3. Fan out

Spawn all N in one message, `run_in_background: true`. Each receives: the problem, the grounding memo, ITS assigned direction (not the others'), its output, the medium reference, and the obligation to deliver a **visible artifact + rationale**.

The rationale names: which UX decisions it made and why, which alternatives within its direction it discarded, and where its direction suffers (the declared weak point is worth more than the strong one).

A candidate that produces no visible artifact is a **dropout**: continue with N-1 and note it.

Fan out is closed when every live candidate has a renderable artifact at its output and a rationale with discarded alternatives and a declared weak point.

## 4. Cross-judge

Screenshot before scoring, always: judging without rendering is judging the rationale, and rationales always sound convincing. The verdict scores per criterion, recommends a base, and names the best graft candidate per candidate.

Who judges is a preset row. Default: one readonly judge, a model different from the parent's (`opus`/`sonnet`/`haiku`), that receives the rubric and the rendered artifacts (screenshots per medium; see the reference). `quick`: the parent renders, scores, and writes the verdict in the same shape; the second opinion is the row skipped.

## 5. Pick

Look at every candidate whole and rendered before picking; skimming thumbnails favors the most familiar one. Score against the rubric criterion by criterion. Compare with the judge: agreement confirms; disagreement means an ambiguous rubric or bias, so read both rationales before deciding. Pick the base by which direction best solves the UX problem; UI polish grafts in later, structure does not.

Pick is closed when the base is named with the rubric rows that decided it.

## 6. Graft

One more pass over each loser: one or two grafts per candidate, not most of it. Pick one whole base and port pieces into it, however strong the pull to blend halves: the midpoint between two good layouts is usually a bad one, and a Frankenstein of directions fails the whole rubric.

Convergence between candidates means the directions were poorly split; the preset table says whether this run reframes or reports. Averaging the converged candidates is never the answer.

Graft is closed when the synthesis note records base, grafts with source, rejections with reason (the most valuable part of the record), and dropouts.

## 7. Verify

Final render of the synthesized artifact in the real medium, against the rubric and with the real content at its edge cases (long string, empty list, dark mode when applicable). For code: in the browser, not in the diff. If something fails that a loser solved, go back to Graft.

## Outputs

The arena is closed when both deliverables exist: the **synthesized artifact** verified in its medium, and the **synthesis note** with preset and the rows it skipped, base, grafts with source, rejections with reason, dropouts, the judge's verdict, and the verify result. In Paper/Figma, losing candidates stay in their section as an exploration record; in code, at their routes or in `artifacts/`.
