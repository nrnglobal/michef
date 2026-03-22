# Architecture Patterns

**Domain:** Bilingual household cook management — Next.js 16 App Router + Supabase
**Researched:** 2026-03-22
**Overall confidence:** HIGH (verified against `node_modules/next/dist/docs/` and existing Phase 1 codebase)

---

## Context: What Phase 1 Established

The existing architecture has no API routes beyond the auth callback. All data fetches happen in Server Components or directly from browser Supabase client. The features in Phases 2–5 break that pattern in specific, predictable ways:

- Claude API calls require a server-side HTTP boundary (key must never reach the browser)
- Supabase Realtime requires a persistent browser-side WebSocket subscription
- PWA offline requires a service worker registration path and a cache strategy
- Financial aggregation and rules validation require server-computed logic that should not live in page components

Each new concern maps cleanly to an existing seam in the architecture.

---

## Recommended Architecture

### Component Map

```
Browser
├── (client) route group                    [app/(client)/]
│   ├── Menu Planning page                  — Server Component, direct Supabase fetch
│   ├── AI Buttons (generate, adjust, import) — Client Components → POST /api/ai/*
│   ├── Messages panel                      — Client Component, Supabase Realtime subscription
│   └── Finance dashboard                   — Server Component, Supabase aggregation query
│
├── (cook) route group                      [app/(cook)/]
│   ├── Shopping list page                  — Client Component (needs check-off interactivity)
│   │   └── service worker caches this page + its data for offline use
│   ├── Messages panel                      — Client Component, Supabase Realtime subscription
│   └── Receipt upload                      — Client Component → Supabase Storage signed URL
│
└── Service Worker                          [public/sw.js]
    └── Cache-first for /lista (shopping list route) + precached assets

Next.js Server (API Layer)                  [app/api/]
├── /api/ai/generate-recipe/route.ts        — POST: Claude Sonnet, returns Recipe JSON
├── /api/ai/adjust-recipe/route.ts          — POST: Claude Sonnet + feedback, returns adjusted Recipe JSON
├── /api/ai/translate-message/route.ts      — POST: Claude Sonnet, returns translated string
├── /api/ai/import-recipe/route.ts          — POST: URL → Claude parses page, returns Recipe JSON
├── /api/ai/ocr-receipt/route.ts            — POST: image URL → Claude vision, returns line items
└── /api/auth/callback/route.ts             — (existing)

Shared Libraries                            [lib/]
├── lib/supabase/server.ts                  — (existing) server Supabase client
├── lib/supabase/client.ts                  — (existing) browser Supabase client
├── lib/claude.ts                           — NEW: Claude SDK client factory (server-only)
├── lib/rules-engine.ts                     — NEW: pure TS rules validation (no DB calls)
├── lib/shopping-merge.ts                   — NEW: ingredient consolidation logic
├── lib/finance.ts                          — NEW: aggregation helpers (called from Server Components)
└── lib/types.ts                            — (existing, extend with new types)

Supabase
├── Database tables (existing schema)
├── Storage bucket: receipts/               — cook uploads receipt images here
└── Realtime: messages table (postgres_changes)
```

---

## Component Boundaries

### 1. Claude API Route Handlers

**What:** `app/api/ai/*/route.ts` files — POST handlers that call Claude and return structured JSON (or stream text).

**Boundary:**
- Receives: authenticated request from browser Client Component with a JSON body
- Reads: relevant Supabase rows (recipes, rules, feedback) using `lib/supabase/server.ts`
- Calls: Claude Sonnet via `lib/claude.ts` (server-only, `CLAUDE_API_KEY` never in browser)
- Returns: JSON response or `ReadableStream` for streamed output

**Key constraints from Next.js 16 docs:**
- Route Handlers must not be called from Server Components (causes extra HTTP round trip, fails at build time for prerendered routes). Only Client Components call API routes.
- `params` must be awaited: `const { id } = await params` — this is a breaking change from older Next.js versions.
- Streaming is supported via `ReadableStream` — use for recipe generation where latency matters.

