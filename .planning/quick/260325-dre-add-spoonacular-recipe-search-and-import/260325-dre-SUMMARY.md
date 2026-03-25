---
id: 260325-dre
type: quick
title: Add Spoonacular recipe search and import
completed: "2026-03-25"
duration_minutes: 3
tasks_completed: 2
files_created:
  - app/api/spoonacular/search/route.ts
  - app/api/spoonacular/detail/route.ts
  - components/spoonacular-import-section.tsx
files_modified:
  - app/(client)/recipes/new/page.tsx
  - .env.local
commits:
  - 295d25a: feat(260325-dre): add Spoonacular search and detail API routes
  - 8df1174: feat(260325-dre): add SpoonacularImportSection component and wire into new-recipe page
key_decisions:
  - SPOONACULAR_API_KEY read server-side only — never exposed to browser
  - Translation gracefully degrades: if translate-recipe fails, recipe still imports with empty Spanish fields
  - dishTypes->category mapping extended to cover beef/chicken/seafood/veggies beyond plan spec
---

# Quick Task 260325-dre: Add Spoonacular recipe search and import

**One-liner:** Spoonacular recipe search with collapsible UI, image/time/servings results, full detail import, and auto-translation of Spanish fields via existing translate-recipe route.

## What Was Built

Two server-side API routes protect the Spoonacular API key from browser exposure:

1. `GET /api/spoonacular/search?query=...&number=10` — proxies to Spoonacular `complexSearch`, maps results to `{ id, title, image, readyInMinutes, servings, dishTypes }`.
2. `GET /api/spoonacular/detail?id=...` — fetches full recipe by ID, maps to `Partial<Recipe>` shape: strips HTML from summary/instructions, maps `extendedIngredients` to `Ingredient[]`, maps `dishTypes` to the app's CATEGORIES enum.

`SpoonacularImportSection` component follows the exact collapsible pattern of `UrlImportSection`:
- Expand/collapse toggle with Search icon and ChevronDown rotation
- Search input + button row, same flex layout and casa-* styling
- Results rendered as cards with 48x48 image thumbnail, title, time, servings
- Import button per result: fetches detail, calls translate-recipe for Spanish fields, merges all data, calls `onImported`
- Graceful degradation: if translation fails, recipe still imports with empty `_es` fields

New-recipe page wires `SpoonacularImportSection` directly below `UrlImportSection` using the same `onImported` handler pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Spoonacular API routes (search + detail) | 295d25a | app/api/spoonacular/search/route.ts, app/api/spoonacular/detail/route.ts |
| 2 | Create SpoonacularImportSection and wire into new-recipe page | 8df1174 | components/spoonacular-import-section.tsx, app/(client)/recipes/new/page.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Enhancement] Extended dishTypes category mapping**
- **Found during:** Task 1
- **Issue:** Plan specified mapping for soup/stew/salad/snack/bread/pasta/rice only, leaving beef/chicken/seafood/veggies unreachable even when dishTypes includes those terms
- **Fix:** Added mapping for beef/pork/lamb -> "beef", chicken/poultry -> "chicken", seafood/fish -> "seafood", vegetarian/vegan -> "veggies"
- **Files modified:** app/api/spoonacular/detail/route.ts

None beyond the above — plan executed successfully as written.

## Known Stubs

None. The Spoonacular API key placeholder in `.env.local` is intentional — the user must replace `your_key_here` with their actual Spoonacular API key from https://spoonacular.com/food-api.

## Verification

- `npx tsc --noEmit` — no type errors
- `npm run build` — build succeeded; /api/spoonacular/search and /api/spoonacular/detail appear in route listing
- Manual verification required: visit /recipes/new, expand "Import from Spoonacular", search for "pasta", confirm results render with image/time/servings, click Import on a result, confirm form auto-fills with English data and Spanish fields translate

## Self-Check: PASSED

- app/api/spoonacular/search/route.ts — FOUND
- app/api/spoonacular/detail/route.ts — FOUND
- components/spoonacular-import-section.tsx — FOUND
- Commits 295d25a and 8df1174 — FOUND
