# Technology Stack — Phases 2–5 Additions

**Project:** MiChef
**Researched:** 2026-03-22
**Context:** Phase 1 is complete. This file covers only the new libraries and patterns needed for Phases 2–5. Do not alter the existing stack.

---

## Existing Foundation (Do Not Change)

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.2.1 | App Router; Turbopack default in dev |
| React | 19.2.4 | — |
| TypeScript | 5.9.x | — |
| Supabase (`@supabase/ssr`) | ^0.9.0 | SSR client pattern already established |
| Tailwind CSS | v4 | — |
| shadcn / @base-ui/react | v4.1.0 / ^1.3.0 | — |

---

## New Dependencies by Feature Area

### 1. Drag-and-Drop Menu Planning UI

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@dnd-kit/core` | ^6.3.1 | Drag sensor + context | Only actively maintained, full-featured DnD library for React 19 in 2025. react-beautiful-dnd is officially deprecated (archived August 2025). react-dnd lacks touch support needed for the cook's phone. |
| `@dnd-kit/sortable` | ^8.0.0 | Sortable list/grid preset | Thin layer over core that handles reorder logic, array moves, and animation transforms — precisely the pattern needed for recipe slots in a menu plan. |
| `@dnd-kit/utilities` | ^3.2.2 | CSS transform helpers | Required by sortable for smooth drag animations; tiny package. |

**Confidence:** HIGH — dnd-kit is the dominant React DnD library post-deprecation of alternatives, verified by multiple sources including the official npm registry showing @dnd-kit/core 6.3.1.

**What NOT to use:**
- `react-beautiful-dnd` — Officially deprecated and archived August 2025.
- `react-dnd` — No active maintenance; poor touch-sensor story.
- `@atlaskit/pragmatic-drag-and-drop` — Atlassian-internal tooling, no community ecosystem, over-engineered for a 2–4 recipe planner.

---

### 2. AI Recipe Generation + Adjustment (Claude API)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@anthropic-ai/sdk` | ^0.80.0 | Official Anthropic client | Latest stable release (published within days of research date). Provides typed request/response, streaming via `.stream()`, built-in retry and error hierarchy. Node.js 18+ requirement is satisfied (project runs Node 24). |

**Pattern: Raw Anthropic SDK over Vercel AI SDK**

Use `@anthropic-ai/sdk` directly rather than the Vercel AI SDK (`ai` package). Rationale:

1. MiChef's AI calls are structured JSON generation (recipes, shopping lists, adjustments), not conversational chat streams. The Vercel AI SDK's value proposition — `useChat` hook + streaming text UI — does not apply.
2. The project already has the constraint "all Claude calls server-side via Next.js API routes." The Anthropic SDK's server-side usage in Route Handlers is the exact pattern already planned.
3. Adding Vercel AI SDK introduces ~120 kB of React hooks and chat-UI utilities that will never be used.
4. Structured output: use `client.messages.create()` with a JSON-schema system prompt. For streaming recipe text to the UI, use `client.messages.stream()` and pipe the `ReadableStream` through the Route Handler response.

**Confidence:** HIGH — `@anthropic-ai/sdk` version confirmed via npm search results showing 0.80.0 published days before research date.

**What NOT to use:**
- `ai` (Vercel AI SDK) — Adds unused abstractions; MiChef's AI use cases are structured generation, not chat UI.

---

### 3. Receipt Image OCR (Claude Vision)

No additional library is needed beyond `@anthropic-ai/sdk` (already listed above).

**Pattern: Two-step — Supabase Storage then Claude Vision**

1. Cook uploads receipt photo from mobile browser via a standard `<input type="file">` form in a Client Component.
2. Server Action / Route Handler: upload the file to Supabase Storage (bucket: `receipts`, private, RLS-scoped to cook role). Return the path.
3. Separately: Route Handler downloads the file bytes from Supabase Storage (server-to-server, using service-role key), encodes as base64, and sends to Claude via:

```typescript
await anthropic.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [{
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: base64Data }
    }, {
      type: "text",
      text: "Extract all line items and totals from this grocery receipt. Return JSON: { items: [{ name, qty, unit_price, total }], grand_total }."
    }]
  }]
})
```

**Why not the Anthropic Files API?** The Files API (`anthropic-beta: files-api-2025-04-14`) is useful when the same image will be referenced in many turns. For single-use receipt OCR, uploading once to Supabase Storage and converting to base64 per-request is simpler, keeps all file storage in one place (Supabase), and avoids an additional external storage dependency.

**Confidence:** MEDIUM — Vision via base64 is documented and well-established. The Files API is real but beta-flagged; skip it for simplicity.

---

### 4. Bilingual Real-Time Messaging with Auto-Translation

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@supabase/supabase-js` | ^2.99.3 | Realtime subscriptions | Already installed. Supabase Realtime's `postgres_changes` subscription is the correct primitive: messages are persisted to the `messages` table (already in schema), and all connected clients receive inserts in real time via WebSocket. No additional library needed. |

**Pattern:**

- Translation happens server-side on insert. Client writes a message in their language → Route Handler calls Claude to translate → writes both `content_en` and `content_es` to the `messages` table in a single insert.
- Client Component subscribes to `messages` channel using `supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback).subscribe()`.
- Each user reads the field matching their `profiles.language` preference.
- **No third-party translation service** (Google Translate, DeepL) needed — Claude already handles translation as part of the same API call that writes the bilingual message. This avoids a second billable API dependency.

**Confidence:** HIGH — Supabase Realtime postgres_changes pattern is official and documented; already used by the project's existing Supabase client.

**What NOT to use:**
- Separate translation APIs (Google Cloud Translation, DeepL) — Redundant; Claude covers this with better context awareness for culinary vocabulary.
- Socket.io / Pusher — Redundant; Supabase Realtime is already in the stack.
- `react-query` / SWR for polling — Polling is the wrong approach; subscriptions give real-time UX the messaging feature requires.

---

### 5. Offline-Capable Shopping List (PWA / Service Worker)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@serwist/next` | ^9.5.4 | Next.js PWA/service worker plugin | Latest stable release (published within 1 day of research date). Successor to the unmaintained `next-pwa`. Serwist 9 added Turbopack support — critical because Next.js 16 uses Turbopack by default. |
| `serwist` | ^9.5.4 | Core service worker runtime (devDep) | Provides the precaching and runtime caching strategies registered by the service worker. |

