# External Integrations

**Analysis Date:** 2026-03-22

## APIs & External Services

**AI / Language Model:**
- Anthropic Claude API - Recipe adjustment based on feedback (Phase 2, not yet implemented)
  - SDK/Client: Not yet installed; `anthropic` package absent from `package.json`
  - Auth: `ANTHROPIC_API_KEY` env var
  - Anticipated use: `ai_adjusted_recipe` JSONB column in `recipe_feedback` table suggests AI-generated recipe variants

**Fonts:**
- Google Fonts (via Next.js) - Geist Sans font loaded at build time
  - Client: `next/font/google` in `app/layout.tsx`
  - No API key required

## Data Storage

**Databases:**
- Supabase (PostgreSQL) - Primary datastore for all application data
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client (server): `@supabase/ssr` `createServerClient` — `lib/supabase/server.ts`
  - Client (browser): `@supabase/ssr` `createBrowserClient` — `lib/supabase/client.ts`
  - Schema: `supabase/migrations/001_schema.sql`
  - Tables: `profiles`, `recipes`, `recipe_feedback`, `menu_plans`, `menu_plan_items`, `cooking_rules`, `shopping_lists`, `shopping_list_items`, `visits`, `messages`, `fridge_staples`
  - Row Level Security: Enabled on all tables; all policies use `TO authenticated` role
  - Seed data: `supabase/migrations/002_seed.sql`

**File Storage:**
- Supabase Storage (anticipated) - `receipt_image_url TEXT` column in `visits` table suggests image uploads, but no storage client calls detected in current code

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email/password authentication
  - Implementation: PKCE OAuth code flow via `/api/auth/callback/route.ts`
  - Session refresh: Middleware in `proxy.ts` calls `supabase.auth.getUser()` on every request
  - Cookie management: `@supabase/ssr` handles session cookies server-side
  - Callback endpoint: `GET /api/auth/callback` — exchanges auth code for session, redirects to `next` param or `/`

**Role-Based Access:**
- Two roles: `client` and `cook` stored in `profiles.role`
- Enforced in middleware (`proxy.ts`):
  - Unauthenticated users → redirect to `/login`
  - `cook` role → `/visita` and `/recetas` routes only
  - `client` role → `/dashboard` and recipe management routes only
- RLS on `profiles` table: users can only read/write their own profile row

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- `console.error` / `console.log` only (no structured logging library)

## CI/CD & Deployment

**Hosting:**
- Not configured; no `vercel.json`, `netlify.toml`, Dockerfile, or platform config present

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project REST/Auth URL (public, exposed to browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous API key (public, exposed to browser)
- `ANTHROPIC_API_KEY` - Server-only; for Phase 2 AI features

**Optional / graceful degradation:**
- If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent, `proxy.ts` middleware skips auth entirely (dev/demo mode)
- `lib/supabase/server.ts` falls back to placeholder strings if env vars are missing

**Secrets location:**
- `.env.local` (gitignored); template at `.env.local.example`

## Webhooks & Callbacks

**Incoming:**
- `GET /api/auth/callback` — Supabase Auth PKCE redirect callback (receives `code` query param)

**Outgoing:**
- None detected

## i18n

- Custom React Context (no external service)
- Language stored in `localStorage` key `casa-cook-lang`
- Translations: `lib/i18n/en.json` (English), `lib/i18n/es.json` (Spanish)
- User language preference also stored in `profiles.language` column (`en` | `es`)

---

*Integration audit: 2026-03-22*
