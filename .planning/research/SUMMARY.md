# Project Research Summary

**Project:** MiChef
**Domain:** Bilingual household cook management (menu planning, shopping, AI assistance, finance)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

MiChef is a narrow-purpose, two-user app that solves a concrete problem: a household client plans meals in English, their Spanish-speaking cook executes them. Phase 1 is complete and has established a Next.js 16 App Router + Supabase foundation. Phases 2–5 layer on menu planning, AI assistance via the Anthropic SDK, bilingual messaging, receipt OCR, payment tracking, and offline shopping list support. The recommended approach is deliberately incremental: Phase 2 adds no new libraries — just pure TypeScript logic for a rules engine and ingredient consolidation. Phase 3 introduces the Anthropic SDK and the API route layer. Phase 4 activates Supabase Realtime for messaging. Phase 5 adds the service worker for offline support. This dependency ordering is not arbitrary — each phase is architecturally safe to build only after the previous one establishes its prerequisites.

The most important cross-cutting recommendation is to treat several Phase 1 tech debt items as Phase 2 prerequisites rather than future work. Three issues identified in CONCERNS.md must be fixed before any new write surfaces ship: (1) blanket RLS policies must be replaced with role-scoped policies, (2) `proxy.ts` must be renamed to `middleware.ts` so API routes have edge-level auth protection, and (3) the Supabase URL fallback placeholder must be replaced with a startup error. Shipping Phase 2 without these fixes creates security exposure that grows with every new feature.

The primary ongoing risk is AI cost and quality: the translation pipeline fires a Claude API call on every message sent, and each call carries a large system prompt. Without prompt caching and model tiering (Haiku for translation, Sonnet for recipe work), costs will escalate non-linearly as usage grows. The secondary risk is correctness — bilingual field drift, ingredient consolidation errors, and inconsistent OCR JSON output are all failure modes that erode user trust. Both risks have concrete, well-documented mitigations described in the research.

---

## Key Findings

### Recommended Stack

The Phase 1 foundation (Next.js 16.2.1, React 19, TypeScript, Supabase SSR, Tailwind v4, shadcn) requires no changes. Phase 2 adds nothing to `package.json` — it is pure TypeScript over the existing stack. Phase 3 adds only `@anthropic-ai/sdk ^0.80.0`, which covers AI recipe generation, adjustment, translation, and receipt OCR in a single package. The Vercel AI SDK is explicitly rejected: MiChef's AI use cases are structured JSON generation, not chat UI, so the Vercel SDK adds ~120 kB of unused hooks. Phase 4 uses Supabase Realtime, which is already installed. Phase 5 adds `@serwist/next ^9.5.4` and `serwist ^9.5.4` for PWA/service worker support — Serwist is the correct choice as the only Next.js PWA library with Turbopack support (the predecessor `next-pwa` is unmaintained and `react-beautiful-dnd` is archived).

**Core new technologies:**
- `@dnd-kit/core` + sortable + utilities — drag-and-drop for menu planning; only actively maintained React 19 DnD library post-deprecation of alternatives
- `@anthropic-ai/sdk ^0.80.0` — all Claude API calls (recipes, translation, OCR); used directly, not via Vercel AI SDK wrapper
- `@serwist/next ^9.5.4` — PWA service worker plugin; the only option with Turbopack compatibility for Next.js 16
- Supabase Realtime (existing) — messaging subscriptions via `postgres_changes`; no additional library needed

**Critical version note:** Production builds with Serwist require the `--webpack` flag (`"build": "next build --webpack"`), even though Turbopack works in dev. This is a known constraint of Serwist 9.

### Expected Features

The research confirms a clear feature hierarchy. The core value proposition is: "the cook arrives prepared — with a confirmed menu in Spanish, a ready-to-check shopping list, and no language barrier." Every feature decision should be tested against whether it serves this core goal.

**Must have (table stakes):**
- Menu plan creation: date picker + recipe assignment (no drag calendar — explicitly rejected)
- Rules engine validation at confirm time (frequency, exclusion, substitution rules)
- "Suggest Menu" AI button with brief rationale per suggestion
- Auto-generated consolidated shopping list on menu confirmation, with category grouping
- Large tap-target check-off view for cook's mobile use in-store
- Fridge staples appended as separate section on every shopping list
- Bidirectional translation: client writes English, cook sees Spanish and vice versa
- Visit-scoped message threads
- Receipt photo upload with Claude Vision extraction and review screen
- Per-visit grocery total + service fee tracking with paid/pending status
- Monthly spending summary
- Client submits freeform recipe feedback → Claude produces adjusted recipe with diff view

