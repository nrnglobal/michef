---
phase: quick
plan: 260324-ccy
subsystem: shopping-lists
tags: [shopping-list, rls, client-ux, edit, delete]
dependency_graph:
  requires: []
  provides: [client-edit-shopping-list-items, client-delete-shopping-list-items]
  affects: [shopping_list_items-rls, shopping-list-client-ui]
tech_stack:
  added: []
  patterns: [inline-edit-pattern, supabase-client-update-delete]
key_files:
  created:
    - supabase/migrations/005_shopping_list_client_write.sql
  modified:
    - app/(client)/shopping-lists/shopping-list-client.tsx
    - app/(client)/shopping-lists/page.tsx
decisions:
  - "Cook UPDATE policy widened to both client+cook (not cook-only) so client can edit names/quantities while cook retains ability to check off items in /lista"
  - "Item rendering moved entirely into ShoppingListClient (client component) to enable per-row edit/delete interaction without server round-trips for toggling state"
  - "quantity field stored as number in DB but accepted as text input string — parseFloat conversion matches existing schema type"
metrics:
  duration: ~10 minutes
  completed_date: "2026-03-24"
  tasks: 2
  files: 3
---

# Quick Task 260324-ccy Summary

**One-liner:** Inline edit and delete for shopping list items via new client+cook UPDATE and client-only DELETE RLS policies, with ItemForm sub-component following the inventory-client pattern.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add RLS policies for client UPDATE and DELETE on shopping_list_items | 88a227f | supabase/migrations/005_shopping_list_client_write.sql |
| 2 | Rewrite shopping-list-client.tsx with edit and delete, update page.tsx | 610dd03 | app/(client)/shopping-lists/shopping-list-client.tsx, app/(client)/shopping-lists/page.tsx |

## What Was Built

- **Migration 005:** Drops the cook-only UPDATE policy and replaces it with a combined client+cook policy. Adds a new client-only DELETE policy. Cook can still check off items; client can now edit and delete items.

- **ShoppingListClient rewrite:** Accepts `items: ShoppingListItem[]` prop and renders all items grouped by category (previously rendered in page.tsx server component). Each item row has Pencil (edit) and Trash2 (delete) icon buttons. Clicking edit shows an inline `ItemForm` pre-filled with name_en, name_es, quantity, unit, and category. Save calls `supabase.update()`, delete calls `supabase.delete()` after `window.confirm`. Add item remains at bottom using the same `ItemForm`.

- **page.tsx:** Removed the category-grouped item rendering loop. Now passes `items={allItems}` to `<ShoppingListClient>`. Header, visit date, item count badge, and empty state card remain in the server component.

## Deviations from Plan

None — plan executed exactly as written. The `quantity` field is a `number | undefined` in the DB schema and a string in the form state; parseFloat conversion handles this correctly as in the existing schema.

## Known Stubs

None. All item data is wired from Supabase through page.tsx server component to ShoppingListClient props.

## Self-Check: PASSED

- supabase/migrations/005_shopping_list_client_write.sql: EXISTS
- app/(client)/shopping-lists/shopping-list-client.tsx: EXISTS (rewritten)
- app/(client)/shopping-lists/page.tsx: EXISTS (updated)
- Commit 88a227f: EXISTS
- Commit 610dd03: EXISTS
- Build: PASSED (no type errors)
