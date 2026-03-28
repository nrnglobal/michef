---
phase: quick
plan: 260328-ijq
type: execute
wave: 1
depends_on: []
files_modified:
  - app/(client)/inventory/inventory-client.tsx
  - app/(client)/inventory/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Add Item button is visible in the top-right area of the inventory page header"
    - "Add Item form still opens inline when button is clicked"
    - "Import from Sheets button remains accessible"
  artifacts:
    - path: "app/(client)/inventory/inventory-client.tsx"
      provides: "Relocated Add Item button at top of component"
    - path: "app/(client)/inventory/page.tsx"
      provides: "Updated layout to accommodate top-right button"
  key_links:
    - from: "inventory-client.tsx"
      to: "showAddForm state"
      via: "onClick handler"
      pattern: "setShowAddForm"
---

<objective>
Move the "Add Item" button from the bottom of the inventory list to the top-right corner of the page header, alongside the item count badge.

Purpose: Better UX -- the primary action should be immediately visible without scrolling.
Output: Updated inventory page with top-right Add Item button.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/(client)/inventory/page.tsx
@app/(client)/inventory/inventory-client.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Relocate Add Item button to top-right of inventory page</name>
  <files>app/(client)/inventory/inventory-client.tsx, app/(client)/inventory/page.tsx</files>
  <action>
In `inventory-client.tsx`, move the "Add Item" button (currently at ~line 822-831, the `Plus` icon button with text "Add item") and the "Import from Sheets" button from the bottom of the component to the TOP of the component's return JSX, positioned as a row above the tab bar.

Specifically:

1. At the very top of the returned JSX (inside the `<div className="space-y-4">`), add a new flex row BEFORE the tab bar section:
   ```
   <div className="flex items-center justify-between">
     <div className="flex items-center gap-2">
       {/* Add Item button - only show when form is not open */}
       {!showAddForm && (
         <button onClick={() => setShowAddForm(true)} ...same styling as current...>
           <Plus className="w-4 h-4" /> Add item
         </button>
       )}
       {!showAddForm && (
         <button onClick={() => setShowImport(!showImport)} ...same styling as current Import from Sheets button...>
           <FileSpreadsheet className="w-4 h-4" /> Import from Sheets
         </button>
       )}
     </div>
   </div>
   ```

2. Keep the `showAddForm` conditional and `<ItemForm>` block where it currently is (below the category groups), so the inline form still appears at the bottom of the list. OR move the form to appear just below this new top row for better proximity to the button -- use your judgment on which feels more natural.

3. Remove the old button location (the `<div className="flex items-center gap-2">` block at ~line 822-845 that contained both buttons).

4. In `page.tsx`, the header already has `flex items-center justify-between` with item count badge on the right. Since the Add Item button is now at the top of `InventoryClient`, no changes needed to `page.tsx` UNLESS the empty state (line 36-48) also needs an add button -- if so, consider passing a callback or keeping the empty state guidance text as-is.

Style the buttons identically to how they currently appear (same colors, same `var(--casa-primary)` usage, same sizing). The top-right positioning comes from the flex justify-between or justify-end in the new row.
  </action>
  <verify>
    <automated>cd /Users/neilreeve-newson/Desktop/MiChef && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>Add Item button renders at the top of the inventory client area (above tabs), not at the bottom. Clicking it still opens the add form. Import from Sheets button also relocated to the same top area. No visual regressions -- build succeeds.</done>
</task>

</tasks>

<verification>
- Build passes without errors
- Add Item button is at the top-right of the inventory section
- Clicking Add Item opens the inline form
- Import from Sheets button is still accessible
- Tab bar and category list render correctly below
</verification>

<success_criteria>
The Add Item button is positioned at the top of the inventory page content area (above the filter tabs), visible without scrolling, and all existing functionality (add form, import) still works.
</success_criteria>

<output>
After completion, create `.planning/quick/260328-ijq-on-inventory-move-the-add-item-button-to/260328-ijq-SUMMARY.md`
</output>
