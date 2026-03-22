# Codebase Structure

**Analysis Date:** 2026-03-22

## Directory Layout

```
MiChef/
├── app/                        # Next.js App Router — all routes
│   ├── layout.tsx              # Root layout (HTML shell, Geist font, Toaster)
│   ├── page.tsx                # Root redirect — auth check + role-based redirect
│   ├── globals.css             # Global Tailwind CSS
│   ├── (auth)/                 # Route group: unauthenticated routes
│   │   └── login/
│   │       └── page.tsx        # Login page (client component)
│   ├── (client)/               # Route group: client/household-owner role
│   │   ├── layout.tsx          # Client layout: auth guard + Sidebar + i18n(en)
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Dashboard overview (server component)
│   │   ├── recipes/
│   │   │   ├── page.tsx        # Recipe library with search/filter (client component)
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # New recipe page (wraps RecipeForm)
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Recipe detail (server component)
│   │   │       ├── archive-button.tsx  # Archive/restore action (client component)
│   │   │       └── edit/
│   │   │           └── page.tsx        # Edit recipe page (wraps RecipeForm)
│   │   └── rules/
│   │       └── page.tsx        # Cooking rules CRUD (client component)
│   ├── (cook)/                 # Route group: cook/housekeeper role
│   │   ├── layout.tsx          # Cook layout: auth guard + BottomNav + i18n(es)
│   │   ├── visita/
│   │   │   └── page.tsx        # Upcoming visit + menu (server component, Spanish)
│   │   └── recetas/
│   │       └── page.tsx        # Recipe list for cook (server component, Spanish)
│   └── api/
│       └── auth/
│           └── callback/
│               └── route.ts    # OAuth/magic-link session exchange
├── components/                 # Shared UI components
│   ├── ui/                     # shadcn/ui primitives (do not edit directly)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── sonner.tsx
│   ├── sidebar.tsx             # Left nav for client role (desktop)
│   ├── bottom-nav.tsx          # Bottom tab bar for cook role (mobile)
│   ├── recipe-card.tsx         # Recipe grid card (client component)
│   └── recipe-form.tsx         # Create/edit recipe form (client component)
├── lib/                        # Shared utilities and configuration
│   ├── types.ts                # All TypeScript domain interfaces
│   ├── utils.ts                # cn(), formatDate(), formatDateEs()
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client factory
│   │   └── server.ts           # Server/SSR Supabase client factory
│   └── i18n/
│       ├── config.tsx          # I18nProvider context + useI18n() hook
│       ├── en.json             # English UI strings
│       └── es.json             # Spanish UI strings
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql      # Full DB schema + RLS policies + indexes
│       └── 002_seed.sql        # Seed data
├── public/                     # Static assets
├── proxy.ts                    # Next.js middleware logic (session + route guards)
├── next.config.ts              # Next.js config (minimal, no customisations)
├── tsconfig.json               # TypeScript config with @/ path alias
├── components.json             # shadcn/ui config
├── package.json                # Dependencies
└── .env.local.example          # Required env var template
```

## Directory Purposes

**`app/(auth)/`:**
- Purpose: Routes accessible without authentication
- Contains: Login page only
- Key files: `app/(auth)/login/page.tsx`

**`app/(client)/`:**
- Purpose: All screens for the household owner/client role. Wrapped in `layout.tsx` that requires `role === 'client'`
- Contains: Dashboard, recipe library (CRUD), cooking rules management
- Key files: `app/(client)/layout.tsx`, `app/(client)/dashboard/page.tsx`, `app/(client)/recipes/page.tsx`

**`app/(cook)/`:**
- Purpose: All screens for the cook/housekeeper role. Wrapped in `layout.tsx` that requires `role === 'cook'`. UI defaults to Spanish
- Contains: Upcoming visit view, recipe reference list
- Key files: `app/(cook)/layout.tsx`, `app/(cook)/visita/page.tsx`, `app/(cook)/recetas/page.tsx`

**`app/api/`:**
- Purpose: Next.js API route handlers
- Contains: Auth callback only
- Key files: `app/api/auth/callback/route.ts`

**`components/ui/`:**
- Purpose: shadcn/ui component primitives. These are owned by shadcn — add new ones via `npx shadcn@latest add <component>`, do not hand-edit
- Contains: Headless UI building blocks (Button, Input, Card, Badge, Tabs, Select, Textarea, Sonner)

**`components/` (root-level):**
- Purpose: Domain-specific shared components used across multiple pages
- Contains: Navigation chrome (`Sidebar`, `BottomNav`), recipe display (`RecipeCard`), recipe mutation (`RecipeForm`)

