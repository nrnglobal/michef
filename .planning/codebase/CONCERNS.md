# Codebase Concerns

**Analysis Date:** 2026-03-22

---

## Tech Debt

**`proxy.ts` is not wired as Next.js middleware:**
- Issue: The auth/route-protection logic lives in `proxy.ts` but there is no `middleware.ts` file at the project root. Next.js middleware must be exported from a file named `middleware.ts` (or `middleware.js`). The `proxy.ts` file exports a `proxy` function and a `config` object, but nothing imports or re-exports them as `middleware`. The result is that all role-based route protection and session-refresh logic in `proxy.ts` is silently never executed.
- Files: `proxy.ts`
- Impact: Route protection (cook vs. client separation, redirect of unauthenticated users) falls entirely on layout-level checks. Any route without a layout guard is open to any authenticated user regardless of role. Session tokens are never refreshed at the edge, which can cause stale-auth bugs.
- Fix approach: Rename `proxy.ts` to `middleware.ts` and export `proxy` as the default export (or rename the function to `middleware`). Alternatively, create `middleware.ts` that re-exports the function. Verify the `config.matcher` is also re-exported.

**Duplicate profile fetches on every request:**
- Issue: `app/page.tsx`, `app/(client)/layout.tsx`, `app/(cook)/layout.tsx`, and `proxy.ts` each independently call `supabase.from('profiles').select(...)` to determine user role. On a single page load this query runs 2–3 times (middleware + layout + root redirect).
- Files: `proxy.ts`, `app/page.tsx`, `app/(client)/layout.tsx`, `app/(cook)/layout.tsx`
- Impact: Extra database round-trips on every authenticated request. Increases latency and Supabase quota usage.
- Fix approach: Encode role in the JWT claims (Supabase custom claims) or store role in a server cookie during auth callback, so layouts can read it without a DB query.

**`CATEGORIES` array is duplicated across three files:**
- Issue: The hard-coded category list `['beef', 'chicken', 'seafood', 'veggies', 'snacks', 'carbs', 'soups', 'salads', 'other']` is copy-pasted identically in `components/recipe-form.tsx` (line 22), `app/(client)/recipes/page.tsx` (line 14), and `app/(cook)/recetas/page.tsx` (categoryLabels object). Spanish translations of category names are also duplicated between `lib/i18n/es.json` and the `categoryLabels` inline object in `app/(cook)/recetas/page.tsx`.
- Files: `components/recipe-form.tsx`, `app/(client)/recipes/page.tsx`, `app/(cook)/recetas/page.tsx`
- Impact: Any category change requires edits in multiple places. The Spanish translations in `recetas/page.tsx` can drift from `es.json`.
- Fix approach: Extract a shared `RECIPE_CATEGORIES` constant to `lib/constants.ts` and import it everywhere. Use i18n translations for labels in all locations.

**`updated_at` manually set on client in recipe form:**
- Issue: `components/recipe-form.tsx` (line 113) sets `updated_at: new Date().toISOString()` from client-side JS on every update. The database schema does not have a trigger to maintain this field automatically.
- Files: `components/recipe-form.tsx`, `supabase/migrations/001_schema.sql`
- Impact: `updated_at` will be wrong if system clock is skewed, or if rows are updated via Supabase dashboard or other paths. Client-side timestamps are also a minor trust boundary issue.
- Fix approach: Add a Postgres trigger (`BEFORE UPDATE` using `NOW()`) on the `recipes` table so the DB controls the timestamp. Remove the manual `updated_at` field from the client payload.

**Language is hardcoded in layout, ignoring stored user preference:**
- Issue: `app/(client)/layout.tsx` always passes `initialLanguage="en"` and `app/(cook)/layout.tsx` always passes `initialLanguage="es"` to `<I18nProvider>`. The `Profile` type has a `language` field, and the `i18n/config.tsx` provider stores language in `localStorage`, but the layout never reads `profile.language` to initialize it correctly.
- Files: `app/(client)/layout.tsx`, `app/(cook)/layout.tsx`, `lib/i18n/config.tsx`, `lib/types.ts`
- Impact: A client user who prefers Spanish will always see English on first load (hydration override from localStorage happens after render, causing flash). The `profile.language` DB field is unused dead data.
- Fix approach: Pass `profile.language` as `initialLanguage` in the layout, which already has the profile object available.

