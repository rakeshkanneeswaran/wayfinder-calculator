# 3. Layout and history UX

- Status: Accepted
- Date: 2026-09-07
- Source: [Layout and history UX](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/4)
- Asset: rough layout prototype `calc-layout-proto.html` (fake numbers, no engine — not committed; produced during the wayfinding session)

## Context

Desktop-friendly, fully client-side, in-memory history. Needed to fix the
on-screen layout, the history data shape and interactions, and the recall/clear
behaviour before component architecture could be modelled.

## Decision

### Layout

- **Shell:** fixed-ish width, centered. Keypad core ≈ 320px; history panel ≈ 300px;
  total ≈ 620px.
- **History placement:** a **right side panel** with its own vertical scroll, height
  matched to the keypad. Below a ~660px viewport it **stacks** under the keypad.
  This is the only responsive behaviour — desktop-first.
- **Display** (right-aligned, dark), two lines:
  - *secondary line* — derived, no state: `operatorPending` / `second` →
    `` `${groupThousands(format(left))} ${operator}` `` (e.g. `"1,234 ×"`); empty
    otherwise.
  - *primary line* — `groupThousands(state.display)`.
- **Button grid**, 4 columns:

  | | | | |
  |---|---|---|---|
  | AC | ⌫ | ÷ | × |
  | 7 | 8 | 9 | − |
  | 4 | 5 | 6 | + |
  | 1 | 2 | 3 | **=** (spans 2 rows) |
  | 0 (spans 2 cols) | . | | |

- **Glyphs:** operator buttons and the secondary line use `− × ÷` (and `+`). A
  negative *value* keeps an ASCII `-` everywhere (no `−` swap) — simpler, copy-safe.

### History

- **Entry** (`HistoryEntry`, see ADR 5 for the final structured shape):
  `{ id, left, operator, right, result }`, all `format()` output, `id =
  crypto.randomUUID()`. Created **only** on a successful `=`. A failed `=` (INVALID)
  appends nothing.
- **Store:** `history = [newEntry, ...history].slice(0, HISTORY_CAP)` with
  `HISTORY_CAP = 50` — newest-first, hard cap, oldest silently dropped.
- **Render:** top-down as stored (newest on top). Each row two lines, right-aligned:
  line 1 `expression` (small, grey, e.g. `7 ÷ 3`), line 2 `= result` (bold). Both
  operands and the result pass through `groupThousands`; exponential strings render
  verbatim.
- **Empty state:** *"No calculations yet. Press equals to add one."*
- **Click a row → insert result:** dispatches `recallResult(row.result)` (ADR 1) —
  loads that value into `result` state; nothing else is restored.
- **Clear-history control:** a dedicated control in the panel header, `disabled`
  when history is empty. Fully independent of `AC` — `AC` never touches history,
  Clear-history never touches calculator state. Dispatches `clearHistory` (ADR 1).

## Consequences

- Two new actions (`recallResult`, `clearHistory`) were added to the state machine —
  recorded as addenda on ADR 1.
- The `expression` string first sketched in ADR 1 becomes derived at render time
  (`selectHistoryRows`, ADR 5) rather than stored, so grouping can be applied
  per-operand.
- The ~660px collapse is a plain reflow with no animation (see ADR 7).
