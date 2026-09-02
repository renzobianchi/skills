---
name: gtm-readiness
description: "Go-to-market audit for a B2B startup: which fit it has (find, sell, serve, retain), which GTM phase it is in, whether the segment is real, and the mistakes in play, each with the correction."
disable-model-invocation: true
argument-hint: "[product name or URL] [quick]"
allowed-tools: Read, Write, WebFetch, AskUserQuestion, Bash(curl *)
---

# GTM readiness

You audit whether a startup is ready to scale what it is doing, and if not, which phase it is really in. Founders arrive claiming product-market fit from a handful of customers and a platform roadmap; the audit tests four pillars for repeatability, places the company in one of three GTM phases, checks the segment is a marketable one, and names the mistakes from a catalogue of thirty with the correction for each.

Vocabulary: **fit** is repeatability, measured per pillar; **segment** is workflow plus competitive alternative plus problem; **phase** is experimentation, beachhead, or expansion. A revenue number is evidence for a pillar, never fit itself, and firmographics alone are a mailing list, never a segment. Definitions and procedures in [references/frameworks.md](references/frameworks.md); read it before the interview.

Output: a **readiness report** with a verdict per pillar, the phase, the segment check, the mistakes in play, and the one next move.

## Phases

Open a todo list with one entry per phase.

1. Reconnaissance
2. Interview (three rounds)
3. Placement
4. Mistakes in play
5. Report

`quick`: reconnaissance plus round 1, placement, report. Say so in the header.

## 1. Reconnaissance

Fetch the homepage, pricing, and one customer or case-study page. Record: the growth model the CTAs imply (trial, demo, contact sales), the number of personas and use cases the site claims, whether the hero leads with an outcome, a capability, a category or a vision, whether a platform or suite is claimed, and which industries or segments are named. Each one is a hypothesis the interview confirms or drops.

Closed when the five observations are written down with the line that supports each.

## 2. Interview

Two or three questions per call to the ask-user tool. Wording and follow-ups in [references/interview.md](references/interview.md).

**Round 1, the four pillars.** Can you consistently get in front of your ideal customers? Consistently close deals with them? Consistently get them to value? Do they stick around? For each, the follow-up is the number: how many of the last ten, and were they the same kind of customer. "Consistently" with no number is a no.

**Round 2, the segment.** Company type, champion, the workflow they buy for, what they used before, and the problem in the champion's framing. Then: who was easiest to close, who gets the most joy from the product, who shares it, and who churned. Any customer using an alternative with no complaint about it is outside the ICP.

**Round 3, the plan.** What are you building toward: one feature with fit, a product, a platform? How many segments are you selling to now, and with how many people? Distribution advantage (community, audience, virality, a large raise)? Time to value: minutes, weeks, quarters?

Closed when each pillar has a number, the segment has all five dimensions or an explicit blank, and the plan questions are answered.

## 3. Placement

From the interview, decide and justify with the founder's own numbers:

- **Fit**: which pillars repeat. Retain course-corrects the others: strong find and sell with weak retain means the wrong customers were found and sold, which is a segment problem.
- **Phase**: experimentation (still learning who cares most), beachhead (one use case for one group, building the plumbing, aiming at repeatability), or expansion (adding a segment or a use case). The exit signal from experimentation is a gut feeling that you could sell a lot to one specific market; the exit from beachhead is repeatability and predictability; ARR is evidence of it, never the criterion.
- **Market maturity**: immature, emerging, or mature, from what the customers used before.
- **Segment**: marketable or not, on the four prioritization questions (sticks, reachable, sellable, onboardable; size is not one of them).

Closed when the four placements each cite an interview number or quote.

## 4. Mistakes in play

Walk [references/mistakes.md](references/mistakes.md) top to bottom against the placement and the reconnaissance. List every mistake that holds, with the evidence line and the prescribed correction. Keep only those with evidence; a padded list buries the one that matters.

Closed when every entry in the catalogue has been checked and the list carries only those with evidence.

## 5. Report

Write `gtm-readiness-<slug>.md`:

1. Verdict in one line: the phase, and whether the current motion is ready to scale.
2. Pillars table: pillar, repeatable yes/no, the number.
3. Segment: the five dimensions and the prioritization answers.
4. Mistakes in play, ordered by cost, each with correction.
5. The one next move (a segment to commit to, a phase to finish, a positioning sprint to run) and which skill runs it: `startup-positioning` when the segment or the alternative is undefined, `homepage-messaging` when the site does not support the growth model.
6. What could not be verified and where the answer lives.

Closed when the founder can say which phase they are in without hedging.

## Guardrails

- **Grade fit pillar by pillar with the founder's numbers.** A million in ARR from five segments is initial traction toward five different fits.
- **Score segments on sticks, reachable, sellable, onboardable, and leave size out.** The biggest segment attracts the worst-fit customers, who pull the product apart.
- **Audit the wedge the company sells today, and treat the platform as a sequence.** Fit is found one feature at a time.
- **Read weak retain as a segment problem before a marketing problem.** Churn means the wrong customers were found and sold.
- **Take the wedge as the market's story and the vision as the investors'.** Customers are told the wedge; investors are told everything.
- **List three mistakes with evidence over fifteen that might apply.** The one that matters gets buried in a padded list.

## Credits

Method distilled from Fletch PMM (Robert Kaminski, Anthony Pierri): the Product Fit Model, the three phases of startup GTM, the segment prioritization questions, the minimal viable market segment, the market maturity stages, and their mistakes posts. Names kept on purpose; [references/sources.md](references/sources.md) maps each part to its post.
