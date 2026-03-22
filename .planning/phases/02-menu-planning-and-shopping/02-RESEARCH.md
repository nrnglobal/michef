# Phase 2: Menu Planning and Shopping - Research

**Researched:** 2026-03-22
**Domain:** Next.js 16 App Router, Supabase (RLS + Server Actions), Claude API (AI suggest), ingredient consolidation, shadcn/Radix UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Menu planning is dashboard-first. The next upcoming visit + "Plan menu" CTA lives on the dashboard. Planning opens as a separate page (not a drawer). No dedicated "Menus" sidebar section — keep the sidebar lean.
- **D-02:** Client picks recipes via a browse-and-select modal. A recipe browser modal opens (with search/filter), client selects up to 4 recipes, then closes to confirm selection. Not drag-and-drop. Not an inline search panel.
- **D-03:** Plain date input — simple date picker / input field. Client types or picks any date. No visit-day pattern suggestions. Consistent with PROJECT.md decision: "No calendar widget for visit scheduling."
- **D-04:** Multiple plans allowed — one plan per visit date. Client can create plans for several upcoming visits simultaneously. Each visit date can have at most one plan (attempting to create a second plan for an existing date should warn/block).

### Claude's Discretion
- AI suggest menu behavior (full replace vs fill slots, preview rationale, re-try) — Claude decides
- Rules engine warnings presentation (inline vs summary panel, hard block vs soft warning, real-time vs on-confirm) — Claude decides
- Cook's shopping list UX details (check-off animation, section ordering, ad-hoc item entry, running count format) — follow REQUIREMENTS: 48px touch targets, running count, visual de-emphasis of checked items
- Ingredient consolidation logic (unit normalisation strategy, same-ingredient detection) — Claude decides
- Empty state design for new plans, loading states — Claude decides

### Deferred Ideas (OUT OF SCOPE)
- None came up — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | proxy.ts is already correctly named for Next.js 16 — the REQUIREMENTS.md description is inverted; `proxy.ts` IS the correct filename, not `middleware.ts` | Verified via Next.js 16 official docs in node_modules/next/dist/docs/ |
| INFRA-02 | RLS policies must be scoped to role-based writes: cook writes own check-offs only, client writes own menu plans only | Current schema has overly broad "Authenticated users can manage" policies; new migration needed |
| INFRA-03 | Remove Supabase URL placeholder fallback in lib/supabase/server.ts | Confirmed: line 8 has `?? 'https://placeholder.supabase.co'` which must be removed |
| MENU-01 | Client creates menu plan: pick date + 2–4 recipes | DB schema already exists: menu_plans + menu_plan_items tables |
| MENU-02 | Client edits plan (add/remove/reorder) before confirming | Edit page at /menus/[id]; Server Actions for mutations |
| MENU-03 | Client confirms a menu plan, making it visible to the cook | Status update: draft → confirmed; Server Action + revalidatePath |
| MENU-04 | AI-suggested menu: respects cooking rules, avoids recently cooked, incorporates feedback | Route handler at app/api/ai/suggest-menu/route.ts; Claude API server-side only |
| MENU-05 | Rules engine validates and surfaces warnings before confirmation | Pure client-side computation against cooking_rules JSONB data |
| MENU-06 | Cook sees next confirmed visit with recipes in Spanish | visita/page.tsx already shows recipes; MENU-06 is a gating behaviour (only show if confirmed) |
| SHOP-01 | Confirm → auto-generate shopping list (merged, normalised, grouped) | Server Action triggered on confirm; ingredient consolidation logic needed |
| SHOP-02 | Cook views shopping list items in Spanish with quantity + unit | /lista page; reads ingredient_name_es column |
| SHOP-03 | Cook checks off individual items — 48px touch targets | Shadcn Checkbox + min-h-12 rows; optimistic update pattern |
| SHOP-04 | Shopping list shows running count (checked / total) | Client state derived from checked items array; aria-live |
| SHOP-05 | Checked items visually de-emphasise (opacity-50 + text-faint) | CSS class toggle on is_checked; do NOT reorder in Phase 2 |
| SHOP-06 | Fridge staples section at bottom (from fridge_staples table, is_always_stock=true) | Appended as separate section after recipe ingredients |
| SHOP-07 | Cook can add ad-hoc items to shopping list | Floating "+" button → inline text input → insert row with is_always_stock=false |
</phase_requirements>

