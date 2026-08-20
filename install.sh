#!/bin/sh
# Installs every skill in this repo into the agent skill directories found on this machine.
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGETS=""
for dir in "$HOME/.claude/skills" "$HOME/.codex/skills" "$HOME/.cursor/skills" "$HOME/.grok/skills" "$HOME/.gemini/skills" "$HOME/.config/opencode/skills"; do
  [ -d "$(dirname "$dir")" ] || continue
  mkdir -p "$dir"
  TARGETS="$TARGETS $dir"
done
[ -n "$TARGETS" ] || { echo "No agent directories found (~/.claude, ~/.codex, ~/.cursor, ~/.grok, ~/.gemini, ~/.config/opencode)."; exit 1; }
for skill in "$REPO_DIR"/skills/*/; do
  name="$(basename "$skill")"
  for target in $TARGETS; do
    rm -rf "$target/$name"
    cp -R "$skill" "$target/$name"
  done
  echo "installed: $name"
done
echo "→ into:$TARGETS"
