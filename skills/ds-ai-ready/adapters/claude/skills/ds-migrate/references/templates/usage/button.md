# Button

Generated scaffold from `button.json`; the prose is written by hand and reviewed by the design owner. Axes and composition stay in sync with the manifest by hand: when the manifest changes, this file changes in the same PR.

## Use when

- The user triggers an action: submit, confirm, open, create.
- One primary action per view; everything else is `secondary`, `outline` or `ghost`.

## Use something else when

- The action navigates to another page: a link styled as a button lies to screen readers and to the browser; use `Link`, or `variant="link"` only for an in-flow action that reads as text.
- The control toggles a state that persists (on/off): `Toggle`.
- The choice is one of several exclusive options: `RadioGroup` or `Select`.

## Variants

- `variant="default"`: the one primary action of the view.
- `variant="secondary"`: a supporting action beside a primary.
- `variant="outline"`: an action on a busy surface where filled buttons would compete.
- `variant="ghost"`: toolbar and inline actions; no container of its own.
- `variant="destructive"`: deletes or cannot be undone; pair with a confirmation when the loss is real.
- `variant="link"`: an action that reads as text inside prose.
- `size="sm"`: dense tables and toolbars.
- `size="default"`: forms and dialogs.
- `size="lg"`: marketing and empty states.
- `size="icon"`: icon-only; `aria-label` is mandatory.

## Composition

- State=Loading: render `<Spinner />` as a child and set `disabled`; there is no `loading` prop, so the label stays visible and width does not jump.
- Show Icon: pass the icon as a child before the label; no `icon` prop.

## Decisions

- Loading is composition, decided with the design owner: a prop hid the label and shifted width.

## Owner notes

- Callers reach for `destructive` for anything red, including "Cancel". Cancel is `ghost` or `outline`; destructive means loss.
- Two primary buttons in one dialog is the request to refuse; ask which one the user came for.