**`app/(client)/recipes/page.tsx` fetches all recipes without pagination:**
- Issue: The recipe list page (a client component) fetches the entire `recipes` table with `.select('*')` and no `.limit()` call, filtered only by optional category and a basic `ilike` on `title_en`.
- Files: `app/(client)/recipes/page.tsx`
- Impact: As the recipe library grows this becomes a large payload fetched on every search keystroke (debounced at 300ms). Also, the `ilike` search only searches `title_en`, so Spanish-titled recipes are invisible when searched in English by substring.
- Fix approach: Add `.limit()` and offset-based or cursor pagination. Use Postgres full-text search against `title_en` and `title_es` combined (a GIN index on `title_es` is missing — only `title_en` has one).

---

## Security Considerations

**RLS policies grant all authenticated users full write access to all tables:**
- Risk: Every RLS policy uses `TO authenticated USING (true) WITH CHECK (true)`, meaning any authenticated user (client OR cook) can insert, update, or delete any recipe, any cooking rule, any visit, any menu plan, any shopping list, etc. There is no ownership column on most tables, so row-level isolation is completely absent.
- Files: `supabase/migrations/001_schema.sql` (lines 173–291)
- Current mitigation: Route-level checks in layouts prevent obvious UI-driven cross-role actions. The missing middleware (`proxy.ts`) means even route protection is incomplete.
- Recommendations: Add an `owner_id` or `client_id` FK to tables where data is per-user (e.g. `cooking_rules`, `shopping_lists`). Scope RLS policies using `auth.uid()` comparisons, or at minimum scope write policies to specific roles using a helper function that checks `profiles.role`.

**`next` redirect parameter in auth callback is not validated:**
- Risk: `app/api/auth/callback/route.ts` (line 7) takes a `next` query parameter and redirects to `${origin}${next}` without validating it. Any value is accepted, including absolute URLs to external domains (open redirect).
- Files: `app/api/auth/callback/route.ts`
- Current mitigation: None.
- Recommendations: Validate that `next` is a relative path starting with `/` before using it. Reject or sanitise any value that does not match `/[a-zA-Z0-9/_-]*`.

**Supabase URL/key fall back to placeholder strings in server client:**
- Risk: `lib/supabase/server.ts` (lines 8–9) falls back to `'https://placeholder.supabase.co'` and `'placeholder-key'` when environment variables are absent. This means a misconfigured production deployment silently connects to a non-existent project rather than failing visibly.
- Files: `lib/supabase/server.ts`
- Current mitigation: Requests will fail at network level.
- Recommendations: Remove the fallback strings and throw a descriptive error at startup if required env vars are absent. The browser client in `lib/supabase/client.ts` correctly uses the `!` non-null assertion instead — keep that pattern.

---

## Performance Bottlenecks

**N+1 query pattern in `app/(cook)/visita/page.tsx`:**
- Problem: Three sequential Supabase queries are made: fetch visit, then fetch menu plan, then fetch menu plan items, then fetch recipes. Each depends on the previous result.
- Files: `app/(cook)/visita/page.tsx` (lines 20–65)
- Cause: No use of Supabase relational query (`.select('*, menu_plans(*, menu_plan_items(*, recipes(*)))')`) which would collapse this to one round-trip.
- Improvement path: Use a single nested select with foreign key relationships, or use `Promise.all` for independent requests.

**Full table scan on `recipes` for cook recipe list:**
- Problem: `app/(cook)/recetas/page.tsx` fetches all active recipes with `.select('*')` and groups them in-memory. No limit.
- Files: `app/(cook)/recetas/page.tsx`
- Cause: No pagination, no server-side grouping.
- Improvement path: Add `.limit()` or paginate. Group by category using a Postgres query rather than JavaScript `reduce`.

**Missing full-text index on `recipes.title_es`:**
- Problem: The schema creates a GIN full-text index on `title_en` only (`idx_recipes_title_en`). The recipe search in `app/(client)/recipes/page.tsx` uses `ilike` (not full-text search), and `title_es` has no index at all.
- Files: `supabase/migrations/001_schema.sql` (line 300), `app/(client)/recipes/page.tsx`
- Cause: Search was implemented with `ilike` instead of `@@` full-text operators, so the GIN index is unused anyway.
- Improvement path: Add a GIN index on `title_es`. Replace `ilike` with Postgres full-text search across both title columns.

