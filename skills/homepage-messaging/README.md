# homepage-messaging

Turns a positioning doc into what the homepage says and in what order: three value propositions on the Messaging House, a section outline with the element each section leads with, the hero template and line, and the element counts check. Hands the lines to `language-market-fit` for the words. `audit` mode reads a live homepage, tags every headline by element, and says which layer is broken: copy, messaging, or positioning.

```
/homepage-messaging build positioning-cravel.md
/homepage-messaging audit https://example.com
```

Runs after `startup-positioning`; refuses to write a hero without its doc.

## Install

```sh
npx skills add renzobianchi/skills --skill homepage-messaging
```

Works with Claude Code, Cursor, Codex, opencode, and any agent that supports the [skills](https://skills.sh) format. Without npm: `git clone https://github.com/renzobianchi/skills && sh skills/install.sh` installs every skill in the pack, or copy `skills/homepage-messaging` into `~/.claude/skills/`.

## Credits

Distilled from the public posts of Fletch PMM (Anthony Pierri, Robert Kaminski): the messaging elements, the Value Proposition Canvas, the Messaging House, the World's Clearest Homepage Template, the hero templates and the homepage evaluation counts. Framework names are theirs; `references/sources.md` links each part to its post. No post text is reproduced.
