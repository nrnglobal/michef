---
phase: quick
plan: 260325-eue
subsystem: recipes
tags: [image, recipe-card, recipe-form, spoonacular, url-import, migration]
dependency_graph:
  requires: []
  provides: [recipe-image-url]
  affects: [recipe-card, recipe-form, recipe-detail, spoonacular-import, url-import]
tech_stack:
  added: []
  patterns: [conditional-render-on-optional-field, og-image-extraction]
key_files:
  created:
    - supabase/migrations/007_add_recipe_image_url.sql
  modified:
    - lib/types.ts
    - components/recipe-card.tsx
    - components/recipe-form.tsx
    - app/(client)/recipes/[id]/page.tsx
    - app/api/spoonacular/detail/route.ts
    - app/api/ai/import-url/route.ts
decisions:
  - Plain img tag used (not next/image) to avoid external domain configuration
  - onError handler hides broken image rather than showing a broken icon
  - og:image extraction happens before Claude call; Claude also asked for image_url as fallback
metrics:
  duration: "~10 minutes"
  completed: "2026-03-25"
  tasks: 2
  files: 6
---

# Quick Task 260325-eue: Add Image Support to Recipes

**One-liner:** Recipe image_url column, type field, card thumbnail, detail hero image, form input, and auto-population from Spoonacular (data.image) and URL import (og:image + Claude extraction).

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Migration, type, and API route updates | f015249 | 007_add_recipe_image_url.sql, lib/types.ts, app/api/spoonacular/detail/route.ts, app/api/ai/import-url/route.ts |
| 2 | Display images on RecipeCard and detail page, add form input | e8036d4 | components/recipe-card.tsx, app/(client)/recipes/[id]/page.tsx, components/recipe-form.tsx |

## What Was Built

### Migration
`supabase/migrations/007_add_recipe_image_url.sql` adds `image_url TEXT` column to the recipes table using `ADD COLUMN IF NOT EXISTS` for idempotency.

### Type Update
`lib/types.ts` Recipe interface now has `image_url?: string` after `youtube_url`.

### RecipeCard
`components/recipe-card.tsx` renders a 128px (`h-32`) thumbnail image at the top of each card when `recipe.image_url` is truthy. Plain `img` tag with `object-cover`. `onError` handler sets `display: none` so a broken URL does not show a broken image icon.

### Recipe Detail Page
`app/(client)/recipes/[id]/page.tsx` renders a full-width max-height-72 (`max-h-72`) image block between the AI actions section and the title, when `r.image_url` is set.

### Recipe Form
`components/recipe-form.tsx`:
- `imageUrl` state initialized from `recipe?.image_url ?? ''`
- `image_url: imageUrl.trim() || null` added to the insert/update payload
- YouTube/Tags row expanded to 3-column grid (`md:grid-cols-3`), with Image URL input placed between YouTube URL and Tags

### Spoonacular Import
`app/api/spoonacular/detail/route.ts` maps `data.image` from the Spoonacular response to `image_url` in the returned object. When the form receives this pre-filled data, the `imageUrl` state picks it up via the `recipe` prop initializer.

### URL Import
`app/api/ai/import-url/route.ts`:
- Extracts `og:image` meta tag from raw HTML before truncation
- Includes `"image_url"` in the Claude JSON format spec so the AI can also extract it from page content
- After parsing Claude's JSON, merges `ogImage` into `parsed.image_url` if Claude didn't find one

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The `image_url` field is fully wired: DB column exists, type updated, form saves it, card and detail page render it, import flows populate it.

## Self-Check: PASSED
- supabase/migrations/007_add_recipe_image_url.sql: FOUND
- lib/types.ts image_url field: FOUND
- Commits f015249 and e8036d4: FOUND
- TypeScript compiles clean: CONFIRMED
