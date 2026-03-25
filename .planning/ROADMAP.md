# Roadmap: MiChef

## Overview

Phase 1 established the foundation: Next.js 16 + Supabase auth, role-based routing, the bilingual data model, and a complete recipe library with 32 pre-loaded recipes. Phases 2–5 build the live workflow on top of that foundation. Phase 2 delivers the core cycle — menu planning, AI suggestions, rules validation, and the cook's mobile shopping list. Phase 3 adds the full Claude API layer: recipe generation, AI adjustment with diff view, receipt OCR, and URL import. Phase 4 activates real-time bilingual messaging and per-visit payment tracking. Phase 5 closes the loop with offline shopping list support, export, and spending analytics.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Auth, role routing, bilingual data model, recipe library (complete)
- [x] **Phase 2: Menu Planning and Shopping** - Core workflow: menu creation, AI suggestions, rules validation, shopping list, cook's mobile check-off view (completed 2026-03-23)
- [x] **Phase 3: AI Features** - Claude API layer: recipe generation, feedback-driven adjustment with diff view, receipt OCR, recipe import from URL (completed 2026-03-24)
- [ ] **Phase 3.1: UX Enhancements** [INSERTED] - Inventory management, shopping list editing, recipe-to-menu shortcut, menu page fixes (dark mode, date editing, recipe limit)
- [ ] **Phase 4: Communication and Finance** - Real-time bilingual messaging, per-visit payment records, monthly spending summary
- [ ] **Phase 5: Polish** - Offline shopping list, export, spending analytics

## Phase Details

### Phase 1: Foundation
**Goal**: Functioning app skeleton that both users can log into with correct role-scoped access, full recipe library, and bilingual UI infrastructure
**Depends on**: Nothing
**Requirements**: All Phase 1 requirements (complete)
**Success Criteria** (what must be TRUE):
  1. Client and cook can log in with email/password and see separate, role-appropriate layouts
  2. Client can browse, search, filter, create, edit, archive, and restore recipes in the library
  3. Every UI string appears in English for the client and Spanish for the cook
  4. Seed data (32 recipes, 10 cooking rules, fridge staples) is present and correct
**Plans**: Complete

### Phase 2: Menu Planning and Shopping
**Goal**: The client can plan and confirm a visit menu, and the cook arrives knowing what to cook and what to buy
**Depends on**: Phase 1
**Requirements**: INFRA-01, INFRA-02, INFRA-03, MENU-01, MENU-02, MENU-03, MENU-04, MENU-05, MENU-06, SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07
**Success Criteria** (what must be TRUE):
  1. Client can create a menu plan by picking a date and assigning 2–4 recipes, then edit and confirm it
  2. "Suggest Menu" AI button returns recipe recommendations that respect cooking rules, recency, and feedback
  3. Rules engine surfaces warnings for frequency, exclusion, and substitution violations before the client confirms
  4. Confirming a menu auto-generates a shopping list with ingredients merged, units normalised, and grouped by category, plus fridge staples appended
  5. Cook sees the next confirmed visit with recipes in Spanish and can check off shopping list items with large touch targets, running count, and visual de-emphasis of checked items
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Infrastructure fixes (proxy routes, RLS tightening, env fallback) + navigation + i18n
- [x] 02-02-PLAN.md — Menu planning Server Actions, business logic, pages, recipe picker, AI suggest route
- [x] 02-03-PLAN.md — Cook shopping list page + visita page update
- [x] 02-04-PLAN.md — Full flow human verification checkpoint