**Should have (differentiators):**
- AI suggestion reasoning transparency ("not cooked in 3 weeks, fits preferences")
- Ingredient consolidation with unit normalization via Claude (pure string matching is insufficient for real recipe data)
- Quick-action messages for common cook communications ("skip recipe", "buy X")
- Accept/reject flow for AI-adjusted recipes before replacing the original
- Pre-fill visit grocery total from receipt extraction
- Show both original and translated message text

**Defer to post-v1:**
- Offline background sync (optimistic local state is sufficient; full sync queuing adds significant complexity)
- Monthly spending trend charts (simple summary table is enough for Phase 4; recharts is the correct addition when needed in Phase 5)
- Nutritional tracking, multi-week planning, barcode scanning, invoice PDF export — all identified as out-of-scope anti-features

### Architecture Approach

The architecture is cleanly partitioned across the phase boundary. Phases 2 adds pure library functions (`lib/rules-engine.ts`, `lib/shopping-merge.ts`) with no new I/O. Phase 3 introduces the API route layer (`app/api/ai/*`) as the server-side boundary that keeps `CLAUDE_API_KEY` out of the browser — all Claude calls must go through these handlers. Phase 4 adds Client Component Realtime subscriptions for messaging (the initial list is SSR, updates arrive via WebSocket). Phase 5 adds the service worker scoped exclusively to the `/lista` cook route.

**Major components:**
1. `lib/rules-engine.ts` — pure TypeScript function; receives pre-fetched data, validates menu plans against frequency and exclusion rules; server-side only
2. `app/api/ai/*` route handlers — authenticated POST endpoints; verify session independently; call Claude via `lib/claude.ts`; return structured JSON or `ReadableStream`
3. `MessagesPanel` Client Components — subscribe to `messages` table via `supabase.channel()` using Supabase Realtime `postgres_changes`; initial render is SSR
4. `lib/shopping-merge.ts` — pure function; consolidates ingredients across 2–4 recipes; called from the Server Action that confirms a menu plan
5. Service worker (`public/sw.js` via Serwist) — cache-first for `/lista` route only; network-first everywhere else

**Key patterns to follow:**
- Every API route must independently call `supabase.auth.getUser()` and return 401 if unauthenticated — never rely solely on middleware
- Never call API routes from Server Components (Next.js 16 explicitly prohibits this)
- Never use Supabase Realtime from Server Components — subscriptions are browser-side only
- Store receipt images in Supabase Storage; never in `bytea` DB columns
- `lib/claude.ts` must be `server-only`; `CLAUDE_API_KEY` must never have `NEXT_PUBLIC_` prefix

### Critical Pitfalls

1. **Blanket RLS policies give cook write access to client-owned data** — must be fixed before Phase 2 ships any write surfaces. Add `is_client()` helper function; scope write policies per role. This is already flagged in CONCERNS.md and is the highest-priority prerequisite.

2. **Supabase Realtime silently delivers nothing when `supabase_realtime` role lacks SELECT grant** — the WebSocket connects successfully and no error is thrown; subscription callbacks simply never fire. Prevention: `GRANT SELECT ON messages TO supabase_realtime` must be in migrations, not ad-hoc SQL.

3. **Streaming Claude responses crash with unhandled abort when user navigates away** — `ResponseAborted` errors fill logs and waste tokens on Claude calls that are never read. Prevention: wrap all `controller.enqueue()` calls with `request.signal.aborted` checks; pass `request.signal` to the Anthropic SDK call.

4. **Phone camera JPEG receipts exceed the 5 MB Claude API hard limit** — default mobile camera photos are 4–12 MB; the upload to Supabase Storage succeeds but the Claude vision call returns a 400 error. Prevention: client-side resize to <1.15 megapixels and JPEG 85% quality before upload.

5. **Claude translation drifts to neutral/Castilian Spanish instead of Mexican Spanish** — without explicit regional instruction, Claude uses prestige register that feels foreign to a Playa del Carmen native. Prevention: every system prompt must specify Mexican Spanish with regional vocabulary glossary (jitomate, papa, jugo, cacahuate, tú forms).

6. **AI costs scale unexpectedly from repeated large system prompts** — prompt caching must be enabled on system prompt blocks from the start. Use Claude Haiku for translation-only tasks; reserve Sonnet for recipe generation and adjustment.

