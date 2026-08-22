# arena-design

Design-exploration arena for coding agents: N parallel candidates attack the same design problem from **assigned, mutually exclusive directions** (density, structure, pattern, tone), a cross-judge scores the **rendered artifacts** against a UX+UI rubric, and the winner absorbs the best grafts from the losers. Because the right layout is rarely the first one you try, and averaging two good layouts produces a bad one.

Works in three mediums, one per run:

- **Paper** via the [Paper MCP](https://paper.design) — one artboard per candidate
- **Figma** via the [official Figma MCP](https://www.figma.com/developers) (read) + [Figma Console MCP](https://github.com/figma-console) with Desktop Bridge (write) — one Section per candidate
- **Front-end code** — a throwaway `/arena/<slug>` route with a picker, or standalone HTML boards

## Install

Copy this folder into your agent's skills directory (`~/.claude/skills/arena-design`, `~/.codex/skills/arena-design`, etc.). Invoke with `/arena-design` — it is deliberately user-invoked (`disable-model-invocation: true`); it will not fire on its own.

## Presets

Two presets set how much a run spends: `quick` (2-3 candidates, local pattern catalog, the parent judges from screenshots, no re-run) and default (3-4 candidates, Mobbin/web research, a separate judge on a different model, one re-run on convergence). The skill asks which one at intake, recommends one from context, and declares in the synthesis note what `quick` skipped. There is no "high" preset on purpose: more candidates only help when the problem has more real axes.

## Optional integrations (graceful degradation built in)

The skill runs self-contained: pattern research falls back to a bundled local catalog (`references/patterns.md`) when no external source is available. Each of these makes it stronger:

| Integration | What it adds | Install |
|---|---|---|
| [Mobbin MCP](https://mobbin.com) | Real production screens/flows for the grounding memo | Mobbin account + MCP setup |
| [Emil Kowalski's skills](https://aiforui.dev) (`design-foundations`, `typography`, `color`, `forms-and-inputs`, `animate`) | Craft floor each candidate reads before designing | `npx @aiforui/install` |
| [impeccable](https://impeccable.style) | The judge's craft-floor lens | see its site |
| `better-layout`, `better-accessibility` ([Jakub Krehel](https://github.com/jakubkrehel/skills)) | Layout/a11y depth for relevant problems | `npx skills add jakubkrehel/skills` |

## Credits

- Arena pattern (frame → fan out → cross-judge → pick → graft → verify) adapted from [`arena`](https://github.com/cursor/plugins/tree/main/pstack) by [Lauren Tan](https://x.com/poteto) (pstack).
- Craft-layer skills by [Emil Kowalski](https://x.com/emilkowalski_), [Jakub Krehel](https://x.com/jakubkrehel), and [Paul Bakaus](https://x.com/pbakaus) (impeccable) — see table above.
- Design-arena adaptation by [Renzo Bianchi](https://x.com/renzobianchi_).