---

## Summary

This phase builds on a complete Phase 1 foundation: the database schema for `menu_plans`, `menu_plan_items`, `shopping_lists`, `shopping_list_items`, `fridge_staples`, and `cooking_rules` is fully defined. Existing code patterns (Server Component reads, client-side mutations via Supabase JS client, shadcn components, i18n dictionaries) are clear and consistent across the codebase. The implementation work is primarily routing, UI, business logic, and wiring — not infrastructure design.

The single most important discovery is that **INFRA-01 has its description exactly backwards**. Next.js 16 renamed `middleware.ts` to `proxy.ts` — the file that already exists at the project root. The current `proxy.ts` is correctly named and correctly functioning. INFRA-01 should be reinterpreted as: verify the proxy function works correctly with the new Next.js 16 `proxy` export name convention (which it does — the file already exports `proxy`, not `middleware`). No rename is needed; the file is correct.

The AI suggest-menu feature (MENU-04) requires a new Route Handler at `app/api/ai/suggest-menu/route.ts`. It must accept the current plan state (selected recipes, visit date), fetch active cooking rules and recent visit history server-side, then call the Claude API using the `CLAUDE_API_KEY` environment variable. Response: an array of recipe IDs with rationale text. The planner should treat this as a straightforward `POST` Route Handler returning JSON — no streaming required for this phase.

**Primary recommendation:** Ship infrastructure fixes first (INFRA-02 RLS migration, INFRA-03 env fallback removal), then build the menu planning flow (dashboard card → /menus list → /menus/[id] edit page with recipe picker modal → confirm Server Action → shopping list generation), then the cook's /lista page.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | App Router, Route Handlers, Server Actions | Project-installed; confirmed in package.json |
| react | 19.2.4 | Client Components, hooks | Project-installed |
| @supabase/ssr | ^0.9.0 | Server + client Supabase access | Already in use throughout codebase |
| @supabase/supabase-js | ^2.99.3 | Supabase JS client | Already in use |

### Supporting (all already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn | ^4.1.0 | Component CLI | Install dialog, checkbox, separator via `npx shadcn add` |
| lucide-react | ^0.577.0 | Icons | All icons — Sparkles for AI button, ShoppingCart, CheckSquare |
| sonner | ^2.0.7 | Toast notifications | Error states: save failed, AI failed, list gen failed |
| tailwind-merge | ^3.5.0 | Class merging | All conditional className logic |
| @base-ui/react | ^1.3.0 | Low-level UI primitives | Available if needed for custom interactions |

### New shadcn Components to Install
```bash
npx shadcn add dialog
npx shadcn add checkbox
npx shadcn add separator
```

These are not yet present in `components/ui/` — confirmed by file listing.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions for mutations | API Route handlers | Server Actions are simpler for this app's single-user pattern; both work |
| Client-side rules validation | Server-side validation | Client-side is instant feedback; server validates before DB write anyway |

---

## Architecture Patterns

### Route Structure (New Routes This Phase)
```
app/
├── (client)/
│   ├── dashboard/
│   │   └── page.tsx              # MODIFY: add upcoming visit card with "Plan menu" CTA
│   └── menus/
│       ├── page.tsx              # NEW: list of menu plans
│       ├── new/
│       │   └── page.tsx          # NEW: create new plan (redirects to /menus/[id] after creation)
│       └── [id]/
│           └── page.tsx          # NEW: edit/confirm plan page (Client Component)
├── (cook)/
│   ├── visita/
│   │   └── page.tsx              # MODIFY: add shopping list link button
│   └── lista/
│       └── page.tsx              # NEW: shopping list (Client Component for optimistic check-off)
└── api/
    └── ai/
        └── suggest-menu/
            └── route.ts          # NEW: POST handler for Claude API call
```