**`lib/supabase/`:**
- Purpose: Supabase client factories scoped to execution environment
- Contains: Two `createClient()` exports — use `lib/supabase/server.ts` in Server Components and layouts, use `lib/supabase/client.ts` in Client Components (`'use client'` files)

**`lib/i18n/`:**
- Purpose: UI string translations and runtime language switching
- Contains: Context provider, two JSON dictionaries; access strings via `useI18n().t('key.path')`

**`supabase/migrations/`:**
- Purpose: Database schema history
- Contains: SQL files applied in order; `001_schema.sql` is the authoritative table/RLS/index definition

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Root redirect — first landing point for all users
- `proxy.ts`: Middleware — runs on every non-static request
- `app/layout.tsx`: HTML document shell

**Configuration:**
- `tsconfig.json`: Path alias `@/` maps to project root
- `components.json`: shadcn/ui component config (style, paths, Tailwind settings)
- `.env.local.example`: Template for required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `next.config.ts`: Minimal — no custom rewrites or redirects

**Core Logic:**
- `lib/types.ts`: All domain interfaces — check here before writing any new TypeScript types
- `lib/supabase/server.ts`: Server Supabase client — use in async Server Components and layouts
- `lib/supabase/client.ts`: Browser Supabase client — use in `'use client'` components
- `lib/utils.ts`: `cn()` class merger, `formatDate()` / `formatDateEs()` locale formatters

**Database:**
- `supabase/migrations/001_schema.sql`: Complete schema with all tables, RLS policies, and indexes

**Testing:**
- Not present — no test files or test framework configured

## Naming Conventions

**Files:**
- Pages: `page.tsx` (required by Next.js App Router convention)
- Layouts: `layout.tsx` (required by Next.js App Router convention)
- API routes: `route.ts` (required by Next.js App Router convention)
- Client action components co-located with their page: `kebab-case.tsx` (e.g., `archive-button.tsx`)
- Shared components: `kebab-case.tsx` (e.g., `recipe-card.tsx`, `recipe-form.tsx`)
- UI primitives: `kebab-case.tsx` matching shadcn/ui names

**Directories:**
- Route groups: `(lowercase)` with parentheses (e.g., `(auth)`, `(client)`, `(cook)`)
- Dynamic segments: `[id]` bracket notation
- Feature sub-routes: `lowercase` (e.g., `recipes/`, `visita/`)

**Exports:**
- Pages: default export named `<PascalCase>Page` (e.g., `DashboardPage`, `RecipesPage`)
- Layouts: default export named `<PascalCase>Layout`
- Shared components: named export (e.g., `export function RecipeCard`, `export function Sidebar`)
- Client action components: named export (e.g., `export function ArchiveRecipeButton`)

**TypeScript:**
- Interfaces: PascalCase in `lib/types.ts` (e.g., `Recipe`, `Profile`, `Visit`)
- Props interfaces: `<ComponentName>Props` pattern (e.g., `RecipeCardProps`, `RecipeFormProps`)

## Where to Add New Code

**New client-role page (e.g., menu planning):**
- Implementation: `app/(client)/<feature>/page.tsx`
- If interactive: mark `'use client'`, use `lib/supabase/client.ts`
- If data-only: keep as Server Component, use `lib/supabase/server.ts`
- Navigation: add entry to `navItems` array in `components/sidebar.tsx` (set `active: true` when ready)

**New cook-role page:**
- Implementation: `app/(cook)/<feature>/page.tsx`
- Navigation: add to `components/bottom-nav.tsx`

**New shared domain component:**
- Implementation: `components/<kebab-case>.tsx`
- If it uses Supabase or hooks: add `'use client'` directive

**New shadcn/ui primitive:**
- Run `npx shadcn@latest add <component>` — output goes to `components/ui/`

**New domain type:**
- Add interface to `lib/types.ts`

**New utility function:**
- Add to `lib/utils.ts` if general-purpose; inline in the page/component if single-use

**New database table:**
- Create new migration file: `supabase/migrations/00N_<description>.sql`
- Add matching TypeScript interface to `lib/types.ts`

**New i18n strings:**
- Add to both `lib/i18n/en.json` and `lib/i18n/es.json` using the same dot-path key

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No

**`.planning/`:**
- Purpose: GSD planning documents and codebase analysis
- Generated: By GSD tooling
- Committed: Yes

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`supabase/migrations/`:**
- Purpose: Database migration history
- Generated: No (hand-written)
- Committed: Yes

---

*Structure analysis: 2026-03-22*
