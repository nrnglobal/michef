---
phase: 03-ai-features
plan: 05
subsystem: ai, ui
tags: [claude, sonnet, prompt-caching, recipe-adjustment, diff-view, feedback, variants]

# Dependency graph
requires:
  - phase: 03-01
    provides: generate-recipe route establishes Claude API call pattern with prompt caching
  - phase: 03-02
    provides: receipt OCR and URL import routes confirm API route conventions and types
provides:
  - Claude Sonnet adjust-recipe API route with prompt caching on system prompt
  - FeedbackForm component (star rating + comments + adjustment type)
  - RecipeDiffView component (ingredient-level and instruction-level diff highlighting)
  - RecipeDetailActions client component (Adjust with AI, Duplicate Recipe, Leave Feedback)
  - Recipe library variant grouping with expandable rows
affects: [04-communication, 05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - adjust-recipe route uses cache_control ephemeral on system prompt + anthropic-beta header (D-20)
    - RecipeDetailActions: separate client component receives server-fetched data via props, handles AI interactions
    - Inline diffIngredients/diffInstructions functions — no diff library dependency
    - Recipe library fetches top-level recipes (.is('parent_recipe_id', null)) then fetches variants by parent IDs separately

key-files:
  created:
    - app/api/ai/adjust-recipe/route.ts
    - components/feedback-form.tsx
    - components/recipe-diff-view.tsx
    - app/(client)/recipes/[id]/recipe-detail-actions.tsx
  modified:
    - app/(client)/recipes/[id]/page.tsx
    - app/(client)/recipes/page.tsx

key-decisions:
  - "Recipe detail page stays as server component; AI interactivity extracted to RecipeDetailActions client component passed data via props"
  - "Inline diffIngredients/diffInstructions: no diff library — avoids dependency for simple use case"
  - "Variant grouping uses two separate queries (top-level + variants by parent IDs) rather than a single recursive query — simpler and Supabase-compatible"

patterns-established:
  - "Client AI interaction component pattern: server page fetches data, passes to dedicated 'use client' component that owns loading/error state"
  - "Diff UI always uses CSS vars (--casa-diff-add-bg, --casa-diff-del-bg, etc.) not hardcoded hex values"

requirements-completed: [AIREC-02, AIREC-03, AIREC-04]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 3 Plan 05: Recipe Adjustment, Feedback, Diff View, Duplicate, and Variant Grouping Summary

**Claude Sonnet adjust-recipe endpoint with prompt caching, structured FeedbackForm, ingredient/instruction-level RecipeDiffView, Adjust+Duplicate+Feedback buttons on recipe detail page, and expandable variant grouping in the recipe library**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T01:45:06Z
- **Completed:** 2026-03-24T01:50:21Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created `adjust-recipe` API route calling Claude Sonnet with `cache_control: { type: 'ephemeral' }` on system prompt (D-20), respecting active cooking rules
- Created `FeedbackForm` capturing 1-5 star rating, freetext comments, adjustment type dropdown (spicier/milder/healthier/simpler/other), and conditional detail input; inserts into `recipe_feedback` on submit and calls `onSubmitted` callback
- Created `RecipeDiffView` with inline `diffIngredients` and `diffInstructions` logic showing added/removed/changed items highlighted with `--casa-diff-add-bg` / `--casa-diff-del-bg` CSS vars; save-in-place via `recipes.update` and discard without persisting
- Created `RecipeDetailActions` client component on recipe detail page: Adjust with AI button (D-05a), Duplicate Recipe button with `parent_recipe_id` FK (D-07), Leave Feedback button, automatic adjust offer after feedback submission (D-05b), diff view when adjusted recipe is ready (D-09)
- Updated recipe library to fetch only top-level recipes (`is('parent_recipe_id', null)`) then fetch variants separately; expandable variant rows with `ChevronDown` toggle (D-08)

## Task Commits

1. **Task 1: adjust-recipe API route, FeedbackForm, RecipeDiffView** - `f0b9bb7` (feat)
2. **Task 2: Wire AI actions into recipe detail page and variant grouping in library** - `3f31120` (feat)

## Files Created/Modified

- `app/api/ai/adjust-recipe/route.ts` - Claude Sonnet recipe adjustment endpoint with prompt caching
- `components/feedback-form.tsx` - Structured feedback form (star rating, text, adjustment type, detail)
- `components/recipe-diff-view.tsx` - Diff view comparing original and adjusted recipe with CSS var highlighting and save-in-place
- `app/(client)/recipes/[id]/recipe-detail-actions.tsx` - Client component: Adjust, Duplicate, Feedback, adjust offer, diff view
- `app/(client)/recipes/[id]/page.tsx` - Added RecipeDetailActions import and placement
- `app/(client)/recipes/page.tsx` - Variant grouping query + expandable rows with ChevronDown

## Decisions Made

- Recipe detail page remains a server component; AI interactivity lives in a dedicated `RecipeDetailActions` `'use client'` component that receives the already-fetched `recipe` prop — preserves server-side data fetching without needing to refactor the whole page
- Inline `diffIngredients` and `diffInstructions` functions rather than a diff library — the use case is simple enough that a library would be overkill and adds a dependency
- Variant grouping uses two sequential Supabase queries (top-level then variants by parent IDs) rather than a recursive or RPC query — straightforward and compatible with existing Supabase client pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compiled clean on first pass for both tasks.

## User Setup Required

None - no external service configuration required. The `ANTHROPIC_API_KEY` environment variable was already configured in Phase 3 Plan 01.

## Known Stubs

None - all features are wired to real data sources. The adjust-recipe API calls Claude; FeedbackForm writes to Supabase; RecipeDiffView updates Supabase; Duplicate writes to Supabase with parent_recipe_id; variant grouping reads live data.

## Next Phase Readiness

- AIREC-02, AIREC-03, AIREC-04 complete — the full AI recipe refinement loop is shipped
- Phase 3 is now complete (all 5 plans delivered)
- Phase 4 (Communication & Finance) can begin: messaging, receipt upload, payment tracking

## Self-Check: PASSED

- FOUND: app/api/ai/adjust-recipe/route.ts
- FOUND: components/feedback-form.tsx
- FOUND: components/recipe-diff-view.tsx
- FOUND: app/(client)/recipes/[id]/recipe-detail-actions.tsx
- FOUND: .planning/phases/03-ai-features/03-05-SUMMARY.md
- FOUND commit: f0b9bb7
- FOUND commit: 3f31120

---
*Phase: 03-ai-features*
*Completed: 2026-03-24*
