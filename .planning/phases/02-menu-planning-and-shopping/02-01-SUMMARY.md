---
phase: 02-menu-planning-and-shopping
plan: 01
subsystem: infrastructure
tags: [proxy, rls, supabase, shadcn, i18n, navigation]
dependency_graph:
  requires: []
  provides: [proxy-route-protection, rls-role-scoped, env-hardened, shadcn-components, i18n-phase2]
  affects: [02-02, 02-03, 02-04]
tech_stack:
  added: [shadcn/dialog, shadcn/checkbox, shadcn/separator]
  patterns: [non-null-assertion for env vars, role-scoped RLS subquery pattern]
key_files:
  created:
    - supabase/migrations/003_rls_tighten.sql
    - components/ui/dialog.tsx
    - components/ui/checkbox.tsx
    - components/ui/separator.tsx
  modified:
    - proxy.ts
    - lib/supabase/server.ts
    - components/sidebar.tsx
    - components/bottom-nav.tsx
    - lib/i18n/en.json
    - lib/i18n/es.json
decisions:
  - "Sidebar menuPlanning href changed to /menus with active: false per D-01 — dashboard CTA is primary entry point"
  - "env fallback removed from server.ts; non-null assertion matches existing pattern in client.ts"
  - "shopping_list_items INSERT open to both roles; UPDATE cook-only as per plan SHOP-07"
metrics:
  duration_minutes: 3
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 6
  completed_date: "2026-03-23"
---

# Phase 2 Plan 01: Infrastructure Hardening and Phase 2 Foundation Summary

**One-liner:** Proxy route protection extended to /menus and /lista, RLS tightened by role with visit_date uniqueness, env fallback removed, shadcn dialog/checkbox/separator installed, navigation hrefs updated, and all Phase 2 UI strings added to both i18n dictionaries.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Fix infrastructure — proxy routes, RLS migration, env fallback | c23918d | proxy.ts, lib/supabase/server.ts, 003_rls_tighten.sql |
| 2 | Install shadcn components and update navigation | 2b412ec | components/ui/{dialog,checkbox,separator}.tsx, sidebar.tsx, bottom-nav.tsx |
| 3 | Add all Phase 2 i18n strings to both dictionaries | eabc5bc | lib/i18n/en.json, lib/i18n/es.json |

## What Was Built

**INFRA-01 — Proxy route protection:**
- Added `/menus` to the cook redirect block (cooks are redirected to /visita)
- Added `/recipes` to the cook redirect block (cook should not access English recipe management UI)
- Added `/lista` to the client redirect block (clients are redirected to /dashboard)

**INFRA-02 — RLS policy tightening (003_rls_tighten.sql):**
- Dropped overly broad "Authenticated users can manage" policies on menu_plans, menu_plan_items, shopping_list_items, shopping_lists
- menu_plans and menu_plan_items writes restricted to client role
- shopping_list_items INSERT open to both roles (client on menu confirm, cook for ad-hoc items)
- shopping_list_items UPDATE restricted to cook only (cook checks off items)
- shopping_lists writes restricted to client role
- Added UNIQUE constraint on menu_plans.visit_date (one plan per date, per D-04)

**INFRA-03 — Env fallback removal:**
- Replaced `?? 'https://placeholder.supabase.co'` and `?? 'placeholder-key'` with non-null assertions (`!`) in lib/supabase/server.ts

**shadcn components installed:**
- components/ui/dialog.tsx
- components/ui/checkbox.tsx
- components/ui/separator.tsx

**Navigation updates:**
- sidebar.tsx: menuPlanning href updated from /menu-planning to /menus, kept active: false per D-01
- bottom-nav.tsx: "Compras" item changed to "Lista" pointing to /lista

**i18n additions (en.json and es.json):**
- `menu.*` section: 22 keys covering plan, confirm, suggest, delete, rules warnings, empty states, recipe selection
- `shopping.*` section: 8 keys covering running count, empty states, add item, fridge staples
- `cook.*` section: 3 keys covering shopping list link and no-visit state

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All changes are infrastructure — no UI rendering involved.

## Self-Check: PASSED

Files verified:
- proxy.ts: contains `pathname.startsWith('/menus')` and `pathname.startsWith('/lista')` — FOUND
- lib/supabase/server.ts: contains `NEXT_PUBLIC_SUPABASE_URL!`, no placeholder — FOUND
- supabase/migrations/003_rls_tighten.sql: contains `role = 'cook'` and `menu_plans_visit_date_unique` — FOUND
- components/ui/dialog.tsx — FOUND
- components/ui/checkbox.tsx — FOUND
- components/ui/separator.tsx — FOUND
- lib/i18n/en.json: valid JSON, contains menu.planMenu, shopping.runningCount — FOUND
- lib/i18n/es.json: valid JSON, contains menu.planMenu, shopping.runningCount — FOUND

Commits verified:
- c23918d — FOUND
- 2b412ec — FOUND
- eabc5bc — FOUND

TypeScript: `npx tsc --noEmit` exits 0 — PASS
