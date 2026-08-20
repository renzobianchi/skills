# Medium: front-end code

Running the arena as real variants in the project.

## Candidate separation

Two forms, by weight:

- **Throwaway route** (default): an `/arena/<slug>` route in the project with a picker between the N candidates, each candidate as its own component at `arena/<slug>/candidate-<direction>.tsx`. Same mechanics as the `prototype` skill; use it as the reference for the picker and live-tuning controls when needed.
- **Standalone HTML** in `artifacts/` (the `html` skill): when the candidate does not need the app's real state. One file per candidate, or a single variant board with the N numbered.

Candidates use the project's **real tokens and components** (import the theme, never re-declare colors): the system rubric is judged against the real system.

## Rendering for the judge

Screenshot of each candidate rendered in the browser (realistic viewport; light and dark when the project has both). With Playwright available, also capture the edge-content state (long string, empty list). The judge receives images + the files.

## Verify

The synthesized artifact replaces or is promoted from the arena route to the real surface, and is verified **in the running browser**, not in the diff: hover/focus states, the project's breakpoints, reduced motion when there is animation. The `/arena/<slug>` route is deleted on promotion (or explicitly kept as a record when the user asks).
