---
phase: 03-ai-features
plan: 01
subsystem: testing
tags: [vitest, jsdom, testing-library, supabase, migrations, css-variables, typescript]

# Dependency graph
requires:
  - phase: 02-menu-planning
    provides: Recipe type in lib/types.ts and existing migration naming conventions
provides:
  - vitest test infrastructure with jsdom environment (tests/**/*.test.ts pattern)
  - Migration 004 adding parent_recipe_id FK and receipts storage bucket
  - CSS diff variables for recipe variant diff view (light and dark themes)
  - Recipe TypeScript type updated with parent_recipe_id optional field
  - 7 test stubs for all AI feature routes and components
affects:
  - 03-ai-features (plans 02–05 depend on test infrastructure, parent_recipe_id column, diff CSS vars)

# Tech tracking
tech-stack:
  added: [vitest, @vitest/ui, jsdom, @testing-library/react, @testing-library/jest-dom]
  patterns:
    - Test stubs define expected shape before implementation exists
    - vitest.config.ts with jsdom environment and @ alias matching Next.js tsconfig paths
    - tests/ directory mirroring app structure: tests/api/, tests/lib/, tests/components/

key-files:
  created:
    - vitest.config.ts
    - supabase/migrations/004_add_parent_recipe_id.sql
    - tests/api/generate-recipe.test.ts
    - tests/api/adjust-recipe.test.ts
    - tests/api/extract-receipt.test.ts
    - tests/api/import-url.test.ts
    - tests/lib/image-resize.test.ts
    - tests/components/feedback-form.test.ts
    - tests/components/receipt-review.test.ts
  modified:
    - app/globals.css
    - lib/types.ts

key-decisions:
  - "Test stubs use mock data objects rather than actual HTTP calls — avoids need for server in unit tests"
  - "image-resize stub uses expect(true).toBe(true) because Canvas API unavailable in jsdom"

patterns-established:
  - "Pattern 1: Test stubs assert response shape using mock data — real integration tests added when routes exist"
  - "Pattern 2: CSS diff variables follow --casa- prefix convention matching existing brand variables"
  - "Pattern 3: Migration files named NNN_description.sql with IF NOT EXISTS guards"

requirements-completed: [AIREC-04]

# Metrics
duration: 3min
completed: 2026-03-24
---

# Phase 3 Plan 01: AI Features Foundation Summary

**vitest installed with jsdom, migration 004 adding parent_recipe_id FK + receipts bucket, diff CSS vars in both themes, and 7 passing test stubs for all AI routes/components**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-24T01:30:33Z
- **Completed:** 2026-03-24T01:34:10Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- vitest 4.1.1 installed and configured with jsdom environment; `npx vitest run` exits 0 with 7 passing stubs
- Migration 004 ready: adds `parent_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL` with index, plus receipts storage bucket with RLS policies
- CSS diff variables (`--casa-diff-add-bg/text`, `--casa-diff-del-bg/text`) added to both `:root` (light) and `.dark` sections in globals.css
- Recipe TypeScript interface updated with `parent_recipe_id?: string` (FK comment included)
- 7 test stubs scaffolded across tests/api/, tests/lib/, tests/components/ — all green

## Task Commits

Each task was committed atomically:

1. **Task 1: Install vitest, create config, migration, CSS vars, and update types** - `e285b49` (chore)
2. **Task 2: Create test stubs for all AI feature routes and components** - `2a0a7fc` (test)

## Files Created/Modified

- `vitest.config.ts` - Test runner config: jsdom environment, tests/** include pattern, @ alias
- `supabase/migrations/004_add_parent_recipe_id.sql` - Adds parent_recipe_id FK, receipts storage bucket with RLS
- `app/globals.css` - Added diff CSS variables in both light (:root) and dark (.dark) sections
- `lib/types.ts` - Recipe interface extended with parent_recipe_id?: string
- `tests/api/generate-recipe.test.ts` - Stub: POST /api/ai/generate-recipe response shape
- `tests/api/adjust-recipe.test.ts` - Stub: POST /api/ai/adjust-recipe response shape
- `tests/api/extract-receipt.test.ts` - Stub: POST /api/ai/extract-receipt response shape
- `tests/api/import-url.test.ts` - Stub: POST /api/ai/import-url response shape
- `tests/lib/image-resize.test.ts` - Stub: resizeImageToLimit function (Canvas unavailable in jsdom)
- `tests/components/feedback-form.test.ts` - Stub: FeedbackForm props contract
- `tests/components/receipt-review.test.ts` - Stub: ReceiptReview props contract

## Decisions Made

- Test stubs use local mock data objects rather than HTTP calls — integration tests will be added when routes exist in plans 03-02 through 03-05
- image-resize stub uses `expect(true).toBe(true)` because Canvas API is unavailable in jsdom; actual resize validation will use a mock or alternative approach

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required for this plan.

Migration 004 will need to be applied to the Supabase project before plans 03-02+ deploy receipts functionality.

## Next Phase Readiness

- Test infrastructure is ready — subsequent plans (03-02 through 03-05) can add tests against real implementations
- Migration 004 must be applied to Supabase before receipt upload routes go live
- Diff CSS vars are available for use in the RecipeDiff component (plan 03-03)
- parent_recipe_id column ready for variant storage (plan 03-03)

## Self-Check: PASSED

All 12 expected files exist. Both task commits verified (e285b49, 2a0a7fc).

---
*Phase: 03-ai-features*
*Completed: 2026-03-24*
