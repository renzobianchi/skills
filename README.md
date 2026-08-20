# skills

Agent skills by [Renzo Bianchi](https://github.com/renzobianchi). Each skill is a self-contained folder under `skills/`.

| Skill | What it does |
|---|---|
| [arena-design](skills/arena-design) | Design-exploration arena: N parallel candidates with assigned directions attack the same UX+UI problem in Paper, Figma, or code; visual cross-judge, base + grafts. |
| [html](skills/html) | Standalone interactive HTML artifacts as the medium for agent↔designer conversation: review docs, variant boards, motion comparisons, copy ecosystems. |

## Install everything

```sh
git clone https://github.com/renzobianchi/skills && sh skills/install.sh
```

The script detects your installed agents (Claude Code, Codex, Cursor, Grok, Gemini CLI, OpenCode) and copies every skill into each one's skills directory.

## Install one skill

```sh
cp -R skills/skills/arena-design ~/.claude/skills/arena-design
```

Each skill's README lists its optional integrations and credits.
