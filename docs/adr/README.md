# Architecture Decision Records

One record per decision area for the React + TypeScript calculator. All were
resolved through the wayfinding effort tracked in
[Map: React + TypeScript calculator](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/1);
each ADR links its source issue. See [`../../CONTEXT.md`](../../CONTEXT.md) for the
glossary and the architecture at a glance.

| # | ADR | Gist |
|---|---|---|
| 1 | [Immediate-execution input model and state machine](0001-immediate-execution-state-machine.md) | 5-state machine (`first`/`operatorPending`/`second`/`result`/`error`), full transition table, `Action` union |
| 2 | [Display formatting, overflow, and error states](0002-display-formatting-and-error-handling.md) | `evaluate` gates on `Number.isFinite`; `format` = 12 sig digits, comma-free, exponential outside `[1e-6, 1e12)`; render-only `groupThousands` |
| 3 | [Layout and history UX](0003-layout-and-history-ux.md) | ~620px shell, right-side history panel (stacks <660px), 2-line rows newest-first capped at 50, click-to-recall, independent Clear-history |
| 4 | [Frontend stack, tooling, and styling](0004-frontend-stack-and-tooling.md) | Vite `react-ts` at repo root, pnpm, strict TS, Vitest + RTL, ESLint + Prettier, Tailwind v4, no CI |
| 5 | [Component architecture and state ownership](0005-component-architecture-and-state-ownership.md) | pure `src/calculator/` (single `reducer` + selectors) + presentational `src/components/`; one `useReducer`, `dispatch` prop-drilled, no context |
| 6 | [Testing strategy](0006-testing-strategy.md) | TDD the engine; 95% coverage gate on `src/calculator/**`; full-behaviour RTL; one Playwright Chromium smoke |
| 7 | [Accessibility bar](0007-accessibility-bar.md) | WCAG 2.1 AA essentials; `aria-live` announces settled values only; terse recall labels; custom focus ring |