**Pattern:**

Configure `@serwist/next` in `next.config.ts` with `swSrc: "app/sw.ts"` (custom service worker entry). The service worker should use:
- `StaleWhileRevalidate` for the shopping list page — shows cached version immediately while updating in background.
- `NetworkFirst` for all other app pages — ensures the cook always sees fresh data when online.
- Cache shopping list item state locally using the Cache API; sync on reconnect.

**Important constraint:** Build with `--webpack` flag for production when Serwist is enabled (Serwist still requires Webpack for the build step even though Turbopack is supported in dev). Add to `package.json`:
```json
"build": "next build --webpack"
```

Disable Serwist in development to avoid cache confusion during local development:
```typescript
disable: process.env.NODE_ENV === "development"
```

**Web App Manifest:** Add `app/manifest.ts` (Next.js 16 supports this natively via the `Metadata` API) with `display: "standalone"`, appropriate icon sizes, and `start_url` pointing to the cook's shopping list route. This makes the app installable to the cook's phone home screen.

**Confidence:** HIGH — Serwist 9.5.4 confirmed as latest version, with explicit Turbopack compatibility noted in docs.

**What NOT to use:**
- `next-pwa` (shadowwalker) — Unmaintained; no App Router or Turbopack support.
- `@ducanh2912/next-pwa` — This IS Serwist's predecessor; the author migrated to publishing Serwist instead. Use Serwist directly.
- Manual service worker without a build plugin — Too fragile with Next.js's hashed file names.

---

### 6. Payment / Financial Tracking UI

**No new library needed.**

Payment tracking in MiChef is a read/write UI over a simple data model (visit cost + service fee + paid/pending status in the existing `visits` table). The requirements are:

- Display per-visit grocery total + service fee
- Monthly summary (aggregate query)
- Toggle pending/paid status

These are straightforward Supabase queries rendered with existing shadcn components (Table, Badge, Card). No charting library is needed for Phase 4 scope. If spending trend charts are added in Phase 5 analytics, use `recharts` at that point — it is the standard shadcn-compatible chart library.

**Confidence:** HIGH — No chart requirement in Phase 4 scope; deferral is correct.

---

## Installation Commands

```bash
# Drag-and-drop menu planning
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Claude API (AI features, OCR, translation)
npm install @anthropic-ai/sdk

# PWA / offline shopping list
npm install @serwist/next
npm install -D serwist
```

---

## Alternatives Considered

| Category | Recommended | Rejected | Why Rejected |
|----------|-------------|----------|--------------|
| Drag-and-drop | `@dnd-kit/core` | `react-beautiful-dnd` | Officially deprecated, archived Aug 2025 |
| Drag-and-drop | `@dnd-kit/core` | `react-dnd` | No active maintenance; poor touch support |
| AI streaming | `@anthropic-ai/sdk` direct | Vercel AI SDK | Unnecessary abstraction; MiChef uses structured JSON generation, not chat UI |
| Translation | Claude (via Anthropic SDK) | Google Translate / DeepL | Redundant third-party API; Claude handles culinary context better |
| Real-time messaging | Supabase Realtime (existing) | Socket.io / Pusher | Already in stack; no reason to add a second real-time layer |
| PWA plugin | `@serwist/next` | `next-pwa` (shadowwalker) | Unmaintained; no Turbopack support |
| Financial UI | shadcn components (existing) | Chart library | Phase 4 scope doesn't need charts; defer to Phase 5 |
| Receipt OCR | Claude Vision (via Anthropic SDK) | Tesseract.js / Google Vision | Claude is already integrated; separate OCR service adds cost and complexity |

---

## Sources

- [@dnd-kit/core on npm — version 6.3.1](https://www.npmjs.com/package/@dnd-kit/core) — MEDIUM confidence (npm registry data via search)
- [react-beautiful-dnd deprecation — GitHub issue #2672](https://github.com/atlassian/react-beautiful-dnd/issues/2672) — HIGH confidence (official Atlassian announcement)
- [@anthropic-ai/sdk on npm — version 0.80.0](https://www.npmjs.com/package/@anthropic-ai/sdk) — HIGH confidence (npm registry data, confirmed recently published)
- [Anthropic Vision docs](https://docs.anthropic.com/en/docs/build-with-claude/vision) — HIGH confidence (official docs)
- [Anthropic Files API docs](https://docs.anthropic.com/en/docs/build-with-claude/files) — MEDIUM confidence (beta-flagged feature)
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — HIGH confidence (official Supabase docs)
- [@serwist/next on npm — version 9.5.4](https://www.npmjs.com/package/@serwist/next) — HIGH confidence (npm registry, published 1 day before research date)
- [Serwist getting started for Next.js](https://serwist.pages.dev/docs/next/getting-started) — HIGH confidence (official Serwist docs)
- [LogRocket: Next.js 16 PWA with Serwist](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) — MEDIUM confidence (editorial source, not official)
