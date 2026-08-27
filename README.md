# skills

Agent skills by [Renzo Bianchi](https://github.com/renzobianchi). Each skill is a self-contained folder under `skills/`.

## Skills

### [arena-design](skills/arena-design)

Design-exploration arena: N parallel candidates with assigned directions attack the same UX+UI problem in Paper, Figma, or code; visual cross-judge, base + grafts. Runs on Claude Code, Cursor, Codex, and Grok Build.

```sh
npx skills add renzobianchi/skills --skill arena-design
```

### [ds-ai-ready](skills/ds-ai-ready)

Migrate a design system to shadcn, or start one from zero, so agents can build with it: phase skills (`/ds-migrate`), component rules that fire on the namespace (`ds-rules`), per-component parity manifests with guards, adapters for Claude Code, Cursor, Codex and Grok. Also a Claude Code plugin: `/plugin marketplace add renzobianchi/skills`.

```sh
git clone https://github.com/renzobianchi/skills && sh skills/install.sh
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

Each skill's README lists its optional integrations and credits. The repository is MIT; `skills/ds-ai-ready` carries its own Apache 2.0 license.