### Pattern 1: Server Component Reads, Server Actions for Mutations
**What:** Pages fetch data in async Server Components using `createClient()` from `lib/supabase/server`. Mutations (create plan, confirm plan, generate list, check off item) go through Server Actions (`'use server'` directive) or Route Handlers.
**When to use:** All data fetching pages in `(client)/menus/` and `(cook)/lista/`

```typescript
// Source: established pattern in app/(client)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function MenusPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from('menu_plans')
    .select('*')
    .order('visit_date', { ascending: true })
  // ...
}
```

### Pattern 2: Client Component for Interactive Surfaces
**What:** Shopping list page and recipe picker modal must be Client Components (`'use client'`) because they need useState for optimistic check-off and selection state.
**When to use:** `/lista` page, `RecipePickerModal` component, menu plan edit page

```typescript
// Source: established pattern in app/(client)/recipes/page.tsx
'use client'
import { createClient } from '@/lib/supabase/client'  // browser client
import { useState } from 'react'

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  // Optimistic updates: update local state immediately, then persist
}
```

### Pattern 3: Server Actions for Mutations with revalidatePath
**What:** Mutations use `'use server'` functions that call Supabase, then `revalidatePath()` to refresh the Server Component tree.
**When to use:** createMenuPlan, confirmMenuPlan, generateShoppingList

```typescript
// Source: Next.js 16 docs — node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md
'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function confirmMenuPlan(planId: string) {
  const supabase = await createClient()
  await supabase
    .from('menu_plans')
    .update({ status: 'confirmed' })
    .eq('id', planId)
  revalidatePath('/menus')
  revalidatePath('/menus/' + planId)
}
```

### Pattern 4: AI Route Handler (server-side Claude API)
**What:** A `POST` Route Handler at `app/api/ai/suggest-menu/route.ts` receives plan context, fetches rules + history, calls Claude API, returns recipe IDs + rationale JSON.
**When to use:** MENU-04 only — all Claude API calls must be server-side (CLAUDE_API_KEY must never reach browser)

```typescript
// Source: STATE.md architecture decision — all Claude API calls via app/api/ai/* route handlers
// app/api/ai/suggest-menu/route.ts
export async function POST(request: Request) {
  const { visitDate, currentRecipeIds } = await request.json()
  const supabase = createClient() // server client
  // fetch active rules, recent visit history, recipe library
  // call Claude API with CLAUDE_API_KEY from process.env
  // return: { suggestedRecipeIds: string[], rationale: string }
  return Response.json({ suggestedRecipeIds, rationale })
}
```

### Pattern 5: Optimistic Check-Off
**What:** Cook taps checkbox → local state updates immediately (pending visual) → Supabase update fires → on success, state confirms. On error, revert + toast.
**When to use:** SHOP-03 shopping list check-off — 48px touch targets, running count

```typescript
// Pattern: optimistic update
async function handleCheck(itemId: string, checked: boolean) {
  setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_checked: checked } : i))
  const supabase = createClient()
  const { error } = await supabase
    .from('shopping_list_items')
    .update({ is_checked: checked, checked_at: checked ? new Date().toISOString() : null })
    .eq('id', itemId)
  if (error) {
    // revert
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_checked: !checked } : i))
    toast.error('Failed to update item')
  }
}
```

### Pattern 6: Ingredient Consolidation Algorithm
**What:** When a menu plan is confirmed, gather all recipe ingredients (JSONB arrays), merge same-ingredient rows, normalise units, group by category.
**When to use:** SHOP-01 shopping list auto-generation; runs inside the confirmMenuPlan Server Action