---

## Fragile Areas

**`app/(client)/recipes/[id]/archive-button.tsx` — stale `isActive` prop after toggle:**
- Files: `app/(client)/recipes/[id]/archive-button.tsx`
- Why fragile: The component receives `isActive` as a prop from the server-rendered page. After `router.refresh()`, the server re-renders and passes the updated value. If the refresh is slow or fails, the button UI reverts to its original label while actually being in the new state in the DB. There is no optimistic update.
- Safe modification: Add local `isActive` state initialised from the prop so the button label updates immediately on success without relying on refresh timing.
- Test coverage: No tests.

**`lib/i18n/config.tsx` — missing translation key falls back to the key string:**
- Files: `lib/i18n/config.tsx` (line 27 — `return path`)
- Why fragile: `getNestedValue` returns the raw dotted key string when a translation is missing (e.g. `"recipes.categories.beef"`). There is no warning or error. The sidebar and category tabs use `t(\`recipes.categories.${cat}\`)` with dynamic keys, so a new category added to the constant array but not to the JSON files will silently display the key path in the UI.
- Safe modification: Always add categories to both `lib/i18n/en.json` and `lib/i18n/es.json` together. Consider adding a dev-mode console.warn when a key falls back to the path string.
- Test coverage: No tests.

**`app/(client)/rules/page.tsx` — `fetchRules` called as bare function inside event handler (stale closure risk):**
- Files: `app/(client)/rules/page.tsx` (lines 42–50, 102)
- Why fragile: `fetchRules` is defined inside the component but not wrapped in `useCallback`, so its reference changes on every render. It's also called directly inside `handleAddRule` after a successful insert. This works now but is one refactor away from becoming a stale closure issue if state dependencies are added.
- Safe modification: Wrap `fetchRules` in `useCallback` with stable deps, or switch to the pattern used in `recipes/page.tsx` which uses `useCallback` + `useEffect`.
- Test coverage: No tests.

---

## Missing Critical Features

**No middleware file — route protection is layout-only:**
- Problem: `proxy.ts` exports middleware logic but is never loaded as Next.js middleware. Any route without its own layout guard (e.g. API routes, direct URL navigation before hydration) has no protection.
- Blocks: True role-based access control and session refresh at the edge.

**No CRUD UI for visits, menu plans, shopping lists, or messages:**
- Problem: The database schema defines `visits`, `menu_plans`, `menu_plan_items`, `shopping_lists`, `shopping_list_items`, `messages`, and `fridge_staples` tables. The sidebar lists "Menu Planning", "Shopping Lists", "Finances", and "Messages" as "Soon". Only the cook's `/visita` page reads visit data (read-only). There is no UI to create or manage visits, build menu plans, or generate shopping lists.
- Blocks: The core workflow of scheduling visits, assigning menus, and tracking payments is entirely missing from the UI.

**Recipe search only matches `title_en`, not `title_es` or other fields:**
- Problem: `app/(client)/recipes/page.tsx` search query uses `.ilike('title_en', ...)` exclusively. Searching by Spanish title, ingredient name, tag, or description returns no results.
- Blocks: Useful recipe discovery.

**No profile management UI:**
- Problem: The `profiles` table stores `name` and `language` per user, but there is no settings page to update them. The `profile.language` field is never used to drive the i18n provider.
- Blocks: User preference persistence.

---

## Test Coverage Gaps

**No application-level tests exist:**
- What's not tested: All application code — auth flows, recipe CRUD, archive/restore, rule management, cook views, i18n resolution, data fetching, form validation.
- Files: Entire `app/`, `components/`, `lib/` directories.
- Risk: Any refactor, new Next.js version upgrade, or Supabase schema change can break functionality silently.
- Priority: High

**No middleware/route-protection tests:**
- What's not tested: The `proxy.ts` logic for unauthenticated redirect, role-based routing, and login redirect for already-authenticated users.
- Files: `proxy.ts`
- Risk: Auth bypass or redirect loops go undetected.
- Priority: High

---

*Concerns audit: 2026-03-22*
