# Coding Conventions

**Analysis Date:** 2026-03-22

## Naming Patterns

**Files:**
- React page components: `page.tsx` (Next.js App Router convention)
- React layout components: `layout.tsx` (Next.js App Router convention)
- API route handlers: `route.ts` (Next.js App Router convention)
- Reusable UI components: kebab-case, e.g. `recipe-card.tsx`, `recipe-form.tsx`, `bottom-nav.tsx`
- shadcn/ui primitives: kebab-case in `components/ui/`, e.g. `button.tsx`, `badge.tsx`, `select.tsx`
- Library modules: kebab-case, e.g. `lib/supabase/client.ts`, `lib/supabase/server.ts`
- Type definition files: single word, e.g. `lib/types.ts`, `lib/utils.ts`

**Functions:**
- Exported components: PascalCase named exports, e.g. `export function RecipeCard(...)`, `export function RecipeForm(...)`
- Default page exports: PascalCase default exports, e.g. `export default function RecipesPage()`
- Event handlers: camelCase prefixed with `handle`, e.g. `handleLogin`, `handleSubmit`, `handleToggle`
- Async data helpers: camelCase descriptive verb-noun, e.g. `fetchRecipes`, `createClient`
- Utility helpers: camelCase, e.g. `formatDate`, `formatDateEs`, `getNestedValue`, `interpolate`
- Local callbacks without event origin: plain camelCase verb, e.g. `addIngredient`, `removeIngredient`, `updateIngredient`

**Variables:**
- State variables: camelCase descriptive noun, e.g. `recipes`, `loading`, `search`, `category`, `saving`
- Constants (module-level arrays/records): SCREAMING_SNAKE_CASE, e.g. `CATEGORIES`, `UNITS`
- Destructured data aliases: short camelCase, e.g. `const r = recipe as Recipe`, `const t = en`

**Types and Interfaces:**
- Domain model interfaces: PascalCase in `lib/types.ts`, e.g. `Recipe`, `Ingredient`, `Profile`, `Visit`
- Props interfaces: PascalCase suffixed with `Props`, defined locally in the same file, e.g. `RecipeCardProps`, `RecipeFormProps`, `ArchiveRecipeButtonProps`, `SidebarProps`
- Type aliases: PascalCase, e.g. `type Language = 'en' | 'es'`, `type Translations = typeof en`
- Context value types: PascalCase suffixed with `Value`, e.g. `I18nContextValue`
- Page props: `PageProps` as local interface, e.g. `interface PageProps { params: Promise<{ id: string }> }`

## Code Style

**Formatting:**
- No dedicated formatter config detected (no `.prettierrc`, no Biome config)
- Style observed: single quotes for strings in TypeScript/TSX files
- No trailing semicolons on object property lines; semicolons present at end of statements vary — most files appear to omit trailing semicolons in object/destructure contexts but use them in function bodies
- Indentation: 2 spaces throughout

**Linting:**
- ESLint 9 with flat config at `eslint.config.mjs`
- Rules: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- No custom rule overrides defined beyond default ignores

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Path alias `@/*` maps to project root — use `@/` for all internal imports
- `moduleResolution: "bundler"` — modern resolution, no `.js` extension needed on imports
- Type assertions used when Supabase returns untyped data: `(data as Recipe[]) ?? []`
- `type` keyword used for imports where only types are needed: `import type { Recipe } from '@/lib/types'`

## Import Organization

**Order observed (top to bottom):**
1. React and framework imports (`'react'`, `'next/navigation'`, `'next/link'`)
2. Third-party library imports (`'lucide-react'`, `'sonner'`)
3. Internal UI components (`@/components/ui/...`, `@/components/...`)
4. Internal lib/utility modules (`@/lib/supabase/client`, `@/lib/utils`, `@/lib/i18n/config`)
5. Internal types (`import type { ... } from '@/lib/types'`)
6. Co-located imports (e.g. `./archive-button`)

