# MiChef

## What This Is

A bilingual (English/Spanish) web app for managing a household cook who visits twice a week. The household client plans menus and tracks finances in English; the cook receives her recipes, shopping lists, and messages in Spanish. Claude API powers recipe generation, feedback-based recipe adjustment, receipt parsing, and real-time translation.

## Core Value

The cook arrives prepared — with a confirmed menu in Spanish, a ready-to-check shopping list, and no language barrier between her and the household.

## Requirements

### Validated

- ✓ Next.js 16 App Router project with Supabase auth (email/password) — existing
- ✓ Role-based route groups: `(client)` and `(cook)` with separate layouts and guards — existing
- ✓ Bilingual data model: all content entities store parallel `_en` / `_es` fields — existing
- ✓ Custom i18n context (`useI18n`) with English and Spanish JSON dictionaries — existing
- ✓ Full database schema: recipes, menu_plans, shopping_lists, visits, messages, cooking_rules, fridge_staples — existing
- ✓ Recipe library with CRUD, category/search/filter, archive/restore — existing
- ✓ Cooking rules management (frequency, exclusion, substitution) — existing
- ✓ Client desktop layout with sidebar navigation — existing
- ✓ Cook mobile layout with bottom tab navigation — existing
- ✓ Seed data: 32 pre-loaded recipes + 10 cooking rules + fridge staples — existing

### Active

**Phase 2 — Menu Planning & Shopping**
- [ ] Client creates a menu plan for an upcoming visit (pick date, assign 2–4 recipes)
- [ ] "Suggest Menu" AI button — recommends recipes based on rules, recency, and feedback
- [ ] Rules engine validation — warns/blocks on frequency, exclusion, and substitution violations
- [ ] Auto-generate consolidated shopping list on menu confirmation (ingredients merged + grouped by category)
- [ ] Cook's mobile shopping list — large checkboxes, category grouping, running count, check-off
- [ ] Fridge staples section appended to every shopping list

**Phase 3 — AI Features**
- [ ] Recipe generation — Claude generates new recipes from household preferences + active rules
- [ ] Recipe adjustment — client feedback triggers Claude to produce an adjusted recipe with diff view
- [ ] Receipt OCR — cook uploads receipt photo, Claude extracts line items and totals
- [ ] Recipe import from URL — Claude parses a recipe page into a structured recipe

**Phase 4 — Communication & Finance**
- [ ] Bilingual messaging — client writes English, cook sees Spanish (and vice versa), Claude translates
- [ ] Quick actions: "buy X", "skip recipe", "reschedule visit"
- [ ] System notifications: menu confirmed, list ready, receipt uploaded
- [ ] Receipt upload by cook → stored in Supabase Storage
- [ ] Payment tracking: grocery total + service fee per visit, monthly summary, pending/paid status

**Phase 5 — Polish**
- [ ] Offline support — service worker so cook's shopping list works without internet
- [ ] Export/print shopping list
- [ ] Recipe export as PDF or shareable link
- [ ] Analytics: most cooked recipes, spending trends, preference patterns

### Out of Scope

- Push notifications — deferred to post-v1; PWA offline is sufficient for now
- Mobile native app — web-first; cook uses mobile browser
- OAuth/social login — email/password is sufficient for two known users
- PIN-based auth — email/password works fine; no need for simpler alternative
- Multi-household support — single household only

## Context

**Users:** Two people. Neil and Andrea (clients, English) + their cook (Spanish). Playa del Carmen, Mexico. Cook visits ~2x/week.

**Dietary rules baked into AI prompts:**
- No added sugar, no vegetable oils (EVOO only), no pork, no mole
- Andrea: chicken breast only, seafood = salmon/shrimp only, no lettuce salads, caldo de pollo only
- Neil: prefers breast but okay with thighs, open to most seafood, beef medium/medium-rare
- Both open to spicy food

**Financial:** Prices in MXN ($), weights in metric (g/kg)

**Codebase state (Phase 1 complete):**
- Next.js 16.2.1 + React 19 + TypeScript 5.9 + Tailwind v4 + shadcn (base-nova style)
- Supabase SSR client pattern: `lib/supabase/server.ts` for Server Components, `lib/supabase/client.ts` for Client Components
- All domain types in `lib/types.ts`
- No test framework configured
- No API routes beyond auth callback — all data fetched directly from Supabase in pages

## Constraints

- **Tech Stack**: Next.js + Supabase + Claude API (Sonnet) — established in Phase 1, do not change
- **Claude API**: All calls server-side via Next.js API routes — never expose key to browser
- **Bilingual**: Every new content entity needs `_en` / `_es` fields; every new UI string needs entries in both `lib/i18n/en.json` and `lib/i18n/es.json`
- **Cook UI**: Mobile-first, min 48px touch targets, simple bottom-nav — she uses her phone in a grocery store
- **RLS**: All new Supabase tables need Row Level Security policies scoped to role
- **Next.js**: This version has breaking changes — read `node_modules/next/dist/docs/` before writing any code (per AGENTS.md)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No calendar widget for visit scheduling | Cook just needs to see next visit details; client picks a date when creating a menu plan | — Pending |
| Claude Sonnet for all AI features | Speed/cost balance for recipe gen, translation, OCR | — Pending |
| No global client-side state store | Server Components + local useState is sufficient; avoids Redux/Zustand complexity | ✓ Good |
| Dual Supabase client pattern | Prevents accidental server client use in browser | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-22 after initialization*
