---
phase: 03-ai-features
plan: 04
subsystem: api, ui
tags: [claude, sonnet, recipe-import, url-fetch, collapsible-ui]

requires:
  - phase: 03-01
    provides: canonical Claude API call pattern via suggest-menu route

provides:
  - POST /api/ai/import-url — server-side URL fetch + Claude Sonnet HTML parsing returning recipe JSON
  - UrlImportSection component — collapsible "Import from URL" panel above RecipeForm
  - /recipes/new updated as client component with imported recipe state management

affects:
  - recipe creation workflow
  - any future AI route additions (follow import-url pattern for no-caching per-request calls)

tech-stack:
  added: []
  patterns:
    - "URL import pattern: fetch page server-side (User-Agent + 10s timeout) → truncate to 50k chars → pass HTML to Claude Sonnet → strip fences → parse JSON"
    - "Collapsible import section: border/radius/surface vars + ChevronDown rotation toggle"
    - "RecipeForm re-initialisation via key prop increment on each import"

key-files:
  created:
    - app/api/ai/import-url/route.ts
    - components/url-import-section.tsx
  modified:
    - app/(client)/recipes/new/page.tsx

key-decisions:
  - "No prompt caching on URL import: each URL has unique content, caching would not help"
  - "Partial recipe data preserved on error: if API returns error + fields, call onImported with available fields per D-17"
  - "/recipes/new converted from server to client component to manage importedRecipe + importKey state locally"

patterns-established:
  - "import-url route: validate url → check API key → fetch with User-Agent + AbortSignal.timeout → truncate → Claude call → strip fences → check parsed.error → return"

requirements-completed:
  - AIURL-01

duration: 2min
completed: 2026-03-23
---

# Phase 3 Plan 4: URL Import Summary

**Collapsible URL import on /recipes/new: paste any recipe URL, Claude fetches + parses HTML server-side, RecipeForm pre-fills with structured bilingual recipe data**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T20:37:43Z
- **Completed:** 2026-03-23T20:39:33Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- POST /api/ai/import-url fetches page server-side (avoids CORS), truncates to 50k chars, calls Claude Sonnet to extract a bilingual recipe-shaped JSON
- UrlImportSection component: collapsible panel with URL input, Globe import button, Loader2 spinner during load, inline error on failure
- /recipes/new updated to client component; importKey + importedRecipe state drives RecipeForm re-initialisation on each successful import

## Task Commits

1. **Task 1: Create import-url API route** - `ab99c26` (feat)
2. **Task 2: Create UrlImportSection component and wire into /recipes/new page** - `f673c91` (feat)

## Files Created/Modified

- `app/api/ai/import-url/route.ts` - POST handler: URL fetch, Claude Sonnet parse, 400/422/502/500 error shapes
- `components/url-import-section.tsx` - Collapsible import UI with loading/error states, calls onImported callback
- `app/(client)/recipes/new/page.tsx` - Converted to client component, renders UrlImportSection above RecipeForm

## Decisions Made

- No prompt caching on URL import: every URL request has unique HTML content; caching would provide zero benefit
- D-17 partial preservation: when error + partial fields present, onImported is still called with available data before showing error
- /recipes/new must be a client component (useState for importedRecipe + importKey); no server-side data fetching needed on this page

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required. Requires `ANTHROPIC_API_KEY` env var already expected from Phase 3 Plan 1.

## Next Phase Readiness

- AIURL-01 fully implemented: client can import a recipe by pasting a URL (D-15, D-16, D-17, D-18)
- Pattern established for per-request Claude calls without caching
- Ready to proceed to remaining Phase 3 plans

---
*Phase: 03-ai-features*
*Completed: 2026-03-23*

## Self-Check: PASSED

- app/api/ai/import-url/route.ts: FOUND
- components/url-import-section.tsx: FOUND
- .planning/phases/03-ai-features/03-04-SUMMARY.md: FOUND
- Commit ab99c26: FOUND
- Commit f673c91: FOUND
