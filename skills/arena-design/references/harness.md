# Harness table

The process in `SKILL.md` is harness-neutral; this file maps its four mechanics to each agent CLI. Verified 21 Aug 2026 against official docs; rows marked (unconfirmed) come from community sources or could not be read directly.

| Mechanic | Claude Code | Cursor (editor + CLI) | Codex CLI | Grok Build CLI |
|---|---|---|---|---|
| Skills dir read | `~/.claude/skills/` | `~/.agents/skills/`, `~/.cursor/skills/` | `~/.agents/skills/` | `~/.agents/skills/`, `~/.claude/skills/`, `~/.grok/skills/` |
| Manual-only invocation | `disable-model-invocation: true` in frontmatter | same frontmatter field | `policy.allow_implicit_invocation: false` in `agents/openai.yaml` (frontmatter field ignored) | same frontmatter field |
| Invoke by name | `/arena-design` | `/arena-design` | `$arena-design` | `/arena-design` |
| Spawn a subagent | `Agent` tool | `Task` tool | `spawn_agent` | `spawn_subagent` |
| Background fan out | `run_in_background: true` | `is_background: true` (subagent frontmatter; per-call flag unconfirmed) | spawn then `wait_agent` | `background: true` |
| Judge on another model | `model: opus/sonnet/haiku` per call | `model` in a subagent definition under `~/.cursor/agents/` | `spawn_agent` `model` param | `[subagents.models]` in `config.toml`, or a per-spawn param (name unconfirmed) |
| Ask the user a structured question | `AskUserQuestion` | "Ask questions" tool | `request_user_input`, Plan mode only; elsewhere ask in plain text and wait | ask-user-question tool (schema unconfirmed) |
| Todo list | `TodoWrite` | built-in todos | built-in plan/todos | built-in todos |
| MCP (Paper, Figma, Mobbin) | `claude mcp add` | `~/.cursor/mcp.json` | `codex mcp add` | `grok mcp add`, also reads `.cursor/mcp.json` and `.claude.json` |

Model names differ per harness; the judge rule is "a different model from the parent's, ideally a different family", whatever the harness calls it.

Headless caveats: Cursor's print mode auto-skips questions (community report); Codex outside Plan mode has no structured question tool. In both, Intake degrades to a plain-text question.
