---
phase: quick
plan: 260328-say
subsystem: recipes, inventory, components
tags: [performance, ssr, memoization, loading-states]
dependency_graph:
  requires: []
  provides: [server-side-recipes, loading-skeletons, memoized-filtering]
  affects: [app/(client)/recipes, app/(client)/inventory, components/recipe-card]
tech_stack:
  added: []
  patterns: [server-component-data-fetching, useMemo-filtering, React.memo-card]
key_files:
  created:
    - app/(client)/recipes/recipes-client.tsx
    - app/(client)/loading.tsx
    - app/(client)/recipes/loading.tsx
    - app/(client)/inventory/loading.tsx
    - app/(client)/menus/loading.tsx
    - app/(client)/shopping-lists/loading.tsx
    - app/(client)/rules/loading.tsx
  modified:
    - app/(client)/recipes/page.tsx
    - app/(client)/inventory/inventory-client.tsx
    - components/recipe-card.tsx
decisions:
  - Variant map passed as Record<string,Recipe[]> (plain object) from server to client to avoid Map serialisation issues across server/client boundary
  - Client-side search matches both title_en and title_es for bilingual support (improvement over old server-only ilike on title_en)
metrics:
  duration_minutes: 12
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_created: 7
  files_modified: 3
---

# Quick Task 260328-say: Performance Audit Summary

**One-liner:** Server-side recipe fetching with client-side useMemo filtering, loading skeletons for all routes, and React.memo on RecipeCard to prevent sibling re-renders.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Convert recipes page to server component + add loading skeletons | 9f1dce1 | recipes/page.tsx, recipes-client.tsx, 6x loading.tsx |
| 2 | Memoize inventory filtering and RecipeCard | 4c0d612 | inventory-client.tsx, recipe-card.tsx |

## What Was Done

### Task 1: Recipes page server-side + loading skeletons

The recipes page was a full `'use client'` component making Supabase calls in `useEffect` with a 300ms debounce that re-fired on every search keystroke. This meant N+1 network round-trips per character typed.

Refactored to:
- `app/(client)/recipes/page.tsx` — async server component that fetches all top-level recipes and their variants once at request time, then passes them as props
- `app/(client)/recipes/recipes-client.tsx` — client component receiving `items: Recipe[]` and `variantMap: Record<string, Recipe[]>`. Search and category filtering happen purely client-side via `useMemo([items, search, category])` — zero additional Supabase calls

Created `loading.tsx` files for all client route segments so Next.js shows skeleton UI during server component data fetching instead of a blank screen:
- `app/(client)/loading.tsx` (shared fallback)
- `app/(client)/recipes/loading.tsx`
- `app/(client)/inventory/loading.tsx`
- `app/(client)/menus/loading.tsx`
- `app/(client)/shopping-lists/loading.tsx`
- `app/(client)/rules/loading.tsx`

### Task 2: Memoization

**inventory-client.tsx** — four expensive derivations now memoized:
- `filteredItems`: `useMemo([items, activeTab, staplesFilter])` — only recomputes when tab or staples toggle changes, not on every keystroke in add/edit forms
- `categoryGroups`: `useMemo([filteredItems])` — only recomputes when filteredItems reference changes
- `addSuggestions`: `useMemo([addForm.item_name_en])` — filters 500+ grocery items JSON only when input changes
- `editSuggestions`: `useMemo([editForm.item_name_en])` — same

**components/recipe-card.tsx** — wrapped export with `React.memo`. Recipe objects are stable server-fetched references; `language` is a string. When user toggles variant expand/collapse in RecipesClient, only the affected recipe's wrapper re-renders — sibling RecipeCard instances skip.

## Verification

- `npx next build` — passes with no errors
- `grep -c "useMemo" app/(client)/inventory/inventory-client.tsx` — 5 (4 usages + import)
- `grep -c "memo" components/recipe-card.tsx` — 2 (import + wrap)
- `head -3 app/(client)/recipes/page.tsx` — no `'use client'` directive
- Both `app/(client)/loading.tsx` and `app/(client)/recipes/loading.tsx` exist

## Deviations from Plan

### Auto-applied improvements

**1. [Rule 2 - Enhancement] Bilingual search in client filter**
- **Found during:** Task 1
- **Issue:** Old server-side query only searched `title_en` via `ilike`. New client-side filter has access to both fields at zero cost.
- **Fix:** Filter checks both `title_en` and `title_es` against the search query
- **Files modified:** app/(client)/recipes/recipes-client.tsx
- **Commit:** 9f1dce1

## Known Stubs

None — all data is wired from server to client via props.

## Self-Check: PASSED

- app/(client)/recipes/page.tsx — exists, no 'use client'
- app/(client)/recipes/recipes-client.tsx — exists
- app/(client)/loading.tsx — exists
- app/(client)/recipes/loading.tsx — exists
- Commits 9f1dce1 and 4c0d612 — verified in git log