**Consolidation strategy (recommended):**
1. Normalize ingredient names: lowercase + trim `name_en` as the merge key (seed data shows consistent English names)
2. Unit normalization: simple string-equality first; handle common aliases (cups/cup, tbsp/tablespoon, tsp/teaspoon, piece/pieces)
3. Quantity parsing: `Ingredient.quantity` is a string in the type but contains numeric text ("2", "0.5") — parse with `parseFloat()`; sum quantities only when units match after normalization
4. When units don't match (e.g., "2 cups" + "100g"), keep as separate rows — do not attempt cross-unit conversion
5. Category: use `Ingredient.category` field if present; default to "Other" if absent
6. `source_recipe_ids`: collect array of all recipe UUIDs that contributed to each merged item

**Anti-Patterns to Avoid**
- **Triggering shopping list generation on the client:** Always run consolidation in a Server Action — it reads all recipe ingredients and writes multiple rows; a client-side fetch-and-write sequence is error-prone and bypasses auth
- **Blocking confirm on AI errors:** The rules engine is soft-warning only; confirm must succeed even if rules violations exist (user has been warned)
- **Using middleware.ts:** In Next.js 16, the file is `proxy.ts` — do not create a `middleware.ts` file
- **Calling Claude API from a Client Component:** CLAUDE_API_KEY must only exist in server-side env; use the Route Handler pattern
- **Moving checked items to bottom in Phase 2:** Explicitly deferred to Phase 5 (offline complexity); use opacity-50 visual de-emphasis only

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal with focus trap | Custom div overlay | shadcn `Dialog` (Radix DialogRoot) | Keyboard nav, focus trap, aria-modal already handled |
| Checkbox with accessible state | Custom div+click | shadcn `Checkbox` (Radix CheckboxRoot) | aria-checked, keyboard support, indeterminate state |
| List section dividers | border-b div | shadcn `Separator` | Semantic role="separator", aria-orientation |
| Toast notifications | Custom toast | `toast()` from sonner (already installed) | Already wired in layout via Toaster component |
| Debounced search in recipe picker | Manual setTimeout | Reuse pattern from `recipes/page.tsx` (already uses 300ms debounce + useCallback) | Proven pattern in codebase |

**Key insight:** The recipe picker modal is NOT a new component architecture — it is the `recipes/page.tsx` search/filter/grid UI extracted into a `Dialog` wrapper with selection state added. Implement it by lifting the search+filter+grid into a `RecipePickerModal` component that `recipes/page.tsx` can also use.

---

## INFRA-01 Critical Correction

**INFRA-01 as written in REQUIREMENTS.md is factually incorrect for this version of Next.js.**

The requirement states: "Middleware file is named `middleware.ts` (not `proxy.ts`) so Next.js edge runtime picks it up correctly."