**Auth guard:** Each route handler must independently verify the session using `lib/supabase/server.ts` and return 401 if unauthenticated. The proxy cannot be relied on for API route protection alone.

```
Client Component
  → fetch('/api/ai/generate-recipe', { method: 'POST', body: JSON.stringify({...}) })
  → route handler: verify session → read rules/recipes from Supabase → call Claude → return JSON
  → Client Component: parse response, update local state, then router.refresh() to re-render server data
```

### 2. Supabase Realtime — Messaging

**What:** The `messages` table already exists in the schema. Real-time delivery is a browser-side concern.

**Boundary:**
- The message form (Client Component) inserts directly into Supabase via browser client
- Translation happens as a server-side side effect: the Client Component POSTs to `/api/ai/translate-message` before inserting, so the row lands in the DB with `translated_text` already populated
- The messages panel subscribes to `postgres_changes` on the `messages` table using the browser Supabase client
- Both (client) and (cook) panels subscribe to the same channel — RLS already allows all authenticated users to read all messages

**Pattern:**
```typescript
// In MessagesPanel (Client Component)
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => setMessages(prev => [...prev, payload.new as Message]))
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

**Important:** The Supabase Realtime `postgres_changes` feature requires the table to have `REPLICA IDENTITY FULL` set in Postgres if you need old record values on UPDATE. For INSERT-only messages, the default replica identity is sufficient.

### 3. PWA / Service Worker — Offline Shopping List

**What:** The cook's shopping list (`/lista`) must work without internet in a grocery store.

**Boundary:**
- Service worker lives at `public/sw.js` (static file, not processed by Next.js)
- Registration happens from a Client Component rendered inside the cook layout (`app/(cook)/layout.tsx` or a dedicated `<ServiceWorkerRegistration />` client component mounted there)
- Cache strategy: **cache-first for `/lista` route and its API responses**, network-first for everything else
- The shopping list page itself should be structured so its data is in the initial HTML (Server Component) and the check-off interactions use the browser Supabase client with optimistic local state — this means offline check-off works locally but does not sync until reconnected

**Next.js 16 recommendation (from official docs):** Use [Serwist](https://github.com/serwist/serwist) for full offline support, as it handles the Workbox complexity and integrates with Next.js webpack config. For the simpler cache-only requirement here (just one route), a hand-written `public/sw.js` with `cache.match` is sufficient and avoids the webpack dependency.

**Web App Manifest:** `app/manifest.ts` (Next.js App Router built-in metadata convention) produces `/manifest.json` automatically. Set `display: 'standalone'` and `start_url: '/lista'` for the cook persona.

### 4. Rules Engine

**What:** Validates that a proposed menu plan does not violate frequency, exclusion, or substitution rules defined in the `cooking_rules` table.

**Boundary — server-side only:**
- Logic lives in `lib/rules-engine.ts` as a pure TypeScript function: `validateMenuPlan(recipes: Recipe[], rules: CookingRule[], recentVisits: Visit[]): ValidationResult`
- This function has no DB calls — it receives pre-fetched data as arguments
- It is called from two places:
  1. Server Component rendering the menu plan confirm page (blocking display of violations)
  2. The `/api/ai/generate-recipe` route handler (so Claude's suggestions are pre-filtered)
- It is NOT run client-side. The client shows the result of server validation, it does not replicate the logic in the browser.

**Rationale for server-only:** The rules are defined in JSON blobs in `cooking_rules.rule_definition`. Parsing and evaluating those blobs in the browser would require shipping the rule interpreter to the client, creating a maintenance surface. Server-side evaluation is simpler and more reliable.

**ValidationResult shape:**
```typescript
type ValidationResult = {
  valid: boolean
  violations: Array<{
    ruleId: string
    ruleType: 'frequency' | 'exclusion' | 'substitution'
    message_en: string
    message_es: string
    severity: 'warn' | 'block'
  }>
}
```

### 5. Receipt Upload + Claude Vision

**What:** Cook photographs her receipt; Claude extracts line items and totals; data stored against the visit record.

**Boundary:**
- Upload path: Client Component → `supabase.storage.from('receipts').upload(...)` directly from the browser (no server round-trip for the binary). Returns a public or signed URL.
- Processing path: Client Component POSTs the storage URL to `/api/ai/ocr-receipt`
- The route handler fetches the image from Supabase Storage (public bucket or using service role key), passes it to Claude's vision API as a base64 image or URL, parses the response into `{ line_items: [...], total: number }`
- The route handler writes `receipt_extracted_data` and `grocery_total` to the `visits` table via `lib/supabase/server.ts`
- Client Component receives the extracted data back in the response and shows a confirmation UI

**Supabase Storage bucket setup:** One bucket named `receipts`. RLS policy: cook can insert objects, both roles can read. Bucket should be private (signed URLs, not public) — the API route uses the Supabase service role key to generate a short-lived signed URL to pass to Claude.

**Why upload from browser, not through API route:** Next.js Route Handlers running as lambda functions have body size limits and timeout constraints. A 3MB JPEG receipt photo should go directly to Supabase Storage from the browser, then the processing step is decoupled.

### 6. Financial Aggregation

**What:** Per-visit payment tracking, monthly summaries, spending trends.

**Boundary:**
- All aggregation runs as Supabase queries in Server Components — no `lib/finance.ts` helper needed for simple aggregations
- For more complex window functions (monthly rolling totals, year-over-year), extract query logic into `lib/finance.ts` helper functions that accept a Supabase client as a parameter and return typed results
- No client-side computation. The finance dashboard page is a Server Component that queries the `visits` table, groups by month, and renders static HTML.

**Key query patterns:**
```sql
-- Monthly summary
SELECT
  DATE_TRUNC('month', visit_date) AS month,
  SUM(grocery_total) AS grocery_total,
  SUM(service_fee) AS service_fee,
  COUNT(*) AS visit_count
