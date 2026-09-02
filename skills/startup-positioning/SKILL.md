---
name: startup-positioning
description: "Guided positioning interview for a B2B product you do not own: readiness gate, reconnaissance, four interview rounds, candidate strategies with thesis and risks, one positioning doc at three lengths."
disable-model-invocation: true
argument-hint: "[product name or URL] [quick]"
allowed-tools: Read, Write, WebFetch, AskUserQuestion, Bash(curl *)
---

# Startup positioning

You run a positioning sprint for someone else's product the way Fletch PMM runs theirs. You interview. The founder holds every fact and you hold the method. The deliverable is a **positioning doc** a homepage can be written from, and it is only done when the founder would put its one-sentence version in their hero.

Vocabulary you use throughout (definitions in [references/elements.md](references/elements.md)): **target customer** (company type, champion), **use case** (an activity you could build an onboarding flow for), **competitive alternative** (how they do it today: a product or a manual process), **problem** (the struggling moment, pointable on a calendar), **product category** (the shelf), **capability** (what the product lets them do), **feature** (what makes the capability possible), **benefit** (the state change).

Language: interview in the founder's language; write the doc in English unless told otherwise.

## Phases

Open a todo list with one entry per phase before asking anything.

0. Readiness gate
1. Reconnaissance
2. Interview (four rounds)
3. Candidate strategies
4. Pick
5. Deliver

`quick` (argument): skip reconnaissance beyond the homepage, run rounds 1 and 2 only, produce two candidates. Say so in the doc header.

## 0. Readiness gate

Positioning is a bet on one segment for months. Before spending an interview, confirm the founder can make that bet. Ask, in one call to the ask-user tool (plain text when the harness has none):

- Do you have paying customers? In one segment or several?
- Are you willing to have the homepage speak to ONE segment for the next six months?
- Why now: expanding, pivoting, or tuning what works?
- What revenue goal in the next 6 to 18 months, and with what GTM resources (reps, marketers, capital)?

A "no" on the second question ends the sprint: report that positioning cannot be done for a founder who will not choose, name what would change that, stop. Gate is closed when all four have answers recorded at the top of the doc draft.

## 1. Reconnaissance

Read before you ask; a question whose answer is on the website is spent attention.

- Fetch the homepage and one product or pricing page. Run the **headline audit**: list every headline, tag each with its element (category, capability, feature, benefit, use case, problem, persona, company type). Then answer from the headlines alone: what is it, who is it for, what does it replace, why is it better. Blanks are the interview's agenda.
- Note the growth model the site implies (sales-led: logos and demo CTA; PLG: trial CTA; marketing-led: one persona, one CTA).
- Note whether the hero leads with an outcome, a category, a capability, or a vision line.

Closed when the audit table exists with the four answers or their blanks.

## 2. Interview

Four rounds, two or three questions per call, adapting to what reconnaissance already answered. Push back on any answer that names a demographic instead of a moment, an outcome instead of an activity, or a category the founder wants instead of one the buyer uses. The exact wording of every question, with the follow-ups that catch vague answers, is in [references/interview.md](references/interview.md); read it before round 1.

**Round 1, core four.** What is your product (category or leading use case)? Who is it for? What does it replace? Why are you better? Then: where are you winning the most today?

**Round 2, the customer.** Company type and champion. The use case, asked as "what do people do with your product," never "why." How they carry it out today. What is limiting about that way. The struggling moment: the day, the meeting, the spreadsheet. Then the ownership test: whose job is solving this, who has budget, and is that the reason people book demos?

**Round 3, the market.** Market maturity: do most people in the target market solve this with the same product category (mature), with bad general tools (emerging), or not at all yet (immature)? Category: "if you find yourself saying 'we're so much more than a ___'," that blank is the category. Alternatives as a JTBD map: DIY, legacy tools bent to the job, manual processes, agencies, in-category vendors; which one you are PRIMARILY against.

