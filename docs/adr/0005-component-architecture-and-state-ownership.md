# 5. Component architecture and state ownership

- Status: Accepted
- Date: 2026-09-07
- Source: [Component architecture and state ownership](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/6) (+ addendum from #9)

## Context

The calculator logic must be a pure, framework-free module (testable without React,
ADR 6). This ADR fixes the module's file layout and public surface, where state
lives, and how the React tree is wired.

## Decision

### `src/calculator/` — framework-free engine (no React imports)

```
calculator/
  index.ts       re-exports the public surface
  types.ts       Op, Status, HistoryEntry, State, Action
  constants.ts   ERROR_TOKEN, INVALID, HISTORY_CAP, SIG, MAX_INPUT_DIGITS
  format.ts      format(), evaluate(), groupThousands()
  reducer.ts     initialState, reducer()   (module-private helpers live here)
  selectors.ts   selectPrimaryDisplay, selectSecondaryDisplay,
                 selectHistoryRows, selectAnnouncement
```

**`HistoryEntry`** (final, structured):

```ts
export type HistoryEntry = {
  id: string;        // crypto.randomUUID()
  left: string;      // format() output
  operator: Op;
  right: string;     // format() output
  result: string;    // format() output
};
```

**`reducer(state, action): State`** — one exported function, `switch (action.type)`,
implementing the ADR 1 transition table plus `recallResult`, `clearHistory`, and the
`equals` history append (`[entry, ...state.history].slice(0, HISTORY_CAP)`).
Buffer-append / decimal / leading-zero / digit-cap logic are **module-private
functions** in `reducer.ts`; the public surface stays the single `reducer`.

**`groupThousands`** lives here (not in the view) — it is pure and both the engine
and the selectors need it.

**Selectors** — pure `State → …`, so React never imports `format`/`groupThousands`:

```ts
selectPrimaryDisplay(state): string     // groupThousands(state.display)
selectSecondaryDisplay(state): string   // "operatorPending"|"second" -> `${groupThousands(format(left))} ${operator}`; else ""
selectHistoryRows(state): { id: string; expr: string; resultDisp: string; resultRaw: string }[]
                                        // expr = `${groupThousands(l)} ${op} ${groupThousands(r)}`
selectAnnouncement(state): string | null   // see ADR 7 — non-null only for operatorPending/result/error
```

### `src/components/` — React view (Tailwind utilities, no CSS files)

| component | responsibility |
|---|---|
| `Calculator.tsx` | owns the single `useReducer(reducer, initialState)`; calls the selectors; renders and wires the three children; holds the `useRef` for the announcement diff (ADR 7). No other state. |
| `Display.tsx` | props `{ primary, secondary, isError }` — presentational, no logic |
| `Keypad.tsx` | props `{ dispatch }`; holds the static key layout config `[{ label, ariaLabel, variant, gridClass, action }]`; maps it to `<Key>` |
| `Key.tsx` | props `{ label, ariaLabel, variant: 'digit'\|'op'\|'util'\|'eq', onPress }` |
| `History.tsx` | props `{ rows, onRecall(resultRaw), onClear }`; header with Clear-history (`disabled` when empty), scroll list, empty state; each row is a `<button>` |

```tsx
// Calculator.tsx (essence)
const [state, dispatch] = useReducer(reducer, initialState);
<Display primary={selectPrimaryDisplay(state)}
         secondary={selectSecondaryDisplay(state)}
         isError={state.status === 'error'} />
<Keypad dispatch={dispatch} />
<History rows={selectHistoryRows(state)}
         onRecall={(value) => dispatch({ type: 'recallResult', value })}
         onClear={() => dispatch({ type: 'clearHistory' })} />
```

- **No context, no state library.** `dispatch` (typed `Dispatch<Action>`) is
  prop-drilled; each `<Key>`'s `onPress` calls `dispatch(action)`.
- **No `useMemo`/`useCallback`** at this scale — selectors are O(≤50) and cheap.
- `App.tsx` just centers `<Calculator />` and paints the page background.

### Where formatting lives

All number/string formatting is in `src/calculator/` (pure). The reducer stores
comma-free strings; the view reads **only selectors**. The display's secondary line
and history grouping are selector-derived, never reducer fields.

## Consequences

- `reducer` is the primary unit under test (pure `(State, Action) => State`);
  selectors and `format`/`evaluate`/`groupThousands` are independently testable
  (ADR 6).
- The four presentational components carry no calculator logic, so component tests
  are about wiring and rendering, not arithmetic.
