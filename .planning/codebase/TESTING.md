# Testing Patterns

**Analysis Date:** 2026-03-22

## Test Framework

**Runner:** None installed.

No test runner, assertion library, or testing framework is present in `package.json` (neither `jest`, `vitest`, `@testing-library/react`, `playwright`, `cypress`, nor any equivalent). No test config files (`jest.config.*`, `vitest.config.*`) exist.

**Run Commands:**
```bash
# No test commands configured
# package.json scripts: dev, build, start, lint only
```

## Test File Organization

**No test files exist in this codebase.**

Running a search for `*.test.*` and `*.spec.*` files returns no results. There is no `__tests__` directory or any co-located test files.

## Test Types

**Unit Tests:** Not implemented.

**Integration Tests:** Not implemented.

**E2E Tests:** Not implemented. No Playwright or Cypress dependency present.

## Coverage

**Requirements:** None enforced. No coverage tooling configured.

## What Exists Instead of Tests

The codebase is manually validated at this stage. Runtime feedback is provided via:
- `sonner` toast notifications for mutation success/failure in client components
- Supabase error objects destructured and surfaced inline in the UI
- Next.js `notFound()` for missing data paths

## Guidance for Adding Tests

If tests are added, the following patterns are consistent with the existing stack:

**Recommended framework:**
- Vitest (compatible with the Vite/bundler module resolution used in `tsconfig.json`)
- `@testing-library/react` for component tests

**Suggested config location:** `vitest.config.ts` at project root.

**Suggested test file location:**
- Co-locate test files beside source: `components/recipe-card.test.tsx`
- Or group in `__tests__/` at project root

**What to mock:**
- `@/lib/supabase/client` and `@/lib/supabase/server` — these make network calls to Supabase and must be mocked in unit/component tests
- `next/navigation` hooks (`useRouter`, `usePathname`, `redirect`, `notFound`) — required for testing page and layout components
- `sonner` toast — mock to assert user-facing feedback

**Suggested mock pattern for Supabase client:**
```typescript
// In a test file or __mocks__/supabase.ts
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
}))
```

**Suggested mock pattern for next/navigation:**
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => '/recipes',
  redirect: vi.fn(),
  notFound: vi.fn(),
}))
```

**I18n in tests:**
- Wrap components under test with `<I18nProvider initialLanguage="en">` from `@/lib/i18n/config`
- Or mock `useI18n` to return `{ t: (key: string) => key, language: 'en', setLanguage: vi.fn() }`

**High-priority areas to test first (based on code complexity):**
- `components/recipe-form.tsx` — complex form state, ingredient array management, conditional insert/update logic
- `lib/i18n/config.tsx` — `getNestedValue` and `interpolate` are pure functions that are straightforward to unit test
- `lib/utils.ts` — `formatDate`, `formatDateEs` are pure functions
- `app/(auth)/login/page.tsx` — role-based redirect logic after login

---

*Testing analysis: 2026-03-22*
