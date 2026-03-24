---
phase: quick
plan: 260324-bve
type: execute
wave: 1
depends_on: []
files_modified:
  - app/(client)/inventory/page.tsx
  - app/(client)/inventory/inventory-client.tsx
  - components/sidebar.tsx
  - lib/i18n/en.json
  - lib/i18n/es.json
  - lib/menu-actions.ts
autonomous: true
requirements: [INVENTORY-PAGE]
must_haves:
  truths:
    - "Client can see all fridge staple items grouped by category"
    - "Client can add a new inventory item with name, quantity, and category"
    - "Client can edit existing inventory items inline"
    - "Client can toggle items active/inactive to mark as out-of-stock"
    - "Client can delete inventory items"
    - "Shopping list generation excludes items marked as on-hand in inventory"
    - "Inventory page is accessible from sidebar navigation"
  artifacts:
    - path: "app/(client)/inventory/page.tsx"
      provides: "Server component that fetches fridge_staples and renders inventory page"
    - path: "app/(client)/inventory/inventory-client.tsx"
      provides: "Client component with add/edit/delete/toggle functionality"
    - path: "components/sidebar.tsx"
      provides: "Updated sidebar with Inventory nav item"
  key_links:
    - from: "app/(client)/inventory/page.tsx"
      to: "fridge_staples table"
      via: "supabase select query"
      pattern: "from.*fridge_staples.*select"
    - from: "app/(client)/inventory/inventory-client.tsx"
      to: "fridge_staples table"
      via: "supabase insert/update/delete"
      pattern: "from.*fridge_staples"
    - from: "lib/menu-actions.ts"
      to: "fridge_staples table"
      via: "supabase select to filter shopping list"
      pattern: "fridge_staples.*is_active"
---

<objective>
Create an Inventory page in the client dashboard that lets the client manage their fridge staple items (what food they have on hand). Integrate with shopping list generation so that items already in inventory are excluded from the shopping list, meaning the cook only buys what is actually missing.

Purpose: The client tracks pantry/fridge items so shopping lists only show what needs to be purchased, reducing waste and duplicate buying.
Output: Full CRUD inventory page + shopping list filtering by on-hand items.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@lib/types.ts (FridgeStaple interface already exists)
@lib/supabase/server.ts
@lib/supabase/client.ts
@app/(client)/shopping-lists/page.tsx (pattern for server component pages)
@app/(client)/shopping-lists/shopping-list-client.tsx (pattern for client interactivity)
@components/sidebar.tsx (nav items array to extend)
@lib/menu-actions.ts (shopping list generation to modify)
@lib/i18n/en.json
@lib/i18n/es.json
@lib/consolidate-ingredients.ts (category keywords reused for inventory)

<interfaces>
<!-- Existing types the executor needs -->

From lib/types.ts:
```typescript
export interface FridgeStaple {
  id: string
  item_name_en: string
  item_name_es: string
  quantity?: string
  notes_en?: string
  notes_es?: string
  category?: string
  is_active: boolean
}
```

Database schema (fridge_staples table):
```sql
CREATE TABLE IF NOT EXISTS fridge_staples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name_en TEXT NOT NULL,
  item_name_es TEXT NOT NULL,
  quantity TEXT,
  notes_en TEXT,
  notes_es TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true
);
```

