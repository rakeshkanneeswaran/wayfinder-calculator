# 6. Testing strategy

- Status: Accepted
- Date: 2026-09-07
- Source: [Testing strategy](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/7)

## Context

The engine (ADR 5) is pure and has an exhaustive transition table (ADR 1) and
formatting vectors (ADR 2) — well suited to test-first development. The view is
thin. There is no CI (ADR 4), so gates run locally / at review.

## Decision

### TDD the engine

`src/calculator/**` is built **test-first** (follow the `tdd` skill): encode as
failing tests, then implement to green —

- the ADR 1 transition table (every state × input cell),
- the ADR 2 `format` / `evaluate` / `groupThousands` vectors,
- the addenda: `recallResult` from all states, `clearHistory`, history newest-first
  + cap 50, no history row on INVALID.

Components and the Playwright spec are **not** TDD — written alongside/after.

### Engine tests — co-located `*.test.ts`, Vitest

| file | covers |
|---|---|
| `reducer.test.ts` | Data-driven table `Array<{ name; from: State; action: Action; expect: Partial<State> }>` over every cell + edge vectors (`0`→`0` / `0`→`5`, `.` first, double `.`, 16th digit ignored, operator replacement, interim eval with no history, `=` no-ops, repeated `=`, chain after `=`, digit after `=`, backspace per state, `÷0`/`0÷0` → `error`, `error` absorbs all but `clear`, `recallResult`/`clearHistory` from all states, history order + 51st-entry drop). Plus `initialState` shape and a reducer-purity check (input never mutated). |
| `format.test.ts` | every ADR 2 vector for `format` (incl. `1e-6`/`1e-7` and `1e12` boundaries, big-int → exponential, `-0`, overflow → INVALID, `1e-300 ÷ 1e300` → `"0"`); `evaluate` validity; `groupThousands` (`"Error"` no-op, exponential no-op, sign-aware grouping, no fractional grouping). |
| `selectors.test.ts` | `selectPrimaryDisplay`, `selectSecondaryDisplay`, `selectHistoryRows`, `selectAnnouncement` — all pure, per their specs in ADR 5 / ADR 7. |

### Component tests — co-located `*.test.tsx`, RTL + jsdom + `user-event`, full behaviour

| file | covers |
|---|---|
| `Key.test.tsx` | renders label; `aria-label` present; click → `onPress` |
| `Keypad.test.tsx` | all 18 keys rendered; each click dispatches the exact expected `Action` (spy `dispatch`) |
| `Display.test.tsx` | renders `primary`; shows `secondary` only when non-empty; error styling + aria when `isError` |
| `History.test.tsx` | empty-state text + Clear-history `disabled` when no rows; N rows newest-first; row click → `onRecall(resultRaw)`; Clear-history → `onClear` |
| `Calculator.test.tsx` | integration, real reducer, no mocks: `7 × 3 =` → `21` + one history row; `÷ 0 =` → `Error`, `AC` recovers; click a history row → display updates; Clear-history → panel empty |

**Deliberately not tested:** Tailwind class output / pixel layout; the ~660px
breakpoint (manual visual check); anything keyboard-*input* related (out of scope).

### Playwright smoke — `e2e/calculator.spec.ts`

One spec, Chromium only. `playwright.config.ts` with `webServer` running
`pnpm preview`. Flow: load → `1 2 + 3 =` → assert display `15` → assert history row
`12 + 3` / `= 15` → click that row → assert display `15` → Clear-history → assert
empty state. Also assert a few accessibility hooks (ADR 7): `AC` accessible name
"All clear"; a history row name starts "Recall "; focus-ring class on a focused key;
live region updates on `=` but not on a digit. Run via `pnpm test:e2e`; not CI-wired.

### Coverage

Vitest coverage, v8 provider, **per-path thresholds**: `src/calculator/**` at
**95%** lines / branches / functions — the run fails below. `src/components/**`,
`main.tsx`, `App.tsx` are reported but **not gated**.

## Consequences

- The transition table exists once, as test data — the reducer is written to satisfy
  it.
- Rigor is concentrated where the logic is; the view is covered for wiring only.
