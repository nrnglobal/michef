# Architecture

**Analysis Date:** 2026-03-22

## Pattern Overview

**Overall:** Next.js App Router with role-based route groups, Supabase as the backend-as-a-service

**Key Characteristics:**
- Two distinct user roles (`client` and `cook`) served by separate route groups with separate layouts
- No dedicated API layer — pages query Supabase directly using either server components or browser client
- Role enforcement happens at three layers: middleware (`proxy.ts`), layout redirects, and RLS policies in Supabase
- Bilingual data model: all content entities store parallel `_en` / `_es` fields at the database level
- i18n UI strings handled separately via a custom React context (`lib/i18n/config.tsx`) with JSON dictionaries

## Layers

**Middleware (session refresh + route guard):**
- Purpose: Refresh expired Supabase sessions on every request; redirect unauthenticated users; enforce role-based route access
- Location: `proxy.ts` (exported as `proxy`, consumed by `middleware.ts` if it exists; currently the file exports config matcher directly)
- Contains: Session hydration, public-route whitelist, role-based redirect logic
- Depends on: `@supabase/ssr` server client
- Used by: Next.js edge middleware

**Route Groups / Page Layer:**
- Purpose: Render pages; fetch data directly from Supabase inside async Server Components
- Location: `app/(auth)/`, `app/(client)/`, `app/(cook)/`
- Contains: Server Components (data fetch + render), Client Components for interactive UIs
- Depends on: `lib/supabase/server.ts` (Server Components), `lib/supabase/client.ts` (Client Components), `lib/types.ts`, `lib/utils.ts`, `lib/i18n/config.tsx`, `components/`
- Used by: End user via browser

**Supabase Clients:**
- Purpose: Provide correctly-scoped Supabase clients — server-side (cookie-aware) vs browser-side
- Location: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- Contains: Factory functions `createClient()` — same name, different imports to prevent misuse
- Depends on: `@supabase/ssr`
- Used by: All pages and components that touch data

**Shared Component Library:**
- Purpose: Reusable UI primitives and domain components
- Location: `components/ui/` (shadcn/ui primitives), `components/` root (domain components)
- Contains: `Button`, `Input`, `Card`, `Badge`, `Tabs`, `Select`, `Textarea`, `Sonner` toaster; domain: `RecipeCard`, `RecipeForm`, `Sidebar`, `BottomNav`
- Depends on: `lib/utils.ts` (cn helper), `lib/i18n/config.tsx`, `lib/supabase/client.ts`
- Used by: All page-level components

**Type Definitions:**
- Purpose: Single source of truth for all domain shapes matching the database schema
- Location: `lib/types.ts`
- Contains: `Profile`, `Recipe`, `Ingredient`, `RecipeFeedback`, `MenuPlan`, `MenuPlanItem`, `CookingRule`, `ShoppingList`, `ShoppingListItem`, `Visit`, `Message`, `FridgeStaple`
- Depends on: Nothing
- Used by: All pages and components

**Internationalisation:**
- Purpose: Runtime language switching and string translation for the UI layer
- Location: `lib/i18n/config.tsx`, `lib/i18n/en.json`, `lib/i18n/es.json`
- Contains: `I18nProvider` React context, `useI18n()` hook, dot-path `t()` function with `{{param}}` interpolation
- Depends on: Nothing
- Used by: All Client Components and layouts; `(client)` layout initialises to `"en"`, `(cook)` layout initialises to `"es"`

## Data Flow

**Authenticated Page Request (Server Component):**

1. Browser sends request with session cookies
2. `proxy.ts` middleware intercepts: refreshes Supabase session, checks auth state, enforces role-based redirects
3. Layout (`app/(client)/layout.tsx` or `app/(cook)/layout.tsx`) re-validates session, fetches profile, wraps children in `I18nProvider`
4. Page Server Component calls `createClient()` from `lib/supabase/server.ts` and queries Supabase directly
5. Data passed as props to child components; page renders HTML on the server and streams to browser

**Client-Side Interactive Data Flow:**

1. Client Component calls `createClient()` from `lib/supabase/client.ts` (browser client)
2. Queries Supabase via the browser SDK (e.g., `RecipesPage` debounced search, `RecipeForm` submit, `RulesPage` toggle)
3. Optimistic or response-driven state update via `useState`
4. Toast notifications via `sonner` for success/error feedback
5. Navigation via `router.push()` or `router.refresh()` to re-trigger server-side data