---

## Implications for Roadmap

Based on combined research, the phase structure is already partially defined by the existing PROJECT.md. Research confirms and refines that structure with concrete ordering rationale.

### Phase 2: Menu Planning and Shopping

**Rationale:** Phase 1 established auth and the recipe library. Phase 2 is the core workflow — it creates the data (menu plans, shopping lists) that all subsequent phases depend on. Critically, it requires no new libraries, making it the safest phase to build next. Before any feature code ships, three CONCERNS.md issues must be resolved as prerequisites.
**Delivers:** Menu plan creation with AI suggestions, rules validation, consolidated shopping list, cook's mobile check-off view, fridge staples management
**Addresses:** Menu planning table stakes, shopping list table stakes, fridge staples management
**Avoids:** Blanket RLS pitfall (fix before first write surface), environment variable fallback pitfall, middleware rename pitfall, ingredient consolidation merge errors (structured ingredient schema from day one)
**Research flag:** Standard patterns — no additional research needed. Rules engine and shopping merge are well-understood pure-function patterns.

### Phase 3: AI Features

**Rationale:** Phase 2 produces the data Claude needs as context (recipes, rules, visits, feedback). Phase 3 cannot precede Phase 2 because the AI route handlers would have nothing meaningful to query. This phase establishes `lib/claude.ts` and all `app/api/ai/*` route handlers that Phase 4's translation pipeline will reuse.
**Delivers:** AI recipe generation, AI recipe adjustment with diff view, recipe import from URL, receipt photo upload with Claude Vision OCR, review-and-confirm UI for extracted receipt data
**Uses:** `@anthropic-ai/sdk`, Supabase Storage `receipts` bucket
**Implements:** API route layer with streaming support, Claude client factory, receipt processing flow
**Avoids:** Streaming abort pitfall, receipt image size pitfall, OCR JSON inconsistency pitfall (Zod validation), bilingual field drift (atomic save of both languages), token cost pitfall (prompt caching from day one)
**Research flag:** Needs phase research for streaming patterns and Zod schema design for OCR output.

### Phase 4: Communication and Finance

**Rationale:** Messaging requires Phase 3's translation API route. The finance dashboard is independent of Phase 3 but logically groups with receipt-to-payment workflow. Phase 4 activates Supabase Realtime for the first time — the RLS grant requirement must be addressed in migration before this ships.
**Delivers:** Bilingual per-visit messaging with real-time delivery, per-visit payment records (grocery total + service fee + paid/pending), monthly spending summary, quick-action message templates
**Uses:** Supabase Realtime (`postgres_changes`), existing `messages` and `visits` table schema
**Implements:** MessagesPanel Client Components with WebSocket subscriptions, finance Server Component with aggregation queries
**Avoids:** Realtime RLS silent failure (add `GRANT SELECT ON messages TO supabase_realtime` in migration), duplicate subscription from unmounted components (cleanup in `useEffect` return), Mexican Spanish drift pitfall, translation cost pitfall (Haiku for translation, prompt caching)
**Research flag:** Needs phase research specifically for Supabase Realtime authorization migration patterns.

### Phase 5: Offline Support and Polish

**Rationale:** The service worker can only be scoped to a stable shopping list route, which is established in Phase 2. Adding PWA earlier risks caching an unstable UI. Phase 5 also addresses the known iOS limitations identified in research.
**Delivers:** Offline-capable shopping list for cook's in-store use, installable PWA with Web App Manifest, update notification toast for service worker refresh
**Uses:** `@serwist/next ^9.5.4`, `serwist ^9.5.4`; production build uses `--webpack` flag
**Implements:** Service worker with cache-first for `/lista`, network-first elsewhere; `app/manifest.ts` with `start_url: '/lista'`; optimistic local state for offline check-off (no Background Sync)
**Avoids:** Stale app shell pitfall (implement `skipWaiting` + update toast), iOS Background Sync unavailability (use `window.addEventListener('online')` for foreground sync fallback)
**Research flag:** Standard patterns — Serwist docs and Next.js 16 PWA guide are comprehensive.

### Phase Ordering Rationale