This is the opposite of what Next.js 16 requires. Confirmed from official docs at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`:

> "Note: The `middleware` file convention is deprecated and has been renamed to `proxy`. See Migration to Proxy for more details."
> "v16.0.0: Middleware is deprecated and renamed to Proxy"

The project's `proxy.ts` file at the root is already correctly named and already exports the function as `proxy` (not `middleware`). It is working correctly.

**INFRA-01 should be reinterpreted as:** Verify the proxy.ts function handles new auth-gated routes `/menus/*` and `/lista` correctly in the role-based route protection section. The new routes need to be added to the protection logic (client routes: `/menus`; cook routes: `/lista`).

---

## INFRA-02: RLS Policy Tightening

Current RLS policies use the overly broad pattern:
```sql
CREATE POLICY "Authenticated users can manage shopping list items"
  ON shopping_list_items FOR ALL
  TO authenticated
  USING (true);
```

Required tightening (new migration `003_rls_tighten.sql`):
- `shopping_list_items` INSERT/UPDATE: restrict to cook role only (check-off is a cook action)
- `menu_plans` INSERT/UPDATE: restrict to client role only
- `menu_plan_items` INSERT/UPDATE/DELETE: restrict to client role only
- SELECT policies can remain broad (both roles need to read)

**How to check role in RLS:**
```sql
-- Join through profiles table to check role
CREATE POLICY "Cook can write shopping list items"
  ON shopping_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'cook'
    )
  );
```

---

## INFRA-03: Supabase URL Fallback Removal

`lib/supabase/server.ts` line 8:
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
```

Remove the `?? 'https://placeholder.supabase.co'` and `?? 'placeholder-key'` fallbacks. Change to:
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
```

This matches the pattern already used in `lib/supabase/client.ts` which correctly uses `!` assertion without fallbacks.

---

## Sidebar and Route Activation

`components/sidebar.tsx` has nav items for "Menu Planning" (`/menu-planning`) and "Shopping Lists" (`/shopping-lists`) with `active: false`. These need to be activated and the hrefs updated:
- Menu Planning → `/menus` (the new list page)
- Shopping Lists → does not need a client-side list view in Phase 2; the cook accesses `/lista` directly

Decision (Claude's discretion): Activate only "Menu Planning" → `/menus` in the sidebar. Shopping Lists entry stays inactive — in Phase 2, shopping lists are accessed via the confirmed menu plan, not a standalone list.

---

## AI Suggest Menu: UX Decisions (Claude's Discretion)

**Behavior:** Full replace — AI returns 2–4 recipe suggestions that replace all current slots. User sees a rationale (collapsed info box). User can re-try for different suggestions or manually adjust slots after.

**Implementation:**
1. Client sends POST to `app/api/ai/suggest-menu/route.ts` with `{ visitDate, currentRecipeIds }`
2. Server fetches: all active recipes, active cooking_rules, recent menu_plans (last 4 confirmed) with their recipe IDs
3. Claude prompt: includes recipe list (id, title_en, category, protein_type, tags), rules text, recently-cooked IDs, visit date
4. Claude returns JSON: `{ recipes: [{id, title_en, rationale_en}], summary_rationale: string }`
5. Client populates slots with returned recipe IDs, shows rationale in collapsed info box
6. Loading state: replace recipe slots area with 2–4 skeleton cards

---

## Rules Engine: Implementation (Claude's Discretion)

**Validation timing:** Real-time — runs on every recipe add/remove in the plan editor. Does not block confirmation (soft warning only).

**Rule types and checks:**
- `dietary` / `allergy`: Check if any recipe's `tags` or `protein_type` contains the restricted item. Uses `rule_definition.description` or `rule_definition.restriction` as the match term.
- `preference`: Warning if rule preference is not satisfied (e.g., "prefer fish on Fridays")
- `frequency`: Check how many times the same recipe appears in recent confirmed plans (last 4). Warn if > threshold.
- `exclusion`: Warn if two specific recipes appear together (recipe A and recipe B should not be combined)

**Implementation:** Pure TypeScript function `validateMenuPlan(recipes: Recipe[], rules: CookingRule[], recentHistory: MenuPlan[]): RulesWarning[]`. Runs client-side; no server round-trip needed.

---

## Common Pitfalls

### Pitfall 1: INFRA-01 Confusion (CRITICAL)
**What goes wrong:** Developer renames `proxy.ts` to `middleware.ts`, breaking auth routing in Next.js 16.
**Why it happens:** REQUIREMENTS.md INFRA-01 description is inverted — written as if Next.js 14/15 convention applies.
**How to avoid:** Keep `proxy.ts` as-is. Only add new route protection entries inside `proxy.ts` for `/menus` and `/lista`.
**Warning signs:** Auth redirects stop working after rename; Next.js console shows no proxy loaded.

### Pitfall 2: Supabase Client in Server Components
**What goes wrong:** Using `createClient()` from `lib/supabase/client` in a Server Component causes "cookies() is not available" error.
**Why it happens:** Browser client tries to use browser APIs in server context.
**How to avoid:** Server Components always import from `lib/supabase/server`; Client Components from `lib/supabase/client`.

### Pitfall 3: Shopping List Not Generated on Re-Confirm
**What goes wrong:** If a confirmed plan is edited and re-confirmed, the shopping list is stale.
**Why it happens:** The confirm action creates the shopping list once but doesn't update on subsequent confirms.
**How to avoid:** The confirm Server Action should check if a shopping list already exists for this plan_id. If yes, delete existing items and regenerate. If no, create fresh.

### Pitfall 4: Duplicate Date Validation
**What goes wrong:** Two menu plans created for the same visit date (D-04 prevents this).
**Why it happens:** No DB-level unique constraint on `menu_plans.visit_date` — only app-level check.
**How to avoid:** Before inserting a new plan, query for existing plan with same visit_date. If found, redirect to edit that plan. Consider adding a DB-level UNIQUE constraint on `visit_date` in the tightening migration.

### Pitfall 5: Ingredient Quantity as String vs Number
**What goes wrong:** `Ingredient.quantity` is typed as `string` in `lib/types.ts` but `ShoppingListItem.quantity` is `NUMERIC` (number) in the DB.
**Why it happens:** Recipe ingredients store quantity as text (e.g., "0.5", "2"), but the shopping list stores it as a number.
**How to avoid:** Consolidation logic must `parseFloat(ingredient.quantity)` before summing. NaN-check after parsing.

### Pitfall 6: i18n String Missing
**What goes wrong:** New UI strings appear as key literals (e.g., "menu.planMenu") instead of translated text.
**Why it happens:** Adding i18n key to `en.json` but forgetting `es.json`.
**How to avoid:** Every new i18n key must be added to BOTH `lib/i18n/en.json` AND `lib/i18n/es.json` in the same commit. The UI-SPEC Copywriting Contract table is the exhaustive list.

### Pitfall 7: Recipe Picker Modal Missing `is_active` Filter
**What goes wrong:** Archived/inactive recipes appear in the recipe picker.
**Why it happens:** The picker fetches all recipes without filtering.
**How to avoid:** Recipe picker query must include `.eq('is_active', true)`.

---

## Code Examples

### Creating a Menu Plan (Server Action)
```typescript
// app/menus/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMenuPlan(formData: FormData) {
  const visitDate = formData.get('visit_date') as string
  const supabase = await createClient()

  // Check for duplicate date
  const { data: existing } = await supabase
    .from('menu_plans')
    .select('id')
    .eq('visit_date', visitDate)
    .single()

  if (existing) {
    // Return error or redirect to existing plan
    redirect(`/menus/${existing.id}`)
  }

  const { data: plan, error } = await supabase
    .from('menu_plans')
    .insert({ visit_date: visitDate, status: 'draft' })
    .select()
    .single()

  if (error || !plan) throw new Error('Failed to create plan')

  revalidatePath('/menus')
  redirect(`/menus/${plan.id}`)
}
```

### Shopping List Generation (Server Action — triggered by confirmMenuPlan)
```typescript
// Part of confirmMenuPlan action
async function generateShoppingList(supabase, planId: string, recipeIds: string[]) {
  // Fetch all recipes with ingredients
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, ingredients')
    .in('id', recipeIds)

  // Fetch fridge staples
  const { data: staples } = await supabase
    .from('fridge_staples')
    .select('*')
    .eq('is_active', true)

  // Consolidate ingredients (see algorithm above)
  const consolidated = consolidateIngredients(recipes)

  // Delete existing shopping list for this plan (re-confirm case)
  const { data: existingList } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('menu_plan_id', planId)
    .single()

  if (existingList) {
    await supabase.from('shopping_lists').delete().eq('id', existingList.id)
  }

  // Create new shopping list
  const { data: list } = await supabase
    .from('shopping_lists')
    .insert({ menu_plan_id: planId, status: 'active' })
    .select()
    .single()

  // Insert consolidated items + fridge staples
  const items = [
    ...consolidated.map(item => ({ ...item, shopping_list_id: list.id, is_always_stock: false })),
    ...staples.map(s => ({
      shopping_list_id: list.id,
      ingredient_name_en: s.item_name_en,
      ingredient_name_es: s.item_name_es,
      quantity: null,
      unit: null,
      category: s.category,
      is_always_stock: true,
      is_checked: false,
    }))
  ]

  await supabase.from('shopping_list_items').insert(items)
}
```

### Proxy Route Protection Update (INFRA-01 actual work)
```typescript
// proxy.ts — add /menus and /lista to role-based protection
// Client trying to access cook routes
if (
  role === 'client' &&
  (pathname.startsWith('/visita') ||
   pathname.startsWith('/recetas') ||
   pathname.startsWith('/lista'))   // ADD THIS
) { ... }

// Cook trying to access client routes
if (
  role === 'cook' &&
  (pathname.startsWith('/dashboard') ||
   pathname.startsWith('/menus'))   // ADD THIS
) { ... }
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export function proxy()` | Next.js 16.0.0 | `middleware.ts` is deprecated; file and function must both use "proxy" naming |
| `revalidatePath` after mutations | Same, still the standard | N/A | No change |
| `useActionState` for pending states | Available in React 19 | React 19 | Can use `useActionState` with `startTransition` for loading spinners in Server Action forms |

**Deprecated/outdated:**
- `middleware.ts` / `export function middleware()`: Deprecated in Next.js 16. Use `proxy.ts` / `export function proxy()`.
- `useFormState` (React 18): Replaced by `useActionState` in React 19 (which this project uses).

---

## Open Questions

1. **Visit record linked to menu plan**
   - What we know: The `visits` table has `menu_plan_id` FK. Dashboard currently reads `visits` table for upcoming visit display.
   - What's unclear: When creating a new menu plan, should a corresponding `visits` record also be created? Or is the menu plan standalone until confirmation?
   - Recommendation: Menu plan is standalone. Visits are created separately (perhaps manually or in a future phase). The dashboard "Plan menu" CTA for an existing upcoming visit should link plan creation to that visit's date. If no visit record exists, the plan is created without a visit link, and the visit table is not touched in this phase.

2. **Route for /lista — needs shopping list ID or uses menu_plan_id?**
   - What we know: The cook's shopping list page is `/lista` (singular); the cook always sees the NEXT confirmed visit's list.
   - What's unclear: How does `/lista` know which shopping list to show? By fetching the most recently confirmed menu plan with a linked shopping list?
   - Recommendation: `/lista` page queries: get the next confirmed menu plan (visit_date >= today, status = 'confirmed'), then get the linked shopping list. No ID in the URL — the cook always sees "the current one."

3. **Ingredient quantity type mismatch**
   - What we know: `Ingredient.quantity` in `lib/types.ts` is `string`. `ShoppingListItem.quantity` in DB is `NUMERIC`.
   - What's unclear: Are all recipe ingredient quantities well-formed numeric strings, or could they be ranges like "1-2" or text like "to taste"?
   - Recommendation: In the consolidation logic, `parseFloat()` each quantity. If NaN (non-numeric text), store `null` for quantity and include the original text as part of the item name or a note field. Safe assumption: seed data shows all quantities are numeric strings ("0.5", "2", "1").

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test config files found |
| Config file | None — Wave 0 must create |
| Quick run command | `npx jest --testPathPattern=src` (after Wave 0 setup) |
| Full suite command | `npx jest` (after Wave 0 setup) |

No `jest.config.*`, `vitest.config.*`, `pytest.ini`, or test directories detected in the project. Test infrastructure does not exist.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | proxy.ts exports `proxy` function (not `middleware`) | unit | Manual verification | N/A — verified by reading file |
| INFRA-02 | RLS policies prevent cross-role writes | integration | Manual Supabase RLS test | ❌ Wave 0 |
| INFRA-03 | Server client throws if env vars missing | unit | `jest tests/lib/supabase.test.ts` | ❌ Wave 0 |
| MENU-01 | createMenuPlan action creates DB row | unit | `jest tests/actions/menu-plan.test.ts` | ❌ Wave 0 |
| MENU-05 | validateMenuPlan returns correct warnings | unit | `jest tests/lib/rules-engine.test.ts` | ❌ Wave 0 |
| SHOP-01 | consolidateIngredients merges same-name items, normalises units | unit | `jest tests/lib/consolidate.test.ts` | ❌ Wave 0 |
| SHOP-03 | Check-off item touch target >= 48px | manual | Visual inspection on mobile device | Manual only |
| SHOP-04 | Running count updates after check-off | manual | Visual inspection | Manual only |

Given there is no existing test infrastructure, the practical validation approach for this phase is:
- **Per-task:** Manual smoke test of the specific feature in browser
- **Per-wave:** Full happy-path walkthrough: create plan → pick recipes → confirm → view shopping list as cook → check off items
- **Phase gate:** Happy-path complete + no console errors before `/gsd:verify-work`

### Sampling Rate
- **Per task commit:** Manual browser smoke test of the changed page
- **Per wave merge:** Full client + cook flow walkthrough in browser
- **Phase gate:** Full end-to-end walkthrough green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test framework installed — if unit tests are desired, add `jest` + `@testing-library/react` setup
- [ ] `tests/lib/consolidate.ts` — covers SHOP-01 ingredient consolidation (pure function, easiest to unit test)
- [ ] `tests/lib/rules-engine.ts` — covers MENU-05 rules validation (pure function)
- [ ] `tests/actions/menu-plan.ts` — covers MENU-01/03 Server Action logic

**Note:** Given the project has zero test infrastructure and the codebase is a focused two-user household app, the planner may reasonably choose to skip formal test setup and rely on manual validation for Phase 2, matching the existing zero-test baseline.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — Next.js 16 proxy convention, deprecation of middleware.ts
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md` — Server Actions, revalidatePath, redirect patterns
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — Route Handler pattern for AI API calls
- `supabase/migrations/001_schema.sql` — Full DB schema, RLS policies
- `lib/types.ts` — TypeScript interfaces confirmed
- `supabase/migrations/002_seed.sql` — Ingredient JSON shape confirmed: `{name_en, name_es, quantity, unit}`
- `app/(client)/dashboard/page.tsx` — Server Component fetch pattern
- `app/(client)/recipes/page.tsx` — Client Component search/filter pattern (recipe picker model)
- `app/(cook)/visita/page.tsx` — Cook page pattern, statusColors, Spanish text
- `components/sidebar.tsx` — Navigation items and active state
- `lib/i18n/en.json`, `lib/i18n/es.json` — i18n dictionary shape

### Secondary (MEDIUM confidence)
- `proxy.ts` + Next.js 16 docs cross-reference: confirmed `proxy.ts` is correct filename and the INFRA-01 requirement description is inverted
- shadcn component inventory from `components/ui/` directory listing — confirmed dialog/checkbox/separator not yet installed

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed from package.json and node_modules
- Architecture: HIGH — patterns confirmed from existing codebase files
- INFRA-01 correction: HIGH — verified against official Next.js 16 docs in node_modules
- Pitfalls: HIGH — derived from actual code inspection
- AI suggest/rules engine design: MEDIUM — Claude's discretion decisions based on requirements; implementation details may need adjustment

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable stack; Next.js 16 recently released so keep eye on patch releases)
