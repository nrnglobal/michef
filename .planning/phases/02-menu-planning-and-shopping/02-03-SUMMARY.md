---
phase: 02-menu-planning-and-shopping
plan: "03"
subsystem: cook-shopping-ui
tags: [shopping-list, optimistic-update, client-component, mobile-first, i18n, touch-targets]
dependency_graph:
  requires: [02-02]
  provides: [lista-page, visita-shopping-link]
  affects: [cook-ux, shopping-list-ux]
tech_stack:
  added: []
  patterns:
    - Client Component with useState + useEffect for data fetching and optimistic UI
    - createClient() browser Supabase client for interactive mutations
    - Optimistic check-off with automatic revert on error
    - Category grouping via reduce on items array
    - Floating fixed-position action button pattern
key_files:
  created:
    - app/(cook)/lista/page.tsx
  modified:
    - app/(cook)/visita/page.tsx
decisions:
  - Checkbox uses data-checked attribute (base-ui pattern) — no separate prop needed; checked prop is standard React
  - Opacity applied via inline style prop (not Tailwind opacity-50 class) to match existing codebase inline-style convention
  - Fallback menu plan query added to visita without changing Server Component pattern
metrics:
  duration: "2m 8s"
  completed_date: "2026-03-23T01:58:55Z"
  tasks: 2
  files: 2
---

# Phase 02 Plan 03: Cook Shopping List and Visita Link Summary

Cook shopping list page (/lista) with optimistic check-off, 48px touch targets, category grouping, fridge staples section, and floating ad-hoc item add; plus visita page updated with confirmed-menu shopping list link and direct menu_plan fallback.

## What Was Built

**Task 1 — `app/(cook)/lista/page.tsx`** (new file, 338 lines)

A fully functional cook shopping list as a Client Component. On mount, it finds the next confirmed `menu_plan`, then its associated `shopping_list`, then fetches all `shopping_list_items`. Items are split into recipe ingredients (grouped by category) and fridge staples (`is_always_stock === true`), each with its own section.

- Optimistic check-off via `handleCheck`: updates local state immediately, then persists to Supabase. On error, reverts state and shows `toast.error`.
- Running count chip with `aria-live="polite"` announces changes to screen readers.
- Each list item row is `min-h-12` (48px) satisfying SHOP-03.
- Checked items de-emphasised with `opacity: 0.5` inline style and name text in `#9B8B70` (SHOP-05).
- Fridge staples section at bottom with "Siempre en casa" sub-label in `#C4B49A` (SHOP-06).
- Floating `fixed bottom-24 right-4` "+" button (56px circle, `#8B6914`) opens inline input for ad-hoc items. Submitted items inserted into `shopping_list_items` and optimistically added to local state (SHOP-07).
- All text in Spanish via `useI18n()` + `t()` hook.
- Empty state with ShoppingCart icon when no list found.

**Task 2 — `app/(cook)/visita/page.tsx`** (modified)

- Added `Link` from `next/link` and `ShoppingCart` from `lucide-react`.
- "Lista de compras" link button (outline style, `#8B6914` border) rendered below recipe list when `menuPlan?.status === 'confirmed' && menuRecipes.length > 0` (MENU-06).
- Added fallback query: if no `visit.menu_plan_id`, directly queries `menu_plans` for `status: 'confirmed'` ordered by nearest date. This ensures the cook sees the confirmed menu even without a linked visit record (expected state in Phase 2).
- Remains a Server Component — no `'use client'` added.

## Requirements Satisfied

| Req | Description |
|-----|-------------|
| MENU-06 | Cook can navigate from visita to shopping list via confirmed-menu-gated link |
| SHOP-02 | Shopping list shows items in Spanish with quantity and unit |
| SHOP-03 | 48px minimum touch targets on all list item rows |
| SHOP-04 | Running count chip ("N de total listos") updates optimistically |
| SHOP-05 | Checked items de-emphasised with opacity-50 and muted text |
| SHOP-06 | Fridge staples section at bottom, separated from recipe ingredients |
| SHOP-07 | Floating + button allows ad-hoc item add with optimistic insert |

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | a2681b0 | feat(02-03): cook shopping list page /lista |
| 2 | 9378645 | feat(02-03): update visita page with shopping list link |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all functionality is wired to live Supabase data. The shopping list items are fetched from the database (seeded in 02-02). Ad-hoc items are inserted in real time.

## Self-Check: PASSED

- FOUND: app/(cook)/lista/page.tsx
- FOUND: app/(cook)/visita/page.tsx
- FOUND: commit a2681b0 (Task 1)
- FOUND: commit 9378645 (Task 2)
