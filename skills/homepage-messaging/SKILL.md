---
name: homepage-messaging
description: "From a positioning doc to a homepage: value propositions on the Messaging House, section outline, hero choice, element counts; hands finished lines to language-market-fit for voice. Also audits an existing homepage by element."
disable-model-invocation: true
argument-hint: "[build <positioning doc path> | audit <url>]"
allowed-tools: Read, Write, WebFetch, AskUserQuestion, Bash(curl *)
---

# Homepage messaging

You turn positioning into what the homepage says, in what order. Most copywriting problems are messaging problems, and most messaging problems are positioning problems, so this skill refuses to write a hero for a product with no positioning doc: `build` needs the doc from `startup-positioning`; `audit` reads a live page and reports which layer is broken.

Vocabulary: the messaging elements in [references/elements.md](references/elements.md). Every headline you write or grade is tagged with one.

Output of `build` is a **messaging doc**: the Messaging House, the section outline with the element each section leads with, the hero, and a hand-off to `language-market-fit`, which owns the words. This skill decides which element goes where. That skill decides whether the words are the prospect's.

## Mode

`build <path>`: read the positioning doc, run phases 1 to 5. `audit <url>`: run the audit at the end of this file. No argument: ask which.

## 1. Purpose and reader

Two questions before any structure, in one call to the ask-user tool:

- What is the homepage for: explore (marketing-led, convert one persona on a CTA), try (PLG, get a trial), or book a demo (sales-led, establish credibility)? The growth model decides what the hero leads with (marketing-led: maximal clarity on what the product does; PLG: the most compelling capability and the feature behind it; sales-led: credibility beside the capability).
- Who reads it: the **ignorant champion**, a senior manager to VP who has the problem and has never heard of you. The executive never reads the homepage; the powerless end user cannot buy (PLG excepted).

Closed when both are recorded at the top of the messaging doc.

## 2. Value propositions

Three arguments for why the target customer should use the product, each tied to a sub-use case, built on the **Value Proposition Canvas** in [references/frameworks.md](references/frameworks.md): for one persona, answer the seven questions in order (who, what capability, when needed, how done today, what limits that way, what problem results, what outcome). Two checks per value prop: the limitation contrasts sharply with the capability (that contrast is the differentiation), and the benefit directly opposes the problem. Every capability names the feature that powers it.

When the product has more than three candidate arguments, score features: biggest problem solved (1 to 5) plus biggest wow factor (1 to 5); the three highest go on the page.

Closed when the Messaging House has its top (the positioning doc's one sentence, with one market element and one product element) and three value props, each with all seven answers.

## 3. Section outline

Start from the **World's Clearest Homepage Template** and adapt by category maturity and growth model, per the section table in the frameworks reference: hero → problem → solution intro → three value-prop sections at the feature-set level → proof → CTA. Then decide the post-hero section type: How It Works for a new category (capability plus feature), Use Cases for a horizontal product, Features only in a very mature category, Results last and only if forced.

Multi-audience or multi-product: pick one persona for the first one to three scrolls and prioritize one product; the others get their own pages. Itemizing every product in the hero or summarizing them into an abstraction are the two ways the hero stops saying anything. Vision and roadmap go on their own page.

Closed when every section has the element it leads with, the value prop it carries, and a one-line purpose; and the element counts on the page are within range (personas 1 to 2, problems 1 to 3, category exactly 1, capabilities 1 to 3, features 1 to 5, benefits 1 to 3).

## 4. Hero

The hero is the only line guaranteed to be read. It answers what is it, who is it for, what does it let me do; or, in the two-question test, "which of my tools does this replace" or "which task in my job does this help with." Choose the template from the frameworks reference (X for Y, category differentiator, how-to, networker) by market maturity and by which element the positioning doc leads with; then write headline, subhead, and the product visual that goes beside it (real UI, never an illustration).

Run the hero and every section headline through [references/rules.md](references/rules.md). Rewrite any line that fails a rule. A line that keeps failing has an abstract claim underneath it; fix the claim in the messaging doc and the wording follows.

Closed when a stranger reading only the hero can say what the product does and who it is for.

## 5. Deliver and hand off

Write `messaging-<slug>.md`: purpose and reader, the Messaging House, the section outline table, the hero with its template and element tags, the counts check, and what was left off the page and why. Then hand the outline to `language-market-fit compose` with the positioning doc attached: it rewrites each line in the prospect's words and runs the voice gate. Copy is not final until it has passed there.

Closed when the messaging doc exists and the hand-off names the exact lines the copy pass must keep as element anchors.

## Audit mode

Fetch the page. **Headline audit**: list every headline in order, tag each with its element, note the growth model the CTAs imply. Then grade:

1. Do the headlines alone answer what is it, who is it for, what does it replace, why is it better? Quote the blanks.
2. Which layer is broken: copy (right elements, wrong words → send to `language-market-fit audit`), messaging (wrong element leads, wrong order, counts out of range → this skill's phases 3 and 4), or positioning (no target customer, no alternative, an outcome lead in a mature category → send to `startup-positioning`)?
3. The rules broken, by number, each with the failing line quoted and the rewrite direction.

Lead with the biggest problem. End with the one change that would move the most, and which skill does it.

## Guardrails

- **Place elements here and send every line to `language-market-fit` for the words.** A hero written in this skill skips the voice gate.
- **Lead with the capability and close with the benefit.** The reader sees what it does before believing what it changes; a benefit lead sounds bigger and reads as any vendor's promise.
- **Stack elements until the two hero questions are answered, then stop.** A three-word tagline obscures the product; a paragraph makes the reader bounce.
- **Keep results and ROI below the fold, and keep benefits first-order.** A fourth-order outcome is a promise every competitor also makes.
- **Name features in plain words.** A branded feature is a word the reader has to learn before it means anything.
- **Give a multi-persona product one persona for the first scrolls and a page per persona after.** A channel-changer hero speaks to nobody.

## Credits

Method distilled from Fletch PMM (Anthony Pierri, Robert Kaminski): the messaging elements, the Value Proposition Canvas, the Messaging House, the World's Clearest Homepage Template, the hero templates and the homepage evaluation counts. Names kept on purpose; [references/sources.md](references/sources.md) maps each part to its post.
