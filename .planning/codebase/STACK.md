# Technology Stack

**Analysis Date:** 2026-03-22

## Languages

**Primary:**
- TypeScript 5.9.x - All application code (`app/`, `components/`, `lib/`)
- SQL - Database schema and migrations (`supabase/migrations/`)

**Secondary:**
- CSS - Tailwind v4 utility classes via `app/globals.css`
- JSON - Translation files (`lib/i18n/en.json`, `lib/i18n/es.json`)

## Runtime

**Environment:**
- Node.js v24.14.0

**Package Manager:**
- npm
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.2.1 - Full-stack React framework (App Router, RSC, API Routes)
- React 19.2.4 - UI rendering

**UI Component System:**
- shadcn (v4.1.0) - Component generation CLI; style `base-nova`
- @base-ui/react ^1.3.0 - Headless UI primitives underlying shadcn components
- Tailwind CSS v4 - Utility-first CSS; configured via `@tailwindcss/postcss` PostCSS plugin
- tw-animate-css ^1.4.0 - Animation utilities imported in `app/globals.css`

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript compiler (`tsc`) - Type checking; config at `tsconfig.json`
- ESLint v9 with `eslint-config-next` - Linting; config at `eslint.config.mjs`
- PostCSS - CSS processing; config at `postcss.config.mjs`

## Key Dependencies

**Critical:**
- `@supabase/ssr` ^0.9.0 - Server-side Supabase client for Next.js App Router (SSR-safe cookie handling)
- `@supabase/supabase-js` ^2.99.3 - Supabase JavaScript client (auth, database queries)
- `next-themes` ^0.4.6 - Dark/light theme management (referenced in CSS variables but not yet wired into root layout)

**UI Utilities:**
- `clsx` ^2.1.1 - Conditional class name composition
- `tailwind-merge` ^3.5.0 - Merge Tailwind classes without conflicts; used in `lib/utils.ts` `cn()` helper
- `class-variance-authority` ^0.7.1 - Typed component variant definitions
- `lucide-react` ^0.577.0 - Icon library (configured as shadcn icon library)
- `sonner` ^2.0.7 - Toast notification library; wired into root layout via `@/components/ui/sonner`

**i18n:**
- Custom React Context implementation at `lib/i18n/config.tsx` - no external i18n library; supports `en` and `es`

**Fonts:**
- Geist Sans via `next/font/google` loaded in `app/layout.tsx`

## Configuration

**Environment:**
- Template: `.env.local.example` (present; never committed)
- Required vars:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key
  - `ANTHROPIC_API_KEY` - Anthropic Claude API (Phase 2, not yet integrated)
- Auth middleware (`proxy.ts`) skips Supabase when env vars are absent, enabling dev/demo mode without credentials

**Build:**
- `next.config.ts` - Minimal; no custom rewrites or webpack config
- `tsconfig.json` - Path alias `@/*` maps to project root; bundler module resolution
- `components.json` - shadcn configuration; aliases for `@/components`, `@/lib`, `@/hooks`

## Platform Requirements

**Development:**
- Node.js v24+ (observed runtime)
- npm
- Supabase project (or run without env vars for demo mode)

**Production:**
- Deployment target: Not explicitly configured; compatible with Vercel (Next.js default) or any Node.js host
- No Dockerfile or platform-specific config detected

---

*Stack analysis: 2026-03-22*
