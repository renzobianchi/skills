# Phase: patterns (vocabulary and specs)

Starts after the component queue drains. This phase has not been run to completion by the authors of this package; the steps below are the plan, marked as such. Refine them on the first run and file what changed as Tier 1.

## 1. Inventory the layouts already reused

Across the kit and shipped screens, list every page layout that recurs: overview (header, metrics, chart, table), settings frame, detail page, list with filters, empty state, onboarding. Start from what exists; invented archetypes do not carry decisions.

**Done when:** a table of layouts with at least two shipped instances each.

## 2. Canonize into the kit

One canonical example per layout, in your kit (not the generic blocks reference). Give each a **name** the team will say out loud: `Overview`, `SettingsFrame`, `DetailPage`. A name is shorthand for decisions the team should not reopen.

## 3. Write the rules beside the patterns

Per pattern, machine-readable and next to the example: what problem it solves, what rules it follows, when not to use it, and the why. Observable rules ("primary actions never sit in the page header on `Overview`"; "settings pages auto-save per field, no Save button"), never vague ones ("keep settings simple"). Each rule gets a stable id linking to its source decision and a shipped example.

Every name points at three things: the code, the guidance, an example in use. An agent follows the name into all three; the rationale tells it when the pattern fits and when it does not.

## 4. Drift test

Give the same ticket to N fresh agents, blind. Compare the outputs. Whatever diverges structurally is a decision not yet captured; write it as a rule and rerun. Stop when divergence is taste, not structure.

## 5. Knowledge base in the repo

Plain text in git, queried by agents at task time:

- an agent instructions file pointing at the rest;
- product vision as the standard for coherence;
- decision logs: what was chosen and why;
- atomic insights: individual, tagged, source-linked research findings;
- product standards: this package's manifests and rules;
- one **living spec** per feature: problem, success criteria, requirements, open questions with owners, chosen flow, rejected directions with reasons, acceptance criteria. It evolves from discovery to handover; by development intake it carries what builders need.

Evaluation splits: agents check conformance deterministically (guards, rubric, lint rules); humans judge meaning (usability, consequent decisions), with findings landing back in the spec.

## 6. Deterministic rules leave prose

Anything checkable without judgement becomes a lint rule or a guard: icon buttons without accessible names, a Select with two or three static options where radios belong, spacing off the grid, dead selectors, a missing mapping. Prose keeps only what needs the why.

## 7. Keep it live

- Evals: one prompt → expectation pair per critical rule, run against unseen components, scored against the rubric. "Did not load the rules" and "loaded them and broke one" are different failures; test both.
- A review loop: a collector gathers evidence from reviews and chat without proposing; a judge validates and groups; a human decides the destination (rule, reference, exemplar, lint rule, eval, coverage gap, nothing).

The request shape this phase is for: from "can we get 30 minutes with design engineering to figure out how to build the projects page?" to "the system recommends `Overview`: metric row, chart card, table with name/status/usage/plan, no actions in the header. Sound right?" The agent assembles; the team decides.