**Authentication Flow:**

1. User submits login form at `/login` (Client Component, `app/(auth)/login/page.tsx`)
2. `supabase.auth.signInWithPassword()` called with browser client
3. On success, profile role fetched; user redirected to `/dashboard` (client) or `/visita` (cook)
4. OAuth/magic-link: `/api/auth/callback/route.ts` exchanges code for session, then redirects to `/`
5. Root page (`app/page.tsx`) re-checks user and role, redirects to role-appropriate home

**State Management:**

- No global client-side state store (no Redux, Zustand, or React Query)
- Server state: fetched fresh on each server render
- Client UI state: local `useState` within each page/component
- Language preference: `localStorage` key `"casa-cook-lang"`, read on mount in `I18nProvider`

## Key Abstractions

**Route Groups:**
- Purpose: Scope layouts and auth guards to user roles without affecting URL paths
- Examples: `app/(auth)/`, `app/(client)/`, `app/(cook)/`
- Pattern: Each group has its own `layout.tsx` that validates role and renders appropriate chrome (Sidebar for client, BottomNav for cook)

**Dual Supabase Client Pattern:**
- Purpose: Prevent accidental use of server-only client in browser and vice versa
- Examples: `lib/supabase/server.ts` (async, cookie-store aware), `lib/supabase/client.ts` (synchronous, `createBrowserClient`)
- Pattern: Both export `createClient()` — import path determines which is used

**Bilingual Data Fields:**
- Purpose: Store content in both English and Spanish at the row level
- Examples: `Recipe.title_en` / `Recipe.title_es`, `Ingredient.name_en` / `Ingredient.name_es`
- Pattern: All content tables have parallel `_en` / `_es` columns; UI selects field based on current language

**Client Action Components:**
- Purpose: Interactive mutations co-located with their parent server-rendered page
- Examples: `app/(client)/recipes/[id]/archive-button.tsx`
- Pattern: Small `'use client'` components that import browser Supabase client, call mutation, then `router.refresh()` to re-run the parent Server Component data fetch

## Entry Points

**Root Route:**
- Location: `app/page.tsx`
- Triggers: Any unauthenticated or freshly-authenticated request to `/`
- Responsibilities: Auth check + role-based redirect to `/dashboard` or `/visita`

**Client Layout:**
- Location: `app/(client)/layout.tsx`
- Triggers: Any request under `/(client)/` routes
- Responsibilities: Auth guard, role guard (redirect cooks to `/visita`), render Sidebar, initialise i18n to English

**Cook Layout:**
- Location: `app/(cook)/layout.tsx`
- Triggers: Any request under `/(cook)/` routes
- Responsibilities: Auth guard, role guard (redirect clients to `/dashboard`), render BottomNav, initialise i18n to Spanish

**Auth Callback:**
- Location: `app/api/auth/callback/route.ts`
- Triggers: OAuth/magic-link redirect from Supabase
- Responsibilities: Exchange auth code for session, redirect to `next` param or `/`

**Middleware:**
- Location: `proxy.ts`
- Triggers: Every request matching the configured pattern (excludes static assets)
- Responsibilities: Session refresh, unauthenticated redirect to `/login`, role-based cross-route protection

## Error Handling

**Strategy:** Minimal — errors surface as toast notifications for mutations; missing data results in `notFound()` for detail pages

**Patterns:**
- Server Component: `notFound()` from `next/navigation` when Supabase returns null for a required record (e.g., recipe detail page)
- Client Component mutations: `if (error)` check on Supabase response → `toast.error(...)` via sonner
- Auth errors: Redirect to `/login?error=auth` from the callback route
- Missing Supabase config: Login page detects missing env vars and shows setup instructions; `proxy.ts` skips auth entirely in dev/demo mode

## Cross-Cutting Concerns

**Logging:** None — no structured logging framework; browser console only
**Validation:** Client-side only — HTML `required` attributes and basic JS guards in form submit handlers; no server-side validation layer
**Authentication:** Supabase Auth with cookie-based sessions; middleware refreshes tokens on every request; row-level security policies enforce data access at the database level

---

*Architecture analysis: 2026-03-22*