**Path Aliases:**
- `@/` — root of the project (defined in `tsconfig.json`). Use this for all non-relative imports.
- Relative imports used only for co-located files in the same directory (e.g. `./archive-button`)

## Client vs Server Component Declaration

- Server Components (default): no directive, used in `layout.tsx`, `page.tsx` files that perform data fetching with `createClient()` from `@/lib/supabase/server`
- Client Components: `'use client'` at the very top of the file (before all imports), used for components with `useState`, `useEffect`, event handlers, `useRouter`, `usePathname`
- Interactive sub-components extracted from server-rendered pages into separate files, e.g. `archive-button.tsx` is `'use client'` while the parent `page.tsx` is a Server Component

## Error Handling

**Patterns:**
- Supabase mutations: destructure `{ error }` from result, check with `if (error) { ... }` then early return
- Supabase reads: destructure `{ data }`, use nullish coalescing `?? []` or `?? defaultValue` for missing data
- Auth errors: set local `error` state string, render inline in JSX
- Toast notifications for user-visible operation results: `toast.error(...)` on failure, `toast.success(...)` on success (via `sonner`)
- Server Component not-found: call `notFound()` from `next/navigation` when required data is absent
- Silent catch in Supabase cookie setter: bare `catch {}` with comment explaining the Server Component context
- No `try/catch` blocks used in client mutation handlers — error is read from Supabase result object

**No global error boundary or centralized error logger is present.**

## Logging

**Framework:** None — no logging library detected.

**Patterns:**
- No `console.log`, `console.error`, or `console.warn` calls found anywhere in the codebase
- User-facing errors surfaced via `toast.error()` (sonner) or inline `error` state in JSX

## Comments

**When to Comment:**
- Inline section comments used in JSX to label blocks, e.g. `{/* Header */}`, `{/* Category Tabs */}`, `{/* Ingredients */}`
- Explanatory inline comments used for non-obvious logic, e.g. `// The setAll method was called from a Server Component.`
- No JSDoc or TSDoc annotations observed anywhere

## Function Design

**Size:** Functions are self-contained and focused. Page components are longer (50–200+ lines) because they combine data fetching and rendering in a single component. Form components are the largest single files (`recipe-form.tsx` at ~410 lines).

**Parameters:**
- Component props typed via local `interface Props` or inline destructuring
- Handler functions are typically zero-argument (closures over state) or receive index/field identifiers
- Async handlers always accept `e: React.FormEvent` for form submissions

**Return Values:**
- All React components return JSX directly — no wrapper objects
- Utility functions return typed primitives (`string`, formatted dates)
- Async handlers: `void` return (no explicit return on success path, early `return` on error)

## Module Design

**Exports:**
- Named exports for reusable components: `export function RecipeCard(...)`, `export function RecipeForm(...)`
- Default exports for Next.js pages and layouts: `export default function DashboardPage()`
- Mixed in `lib/i18n/config.tsx`: named exports for `I18nProvider` and `useI18n`

**Barrel Files:**
- None used. All imports reference specific files directly, e.g. `@/components/recipe-card` not `@/components`

## Styling Conventions

**Approach:** Tailwind CSS utility classes as primary styling. Inline `style` props used for brand-specific color values (hex codes not in the Tailwind palette).

**Color palette applied via inline style:**
- Primary text: `#1A1410`
- Secondary text: `#6B5B3E`, `#9B8B70`
- Brand accent / interactive: `#8B6914`
- Background: `#FAFAF8`, `#FFFFFF`
- Border: `#E8E0D0`, `#F0EBE0`

**cn() helper:** Use `cn(...)` from `@/lib/utils` whenever combining conditional Tailwind classes.

**shadcn/ui components** (`@/components/ui/`): built on `@base-ui/react` primitives with `class-variance-authority` variants. Always use `variant` and `size` props before adding inline styles.

---

*Convention analysis: 2026-03-22*
