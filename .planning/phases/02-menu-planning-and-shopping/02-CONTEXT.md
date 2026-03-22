# Phase 2: Menu Planning and Shopping - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

The client can plan and confirm a visit menu, and the cook arrives knowing what to cook and what to buy. This phase delivers: menu plan creation (pick date + 2–4 recipes), AI-suggested menu, rules engine validation, auto-generated consolidated shopping list on confirmation, and the cook's mobile shopping list with check-off. No messaging, no payment tracking, no offline support — those are later phases.

</domain>

<decisions>
## Implementation Decisions

### Navigation
- **D-01:** Menu planning is dashboard-first. The next upcoming visit + "Plan menu" CTA lives on the dashboard. Planning opens as a separate page (not a drawer). No dedicated "Menus" sidebar section — keep the sidebar lean.

### Recipe picking
- **D-02:** Client picks recipes via a browse-and-select modal. A recipe browser modal opens (with search/filter), client selects up to 4 recipes, then closes to confirm selection. Not drag-and-drop. Not an inline search panel.

### Date selection
- **D-03:** Plain date input — simple date picker / input field. Client types or picks any date. No visit-day pattern suggestions. Consistent with PROJECT.md decision: "No calendar widget for visit scheduling."

### Multiple plans
- **D-04:** Multiple plans allowed — one plan per visit date. Client can create plans for several upcoming visits simultaneously. Each visit date can have at most one plan (attempting to create a second plan for an existing date should warn/block).

### Claude's Discretion
- AI suggest menu behavior (full replace vs fill slots, preview rationale, re-try) — Claude decides
- Rules engine warnings presentation (inline vs summary panel, hard block vs soft warning, real-time vs on-confirm) — Claude decides
- Cook's shopping list UX details (check-off animation, section ordering, ad-hoc item entry, running count format) — follow REQUIREMENTS: 48px touch targets, running count, visual de-emphasis of checked items
- Ingredient consolidation logic (unit normalisation strategy, same-ingredient detection) — Claude decides
- Empty state design for new plans, loading states — Claude decides

</decisions>

<specifics>
## Specific Ideas

- Dashboard should show the next upcoming confirmed visit prominently — that's the cook's north star too
- The recipe picker modal should reuse the existing recipe library UI patterns (search, category filter) from `app/(client)/recipes/`
- Ingredient schema is confirmed as `{name_en, name_es, quantity, unit}` structured tuples (verified in seed data) — safe to consolidate programmatically

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & types
- `supabase/migrations/001_schema.sql` — Full table definitions for `menu_plans`, `menu_plan_items`, `shopping_lists`, `shopping_list_items`, `fridge_staples`, `visits`, `cooking_rules`; existing RLS policies
- `lib/types.ts` — TypeScript interfaces: `MenuPlan`, `MenuPlanItem`, `ShoppingList`, `ShoppingListItem`, `FridgeStaple`, `CookingRule`, `Ingredient`, `Recipe`

### Seed data
- `supabase/migrations/002_seed.sql` — Ingredient JSON shape confirmed: `{name_en, name_es, quantity, unit}` — this is the canonical format for consolidation logic

### Requirements
- `.planning/REQUIREMENTS.md` — INFRA-01–03, MENU-01–06, SHOP-01–07 (full requirement text)

### Existing UI patterns (reuse these)
- `app/(client)/recipes/` — Recipe library: search, category filter, card layout — modal picker should mirror this
- `app/(client)/layout.tsx` — Sidebar navigation (add menu entry if needed)
- `app/(cook)/layout.tsx` — Cook mobile layout with bottom tab nav
- `lib/supabase/server.ts` — Server Component Supabase client pattern
- `lib/supabase/client.ts` — Client Component Supabase client pattern
- `lib/i18n/en.json`, `lib/i18n/es.json` — i18n dictionaries (all new strings must be added to both)

### State & decisions
- `.planning/STATE.md` — INFRA-01–03 tech debt items that must ship first; architecture decision: all Claude API calls server-side via `app/api/ai/*` route handlers

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Recipe search/filter UI in `app/(client)/recipes/` — can be adapted into the recipe picker modal for menu building
- `lib/types.ts` Ingredient interface already has optional `category` field — useful for shopping list grouping
- `ShoppingListItem` type has `source_recipe_ids` array — multi-recipe ingredient tracking is already modelled
- `ShoppingListItem.is_always_stock` boolean — maps to fridge staples distinction

### Established Patterns
- Server Components fetch from Supabase directly (no API routes for reads); mutations go through Server Actions or API routes
- All new tables need RLS (already in place for Phase 2 tables, but INFRA-02 requires scope tightening: cook writes own check-offs only, client writes own menu plans only)
- Every new UI string needs entries in both `lib/i18n/en.json` and `lib/i18n/es.json`

### Integration Points
- `app/(client)/dashboard/page.tsx` — Add upcoming visit card + "Plan menu" CTA here
- `app/(cook)/visita/page.tsx` — Cook's next visit view; needs confirmed menu recipes (in Spanish) + shopping list link
- INFRA-01: `proxy.ts` must be renamed to `middleware.ts` before any auth-gated routes work correctly in production
- INFRA-03: Remove Supabase URL placeholder fallback in `lib/supabase/server.ts` before shipping

</code_context>

<deferred>
## Deferred Ideas

- None came up — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-menu-planning-and-shopping*
*Context gathered: 2026-03-22*