**Round 4, the segment.** If more than one segment came up, score each on the ICP scorecard: problem severity (is there a compelling reason to buy), differentiation (are you significantly better than their alternative), access (can you reach them consistently), size (only that it supports the next revenue goal). Then the anti-persona: who is this NOT for.

Present an **interview summary** in the elements vocabulary and stop for confirmation before building strategies; a strategy built on a misheard use case is the expensive failure.

Interview is closed when every element has a value or an explicit "unknown", the struggling moment is a concrete scene, one primary alternative is named, and the founder confirmed the summary.

## 3. Candidate strategies

Build 3 to 5 candidates (2 in `quick`), each a different **anchor**, following [references/frameworks.md](references/frameworks.md) → Market maturity and Positioning Anchors: immature markets anchor on a desired outcome, emerging on the use case, mature on the category; then one or two alternatives that cross the grain (a competitive anchor against the primary alternative, a contextual anchor on the workflow). Each candidate carries:

- **Anchors**: which one leads, which support.
- **Unique value**: the problem tied to that anchor and how the product solves it differently, backed by a feature.
- **Sample hero**: headline and subhead, elements color-labeled in brackets.
- **Thesis**: why the founder SHOULD make this bet.
- **Risks**: why they SHOULD NOT.

Run every candidate through [references/rules.md](references/rules.md) before showing it; a candidate that breaks a rule is rewritten or dropped, and the rule is cited in its risks. Closed when every candidate has all five parts and passed the rules.

## 4. Pick

Lay the candidates side by side. Ask the founder which hero they would put on the homepage tomorrow; a strategy the team would not put in the hero will not be brought to life. When their pick differs from the strongest thesis, state the tradeoff in market terms (reach against clarity, existing energy against evangelizing) and let them decide.

Closed when one candidate is named with the rule rows and interview facts that decided it.

## 5. Deliver

Write `positioning-<slug>.md` in the working directory:

1. Header: date, preset, readiness answers.
2. The elements table (every element, its value, the interview quote it came from).
3. Positioning at three lengths: one sentence (`<category or use case> for <target customer> that <differentiation>`), a ten-second elevator pitch, a homepage story (hero → problem → differentiated solution → benefit).
4. The chosen strategy with thesis and risks; the runners-up in two lines each with why not.
5. Anti-persona.
6. Open questions the founder could not answer, each with where the answer lives (first sales calls, competitor reviews, onboarding data).
7. Hand-off: this doc is the input to `homepage-messaging` (structure and hero) and to `language-market-fit` (copy in the prospect's words).

Closed when the founder confirms the one-sentence version is what they would say on a call.

## Guardrails

Each is the move that keeps the sprint honest, with the failure it prevents.

- **Ask "what do people do with it" and re-ask with the activity frame whenever the answer is a why.** "Why" yields outcomes; only the activity is a use case.
- **Anchor on the category the buyer already shops, and when the category is new, on the use case.** A category the founder wants to own is a shelf nobody visits yet; say the category will form on its own.
- **Keep the candidates separate through the pick, and note the runner-up as a future segment.** A blend of two anchors says one thing about everything.
- **Lead with the clearest anchor, usually the capability, in any competitive category.** Every vendor claims the outcome, and an outcome lead puts the founder in competition with "hire two more reps."
- **Run the readiness gate before the first interview question, every time.** A founder who will not choose a segment gets a doc that decorates the old homepage.
- **Mark every element the founder did not say as inferred.** The doc's authority comes from being the interview, and an inferred line presented as founder-stated is the one they will build on.

## Credits

Method distilled from Fletch PMM (Anthony Pierri, Robert Kaminski, Sara Santanen): the Minimum Viable Positioning canvas, positioning anchors, market-maturity stages, the ICP scorecard, the JTBD positioning map and the Positioning Strategy Visualizer. Their names for things are kept on purpose so their posts stay searchable; [references/sources.md](references/sources.md) lists the posts each part comes from.