FROM visits
GROUP BY month
ORDER BY month DESC;
```

This runs fine as a Supabase `rpc` call or via the JS client with `.select()` chaining.

---

## Data Flow

### AI Feature Request (Client → API Route → Claude → Supabase)

```
1. Client Component collects input (e.g., "Generate a recipe with chicken")
2. Client Component POSTs to /api/ai/generate-recipe
3. Route handler: createClient() from lib/supabase/server.ts → verify session → 401 if invalid
4. Route handler: query active recipes, cooking_rules, recent visit feedback from Supabase
5. Route handler: call Claude Sonnet via lib/claude.ts with assembled prompt
6. Route handler: parse Claude JSON response, validate structure
7. Route handler: optionally INSERT new recipe into Supabase, return recipe JSON to client
8. Client Component: updates local state with returned recipe
9. Client Component: router.refresh() to re-trigger any parent Server Component queries
```

### Realtime Message Flow

```
1. Client Component: user types message, submits form
2. Client Component: POST /api/ai/translate-message with { text, from_language }
3. Route handler: call Claude → return translated string
4. Client Component: browser Supabase client INSERT into messages table
   { sender_role, original_text, translated_text, original_language }
5. Supabase Realtime: postgres_changes fires INSERT event
6. Both user's MessagesPanel subscriptions receive the new row
7. Each panel renders the language-appropriate field based on role
```

### Receipt OCR Flow

```
1. Cook Client Component: file input → supabase.storage.from('receipts').upload(file)
2. Supabase Storage: returns { path }
3. Client Component: POST /api/ai/ocr-receipt with { storage_path }
4. Route handler: generate signed URL via Supabase service role client
5. Route handler: call Claude vision API with image URL
6. Route handler: parse line items → UPDATE visits SET receipt_extracted_data=..., grocery_total=...
7. Route handler: return extracted data JSON to client
8. Client Component: render confirmation/edit UI
```

### Shopping List Offline Flow

```
Online path:
1. Cook opens /lista — Server Component fetches shopping_list_items, renders HTML
2. Service worker caches the HTML response and marks it as fresh
3. Cook taps checkboxes — Client Component: browser Supabase client UPDATE is_checked=true