- Phase 2 before Phase 3: Claude needs menu plans and shopping lists as context; no AI feature makes sense without the core data model
- Phase 3 before Phase 4 messaging: The translate-then-insert messaging pattern directly reuses the Phase 3 API route layer
- Phase 2 before Phase 5: Service worker must be scoped to a stable route; adding it before the shopping list UI is stable creates cache invalidation complexity
- Finance (Phase 4) is architecturally independent of messaging but logically grouped because both involve the cook completing a visit cycle (cook arrives, shops, submits receipt, gets paid)
- Prerequisites that span phases: RLS fixes and middleware rename must happen at the very start of Phase 2, not at the phase where they first become critical

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Streaming recipe generation and abort handling have open Next.js GitHub issues (#61972, #56529) with no canonical fix — needs implementation research before writing streaming code. Zod schema design for OCR output should be designed upfront.
- **Phase 4:** Supabase Realtime `postgres_changes` authorization with RLS requires a specific migration pattern (`GRANT SELECT TO supabase_realtime`) that is easy to miss and silent on failure — needs explicit verification step in planning.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Rules engine and ingredient merge are pure TypeScript — well-understood patterns with no external dependencies or gotchas beyond the ingredient schema design decision.
- **Phase 5:** Serwist + Next.js 16 PWA has official documentation, a verified version, and the Turbopack constraint is already documented in STACK.md.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library versions verified via npm registry at time of research; deprecation status of alternatives confirmed via official sources |
| Features | HIGH | Menu planning, shopping, and offline UX patterns are well-documented across multiple independent sources; recipe feedback diff view is novel (no prior art in cooking apps) |
| Architecture | HIGH | Verified against local `node_modules/next/dist/docs/`; patterns confirmed against Phase 1 codebase; all seams between components are well-defined |
| Pitfalls | HIGH | Critical pitfalls sourced from official Supabase and Anthropic docs, confirmed Next.js GitHub issues, and direct codebase audit (CONCERNS.md) |

**Overall confidence:** HIGH

### Gaps to Address

- **Recipe diff view UX:** No prior art found in cooking apps for showing ingredient/instruction changes after AI adjustment. Treat this as a novel design problem — implementation should prototype early and validate with actual users before committing to a specific UI pattern.
- **Ingredient schema migration:** The decision to store ingredients as structured `{quantity, unit, ingredient, notes}` tuples (required for safe consolidation) needs to be evaluated against the Phase 1 recipe data model. If Phase 1 recipes store ingredients as free text, a migration strategy is needed before Phase 2 consolidation can work.
- **Background Sync on iOS:** The research recommends against Background Sync and proposes `window.addEventListener('online')` as fallback. The exact behavior of this on iOS Safari (when the tab is in background) should be validated on a real device during Phase 5 development.
- **Prompt caching effectiveness for translation:** Haiku + prompt caching for message translation is the cost recommendation, but the actual token savings depend on cache hit rate (system prompt must be identical across calls). Validate the caching implementation early in Phase 4 by logging `cache_read_input_tokens` from API responses.

---

## Sources

### Primary (HIGH confidence)
- Next.js 16 official docs (local) — `node_modules/next/dist/docs/` — Route Handler patterns, PWA, service worker, params awaiting
- Supabase Realtime Authorization — `supabase.com/docs/guides/realtime/authorization` — RLS with Postgres Changes, `supabase_realtime` role requirement
- Anthropic official docs — Vision API image limits, prompt caching, rate limits
- `@anthropic-ai/sdk` npm — version 0.80.0 confirmed published
- `@serwist/next` npm — version 9.5.4 confirmed published with Turbopack support
- react-beautiful-dnd GitHub issue #2672 — official deprecation announcement
- MiChef codebase CONCERNS.md — direct audit of existing tech debt and security issues
- MiChef `supabase/migrations/001_schema.sql` — schema supports all planned features

### Secondary (MEDIUM confidence)
- LogRocket Next.js 16 PWA with Serwist — Serwist setup patterns
- Next.js GitHub discussions #61972, #56529 — streaming abort error confirmed
- Supabase GitHub issue #35195 — `supabase_realtime` role requirement confirmed by community
- Mealie GitHub discussion #1852 — ingredient consolidation problems in real apps
- Plan to Eat documentation — ingredient merge challenges
- MDN PWA offline guides — IndexedDB + Background Sync patterns
- PMC reinforcement learning study — AI suggestion transparency improves user acceptance
- Receipt OCR UX — eWeek AI scanner apps 2025, Klippa OCR accuracy data

### Tertiary (LOW confidence)
- Novita AI: Fine-tuning for Mexican Spanish — single source on LLM regional Spanish drift (validates the pitfall exists; specific vocabulary list should be validated with a native speaker)

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*
