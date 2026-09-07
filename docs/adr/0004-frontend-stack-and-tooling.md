# 4. Frontend stack, tooling, and styling

- Status: Accepted
- Date: 2026-09-07
- Source: [Frontend stack, tooling, and styling approach](https://github.com/rakeshkanneeswaran/wayfinder-calculator/issues/5) (+ addendum from #7)

## Context

Small, desktop-friendly, fully client-side React + TypeScript app. No backend,
database, auth, or cloud storage. The app **is** this repo (lives at the root).

## Decision

| Concern | Decision |
|---|---|
| Build tool / template | Vite, `react-ts` template (React 18+, TypeScript) |
| Node | 20 LTS minimum; `"packageManager": "pnpm@<x.y.z>"` (Corepack) + `.nvmrc` = `20` |
| Package manager | **pnpm** — `pnpm-lock.yaml` committed |
| TypeScript | **strict** (`strict: true`, `noUncheckedIndexedAccess: true`); `tsc --noEmit` is the typecheck |
| Test runner | **Vitest** + React Testing Library + `@testing-library/jest-dom` + `@testing-library/user-event`, `environment: 'jsdom'`, `globals: true` (config in `vite.config.ts`) |
| E2E | **Playwright** (`@playwright/test`), Chromium only, one smoke spec (see ADR 6) |
| Lint | **ESLint** flat config: `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |
| Format | **Prettier** + `eslint-config-prettier` + `prettier-plugin-tailwindcss` |
| Styling | **Tailwind v4** via `@tailwindcss/vite`; single `src/index.css` with `@import "tailwindcss";`. No component CSS files, no CSS Modules, no CSS-in-JS. |
| CI | **None** for this effort. Local scripts only; a workflow can be added later without touching app code. |

### Directory layout (repo root)

```
/
  index.html
  package.json  pnpm-lock.yaml  .nvmrc
  vite.config.ts          # Vite + Vitest + @tailwindcss/vite
  tsconfig.json  tsconfig.node.json
  eslint.config.js  .prettierrc
  playwright.config.ts
  e2e/
    calculator.spec.ts
  src/
    main.tsx             # ReactDOM bootstrap
    App.tsx              # centers <Calculator />, paints the page
    index.css            # @import "tailwindcss";
    calculator/          # framework-free engine — see ADR 5
    components/          # React view tree — see ADR 5
  docs/adr/              # these ADRs
```

### `package.json` scripts

```
dev         vite
build       tsc -b && vite build
preview     vite preview
lint        eslint .
format      prettier --write .
typecheck   tsc --noEmit
test        vitest run
test:watch  vitest
test:cov    vitest run --coverage
test:e2e    playwright test
```

### Dev dependencies beyond the Vite template

`vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`,
`@testing-library/user-event`, `jsdom`, `@playwright/test`, `tailwindcss`,
`@tailwindcss/vite`, `prettier`, `eslint-config-prettier`, `prettier-plugin-tailwindcss`.

## Consequences

- `src/lib/` (tentatively proposed here for `groupThousands`) is **not used** —
  ADR 5 places that helper in `src/calculator/`.
- No CI means the coverage gate (ADR 6) and lint are enforced by the developer
  locally / at review time.
