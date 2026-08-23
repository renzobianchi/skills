# skills

Agent skills by [Renzo Bianchi](https://github.com/renzobianchi). Each skill is a self-contained folder under `skills/`.

| Skill | What it does |
|---|---|
| [arena-design](skills/arena-design) | Design-exploration arena: N parallel candidates with assigned directions attack the same UX+UI problem in Paper, Figma, or code; visual cross-judge, base + grafts. |
| [html](skills/html) | Standalone interactive HTML artifacts as the medium for agent↔designer conversation: review docs, variant boards, motion comparisons, copy ecosystems. |

## Install

```sh
npx skills add renzobianchi/skills
```

Installs into every agent it detects (Claude Code, Cursor, Codex, Grok Build, and the rest the [`skills` CLI](https://skills.sh) supports). One skill only:

```sh
npx skills add renzobianchi/skills --skill arena-design
```

Without npm: `git clone https://github.com/renzobianchi/skills && sh skills/install.sh` does the same detection and copy.

Each skill's README lists its optional integrations and credits.
