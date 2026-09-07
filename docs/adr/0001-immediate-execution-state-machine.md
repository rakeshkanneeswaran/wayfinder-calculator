# 1. Immediate-execution input model and state machine

- Status: Accepted
- Date: 2026-09-07
- Source: [Calculator input model and state machine](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/2) (+ addenda from #4, #6)

## Context

The calculator supports `+ − × ÷`, decimal entry, clear, delete/backspace, equals,
and an in-session history. Charting fixed **immediate execution**: each operator
resolves the pending binary operation at once, there is no operator precedence, and
there is a single result display. We need a state machine precise enough to
implement and to write an exhaustive unit-test table against.

## Decision

### State shape (`src/calculator/types.ts`)

```ts
export type Op = '+' | '-' | '×' | '÷';
export type Status = 'first' | 'operatorPending' | 'second' | 'result' | 'error';

export type State = {
  status: Status;
  display: string;       // comma-free: raw entry buffer | format() output | ERROR_TOKEN
  left: number | null;   // stored left operand, set once an operator is chosen
  operator: Op | null;
  history: HistoryEntry[];   // newest-first, capped at HISTORY_CAP (see ADR 3)
};
```

`initialState = { status: 'first', display: '0', left: null, operator: null, history: [] }`.

The right operand is **not** stored separately — during `second` it lives in
`display` and is read with `Number(display)`. There is **no** stored "last operator
+ last operand": repeated `=` is a no-op, so nothing needs remembering.

### States

| status | meaning | display shows |
|---|---|---|
| `first` | accumulating the first operand (initial) | the entry buffer |
| `operatorPending` | operator chosen; `left` + `operator` set; no right digit yet | `left` / interim chain result |
| `second` | accumulating the right operand | the entry buffer |
| `result` | `=` applied; `left`/`operator` cleared | the formatted result |
| `error` | last arithmetic was invalid | `ERROR_TOKEN` (see ADR 2) |

### Entry-buffer rules

- Fresh buffer is `"0"`.
- **digit `d`**: if buffer is `"0"`, replace with `String(d)` (`0` then `0` stays
  `"0"`; `0` then `5` → `"5"` — no leading zeros); otherwise append `d`.
- **max length**: 15 significant digits (digit chars only, ignoring sign and `.`).
  Extra digits are ignored. Keeps typed integers within JS exact-integer range.
- **decimal**: if the buffer already contains `"."`, ignore; else append `"."`
  (`"0"` → `"0."`).
- Buffers never start negative — there is no unary-minus key.

### Transition table

`op` = `operator(+|-|×|÷)`. Unlisted cells are a no-op that keeps state.
"reset" = `{ status:'first', display:'0', left:null, operator:null }`, history preserved.

| from \ input | digit d | decimal | op | `=` | Clear (AC) | Backspace |
|---|---|---|---|---|---|---|
| **first** | buffer rule on `display` | buffer rule | `left = Number(display)`; `operator = op`; → `operatorPending` | no-op | reset | trim last char; empty/`"-"` → `"0"` |
| **operatorPending** | start right operand (buffer rule on `"0"`); → `second` | `display = "0."`; → `second` | replace `operator = op` | no-op | reset | no-op |
| **second** | buffer rule on `display` | buffer rule | evaluate `left op Number(display)` → INVALID: → `error`; else `left = result`, `operator = op`, `display = format(result)`, → `operatorPending` (**no history**) | evaluate → INVALID: → `error`; else `display = format(result)`, **push history entry**, `left = null`, `operator = null`, → `result` | reset | trim last char; `"1"`/empty → `"0"`; stay `second` |
| **result** | start fresh (buffer rule on `"0"`, `left = null`); → `first` | fresh `"0."`; → `first` | chain: `left = Number(display)`; `operator = op`; → `operatorPending` | no-op | reset | no-op |
| **error** | no-op | no-op | no-op | no-op | **reset** | no-op |

### Actions (`Action` union)

```ts
export type Action =
  | { type: 'digit'; digit: number }        // 0..9
  | { type: 'decimal' }
  | { type: 'operator'; operator: Op }
  | { type: 'equals' }
  | { type: 'clear' }                        // AC — single all-clear
  | { type: 'backspace' }
  | { type: 'recallResult'; value: string }  // from a history row (ADR 3)
  | { type: 'clearHistory' };                // dedicated Clear-history control (ADR 3)
```

- **`recallResult(value)`** — from **any** state incl. `error`:
  `{ status:'result', display:value, left:null, operator:null }`, history untouched.
  `value` is a comma-free `format()` string, so `Number(value)` parses directly.
  This is the one non-keypad way out of `error`; keypad input still exits `error`
  only via `clear`.
- **`clearHistory`** — `{ ...state, history: [] }`; touches nothing else; valid from
  every state.

### History-entry trigger

A `HistoryEntry` is appended **only** by `equals` from `second` with a valid
result. Chained operator evaluations and failed `=` append nothing. Entry shape and
cap: see ADR 3.

## Consequences

- The machine is small enough that `reducer.test.ts` can be a data-driven table
  covering every cell plus edge vectors (`0`→`0`, `.` first, double `.`, 16th digit
  ignored, operator replacement, interim eval with no history, repeated `=`, chain
  after `=`, digit after `=`, backspace per state, `÷0` → `error`, `error` absorbs
  all but `clear`, `recallResult`/`clearHistory` from every state).
- No precedence and no expression parser: `7 + 3 × 2 =` yields `20`, by design.
- `Number(display)` is the single parse point; keeping `display` comma-free (ADR 2)
  is what makes that safe.