Offline path:
1. Cook opens /lista — service worker serves cached HTML
2. Cook taps checkboxes — Client Component: update local React state (optimistic)
3. Supabase client call fails silently (or is queued via Background Sync API)
4. On reconnect: if using Background Sync, queued writes replay; otherwise cook loses check state
```

**Recommendation on offline writes:** For Phase 5, implement optimistic local state only — do not implement Background Sync. The shopping list is ephemeral enough that losing check-state on reconnect is acceptable. Flag this as a known limitation. Full sync queuing adds significant complexity.

---

## Patterns to Follow

### Pattern 1: API Route Auth Guard

Every route handler in `app/api/ai/` must start with session verification. Do not rely on the proxy matcher to protect API routes — the proxy runs before the route but cannot guarantee the session is valid for the specific operation.

```typescript
// app/api/ai/generate-recipe/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  // ...proceed
}
```

### Pattern 2: Claude Client Factory (lib/claude.ts)

Centralise the Anthropic SDK instantiation. This file must never be imported by Client Components (mark it as server-only with the `'server-only'` package if needed).

```typescript
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

export function createClaudeClient() {
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
}
```

`CLAUDE_API_KEY` must be a server-only env var (no `NEXT_PUBLIC_` prefix).

### Pattern 3: Streaming Recipe Generation

For recipe generation where response latency is noticeable, stream Claude's response to the browser:

```typescript
// app/api/ai/generate-recipe/route.ts
const stream = await claude.messages.stream({ model: 'claude-sonnet-4-5', ... })
return new Response(stream.toReadableStream(), {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' }
})
```

Client Component reads it with a `ReadableStreamDefaultReader`. This requires the Client Component to accumulate the stream, parse the final JSON at the end, and show a loading skeleton during generation.

### Pattern 4: Rules Engine Composition

The rules engine receives data, does not fetch it. This keeps it testable and decoupled:

```typescript
// lib/rules-engine.ts
export function validateMenuPlan(
  proposedRecipes: Recipe[],
  rules: CookingRule[],
  recentVisits: Visit[]   // last N visits for frequency checks
): ValidationResult { ... }
```

Callers are responsible for fetching the data from Supabase before calling this function.

### Pattern 5: Shopping List Ingredient Merge

Consolidation of duplicate ingredients across multiple recipes into a single list is pure computation — no DB calls. Lives in `lib/shopping-merge.ts`:

```typescript
export function mergeIngredients(
  recipes: Recipe[],
  staples: FridgeStaple[]
): ShoppingListItem[]
```

Called from the Server Action or API route that confirms a menu plan and generates the shopping list.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Calling API Routes from Server Components

**What:** `fetch('/api/ai/generate-recipe', ...)` inside a `async function Page()` Server Component.

**Why bad:** Next.js 16 docs explicitly warn against this — it adds an HTTP round trip to an in-process call, and it fails completely for pages prerendered at build time. Server Components should query Supabase directly or call library functions.

**Instead:** Call `lib/rules-engine.ts`, `lib/shopping-merge.ts`, or `lib/finance.ts` directly. If Claude is needed at Server Component render time (e.g., pre-generated menu suggestion), fetch the suggestion in the Client Component via API route after hydration.

### Anti-Pattern 2: Exposing CLAUDE_API_KEY to Browser

**What:** Accidentally using `NEXT_PUBLIC_CLAUDE_API_KEY` or importing `lib/claude.ts` in a Client Component.

**Why bad:** Key is exposed in the JS bundle, visible in browser dev tools, can be scraped.

**Instead:** All Claude calls go through `app/api/ai/` route handlers. `lib/claude.ts` uses `import 'server-only'` as a guard. `CLAUDE_API_KEY` has no `NEXT_PUBLIC_` prefix.

### Anti-Pattern 3: Running Rules Engine in Browser

**What:** Duplicating `lib/rules-engine.ts` logic in a Client Component for instant validation feedback.

**Why bad:** The rule definitions are JSONB blobs with complex semantics. Keeping two implementations in sync is a maintenance trap. Network latency for a server validation round-trip is ~100ms — acceptable for a confirm action.

**Instead:** Server-side only. If instant feedback is needed (e.g., as the user picks recipes), do a lightweight optimistic check in the UI (e.g., simple frequency counter) and treat the server as authoritative.

### Anti-Pattern 4: Supabase Realtime on Server Components

**What:** Attempting to use `supabase.channel()` in a Server Component.

**Why bad:** Server Components render once and return HTML — they have no persistent connection. Realtime subscriptions require a browser WebSocket that stays alive.

**Instead:** Realtime subscriptions live exclusively in Client Components. The initial message list is fetched by the Server Component (fast, SSR); the Client Component hydrates and subscribes for subsequent updates.

### Anti-Pattern 5: Storing Receipt Binary in Supabase DB

**What:** Converting image to base64 and storing in a `bytea` column.

**Why bad:** Bloats the DB, slows queries on the `visits` table, exceeds Supabase row size limits for large images.

**Instead:** Supabase Storage bucket for binaries; `receipt_image_url` column on `visits` for the reference (already in schema).

---

## Scalability Considerations

This is a single-household, two-user app. Scalability is not a concern. The patterns above are chosen for simplicity and correctness, not scale. If the app ever expanded to multiple households, the primary change would be adding a `household_id` foreign key and scoping all RLS policies to it.

---

## Build Order Implications

The features have dependencies that suggest this build order:

**Phase 2 (Menu Planning & Shopping) — no new architecture needed**
- All data fetches are direct Supabase queries in Server/Client Components
- `lib/rules-engine.ts` is new but uses only existing types
- `lib/shopping-merge.ts` is new but is pure computation
- Shopping list page can be a Client Component using existing browser Supabase client
- No API routes, no service worker, no new library integrations

**Phase 3 (AI Features) — introduces the API route layer**
- Establish `lib/claude.ts` first — all AI routes depend on it
- Add `app/api/ai/` directory with individual route handlers
- Recipe generation and adjustment are independent of each other
- Recipe import (URL → Claude) is independent
- Receipt OCR depends on Supabase Storage bucket being configured

**Phase 4 (Communication & Finance) — introduces Realtime**
- Messaging builds on the existing `messages` table schema
- The translate-then-insert pattern requires the API route layer from Phase 3 to exist
- Finance dashboard is pure Server Component + Supabase queries — no dependencies on Phase 3
- Receipt upload depends on Phase 3's OCR route handler

**Phase 5 (Polish) — introduces Service Worker**
- Service worker can only be added after the shopping list UI is stable (Phase 2)
- PWA manifest is independent and can be added any time
- The service worker scope (`/lista`) must match the cook's shopping list route

**Dependency graph:**
```
Phase 2: lib/rules-engine.ts, lib/shopping-merge.ts
    ↓
Phase 3: lib/claude.ts → app/api/ai/* route handlers → Supabase Storage bucket
    ↓
Phase 4: MessagesPanel (Realtime) + translate API route (from Phase 3)
         Finance dashboard (independent of Phase 3)
    ↓
Phase 5: public/sw.js + app/manifest.ts (depends on Phase 2 shopping list being stable)
```

---

## Sources

- Next.js 16 official docs (local): `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md` — Route Handler patterns, Server Component caveats, proxy auth
- Next.js 16 official docs (local): `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md` — PWA, service worker, manifest, Serwist recommendation
- Next.js 16 official docs (local): `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` — Route Handler API, params awaiting pattern
- Existing codebase: `supabase/migrations/001_schema.sql` — confirmed schema supports all features (messages, visits, receipt_image_url, shopping_list_items.is_checked)
- Existing codebase: `.planning/codebase/ARCHITECTURE.md` — Phase 1 patterns, dual Supabase client, no global state store
- Supabase JS v2 package installed (`@supabase/supabase-js ^2.99.3`) — Realtime channel API confirmed available
