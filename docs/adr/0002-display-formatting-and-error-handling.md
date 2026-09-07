# 2. Display formatting, overflow, and error states

- Status: Accepted
- Date: 2026-09-07
- Source: [Display formatting, overflow, and error states](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/3)

## Context

Arithmetic uses native JS `number` (charting ruled out decimal.js/big.js — zero
arithmetic dependencies). That means float artifacts (`0.1 + 0.2`), non-finite
results (`÷0`), and magnitudes too large or small to show plainly. The state
machine (ADR 1) delegates two pure functions to this decision: `evaluate` (which
results are invalid) and `format` (number → display string).

## Decision

### `evaluate(left, op, right) → number | INVALID`

```ts
export const INVALID = Symbol('invalid');

export function evaluate(left: number, op: Op, right: number): number | typeof INVALID {
  let n: number;
  switch (op) {
    case '+': n = left + right; break;
    case '-': n = left - right; break;
    case '×': n = left * right; break;
    case '÷': n = left / right; break;
  }
  return Number.isFinite(n) ? n : INVALID;
}
```

`Number.isFinite` is the single gate:

| case | JS result | outcome |
|---|---|---|
| `x ÷ 0`, x≠0 | `±Infinity` | INVALID → `error` |
| `0 ÷ 0` | `NaN` | INVALID → `error` |
| finite operands, result past `Number.MAX_VALUE` | `±Infinity` | INVALID → `error` |
| result underflows to `0` / subnormal | `0` (finite) | **valid** → `"0"` |

Large-but-finite results (up to ~1e308) are valid and shown in exponential
notation; only true `Infinity`/`NaN` reach `error`.

### Error state

- `ERROR_TOKEN = "Error"`.
- Recovery: keypad input exits `error` **only via Clear (AC)**; every other key is a
  no-op. `recallResult` (ADR 1/3) also exits `error`.
- A `=` that produces INVALID appends **no** history entry.

### `format(n: number) → string` — pure, comma-free, ASCII

Precondition: `n` is finite (INVALID never reaches `format`). `SIG = 12`.

```
1. if n === 0            → "0"                 // normalises -0
2. abs = Math.abs(n)
3. if abs >= 1e12 || abs < 1e-6:              // EXPONENTIAL
     s = n.toExponential(SIG - 1)             // "1.23456789012e+19"
     strip trailing zeros in the mantissa fraction, and a bare trailing "."
     keep JS's exponent form ("e+19", "e-7")
   else:                                      // FIXED
     s = n.toPrecision(SIG)                   // artifact-hiding round
     if s contains 'e' → s = Number(s).toString()
     strip trailing zeros in the fractional part, and a bare trailing "."
```

`format()` output is comma-free ASCII and always round-trips through `Number()`.
Negative values keep an ASCII `-` (no `−` glyph swap).

### `groupThousands(s: string) → string` — render-only

- Groups the integer part in threes from the right, sign-aware
  (`"-1234567.5"` → `"-1,234,567.5"`); never groups the fractional part.
- **No-op** on `"Error"` and on strings containing `e`.
- Applied to `state.display` (and history operands/result) at render time only —
  `state.display` itself stays comma-free, so `Number(display)` never needs a strip
  step. Live grouping of the entry buffer falls out for free.

`groupThousands` lives in `src/calculator/` alongside `format`/`evaluate` (see
ADR 5), not in the view.

### Test vectors (subset)

| input | outcome |
|---|---|
| `0`, `-0` | `"0"` |
| `format(0.30000000000000004)` | `"0.3"` |
| `1 ÷ 3` | `"0.333333333333"` |
| `1234567.5` | `format` `"1234567.5"` → view `"1,234,567.5"` |
| `123456789012` | `"123,456,789,012"` |
| `1e12` | `"1e+12"` |
| `12345678901234567890` | `"1.23456789012e+19"` |
| `1e-7` | `"1e-7"`; `1e-6` | `"0.000001"` |
| `9 ÷ 0 =`, `0 ÷ 0 =`, `1e308 × 1e308` | `error`, display `"Error"` |
| `1e-300 ÷ 1e300 =` | `"0"` (finite, not error) |

## Consequences

- The display digit cap (12) is independent of the input cap (15, ADR 1): you can
  type a longer number than the result column will show, and `format` rounds it.
- Comma grouping being render-only keeps the reducer's `display` string parseable
  and testable without a normalisation step.
