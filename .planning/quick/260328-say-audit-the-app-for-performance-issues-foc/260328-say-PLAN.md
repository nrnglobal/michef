---
phase: quick
plan: 260328-say
type: execute
wave: 1
depends_on: []
files_modified:
  - app/(client)/recipes/page.tsx
  - app/(client)/recipes/recipes-client.tsx
  - app/(client)/inventory/inventory-client.tsx
  - components/recipe-card.tsx
  - app/(client)/loading.tsx
  - app/(client)/recipes/loading.tsx
  - app/(client)/inventory/loading.tsx
  - app/(client)/menus/loading.tsx
  - app/(client)/shopping-lists/loading.tsx
  - app/(client)/rules/loading.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Navigation between pages shows skeleton/loading UI instead of blank screen"
    - "Recipes page loads data server-side, not via client-side useEffect"
    - "Inventory filter changes do not recompute category groupings unnecessarily"
    - "RecipeCard does not re-render when sibling cards change state"
  artifacts:
    - path: "app/(client)/loading.tsx"
      provides: "Shared loading skeleton for client route group"
    - path: "app/(client)/recipes/recipes-client.tsx"
      provides: "Client-side filtering/interaction for recipes (search, category, variants)"
    - path: "app/(client)/recipes/page.tsx"
      provides: "Server component that fetches recipes and passes to client"
  key_links:
    - from: "app/(client)/recipes/page.tsx"
      to: "app/(client)/recipes/recipes-client.tsx"
      via: "props (recipes data)"
      pattern: "RecipesClient.*items="
---

<objective>
Fix the three most impactful performance issues in the app: (1) recipes page fetching all data client-side instead of server-side, (2) zero loading.tsx files causing blank screens during navigation, (3) missing memoization on expensive inventory filtering and recipe card rendering.

Purpose: Faster perceived load times, less data fetching overhead, smoother navigation experience.
Output: Server-rendered recipes page, loading skeletons, memoized components.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/(client)/recipes/page.tsx
@app/(client)/inventory/inventory-client.tsx
@app/(client)/inventory/page.tsx
@components/recipe-card.tsx
@app/(client)/dashboard/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Convert recipes page to server component + add loading skeletons</name>
  <files>
    app/(client)/recipes/page.tsx
    app/(client)/recipes/recipes-client.tsx
    app/(client)/loading.tsx
    app/(client)/recipes/loading.tsx
    app/(client)/inventory/loading.tsx
    app/(client)/menus/loading.tsx
    app/(client)/shopping-lists/loading.tsx
    app/(client)/rules/loading.tsx
  </files>
  <action>
**Recipes page refactor (biggest perf win):**

The recipes page is currently a full `'use client'` component that fetches ALL recipe data via `useEffect` + `createClient()` on mount. Every other data page (dashboard, inventory, menus, shopping-lists) already fetches server-side.

1. Create `app/(client)/recipes/recipes-client.tsx` as a `'use client'` component that receives `items: Recipe[]` and `variantMap: Record<string, Recipe[]>` as props. Move the client-side logic there: search filtering (local string match -- no refetch), category filtering (local -- no refetch), variant expand/collapse, GenerateRecipeModal toggle, generatedRecipe state. The search and category filter should work purely client-side against the passed-in items (using `useMemo`) -- do NOT re-fetch from Supabase on every keystroke like the current code does.

2. Rewrite `app/(client)/recipes/page.tsx` as an async server component (remove `'use client'`). Fetch all active top-level recipes + their variants server-side using `createClient` from `@/lib/supabase/server` (follow exact pattern from `app/(client)/inventory/page.tsx` and `app/(client)/dashboard/page.tsx`). Pass data to `<RecipesClient items={recipes} variants={variantMap} />`.

3. The current code re-fetches from Supabase on every search keystroke (with a 300ms debounce). The new version should fetch ALL recipes once server-side, then filter client-side with `useMemo` keyed on `[search, category, items]`. This eliminates N+1 network requests during search/filter.

**Loading skeletons:**

