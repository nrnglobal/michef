---
phase: quick
plan: 260324-ccy
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/005_shopping_list_client_write.sql
  - app/(client)/shopping-lists/shopping-list-client.tsx
  - app/(client)/shopping-lists/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Client can edit the name, quantity, and category of an existing shopping list item"
    - "Client can delete a shopping list item they no longer need"
    - "Add item still works as before"
  artifacts:
    - path: "supabase/migrations/005_shopping_list_client_write.sql"
      provides: "RLS policies allowing client UPDATE and DELETE on shopping_list_items"
    - path: "app/(client)/shopping-lists/shopping-list-client.tsx"
      provides: "Client component with add, inline edit, and delete for shopping list items"
  key_links:
    - from: "app/(client)/shopping-lists/shopping-list-client.tsx"
      to: "shopping_list_items table"
      via: "Supabase client .update() and .delete()"
      pattern: "supabase.*from.*shopping_list_items.*(update|delete)"
---

<objective>
Give the client the ability to edit and remove existing shopping list items.

Purpose: Currently the client can only add items to the shopping list. They need to correct typos, update quantities, and remove items they no longer need.
Output: Updated shopping list page with inline edit and delete actions per item, backed by new RLS policies.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@lib/types.ts (ShoppingListItem interface)
@supabase/migrations/003_rls_tighten.sql (current RLS — UPDATE is cook-only, no DELETE policy)
@app/(client)/shopping-lists/page.tsx (server component rendering items)
@app/(client)/shopping-lists/shopping-list-client.tsx (current add-only client component)
@app/(client)/inventory/inventory-client.tsx (reference pattern for edit/delete UI)

IMPORTANT: Per AGENTS.md, read the relevant Next.js guide in node_modules/next/dist/docs/ before writing any code.

<interfaces>
From lib/types.ts:
```typescript
export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient_name_en: string
  ingredient_name_es: string
  quantity?: number
  unit?: string
  category?: string
  source_recipe_ids?: string[]
  is_checked: boolean
  is_always_stock: boolean
  checked_at?: string
}
```

Current ShoppingListClient props:
```typescript
interface Props {
  listId: string
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add RLS policies for client UPDATE and DELETE on shopping_list_items</name>
  <files>supabase/migrations/005_shopping_list_client_write.sql</files>
  <action>
Create migration `supabase/migrations/005_shopping_list_client_write.sql` that:

1. Drops the existing cook-only UPDATE policy:
   ```sql
   DROP POLICY IF EXISTS "Cook can update shopping list items" ON shopping_list_items;
   ```

2. Creates a new UPDATE policy allowing BOTH client and cook roles (cook still needs it for checking off items in /lista):
   ```sql
   CREATE POLICY "Authenticated can update shopping list items"
     ON shopping_list_items FOR UPDATE
     TO authenticated
     USING (
       EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'client' OR role = 'cook'))
     );
   ```

3. Creates a DELETE policy for client role (cook should not delete items from the shopping list):
   ```sql
   CREATE POLICY "Client can delete shopping list items"
     ON shopping_list_items FOR DELETE
     TO authenticated
     USING (
       EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
     );
   ```

Run this migration against the local Supabase instance:
```bash
npx supabase db push
```
If `supabase db push` is not available or fails, run the SQL directly via the Supabase dashboard or `psql`. The executor should apply the migration however the project normally applies them.
  </action>
  <verify>
    <automated>npx supabase db push --dry-run 2>&1 || echo "Run migration manually if supabase CLI not configured"</automated>
  </verify>
  <done>Migration file exists at supabase/migrations/005_shopping_list_client_write.sql. Client role can UPDATE and DELETE shopping_list_items. Cook role can still UPDATE.</done>
</task>

<task type="auto">
  <name>Task 2: Rewrite shopping-list-client.tsx with edit and delete, update page.tsx to pass items</name>
  <files>app/(client)/shopping-lists/shopping-list-client.tsx, app/(client)/shopping-lists/page.tsx</files>
  <action>
Follow the pattern established in `app/(client)/inventory/inventory-client.tsx` closely.

**shopping-list-client.tsx changes:**

1. Change Props interface to accept both `listId: string` and `items: ShoppingListItem[]` (import ShoppingListItem from `@/lib/types`).

2. Add state for `editingId`, `editForm`, `saving`, `deleting` (same pattern as inventory-client).

3. Define a FormState interface with fields: `ingredient_name_en: string`, `ingredient_name_es: string`, `quantity: string`, `unit: string`, `category: string`. Define `emptyForm` constant. Use the same CATEGORIES array as inventory-client: `['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Spices', 'Other']`.

4. Keep the existing `handleAdd` function but update it to use the full form (name_en, name_es, quantity, unit, category) instead of just a text input.

5. Add `startEdit(item: ShoppingListItem)` — populates editForm from item fields.

6. Add `handleEdit(e: React.FormEvent, itemId: string)` — calls `supabase.from('shopping_list_items').update({...}).eq('id', itemId)`, then `router.refresh()`.

7. Add `handleDelete(itemId: string)` — shows `window.confirm('Remove this item from the shopping list?')`, then calls `supabase.from('shopping_list_items').delete().eq('id', itemId)`, then `router.refresh()`.

8. Create an `ItemForm` sub-component (same pattern as inventory-client) rendering fields for name_en, name_es, quantity, unit, and category in a compact grid layout. Use the same `inputStyle` object with casa CSS variables.

9. Render the items list inside the client component (move rendering from page.tsx): for each item, if `editingId === item.id` show the ItemForm in edit mode, otherwise show the item row with Pencil (edit) and Trash2 (delete) icon buttons on the right side. Display item name, Spanish name (if different), quantity+unit.

10. Keep the "Add item" button and add form at the bottom.

11. Import icons: `Plus, Trash2, Pencil` from lucide-react.

**page.tsx changes:**

1. Remove the item rendering loop from page.tsx (lines ~105-141 that render categoryGroups). The client component will handle all item display.

2. Pass items to ShoppingListClient: `<ShoppingListClient listId={list.id} items={allItems} />`.

3. Keep the header, visit date, item count badge, and empty state in page.tsx. Only move the per-item rendering into the client component.

Style everything using the existing casa CSS custom properties (var(--casa-text), var(--casa-border), var(--casa-primary), etc.) and Tailwind classes. Match the visual density and spacing of the inventory page.
  </action>
  <verify>
    <automated>cd /Users/neilreeve-newson/Desktop/MiChef && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>Shopping list page shows all items with edit (pencil) and delete (trash) buttons per row. Clicking edit shows inline form pre-filled with item data. Clicking delete prompts confirmation then removes the item. Add item still works. Build succeeds with no type errors.</done>
</task>

</tasks>

<verification>
1. `npx next build` completes without errors
2. Visit /shopping-lists as client — items display with edit and delete buttons
3. Click pencil on an item — inline edit form appears with pre-filled values
4. Save edit — item updates in list
5. Click trash on an item — confirmation dialog appears, item removed on confirm
6. Add item button still works as before
</verification>

<success_criteria>
- Client can edit any shopping list item (name, quantity, unit, category)
- Client can delete any shopping list item with confirmation
- Add item functionality preserved
- RLS policies allow client UPDATE and DELETE on shopping_list_items
- Cook UPDATE still works (for checking off items)
- Build passes with no type errors
</success_criteria>

<output>
After completion, create `.planning/quick/260324-ccy-client-needs-ability-to-edit-remove-exis/260324-ccy-SUMMARY.md`
</output>
