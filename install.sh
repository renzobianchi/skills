#!/bin/sh
# Installs every skill in this repo into the agent skill directories found on this machine.
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGETS=""
for dir in "$HOME/.claude/skills" "$HOME/.claude-personal/skills" "$HOME/.claude-smallstep/skills" "$HOME/.codex/skills" "$HOME/.cursor/skills" "$HOME/.grok/skills" "$HOME/.gemini/skills" "$HOME/.config/opencode/skills"; do
  [ -d "$(dirname "$dir")" ] || continue
  mkdir -p "$dir"
  TARGETS="$TARGETS $dir"
done
[ -n "$TARGETS" ] || { echo "No agent directories found (~/.claude, ~/.claude-personal, ~/.claude-smallstep, ~/.codex, ~/.cursor, ~/.grok, ~/.gemini, ~/.config/opencode)."; exit 1; }
install_one() {
  name="$(basename "$1")"
  for target in $TARGETS; do
    rm -rf "$target/$name"
    cp -R "$1" "$target/$name"
  done
  echo "installed: $name"
}
for skill in "$REPO_DIR"/skills/*/; do
  if [ -f "$skill/SKILL.md" ]; then
    install_one "$skill"
  elif [ -d "$skill/adapters/claude/skills" ]; then
    # A package (core + per-tool adapters): install its Claude skills, which are self-contained.
    for sub in "$skill"/adapters/claude/skills/*/; do install_one "$sub"; done
  fi
done
echo "→ into:$TARGETS"