Create `app/(client)/loading.tsx` as the shared loading skeleton for the client route group. Use the casa design system variables. Show a simple skeleton with:
- A header placeholder bar (h-8 w-48)
- A subtitle placeholder bar (h-4 w-32)
- 3 card-shaped skeleton blocks in a grid

Use `animate-pulse` with `backgroundColor: 'var(--casa-border)'` (matches existing skeleton pattern from current recipes page loading state, lines 196-204).

Also create route-specific `loading.tsx` files for `/recipes`, `/inventory`, `/menus`, `/shopping-lists`, `/rules` that re-export or customize the shared skeleton. These can be minimal -- even just re-exporting the shared one, or a simple `export default function Loading() { return <div>...</div> }` with 2-3 pulse blocks. The key is that SOMETHING shows during server component data fetch.
  </action>
  <verify>
    <automated>cd /Users/neilreeve-newson/Desktop/MiChef && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - Recipes page.tsx is a server component (no 'use client' directive)
    - recipes-client.tsx handles search/filter/expand client-side with useMemo
    - No useEffect data fetching in recipes flow
    - loading.tsx exists in at least app/(client)/ and app/(client)/recipes/
    - Build succeeds with no errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Memoize inventory filtering and RecipeCard</name>
  <files>
    app/(client)/inventory/inventory-client.tsx
    components/recipe-card.tsx
  </files>
  <action>
**Inventory client memoization:**

In `inventory-client.tsx`, the following values recompute on EVERY render (any state change -- even opening the add form, typing in edit form, toggling saving state):

1. `filteredItems` (line 474) -- depends only on `items`, `activeTab`, `staplesFilter`. Wrap in `useMemo` with those deps.

2. `categoryGroups` (line 487) -- depends only on `filteredItems`. Wrap in `useMemo` with `[filteredItems]`.

3. `addSuggestions` (line 308) -- depends only on `addForm.item_name_en`. Wrap in `useMemo` with `[addForm.item_name_en]`.

4. `editSuggestions` (line 314) -- depends only on `editForm.item_name_en`. Wrap in `useMemo` with `[editForm.item_name_en]`.

Add `useMemo` to the import from 'react' (currently only imports `useState`).

Do NOT memoize the handlers (handleAdd, handleEdit, etc.) -- they are used in forms that already have their own saving/disabled states and are not passed to memoized children.

**RecipeCard memoization:**

Wrap the `RecipeCard` component export with `React.memo()`. The component receives `recipe` and `language` props -- both are stable references (recipe object from server data, language is a string). This prevents re-rendering every card when one card's variant expand/collapse toggle changes in the parent.

Change the export to:
```typescript
export const RecipeCard = memo(function RecipeCard({ recipe, language = 'en' }: RecipeCardProps) {
  // ... existing body
})
```

Import `memo` from 'react'.
  </action>
  <verify>
    <automated>cd /Users/neilreeve-newson/Desktop/MiChef && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - inventory-client.tsx uses useMemo for filteredItems, categoryGroups, addSuggestions, editSuggestions
    - RecipeCard is wrapped with React.memo
    - Build succeeds with no errors
    - No behavioral changes -- filters, search, add/edit/delete all work identically
  </done>
</task>

</tasks>

<verification>
- `npx next build` completes without errors
- Recipes page.tsx has NO `'use client'` directive
- recipes-client.tsx has `'use client'` and uses `useMemo` for filtering
- `grep -c "useMemo" app/(client)/inventory/inventory-client.tsx` returns >= 4
- `grep -c "memo" components/recipe-card.tsx` returns >= 1
- `ls app/(client)/loading.tsx app/(client)/recipes/loading.tsx` both exist
</verification>

<success_criteria>
- Server-side recipe data fetching eliminates N client-side Supabase calls per page load
- Loading skeletons appear during page transitions (no blank screens)
- Inventory filter/tab changes only recompute derived data when relevant inputs change
- RecipeCard instances do not re-render when sibling state changes
</success_criteria>

<output>
After completion, create `.planning/quick/260328-say-audit-the-app-for-performance-issues-foc/260328-say-SUMMARY.md`
</output>
