---
phase: 03-ai-features
plan: 02
subsystem: ai-features
tags: [claude-api, recipe-generation, modal, prompt-caching]
dependency_graph:
  requires: [03-01]
  provides: [AIREC-01]
  affects: [app/api/ai/generate-recipe/route.ts, components/generate-recipe-modal.tsx, app/(client)/recipes/page.tsx]
tech_stack:
  added: []
  patterns: [prompt-caching-ephemeral, key-prop-rerender, client-side-modal]
key_files:
  created:
    - app/api/ai/generate-recipe/route.ts
    - components/generate-recipe-modal.tsx
  modified:
    - app/(client)/recipes/page.tsx
    - lib/i18n/en.json
    - lib/i18n/es.json
decisions:
  - Added anthropic-beta prompt-caching-2024-07-31 header alongside cache_control on system prompt per D-20
  - Generate button placed before Add Recipe button as outlined div with casa-primary border (not filled) to visually differentiate
  - Generated recipe preview shown inline below header (not replacing list) so client can compare with existing recipes
key_decisions:
  - Prompt caching uses anthropic-beta header + cache_control ephemeral on system prompt to cache rules/history context
metrics:
  duration: 3 minutes
  completed: 2026-03-24
  tasks_completed: 2
  files_created: 3
  files_modified: 5
---

# Phase 3 Plan 02: Recipe Generation Summary

Recipe generation via Claude Sonnet: client picks category + optional protein in modal, API fetches rules/history/feedback as cached context, Claude returns bilingual recipe that pre-fills RecipeForm for review and save.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create generate-recipe API route | 3659a56 | app/api/ai/generate-recipe/route.ts |
| 2 | Create GenerateRecipeModal and wire into recipes page | 50017c5 | components/generate-recipe-modal.tsx, app/(client)/recipes/page.tsx, lib/i18n/*.json |

## What Was Built

### Task 1: generate-recipe API route

`POST /api/ai/generate-recipe` follows the canonical suggest-menu pattern exactly:

1. Fetches active cooking rules from `cooking_rules` table
2. Fetches 20 most-recent active recipe titles (for deduplication context)
3. Fetches 10 most-recent feedback entries (for preference context)
4. Guards on missing `ANTHROPIC_API_KEY` (500)
5. Calls Claude Sonnet with prompt caching via `cache_control: { type: 'ephemeral' }` on system prompt and `anthropic-beta: 'prompt-caching-2024-07-31'` header
6. Handles non-ok response (502) and JSON parse failure (500)
7. Strips markdown fences before parsing via `.replace(/^```(?:json)?\s*/i, '')`

### Task 2: GenerateRecipeModal + recipes page integration

`GenerateRecipeModal` (`'use client'`):
- Category select using same CATEGORIES array as recipe-form.tsx
- Optional protein focus text input
- Loader2 animate-spin during generation
- Error display (red text, modal stays open)
- Backdrop click to close
- All colors via CSS vars

Recipes page changes:
- Generate button (Sparkles icon, outline style) placed before Add Recipe
- On generation success: recipe stored in state, dismissible preview card shown below header
- `<RecipeForm key={genKey} recipe={generatedRecipe as Recipe} />` re-renders from fresh state on each generation
- X button dismisses preview card

## Decisions Made

- Prompt caching uses `anthropic-beta` header required by Anthropic API plus `cache_control: { type: 'ephemeral' }` on system prompt block — caches the rules/recipes/feedback context across requests
- Generate button is outline style (not filled) to visually distinguish from the primary Add Recipe action
- Generated recipe shown inline below header (not replacing library) so client can compare generated recipe against existing ones before saving

## Deviations from Plan

### Auto-additions

**1. [Rule 2 - Missing critical functionality] Added anthropic-beta header for prompt caching**
- **Found during:** Task 1
- **Issue:** The `cache_control` field on the system message block requires the `anthropic-beta: 'prompt-caching-2024-07-31'` request header to activate caching; without it the field is silently ignored
- **Fix:** Added `'anthropic-beta': 'prompt-caching-2024-07-31'` to fetch headers
- **Files modified:** app/api/ai/generate-recipe/route.ts

**2. [Rule 2 - Missing critical functionality] Added i18n strings for GenerateRecipeModal**
- **Found during:** Task 2
- **Issue:** Modal uses `t('generateRecipe.*')` keys that didn't exist in dictionaries — would render raw key strings
- **Fix:** Added `generateRecipe` section to both en.json and es.json
- **Files modified:** lib/i18n/en.json, lib/i18n/es.json

## Known Stubs

None. All data sources are wired: API fetches live Supabase data, modal calls live API, RecipeForm is the real production form.

## Verification

- `npx tsc --noEmit`: PASS (zero errors)
- API route: all acceptance criteria met (POST export, claude-sonnet-4-6, cache_control, createClient, ANTHROPIC_API_KEY, fence-stripping regex, error shapes)
- Modal: 'use client', GenerateRecipeModal export, fetch('/api/ai/generate-recipe')
- Recipes page: GenerateRecipeModal import, Sparkles icon, showGenerate state, RecipeForm key={genKey}

## Self-Check: PASSED

Files created:
- FOUND: app/api/ai/generate-recipe/route.ts
- FOUND: components/generate-recipe-modal.tsx
- FOUND: .planning/phases/03-ai-features/03-02-SUMMARY.md

Commits:
- FOUND: 3659a56 (feat(03-02): create generate-recipe API route)
- FOUND: 50017c5 (feat(03-02): create GenerateRecipeModal and wire into recipes page)
