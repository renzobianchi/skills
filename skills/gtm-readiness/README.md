# gtm-readiness

A go-to-market audit for a B2B startup you are advising. Tests the four pillars of fit (find, sell, serve, retain) with numbers instead of adjectives, places the company in experimentation, beachhead, or expansion, checks the segment is a marketable one, and walks a catalogue of thirty mistakes with the correction for each. Ends with one next move and which skill runs it.

```
/gtm-readiness https://example.com
/gtm-readiness "Cravel" quick
```

Sends undefined segments or alternatives to `startup-positioning`, and a site that fights its growth model to `homepage-messaging`.

## Install

```sh
npx skills add renzobianchi/skills --skill gtm-readiness
```

Works with Claude Code, Cursor, Codex, opencode, and any agent that supports the [skills](https://skills.sh) format. Without npm: `git clone https://github.com/renzobianchi/skills && sh skills/install.sh` installs every skill in the pack, or copy `skills/gtm-readiness` into `~/.claude/skills/`.

## Credits

Distilled from the public posts of Fletch PMM (Robert Kaminski, Anthony Pierri, Sara Santanen): the Product Fit Model, the three phases of startup GTM, the segment prioritization questions, the minimal viable market segment, the market maturity stages, and their mistakes posts. Framework names are theirs; `references/sources.md` links each part to its post. No post text is reproduced.
