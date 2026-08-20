# skills

Agent skills by [Renzo Bianchi](https://github.com/renzobianchi). Each skill is a self-contained folder: copy it into your agent's skills directory (`~/.claude/skills/`, `~/.codex/skills/`, etc.) and invoke it by name.

| Skill | What it does |
|---|---|
| [arena-design](skills/arena-design) | Design-exploration arena: N parallel candidates with assigned directions attack the same UX+UI problem in Paper, Figma, or code; visual cross-judge, base + grafts. |
| [html](https://github.com/renzobianchi/html-skill) | Standalone interactive HTML artifacts as the medium for agent↔designer conversation (published separately). |

## Install

```
cp -R skills/arena-design ~/.claude/skills/arena-design
```

Each skill's README lists its optional integrations and credits.
