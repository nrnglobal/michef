---
phase: quick
plan: 260324-bve
subsystem: inventory
tags: [inventory, fridge-staples, shopping-list, crud, client-dashboard]
dependency_graph:
  requires: []
  provides: [inventory-page, shopping-list-inventory-filter]
  affects: [shopping-list-generation, sidebar-navigation]
tech_stack:
  added: []
  patterns: [server-component-page, use-client-interactivity, supabase-crud, router-refresh]
key_files:
  created:
    - app/(client)/inventory/page.tsx
    - app/(client)/inventory/inventory-client.tsx
  modified:
    - components/sidebar.tsx
    - lib/i18n/en.json
    - lib/i18n/es.json
    - lib/menu-actions.ts
decisions:
  - "Used Refrigerator icon from lucide-react (available in installed version) for sidebar nav item"
  - "Inline edit renders a form in place of the row (replaces the item row with an edit form) rather than a modal overlay"
  - "Shopping list filter uses exact lowercase string match on ingredient_name_en vs fridge_staples.item_name_en"
metrics:
  duration_minutes: 12
  completed_date: "2026-03-24T13:42:25Z"
  tasks_completed: 2
  files_changed: 6
---

# Quick Task 260324-bve: Add Inventory Page Summary

**One-liner:** Full CRUD inventory page for fridge staples with active/inactive toggle, sidebar nav, and shopping list generation filtered to exclude on-hand items.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create Inventory page with full CRUD | e48a9c9 | app/(client)/inventory/page.tsx, inventory-client.tsx, components/sidebar.tsx, lib/i18n/en.json, lib/i18n/es.json |
| 2 | Filter shopping list by inventory on-hand items | 4e2ef48 | lib/menu-actions.ts |

## What Was Built

### Inventory Page (`/inventory`)

- Server component (`page.tsx`) fetches all `fridge_staples` rows ordered by category then name
- Items grouped by category using the same `reduce` pattern as shopping lists page
- Category headers: uppercase, tracking-wide, same visual style as shopping lists
- Active items render normally; inactive items show with `opacity-50` and `line-through` on the name
- Empty state shows `Refrigerator` icon with descriptive copy
- Item count badge matching shopping-list style

### InventoryClient Component

- Manages `showAddForm` boolean and `editingId` string state
- Add form: item_name_en (required), item_name_es (optional, defaults to EN value on insert), quantity, category dropdown (Produce, Protein, Dairy, Grains, Pantry, Spices, Other)
- Edit: clicking Pencil icon replaces the item row with pre-populated form; Save commits update via `supabase.update().eq('id')`
- Toggle active: Check icon button; supabase update flips `is_active`; inactive rows show dimmed + strikethrough
- Delete: Trash icon with `window.confirm`; supabase delete; `router.refresh()` after every mutation
- All mutations use `createClient` from `@/lib/supabase/client`
- Styles match shopping-list-client.tsx: same `--casa-*` CSS variables, button classes, input classes

### Sidebar

- Added `Refrigerator` import from `lucide-react`
- Added `{ key: 'nav.inventory', href: '/inventory', icon: Refrigerator, active: true }` after `shoppingLists` entry

### i18n

- `en.json`: `"inventory": "Inventory"` added to `nav` object
- `es.json`: `"inventory": "Inventario"` added to `nav` object

### Shopping List Filtering (`lib/menu-actions.ts`)

In `confirmMenuPlan`, after consolidating ingredients and before inserting into `shopping_list_items`:
1. Fetches all `fridge_staples` where `is_active = true`
2. Builds `Set<string>` of lowercase trimmed `item_name_en` values
3. Filters `ingredientItems` to exclude those whose `ingredient_name_en.toLowerCase().trim()` is in the set
4. Inserts only the filtered items — shopping list only contains what the client does not already have

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All data flows are wired to the `fridge_staples` table via Supabase.

## Self-Check: PASSED

Files confirmed:
- app/(client)/inventory/page.tsx: FOUND
- app/(client)/inventory/inventory-client.tsx: FOUND
- components/sidebar.tsx: modified with Refrigerator + nav item
- lib/menu-actions.ts: modified with inventory filter

Commits confirmed:
- e48a9c9: feat(quick-260324-bve): add inventory page with full CRUD
- 4e2ef48: feat(quick-260324-bve): filter shopping list by active inventory items

Build: Passed with zero TypeScript errors (Next.js 16.2.1 Turbopack)
