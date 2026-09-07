# CONTEXT — React + TypeScript calculator

A small, desktop-friendly, **fully client-side** calculator: `+ − × ÷`, decimal
entry, clear, delete/backspace, equals, and an in-session calculation history.
No backend, database, authentication, or cloud storage. Arithmetic uses native
JavaScript `number` — no decimal library.

This document is the entry point for anyone (human or agent) about to work in the
codebase. The decisions behind it live in [`docs/adr/`](docs/adr/); read the ADRs
that touch your area. They were produced by the wayfinding effort at
[issue #1](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/1) and
are **accepted** — the app has not been implemented yet.

## Architecture at a glance

```
src/
  calculator/     pure, framework-free (no React imports)
    types.ts        Op, Status, HistoryEntry, State, Action
    constants.ts    ERROR_TOKEN, INVALID, HISTORY_CAP (50), SIG (12), MAX_INPUT_DIGITS (15)
    format.ts       format(), evaluate(), groupThousands()
    reducer.ts      initialState, reducer()          ← the single source of truth
    selectors.ts    selectPrimaryDisplay, selectSecondaryDisplay,
                    selectHistoryRows, selectAnnouncement
  components/      React view — Tailwind utilities, no CSS files, presentational
    Calculator.tsx  owns the one useReducer; wires the three children
    Display.tsx  Keypad.tsx  Key.tsx  History.tsx
```

**Data flow:** buttons `dispatch` an `Action` (prop-drilled, no context) →
`reducer` produces the next `State` → `Calculator` runs the pure **selectors** over
`State` and passes plain strings/rows to the presentational components. The view
never imports `format` / `groupThousands` directly.

**One-way invariants**

- `state.display` is always **comma-free** and `Number()`-parseable (raw entry
  buffer, `format()` output, or `"Error"`). Comma grouping happens only at render,
  via `groupThousands`.
- Every number becomes a string through `format()` before it enters `display` or a
  history entry.
- `history` is newest-first and hard-capped at 50; it is in-memory only and is lost
  on reload.
- A history entry is created **only** by `=` on a valid result. Failed `=`
  (division by zero, overflow) produces no entry.
- The engine is pure: `reducer(state, action)` never mutates its input.

## Glossary

Use these terms verbatim in issues, tests, and code.

| Term | Meaning |
|---|---|
| **Immediate execution** | Each operator resolves the pending binary operation at once. No operator precedence, no expression parser. `7 + 3 × 2 =` is `20`. |
| **Entry buffer** | The number string being typed; it *is* `state.display` while `status` is `first` or `second`. Fresh value `"0"`; no leading zeros; one `.`; max 15 significant digits. |
| **`status`** | One of `first`, `operatorPending`, `second`, `result`, `error` (ADR 1). |
| **`left` / `operator`** | The stored left operand (a `number`) and pending `Op`. The right operand is not stored — it lives in `display` during `second`. |
| **`Op`** | `'+' \| '-' \| '×' \| '÷'`. Operator glyphs `− × ÷` are used in the UI and history; a negative *value* keeps an ASCII `-`. |
| **`evaluate(left, op, right)`** | Pure; returns a finite `number` or the `INVALID` sentinel (÷0, `0÷0`, IEEE overflow). `INVALID` sends the machine to `error`. |
| **`format(n)`** | Pure `number → string`: 12 significant digits, comma-free ASCII, exponential when `abs >= 1e12 || abs < 1e-6`, trailing zeros trimmed. |
| **`groupThousands(s)`** | Pure, **render-only**: groups the integer part in threes; no-op on `"Error"` and exponential strings. |
| **`ERROR_TOKEN`** | `"Error"` — the `display` value in `error`. Exits only via Clear (AC) or `recallResult`. |
| **`HistoryEntry`** | `{ id, left, operator, right, result }` — `id` = `crypto.randomUUID()`, the rest `format()` output. |
| **`recallResult(value)`** | Action: load a history row's result into `result` state from any `status` (including `error`). |
| **`clearHistory`** | Action: empty `history`, touch nothing else. Independent of Clear (AC). |
| **Settled value** | A display value worth announcing to assistive tech: the states `operatorPending`, `result`, `error`. `selectAnnouncement` returns non-null only for these. |
| **Clear (AC)** | The single all-clear key. Resets calculator state; never touches `history`. |

## ADR index

See [`docs/adr/README.md`](docs/adr/README.md) for the table. In short:
1. state machine · 2. formatting & errors · 3. layout & history UX ·
4. stack & tooling · 5. component architecture · 6. testing strategy ·
7. accessibility bar.

## Out of scope

Ruled out by the destination; would need a fresh effort to revisit:

- Unary sign toggle (`+/−`) and percent (`%`) keys — the button set is exactly the
  four operators, decimal, clear, delete, equals.
- Operator precedence / full expression parsing.
- Physical keyboard *operation* (typing digits, Enter = equals). Keyboard *focus*
  navigation is in scope (ADR 7).
- Backend, database, authentication, cloud / remote storage, multi-device sync,
  history persistence of any kind (including `localStorage`).
- CI. Formal accessibility audit / AT certification.

## Next step

The map is fully charted — nothing left to decide. Implementation hands off to the
`implement` / `implement-spec` skill, working from these ADRs, TDD-first on
`src/calculator/` per ADR 6.
