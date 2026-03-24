# Phase 3: AI Features - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Four AI-powered capabilities added to the client and cook experience:
1. **Recipe generation** — Claude generates a new recipe from household preferences and rules
2. **Recipe adjustment** — Claude adjusts an existing recipe based on client feedback; saves over the original
3. **Receipt OCR** — Cook uploads receipt photo; Claude Vision extracts line items and totals for client review
4. **URL import** — Client pastes a recipe URL; Claude parses it into a pre-filled Add Recipe form

Bilingual messaging and payment tracking are Phase 4. Offline support is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### A. Recipe Generation Entry Point
- **D-01:** "✨ Generate" button placed next to "+ Add Recipe" on the `/recipes` library page — keeps generation discoverable without cluttering the detail or add-recipe pages
- **D-02:** Clicking opens a small modal where client picks a category and optional protein focus as input parameters
- **D-03:** Claude returns **one** fully-formed recipe; it is presented as a pre-filled `RecipeForm` (the existing edit form) for the client to review, tweak, and save — no auto-save
- **D-04:** Uses Claude Sonnet; active cooking rules and recent recipe history are injected as context (same pattern as suggest-menu route)

### B. Recipe Adjustment + Variants
- **D-05:** AI adjustment is triggered **two ways**: (a) a dedicated "Adjust with AI" button on the recipe detail page, and (b) an automatic offer ("Want Claude to adjust this recipe based on your feedback?") shown after the client submits a rating/comment via the feedback form
- **D-06:** Saving an AI-adjusted recipe **replaces** the original recipe (update in place) — no version branching
- **D-07:** Separately, a "Duplicate Recipe" button on the recipe detail page lets the client fork a recipe into a variant; the duplicate saves as a new recipe with a `parent_recipe_id` FK pointing to the original
- **D-08:** In the recipe library, recipes with variants are displayed **grouped under the original** — expandable row (e.g., "Energy Balls ▾ + 2 variants"); variants are not shown at the top level by default
- **D-09:** Diff view shows ingredient-level and instruction-level changes with before/after highlighting; client can save or discard before anything is written

### C. Receipt OCR
- **D-10:** Cook uploads receipt photo from the **`/visita` page** — the visit screen is the natural post-shopping context
- **D-11:** Upload triggers client-side resize to ≤ 5 MB before sending to the API route
- **D-12:** While Claude processes: spinner + "Analizando recibo..." on the cook's screen
- **D-13:** On failure: "No pude leer el recibo. Intenta de nuevo." with a retry button — cook can try a clearer photo; no partial data is saved
- **D-14:** Client (not cook) reviews extracted line items and totals; extracted data populates `visits.receipt_extracted_data JSONB` and pre-fills the grocery total field (used in Phase 4 payment tracking)

### D. URL Import
- **D-15:** URL import is a collapsible **"Import from URL"** section at the top of the existing Add Recipe form (`/recipes/new`) — no new page
- **D-16:** Client pastes URL → submits → Claude fetches and parses the page server-side → form fields auto-populated; client reviews and saves normally
- **D-17:** On parse failure: inline error "No pude importar esa receta." — client falls back to manual entry; partially parsed fields are preserved if available

### AI Model Allocation
- **D-18:** Claude Sonnet for recipe generation, adjustment, and URL import (quality matters)
- **D-19:** Claude Haiku for receipt OCR (fast, vision-capable, cost-effective for structured extraction)
- **D-20:** Prompt caching enabled from day one on all routes that inject static context (rules, recipe list)

### Claude's Discretion
- Exact prompt wording and system prompts
- Diff highlighting UI implementation detail (CSS approach)
- Modal layout for the generate flow
- Supabase Storage bucket naming for receipt images

</decisions>

<specifics>
## Specific Ideas

- Variant grouping in the recipe list should feel like product variants (e.g., a product with size options) — expandable, not a separate list
- "Adjust with AI" should feel like a natural next step after leaving feedback, not a buried setting
- Receipt upload on `/visita` — the cook just cooked and shopped, so uploading the receipt is the natural last step before leaving

</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above.

### Schema (existing — read before planning)
- `supabase/migrations/001_schema.sql` §recipe_feedback — `ai_adjusted_recipe JSONB`, `adjustment_type`, `adjustment_detail` columns already present
- `supabase/migrations/001_schema.sql` §visits — `receipt_image_url TEXT`, `receipt_extracted_data JSONB` columns already present
- `supabase/migrations/001_schema.sql` §recipes — needs `parent_recipe_id UUID REFERENCES recipes(id)` column added via migration for variant support

### Existing AI route pattern
- `app/api/ai/suggest-menu/route.ts` — canonical pattern for Claude API calls: fetch to Anthropic, JSON response, markdown fence stripping, error passthrough

### Existing components to reuse
- `components/recipe-form.tsx` — RecipeForm accepts optional `recipe` prop for pre-fill; used by both edit and new pages; generation and URL import should render this same component
- `app/(client)/recipes/[id]/page.tsx` — add "Adjust with AI" and "Duplicate Recipe" buttons to the action row
- `app/(client)/recipes/new/page.tsx` — add collapsible URL import section above the form

### Blocker to resolve in research
- STATE.md blocker: Streaming Claude responses and abort handling have open Next.js issues (#61972, #56529) — research needed before writing any streaming code; non-streaming (single JSON response) is the safe default

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/recipe-form.tsx` — RecipeForm with all fields; accepts `recipe?: Recipe` for pre-population; generation and URL import simply pass a Claude-returned object as the initial value
- `app/api/ai/suggest-menu/route.ts` — established fetch → strip fences → parse JSON → return pattern; all new AI routes should follow the same error shape `{ error, status, detail }`
- `lib/types.ts RecipeFeedback` — feedback type with `ai_adjusted_recipe`, `adjustment_type`, `adjustment_detail` already typed
- `lib/types.ts Visit` — `receipt_image_url`, `receipt_extracted_data` already typed

### Established Patterns
- All Claude API calls: server-side POST route in `app/api/ai/*/route.ts`, never in Server Actions or client components
- Error shape: `{ error: string, status: number, detail: object }` — keeps frontend diagnosis consistent
- CSS vars for all colors (`var(--casa-*)`) — any new UI components must follow this pattern
- Dark mode compatible: all new components must use CSS variable colors, not hardcoded hex

### Integration Points
- Generate modal → RecipeForm → `/recipes/new` save flow (or direct Supabase insert)
- Adjustment → `recipe_feedback` table row → `ai_adjusted_recipe` JSONB → update `recipes` row on confirm
- Receipt upload → Supabase Storage → Claude Vision API route → `visits.receipt_extracted_data`
- URL import → new AI route → RecipeForm pre-fill → existing save flow
- Variant grouping → requires `parent_recipe_id` on `recipes` table → recipe list query must group by parent

</code_context>

<deferred>
## Deferred Ideas

- Streaming Claude responses for generation — defer until Next.js streaming issues (#61972, #56529) are resolved; use single JSON response for now
- Cook-side URL import — client only for Phase 3
- Multi-image receipt upload — single photo only for Phase 3
- Variant history / version timeline — too complex for Phase 3; grouping by parent_recipe_id is sufficient

</deferred>

---

*Phase: 03-ai-features*
*Context gathered: 2026-03-23*
