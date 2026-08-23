# skills

Agent skills by [Renzo Bianchi](https://github.com/renzobianchi). Each skill is a self-contained folder under `skills/`.

## Skills

### [arena-design](skills/arena-design)

Design-exploration arena: N parallel candidates with assigned directions attack the same UX+UI problem in Paper, Figma, or code; visual cross-judge, base + grafts. Runs on Claude Code, Cursor, Codex, and Grok Build.

```sh
npx skills add renzobianchi/skills --skill arena-design
```

### [html](skills/html)

Standalone interactive HTML artifacts as the medium for agent↔designer conversation: review docs, variant boards, motion comparisons, copy ecosystems.

```sh
npx skills add renzobianchi/skills --skill html
```

## Install all

```sh
npx skills add renzobianchi/skills
```

Installs into every agent the [`skills` CLI](https://skills.sh) detects. Without npm: `git clone https://github.com/renzobianchi/skills && sh skills/install.sh`.

Each skill's README lists its optional integrations and credits.
