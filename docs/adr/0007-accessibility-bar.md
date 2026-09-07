# 7. Accessibility bar

- Status: Accepted
- Date: 2026-09-07
- Source: [Accessibility bar](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/9)

## Context

Layout is fixed (ADR 3). This ADR sets the accessibility bar and the concrete
markup / behaviour that meets it.

## Decision

### Conformance target

**WCAG 2.1 AA on the essentials below**, verified by a manual keyboard +
screen-reader spot check and a few assertions in the Playwright smoke (ADR 6). No
axe-core gate, no third-party audit, no NVDA/JAWS/VoiceOver certification pass.

### Structure & names

- One landmark: `<main>` around the calculator. Visually-hidden `<h1>Calculator</h1>`.
- **Display** — `role="group"` `aria-label="Display"`. The visible primary/secondary
  lines are plain text. A separate **`sr-only` element with `aria-live="polite"`
  `aria-atomic="true"`** is the announcement channel (below).
- **Keypad** — `role="group"` `aria-label="Keypad"`. Plain `<button type="button">`s
  in a CSS grid — no `grid`/`gridcell` roles.
- **Key `aria-label`s** (from the keypad layout config): `×`→"Multiply",
  `÷`→"Divide", `−`→"Subtract", `+`→"Add", `=`→"Equals", `⌫`→"Delete", `AC`→"All
  clear", `.`→"Decimal point". Digits `0`–`9` use their visible text.
- **History** — `<section aria-labelledby>` → real `<h2>History</h2>`. Entries:
  `<ul>` › `<li>` › `<button type="button" aria-label={`Recall ${resultDisp}`}>`
  (terse: "Recall 21", "Recall -4", "Recall 2e+12"); the visible row keeps its
  two-line `expr` / `= result`. Empty state: a `<p>` — *"No calculations yet. Press
  equals to add one."* Clear-history: `<button type="button">Clear history</button>`
  with native `disabled` when the list is empty.

### Live-region announcements — settled values only

`selectAnnouncement(state): string | null` (in `src/calculator/selectors.ts`):

- `operatorPending` → `` `${groupThousands(format(left))} ${word(operator)}` `` (`"1,234 times"`)
- `result` → `groupThousands(state.display)` (`"21"`)
- `error` → `"Error"`
- `first` | `second` → `null`

`word()`: `+`→"plus", `−`→"minus", `×`→"times", `÷`→"divided by".

`Calculator` keeps the previous announced string in a `useRef` and writes the
live-region node only when `selectAnnouncement` is non-null **and changed** — so
`digit` / `decimal` / `backspace` never announce; `operator` / `equals` / `error` /
`recallResult` do. This is the only accessibility logic in the container.

### Focus

- **Tab order = source order**, row-major through the keypad
  (`AC, ⌫, ÷, ×, 7, 8, 9, −, 4, 5, 6, +, 1, 2, 3, =, 0, .`), then History
  (`Clear history`, then row buttons top→bottom). No `tabindex`, no roving tabindex,
  no focus trap, no autofocus.
- **Custom focus ring** on every interactive element:
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  focus-visible:ring-<token>`, ring colour ≥ 3:1 against both the control fill and
  the page ground (SC 1.4.11). The UA outline is not relied upon.
- Focus never moves programmatically — after `AC`, `clearHistory`, or recalling a
  row, focus stays on the pressed button; the live region carries the result.

### Colour contrast (WCAG AA) — implementer fills final hex + measured ratios

| Pair | Min | Note |
|---|---|---|
| Display primary text / display bg | 4.5:1 | SC 1.4.3 |
| Grey expression text (secondary line + history `expr`) / its bg | 4.5:1 | real text, not decoration |
| Operator button text / blue fill | 4.5:1 | prototype `#2563eb` + white ≈ 5.2:1 |
| `=` text / accent fill | 4.5:1 | prototype `#1d4ed8` + white ≈ 6.3:1 |
| Button border, focus ring, control-vs-ground edges | 3:1 | SC 1.4.11 |
| "Error" | — | not colour-alone: literal word + spoken by the live region (SC 1.4.1) |

### Motion & reflow

- The ~660px responsive collapse is a plain layout reflow — **no transition /
  animation**, nothing to guard.
- Any button hover/press micro-transition added later must be ≤150ms and gated by
  `motion-reduce:` / `@media (prefers-reduced-motion: reduce)`.
- SC 1.4.10: usable at 320px width / 400% zoom — the stacked layout covers it;
  verify no horizontal scroll at 320px. Long display values wrap (`break-all`).

### Explicitly not done

No formal / axe-core audit, no AT certification pass, no forced-colors / high-
contrast theming, no skip links (single landmark). **Keyboard operation** of the
calculator (typing digits, Enter = equals) is out of scope per the map — only
Tab/focus navigation and AT semantics are guaranteed.

## Consequences

- `Calculator` gains a small announcement diff (`useRef` + live-region write);
  `selectAnnouncement` joins the selectors module (recorded as an addendum on
  ADR 5).
- The Playwright smoke gains the accessibility assertions listed in ADR 6.
