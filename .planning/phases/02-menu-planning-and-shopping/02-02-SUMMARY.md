---
phase: 02-menu-planning-and-shopping
plan: "02"
subsystem: menu-planning
tags: [server-actions, rules-engine, ingredient-consolidation, ai-suggest, shadcn-dialog]
dependency_graph:
  requires: ["02-01"]
  provides: ["MENU-01", "MENU-02", "MENU-03", "MENU-04", "MENU-05", "SHOP-01"]
  affects: ["app/(client)/menus", "lib/menu-actions", "app/(client)/dashboard"]
tech_stack:
  added: []
  patterns:
    - "Server Actions for CRUD via 'use server' directive in lib/menu-actions.ts"
    - "Pure client-side rules engine (no 'use server') in lib/rules-engine.ts"
    - "Unit normalization Map-based ingredient consolidation"
    - "Route Handler pattern for Claude API proxy"
    - "useTransition for confirm/delete pending states"
key_files:
  created:
    - lib/menu-actions.ts
    - lib/rules-engine.ts
    - lib/consolidate-ingredients.ts
    - app/(client)/menus/page.tsx
    - app/(client)/menus/new/page.tsx
    - app/(client)/menus/[id]/page.tsx
    - app/(client)/menus/[id]/recipe-picker-modal.tsx
    - app/api/ai/suggest-menu/route.ts
  modified:
    - app/(client)/dashboard/page.tsx
decisions:
  - "Rules engine runs client-side (no 'use server') so validation is instant on recipe changes without a round-trip"
  - "Picker confirm replaces all slots via add/remove Server Actions rather than diffing — simpler than tracking individual changes"
  - "CLAUDE_API_KEY added to .env.local.example alongside ANTHROPIC_API_KEY for clarity (gitignored, not committed)"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-23"
  tasks: 3
  files: 9
---

# Phase 02 Plan 02: Menu Planning Pages Summary

**One-liner:** Complete menu planning flow — Server Actions for CRUD, ingredient consolidation with unit normalization, client-side rules engine, interactive edit/confirm page with recipe picker modal and AI suggest, and dashboard CTA.

## What Was Built

### Task 1: Business logic modules

**lib/menu-actions.ts** — Five Server Actions with `'use server'` directive:
- `createMenuPlan(formData)` — checks for duplicate date (D-04), inserts draft, redirects to edit page
- `addRecipeToPlan(planId, recipeId, sortOrder)` — inserts menu_plan_items row + revalidates
- `removeRecipeFromPlan(planId, itemId)` — deletes item + revalidates
- `confirmMenuPlan(planId)` — fetches recipes + fridge staples, consolidates ingredients, handles re-confirm (deletes existing list), inserts shopping_list + shopping_list_items, updates plan status to confirmed
- `deleteMenuPlan(planId)` — deletes plan (cascade handles items) + redirects

**lib/consolidate-ingredients.ts** — Pure function `consolidateIngredients`:
- Map keyed by `name_en|unit` (unit normalized via alias table: cups→cup, tbsp→tablespoon, etc.)
- Accumulates quantities with `parseFloat`, null if NaN
- Returns sorted by category then name_en

**lib/rules-engine.ts** — Pure client-side `validateMenuPlan`:
- Handles rule types: dietary/allergy (tag/protein matching), preference (soft warning), frequency (last-4-plans count), exclusion (pair detection)
- Filters only active rules
- Returns `RulesWarning[]` with severity: 'warning'

### Task 2: Menu planning pages

**app/(client)/menus/page.tsx** — Server Component showing upcoming plans as cards with status badge (draft/confirmed), recipe count, edit link. Empty state with CalendarDays icon and Plan menu CTA.

**app/(client)/menus/new/page.tsx** — Minimal Server Component with date input form bound to `createMenuPlan` action.

**app/(client)/menus/[id]/page.tsx** — Client Component (`'use client'`):
- Fetches plan + items + rules + recent plans on mount via Supabase client
- Calls `validateMenuPlan()` on every render (recipes change → warnings recalculate)
- Recipe slots with remove buttons, loading skeletons during AI suggest
- "Add recipes" opens RecipePickerModal; "Suggest menu" calls /api/ai/suggest-menu
- Rules warnings panel with role="alert" and ChevronDown toggle
- AI rationale collapsible box (EFF6FF background)
- Fixed bottom action bar (mobile) with "Confirm menu" + "Delete plan"
- useTransition for pending states on confirm/delete

**app/(client)/menus/[id]/recipe-picker-modal.tsx** — Client Component:
- shadcn Dialog, max-w-2xl, overflow-y-auto
- Search + 300ms debounce, category Tabs
- Fetches `is_active = true` recipes from Supabase
- Toggle selection with ring-2 outline + checkmark badge overlay
- Disabled (opacity-40) at limit for unselected cards
- Footer "Confirm selection" disabled when < 2 selected

**app/(client)/dashboard/page.tsx** — Added Menu Plan card:
- Fetches next confirmed plan with recipe titles
- Shows recipe list if confirmed plan exists, else "Plan menu" CTA button linking to /menus

### Task 3: AI suggest menu route handler

**app/api/ai/suggest-menu/route.ts** — Route Handler (no 'use server', no 'use client'):
- Fetches all active recipes, active cooking rules, last 4 confirmed plans from Supabase
- Builds detailed Claude prompt with recipe catalog, rules, recent history, current selection
- Calls `claude-sonnet-4-20250514` via `https://api.anthropic.com/v1/messages`
- Returns JSON `{ recipes: [...], summary_rationale: "..." }`
- Guards on missing `CLAUDE_API_KEY` (500) and Claude API errors (502)

## Deviations from Plan

### Auto-fixed Issues

None.

### Minor implementation notes

**1. [Rule 2 - Missing validation] RecipePickerModal — minimum 2 recipes enforced**
- Found during: Task 2 implementation review
- The plan specified "Confirm selection" button disabled when < 2 selected — implemented as spec'd

**2. [Rule 1 - Bug] `maybeSingle()` used instead of `single()` for duplicate date check**
- Found during: Task 1
- `single()` throws when no row found; `maybeSingle()` returns null — correct semantics for "check if exists"

## Known Stubs

None. All data is wired to live Supabase queries. The AI suggest flow returns real recipe IDs that are saved to the database.

## Self-Check: PASSED

All files exist and all task commits verified:
- `530339a` — feat(02-02): business logic
- `59e8550` — feat(02-02): menu planning pages
- `49fdcf9` — feat(02-02): AI suggest menu route handler
