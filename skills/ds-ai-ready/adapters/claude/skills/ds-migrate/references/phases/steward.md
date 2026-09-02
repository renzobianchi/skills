# Phase: steward

Runs after `cleanup` and `patterns`. The migration is over: `1.0.0` is published, the legacy map is deleted, the vocabulary exists. Every earlier phase assumed one team building against one kit. This phase answers what none of them do: other teams now want to add to the system, and it has to survive them.

Run it after `patterns`, not before. Open contribution while the recurring decisions are still unnamed and every contributor relitigates them, because a reviewer refusing a fourth button variant has nothing to point at except taste.

## 1. Read the model off the repo, do not choose it

The ownership model is a fact about who already ships, not a preference. Count it:

```
How many teams outside the system's own owners merged a PR
touching `namespace` in the last 90 days?

├── 0  → centralized. The owners build everything; others file requests.
├── 1-2 → hybrid. Owners hold the core; those teams hold their own composites.
└── 3+  → federated. It is already federated whether it is written down or not.

Then: is there a named person whose job description includes this system?
└── No → the model is centralized regardless of the count above.
         Contributions with no owner to review them become the contributors'
         fork, and the fork is discovered a year later.
```

Fill the `governance` block that `foundations` left empty in `ds.config.json`:

```json
"governance": {
  "model": "centralized",
  "owners": ["<github-handle>"],
  "contribution": "request",
  "noticeMajor": "6 weeks"
}
```

`contribution` is `request` (file an issue, owners build), `rfc` (proposal reviewed before code), or `open-pr` (build it, owners review). It must match `model`: a `centralized` model with `open-pr` contribution is a queue of PRs nobody is accountable for reviewing.

**Done when:** `governance` is in `ds.config.json`, the count that produced `model` is in the RFC addendum with its date, and the owners named agree in writing.

## 2. Name the public surface, because semver is undecidable without it

A version number means nothing until the surface it describes is written down. For this package the surface is exactly three things:

1. Every export from the namespace index.
2. Every prop on those exports, including its type.
3. Every token name in `theme.css`.

Anything else is internal: file layout, slot structure, class strings, which primitive a component wraps. Consumers who reach past the surface are on their own, and the RFC says so once.

**Done when:** the three-item list is in the RFC and in the namespace's README.

## 3. Version as a contract with consumers

| Bump | When |
|---|---|
| **major** | An export is removed or renamed. A prop is removed, or its type narrows. A token name is removed. A default changes what renders. |
| **minor** | A new component. A new value on an existing variant axis. A new optional prop. A deprecation is announced. |
| **patch** | Everything else, including fixes that leave the axis list and the rendered output unchanged. |

This table replaces the `0.x` release policy the RFC carried from foundations. That policy held while the surface was still moving; from `1.0.0` on, the table below is the contract.

The case that is always argued: **a visual change that touches no API.** It ships as `minor` with a note in the changelog, never `patch`. A consumer with snapshot tests wakes up to a red CI either way; the difference is whether they were told. Patch releases are the ones teams auto-merge.

**Done when:** the table is in the namespace's `CONTRIBUTING.md` and one release of each kind has shipped under it.

## 4. Deprecate with machinery, not with a comment

A component leaving the system uses the manifest, the same as one entering it. Set its parity manifest to:

```json
"status": "deprecated",
"supersededBy": ["field", "field-label"],
"removeIn": "2.0.0"
```

`node scripts/ds-manifest.mjs check` fails when a `deprecated` component names neither. A deprecation with no replacement and no removal version is a permanent warning, and consumers correctly learn to ignore permanent warnings.

While deprecated the component stays exported, stays tested, and keeps its stories. Its usage doc gets the replacement recipe as its first line, in the same find-and-replace shape `MIGRATION.md` used for legacy exports, because the consumer doing the work has the same job either way.

Removal happens in the major named by `removeIn`, announced `noticeMajor` before it ships.

**Done when:** `PARITY.md` has its Deprecated section, the guard has been seen failing on a `deprecated` entry missing `removeIn`, and every deprecated component's usage doc opens with its recipe.

## 5. Gate contributions on the guards that already exist

A contributed component passes exactly what a core component passes. Nothing new to remember:

- `node scripts/ds-manifest.mjs check` green.
- The guard test green.
- Its kit page at the ready marker, per rule 1. A contribution with no kit page is a request, not a contribution.
- A usage doc with no `<fill>` left, written by the contributor, with the owner's notes added by the owner.

Plus one rule that only applies to contributions:

**A contributed component needs a second consumer before it is absorbed.** One caller means it belongs to that caller. Absorbing it makes the owners maintain a private component forever, and the owners find out when they try to change it. Until a second consumer exists it lives in the contributing team's code, and the manifest carries it as `code-only` with the reason in `note`.

**Done when:** `CONTRIBUTING.md` lists these gates and points at the commands, and the last merged contribution passed all of them.

## 6. Keep the model honest

Rerun step 1's count every quarter. The model is wrong the moment the count moves a bracket, and the symptom is always the same in either direction: a centralized system with a federated count has a request backlog nobody is servicing, and a federated system with a centralized count has one exhausted person reviewing everything.

Changing the model is an RFC addendum, not a quiet edit to `ds.config.json`.

**Done when:** the count and its date are in the RFC addendum, and the next review is on someone's calendar.

**Phase done when:** `ds.config.json` carries `governance`, `CONTRIBUTING.md` exists with the surface, the bump table and the gates, the deprecation guard has been exercised red and green, and the RFC has the addendum with the model and the count behind it.