### Phase 3: AI Features
**Goal**: The client can generate new recipes, adjust existing ones with AI-produced diffs, import recipes from URLs, and the cook can upload receipts for automated extraction
**Depends on**: Phase 2
**Requirements**: AIREC-01, AIREC-02, AIREC-03, AIREC-04, AIOCR-01, AIOCR-02, AIOCR-03, AIURL-01
**Success Criteria** (what must be TRUE):
  1. Client can generate a new recipe idea via Claude using household dietary rules and recent history as context
  2. Client can leave structured feedback (rating + text) on a cooked recipe and receive an AI-adjusted version showing a highlighted diff of what changed; client can save the new version or discard
  3. Client can paste a URL and have Claude parse it into a pre-filled recipe form
  4. Cook can upload a receipt photo (resized client-side to ≤5 MB); client can review extracted line items and totals from Claude Vision and save or correct them
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md — Foundation: vitest, parent_recipe_id migration, CSS diff vars, test stubs
- [x] 03-02-PLAN.md — Recipe generation: Claude Sonnet generate-recipe route + GenerateRecipeModal
- [x] 03-03-PLAN.md — Receipt OCR: Claude Haiku extract-receipt route + upload/review components
- [x] 03-04-PLAN.md — URL import: import-url route + collapsible UrlImportSection on /recipes/new
- [x] 03-05-PLAN.md — Recipe adjustment + variants: adjust-recipe route, FeedbackForm, RecipeDiffView, Duplicate, variant grouping

### Phase 3.1: UX Enhancements [INSERTED]
**Goal**: Polish the core client workflow — inventory is fully manageable with categories and shopping list integration, shopping lists support full CRUD, clients can add recipes to a menu directly from the recipe detail page, and the menu editor works correctly for up to 10 recipes with dark mode fixed
**Depends on**: Phase 3
**Requirements**: UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. Client can add, edit, and remove inventory items categorized under Fridge / Pantry / Spices, view them in tabs with a "Show All" option, star-mark staples, filter by staples, and add any item directly to the shopping list
  2. Client can add, edit, and remove shopping list items manually
  3. Client can add a recipe to a menu from the recipe detail page without navigating away
  4. Menu editor accepts up to 10 recipes, date field is always visible and editable, all elements render correctly in dark mode
**Plans**: 2 plans

Plans:
- [ ] 03.1-01-PLAN.md — Inventory enhancements: is_staple migration, category tabs, staple toggle/filter, add-to-shopping-list
- [ ] 03.1-02-PLAN.md — Recipe-to-menu shortcut, menu editor fixes (limit 10, dark mode, date edit), shopping list verification

### Phase 4: Communication and Finance
**Goal**: Client and cook can communicate across the language barrier in real time, and the client has full visibility into visit costs and payment status
**Depends on**: Phase 3
**Requirements**: MSG-01, MSG-02, MSG-03, MSG-04, MSG-05, FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, FIN-06
**Success Criteria** (what must be TRUE):
  1. Client can send a message in English and cook sees it in Mexican Spanish without page refresh; cook can reply in Spanish and client sees it in English
  2. Client can send quick-action messages ("buy X", "skip recipe", "reschedule visit") from a single tap
  3. Cook receives an automatic notification when a menu is confirmed and when a shopping list is ready
  4. Client can record grocery total and service fee per visit, mark payment as paid, and see a monthly spending summary; grocery total is pre-populated from the receipt OCR result
**Plans**: TBD

### Phase 5: Polish
**Goal**: The cook's shopping list works without internet, and the client can export content and review spending trends
**Depends on**: Phase 4
**Requirements**: OFFL-01, OFFL-02, EXP-01, EXP-02, ANLX-01, ANLX-02
**Success Criteria** (what must be TRUE):
  1. Cook can use the shopping list and check off items in a grocery store with no internet connection; check-off state syncs automatically when connectivity is restored
  2. Client can export or print the shopping list and export a recipe as PDF or shareable link
  3. Client can see which recipes have been cooked most often and view monthly spending trends over time
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 2 → 3 → 3.1 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | - | Complete | 2026-03-22 |
| 2. Menu Planning and Shopping | 4/4 | Complete   | 2026-03-23 |
| 3. AI Features | 5/5 | Complete    | 2026-03-24 |
| 3.1. UX Enhancements | 0/2 | Not started | - |
| 4. Communication and Finance | 0/TBD | Not started | - |
| 5. Polish | 0/TBD | Not started | - |
