---
name: arena-design
description: "Design-exploration arena: N parallel candidates with assigned directions attack the same UX+UI problem in Paper, Figma, or code; visual cross-judge, base + grafts."
disable-model-invocation: true
---

# Arena design

Fan out N parallel candidates that attack the same design problem from **assigned, distinct directions**. Cross-judge on what renders, not on the write-up. Pick a base, graft the best of the losers into it, verify with eyes.

Sibling of `arena` (code). The structural difference: in code, divergence between candidates signals a loose frame; here divergence **is the goal** and is forced in the frame. If two candidates converge, the directions were poorly split.

## Phases

Open a todolist with one entry per phase before launching anything.

1. Frame
2. Research & craft layer
3. Fan out
4. Cross-judge
5. Pick
6. Graft
7. Verify

## Phase A: Frame

The shared prompt is the contract. Before spawning:

1. **State the design problem**, not the solution: what the user must accomplish on this surface, with what context and constraints (tokens, system, breakpoints). Attach the real content — a candidate working with lorem ipsum explores typography, not design, and a layout picked on placeholders is invalidated when the real content arrives.
2. **Confirm this run's medium** and read its reference: [Paper](references/paper.md), [Figma](references/figma.md), or [code](references/code.md). One medium per arena; the medium decides how each candidate is delivered, viewed, and verified. When the user named the medium, proceed. When they did not, **ask before anything else** — one question offering the three, with a recommendation drawn from context (a Figma file open → Figma; a repo with the target surface → code; early ideation with no repo → Paper). The fan out is the expensive step; running it in the wrong medium wastes the whole arena.
3. **Derive the UX+UI rubric**: 3-6 gradeable criteria where at least one is UX (does the user complete the task with fewer steps / less load?) and at least one is UI (hierarchy, rhythm, use of the system). Concrete: "the empty state distinguishes first use from filtered-to-zero." Vague: "looks good."
4. **Assign directions**: one per candidate, named and mutually exclusive. Useful axes: density (airy editorial vs data-dense), structure (linear vs progressive disclosure vs spatial), reference pattern (table vs cards vs timeline), tone (systematic vs expressive). 3-4 candidates; more only when the problem has more real axes.
5. **Assign separate outputs** per candidate according to the medium (own artboards, own sections, own routes or files). Two candidates writing to the same nodes clobber each other; quotas and write gotchas live in each medium's reference.

Frame is closed when every numbered step above is satisfied. **Then show the frame in five lines** (problem, medium, rubric, directions, N) before spawning — it is the last cheap moment to correct course; every phase after it spends N agents.

## Phase B: Research & craft layer

One short pass BEFORE the fan out whose output is a shared **grounding memo** with two halves:

**Patterns.** Which patterns exist in production for this problem, by name. Candidates receive them as vocabulary, with the instruction to diverge from them, not to copy the first reference. Source ladder — use the highest available:

1. **Mobbin MCP**: `search_screens`/`search_flows`/`search_sections` on the problem's pattern.
2. **Web search** (when a search tool exists): pattern references in real products.
3. **Local catalog**: [references/patterns.md](references/patterns.md), bundled with the skill; works with no connection at all.
4. Model memory, stated as such.

**Craft skills.** Detect which craft skills exist in the skills directory (`ls`) and assign them by role:

- **Candidates**: each reads `design-foundations` (hierarchy/spacing/copy floor) plus the one relevant to the problem (`typography`, `color`, `better-layout`, `forms-and-inputs`, `animate` when there is motion). Reference by direct path (`~/.claude/skills/<skill>/SKILL.md`); reading it is part of the candidate's prompt, not optional.
- **Judge**: audits with the `impeccable` craft-floor lens (or `design-foundations` when impeccable is absent) on top of the arena rubric. Craft is the shared floor; the rubric decides between directions that already clear the floor.
- **Synthesis**: the Graft step honors the user's system rules (tokens, scale, repo conventions) over any candidate preference.

Research is closed when the memo exists and states which pattern source ran and which craft skills were found. Absences degrade the memo, never block the arena.

## Phase C: Fan out

Spawn all N in one message, `run_in_background: true`. Each receives: the problem, the grounding memo, ITS assigned direction (not the others'), its output, the medium reference, and the obligation to deliver a **visible artifact + rationale**.

The rationale names: which UX decisions it made and why, which alternatives within its direction it discarded, and where its direction suffers (the declared weak point is worth more than the strong one).

A candidate that produces no visible artifact is a dropout: continue with N-1 and note it.

Fan out is closed when: every live candidate has a renderable artifact at its output and a rationale with discarded alternatives and a declared weak point.

## Phase D: Cross-judge

One readonly judge (a model different from the parent's: `opus`/`sonnet`/`haiku`) that sees the rubric and **the rendered artifacts** (screenshots per medium; see the reference) — screenshot before scoring, always, because judging without rendering is judging the rationale, and rationales always sound convincing. It scores per criterion, recommends a base, and names the best graft candidate per candidate.

## Phase E: Pick

Look at every candidate whole and rendered before picking; skimming thumbnails favors the most familiar one. Score against the rubric criterion by criterion. Compare with the judge: agreement confirms; disagreement means an ambiguous rubric or bias — read both rationales before deciding. Pick the base by which direction best solves the UX problem; UI polish grafts in later, structure does not.

## Phase F: Graft

One more pass over each loser: one or two grafts per candidate, not most of it. Pick one whole base and port pieces into it, however strong the pull to blend halves — the midpoint between two good layouts is usually a bad one, and a Frankenstein of directions fails the whole rubric. Record in the synthesis note: base, grafts with source, rejections with reason (the most valuable part of the record), dropouts.

Convergence between candidates = the directions were poorly split: reframe Phase A and re-run, do not average.

## Phase G: Verify

Final render of the synthesized artifact in the real medium, against the rubric and with the real content at its edge cases (long string, empty list, dark mode when applicable). For code: in the browser, not in the diff. If something fails that a loser solved, go back to Graft.

## Outputs

The arena is closed when both deliverables exist: the **synthesized artifact** verified in its medium, and the **synthesis note** with base, grafts with source, rejections with reason, dropouts, the judge's verdict, and the verify result. In Paper/Figma, losing candidates stay in their section as an exploration record; in code, at their routes or in `artifacts/`.