Sidebar nav pattern (from components/sidebar.tsx):
```typescript
const navItems = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, active: true },
  // ...add inventory item here, between shoppingLists and finances
]
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Inventory page with full CRUD</name>
  <files>app/(client)/inventory/page.tsx, app/(client)/inventory/inventory-client.tsx, components/sidebar.tsx, lib/i18n/en.json, lib/i18n/es.json</files>
  <action>
IMPORTANT: Read the Next.js docs at node_modules/next/dist/docs/ before writing any page components.

1. Create `app/(client)/inventory/page.tsx` as a server component:
   - Import `createClient` from `@/lib/supabase/server`
   - Fetch all fridge_staples ordered by category, then item_name_en
   - Import and use `FridgeStaple` type from `@/lib/types`
   - Render page title "Inventory" with subtitle "Track what you have on hand"
   - Show item count badge (same style as shopping-lists page)
   - Group items by category (same reduce pattern as shopping-lists/page.tsx)
   - For each category group, render category header (uppercase, tracking-wide, same style as shopping list)
   - For each item: show item_name_en (bold), item_name_es (faint below), quantity on right side, dim styling if is_active=false
   - Empty state: Refrigerator icon from lucide-react, "No inventory items yet", "Add items you keep on hand so your shopping list only shows what's missing."
   - Pass items array to InventoryClient component for interactivity

2. Create `app/(client)/inventory/inventory-client.tsx` as a 'use client' component:
   - Props: `items: FridgeStaple[]`
   - State: editing item ID (null = none), showAddForm boolean
   - ADD: Form with fields: item_name_en (required), item_name_es (optional, defaults to en value), quantity (optional), category (dropdown with options: Produce, Protein, Dairy, Grains, Pantry, Spices, Other — matching consolidate-ingredients.ts categories)
   - Insert into `fridge_staples` via client supabase, set is_active=true, then router.refresh()
   - EDIT: Click item row to enter inline edit mode. Same fields as add form but pre-populated. Update via supabase .update().eq('id', item.id), then router.refresh()
   - TOGGLE ACTIVE: Checkbox or toggle button on each row. Supabase update is_active, router.refresh(). Active items show normal, inactive items show with opacity-50 and strikethrough on name
   - DELETE: Small trash icon button on each row (confirm with window.confirm). Supabase .delete().eq('id', item.id), router.refresh()
   - All mutations use `createClient` from `@/lib/supabase/client`
   - Style consistently with shopping-list-client.tsx: same button styles, input styles, color variables (--casa-primary, --casa-border, --casa-text, etc.)

3. Add Inventory to sidebar navigation in `components/sidebar.tsx`:
   - Import `Refrigerator` from lucide-react (or `Package` if Refrigerator unavailable — check lucide-react exports)
   - Add nav item after shoppingLists entry: `{ key: 'nav.inventory', href: '/inventory', icon: Refrigerator, active: true }`

4. Add i18n keys:
   - en.json: Add `"inventory": "Inventory"` inside the `"nav"` object
   - es.json: Add `"inventory": "Inventario"` inside the `"nav"` object
  </action>
  <verify>
    <automated>cd /Users/neilreeve-newson/Desktop/MiChef && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>Inventory page renders at /inventory with all fridge_staples listed by category. Client can add, edit, toggle active, and delete items. Sidebar shows Inventory link. Build succeeds with no errors.</done>
</task>

<task type="auto">
  <name>Task 2: Filter shopping list by inventory on-hand items</name>
  <files>lib/menu-actions.ts</files>
  <action>
In `lib/menu-actions.ts`, find the function that generates shopping list items (the one that inserts into `shopping_list_items` after consolidating ingredients). Modify it to:

1. After consolidating ingredients but BEFORE inserting into shopping_list_items, fetch active fridge staples:
   ```
   const { data: staples } = await supabase
     .from('fridge_staples')
     .select('item_name_en')
     .eq('is_active', true)
   ```

2. Build a Set of lowercase staple names:
   ```
   const onHand = new Set((staples ?? []).map(s => s.item_name_en.toLowerCase().trim()))
   ```

3. Filter the consolidated ingredient items to EXCLUDE any whose `ingredient_name_en.toLowerCase().trim()` matches an entry in onHand:
   ```
   const filteredItems = ingredientItems.filter(
     item => !onHand.has(item.ingredient_name_en.toLowerCase().trim())
   )
   ```

4. Use `filteredItems` instead of `ingredientItems` for the shopping_list_items insert.

This means when the client confirms a menu and the shopping list is generated, items they already have on hand (active fridge staples) are automatically excluded.
  </action>
  <verify>
    <automated>cd /Users/neilreeve-newson/Desktop/MiChef && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>Shopping list generation in menu-actions.ts filters out ingredients that match active fridge_staples by name. Only missing items appear on the generated shopping list.</done>
</task>

</tasks>

<verification>
1. `npx next build` succeeds with no type errors
2. Navigate to /inventory — page loads, shows seeded fridge staple items grouped by category
3. Add a new item — appears in the list after refresh
4. Toggle an item inactive — shows dimmed/strikethrough styling
5. Delete an item — removed from list
6. Sidebar shows "Inventory" link between Shopping Lists and Finances
7. Confirm a menu plan — shopping list excludes items that are active in inventory
</verification>

<success_criteria>
- Inventory page at /inventory with full CRUD for fridge_staples
- Items grouped by category with same visual style as shopping lists
- Active/inactive toggle visually distinguishes on-hand vs out-of-stock items
- Shopping list generation filters out active inventory items by name match
- Sidebar navigation includes Inventory link
- Build passes with zero errors
</success_criteria>

<output>
After completion, create `.planning/quick/260324-bve-add-inventory-page-for-client-to-track-f/260324-bve-SUMMARY.md`
</output>
