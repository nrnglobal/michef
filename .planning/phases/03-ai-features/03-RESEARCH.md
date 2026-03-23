# Phase 3: AI Features - Research

**Researched:** 2026-03-23
**Domain:** Anthropic Claude API (vision, prompt caching), Supabase Storage, Next.js 16 route handlers, React client-side image resizing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**A. Recipe Generation**
- D-01: "Generate" button placed next to "+ Add Recipe" on the `/recipes` library page
- D-02: Clicking opens a small modal where client picks a category and optional protein focus
- D-03: Claude returns one fully-formed recipe; presented as a pre-filled RecipeForm for review — no auto-save
- D-04: Uses Claude Sonnet; active cooking rules and recent recipe history injected as context (same pattern as suggest-menu route)

**B. Recipe Adjustment + Variants**
- D-05: AI adjustment triggered two ways: (a) dedicated "Adjust with AI" button on recipe detail page, and (b) automatic offer after client submits rating/comment
- D-06: Saving an AI-adjusted recipe replaces the original recipe (update in place) — no version branching
- D-07: "Duplicate Recipe" button on recipe detail page forks a recipe; saves as new recipe with `parent_recipe_id` FK pointing to original
- D-08: Recipes with variants displayed grouped under the original in the library — expandable row; variants not shown at top level by default
- D-09: Diff view shows ingredient-level and instruction-level changes with before/after highlighting; client can save or discard before anything is written

**C. Receipt OCR**
- D-10: Cook uploads receipt photo from `/visita` page
- D-11: Upload triggers client-side resize to ≤ 5 MB before sending to API route
- D-12: While Claude processes: spinner + "Analizando recibo..."
- D-13: On failure: "No pude leer el recibo. Intenta de nuevo." with retry — no partial data saved
- D-14: Client (not cook) reviews extracted line items and totals; extracted data populates `visits.receipt_extracted_data` JSONB and pre-fills grocery total field

**D. URL Import**
- D-15: URL import is a collapsible "Import from URL" section at top of Add Recipe form (`/recipes/new`) — no new page
- D-16: Client pastes URL → submits → Claude fetches and parses server-side → form fields auto-populated
- D-17: On parse failure: inline error "No pude importar esa receta." — partially parsed fields preserved if available

**Model Allocation**
- D-18: Claude Sonnet for recipe generation, adjustment, and URL import
- D-19: Claude Haiku for receipt OCR
- D-20: Prompt caching enabled from day one on all routes injecting static context

### Claude's Discretion
- Exact prompt wording and system prompts
- Diff highlighting UI implementation detail (CSS approach)
- Modal layout for the generate flow
- Supabase Storage bucket naming for receipt images

### Deferred Ideas (OUT OF SCOPE)
- Streaming Claude responses — defer until Next.js streaming issues resolved; single JSON response only
- Cook-side URL import — client only for Phase 3
- Multi-image receipt upload — single photo only
- Variant history / version timeline — grouping by `parent_recipe_id` is sufficient
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AIREC-01 | Client can generate a new recipe idea via Claude API using household dietary rules, preferences, and recent history as context | D-04 confirms Sonnet + suggest-menu pattern; generate-recipe route structure documented below |
| AIREC-02 | Client can leave structured feedback on a cooked recipe (1-5 star rating, feedback text, adjustment type) | `recipe_feedback` table already has all required columns; FeedbackForm component needed |
| AIREC-03 | App generates an AI-adjusted version incorporating client feedback, shown with highlighted diff of what changed | Diff rendering approach documented; adjust-recipe API route pattern documented |
| AIREC-04 | Adjusted recipe can be saved as new version (original in history) or saved as named variant | D-06 clarifies: update-in-place for AI adjustment; D-07 for duplicate/variant; `parent_recipe_id` migration needed |
| AIOCR-01 | Cook can upload receipt photo (client-side resize to ≤5 MB before upload to Supabase Storage) | Supabase Storage upload pattern documented; client-side canvas resize pattern documented |
| AIOCR-02 | App uses Claude vision to extract store name, date, line items, and total from uploaded receipt image | Claude Haiku 4.5 vision confirmed; base64 message format documented |
| AIOCR-03 | Client can review and correct extracted receipt data before saving | Review UI writes to `visits.receipt_extracted_data` JSONB; column already exists |
| AIURL-01 | Client can import a recipe by pasting a URL; Claude parses the page and populates the recipe form | Server-side URL fetch in route handler (no CORS issue); RecipeForm pre-fill pattern confirmed |
</phase_requirements>

---

## Summary

Phase 3 adds four Claude-powered features to MiChef. The project already has a working pattern for Claude API calls (`app/api/ai/suggest-menu/route.ts`) — every new AI route follows that same structure: server-side POST handler, raw `fetch` to Anthropic API, JSON response with markdown fence stripping, and `{ error, status, detail }` error shape. No Anthropic SDK is installed; raw fetch is the established convention.

The database schema already provisions every column needed for Phase 3: `recipe_feedback.ai_adjusted_recipe JSONB`, `visits.receipt_image_url`, and `visits.receipt_extracted_data JSONB` all exist in migration 001. The only schema change needed is adding `parent_recipe_id UUID REFERENCES recipes(id)` to the `recipes` table for variant support (D-07).

This project runs **Next.js 16.2.1**, which has renamed `middleware.ts` to `proxy.ts`. The project correctly uses `proxy.ts` already — no migration needed. The model IDs in use (`claude-sonnet-4-6`, `claude-haiku-4-5-20251001`) are confirmed current as of March 2026.

**Primary recommendation:** Follow the existing `suggest-menu` route pattern for all four AI routes. Build UI components as client components (`'use client'`) that call these route handlers. Never expose `ANTHROPIC_API_KEY` client-side.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.99.3 | Storage upload + DB writes | Already installed; `supabase.storage.from().upload()` is the upload API |
| `@supabase/ssr` | 0.9.0 | Server-side Supabase client in route handlers | Already installed; `createClient()` from `@/lib/supabase/server` |
| Anthropic API (raw fetch) | REST | Claude Sonnet + Haiku calls | Established project convention; no SDK installed |
| `sonner` | 2.0.7 | Toast notifications for save/error states | Already installed and used in RecipeForm |
| `lucide-react` | 0.577.0 | Icons (spinner, upload icon) | Already installed throughout the project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Browser Canvas API | built-in | Client-side image resize before upload | AIOCR-01 requires resize to ≤5 MB; no npm package needed |
| CSS variables (`var(--casa-*)`) | built-in | Diff highlighting colors | All new UI must use CSS vars, not hardcoded hex |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw fetch to Anthropic | `@anthropic-ai/sdk` | SDK adds type safety but adds a dependency; project convention is raw fetch — follow it |
| Canvas resize | `browser-image-compression` npm | npm package adds flexibility but canvas is sufficient for single-image ≤5 MB requirement |
| CSS diff highlighting | `diff` npm + `react-diff-viewer` | Libraries handle edge cases but add ~50 KB; CSS-based approach with computed diffs is sufficient for ingredient/instruction comparisons |

**Installation:** No new npm packages required for Phase 3. All dependencies are already installed.

**Version verification (npm view, 2026-03-23):**
- `@supabase/supabase-js`: 2.99.3 (confirmed installed)
- `@supabase/ssr`: 0.9.0 (confirmed installed)
- No new packages to install

---

## Architecture Patterns

### Recommended Project Structure (additions only)
```
app/
├── api/
│   └── ai/
│       ├── suggest-menu/route.ts      (existing — canonical pattern)
│       ├── generate-recipe/route.ts   (NEW — AIREC-01)
│       ├── adjust-recipe/route.ts     (NEW — AIREC-03)
│       ├── import-url/route.ts        (NEW — AIURL-01)
│       └── extract-receipt/route.ts   (NEW — AIOCR-02)
├── (client)/
│   └── recipes/
│       ├── page.tsx                   (add Generate button + modal)
│       ├── new/page.tsx               (add collapsible URL import section)
│       └── [id]/page.tsx              (add Adjust + Duplicate buttons, FeedbackForm)
└── (cook)/
    └── visita/page.tsx                (add receipt upload section)

components/
├── recipe-form.tsx                    (existing — reused for generate/URL import pre-fill)
├── generate-recipe-modal.tsx          (NEW — D-02 modal)
├── feedback-form.tsx                  (NEW — AIREC-02 structured feedback)
├── recipe-diff-view.tsx               (NEW — D-09 diff display)
├── receipt-upload.tsx                 (NEW — AIOCR-01 upload UI)
└── url-import-section.tsx             (NEW — D-15 collapsible section)

supabase/migrations/
└── 004_add_parent_recipe_id.sql       (NEW — adds parent_recipe_id to recipes)
```

### Pattern 1: Claude API Route Handler (established)
**What:** Server-side POST handler calls Anthropic API, strips markdown fences, returns parsed JSON.
**When to use:** All AI features — never call Anthropic from client components.
**Example:**
```typescript
// Source: app/api/ai/suggest-menu/route.ts (existing canonical pattern)
export async function POST(request: Request) {
  const { /* inputs */ } = await request.json()
  const supabase = await createClient()

  // 1. Fetch context data from Supabase
  // 2. Build prompt
  // 3. Call Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Claude API key not configured' }, { status: 500 })
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',   // or 'claude-haiku-4-5-20251001' for OCR
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  // 4. Strip fences + parse
  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  return Response.json(JSON.parse(clean))
}
```

### Pattern 2: Prompt Caching (system prompts with static context)
**What:** Add `cache_control` to system prompt blocks that inject static context (cooking rules, recipe list). Reduces costs on repeated calls.
**When to use:** generate-recipe and adjust-recipe routes — they inject cooking rules and recipe history which are static within a session.
**Example:**
```typescript
// Source: Anthropic docs — prompt caching with raw fetch
body: JSON.stringify({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  system: [
    {
      type: 'text',
      text: `You are a household recipe assistant. Active cooking rules: ${JSON.stringify(rules)}. Recent recipes: ${JSON.stringify(recentRecipes)}.`,
      cache_control: { type: 'ephemeral' }  // cache the static context
    }
  ],
  messages: [{ role: 'user', content: userPrompt }],  // user-specific, not cached
})
```
**Note:** Claude Sonnet 4.6 minimum cache threshold is 2,048 tokens. Only cache system prompts that will exceed this length. Monitor `usage.cache_read_input_tokens` in response to verify hits.

### Pattern 3: Claude Vision (receipt OCR)
**What:** Pass base64-encoded image in message content array. Use `claude-haiku-4-5-20251001` for speed and cost.
**When to use:** extract-receipt route (AIOCR-02).
**Example:**
```typescript
// Source: Anthropic Vision docs (verified 2026-03-23)
// Image must be base64-encoded and ≤5 MB (JPEG, PNG, GIF, or WebP supported)
body: JSON.stringify({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',  // or image/png, image/webp
            data: base64ImageData,     // string, no data: prefix
          },
        },
        {
          type: 'text',
          text: 'Extract store name, date, all line items with prices, and total. Return JSON only.',
        },
      ],
    },
  ],
})
```

### Pattern 4: Client-Side Image Resize (before upload)
**What:** Use Canvas API to resize receipt image to ≤5 MB before uploading to Supabase Storage.
**When to use:** receipt-upload.tsx component (AIOCR-01).
**Example:**
```typescript
// Source: MDN Canvas API — standard pattern, no library needed
async function resizeImageToLimit(file: File, maxBytes: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      // Scale down proportionally until estimated size is under limit
      const scale = Math.sqrt(maxBytes / file.size)
      if (scale < 1) {
        width = Math.floor(width * scale)
        height = Math.floor(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85)
    }
    img.src = url
  })
}
```

### Pattern 5: Supabase Storage Upload
**What:** Upload receipt image to Supabase Storage, get public URL, store URL in visit record.
**When to use:** receipt-upload.tsx → extract-receipt route integration.
**Example:**
```typescript
// Source: @supabase/supabase-js 2.99.3 docs
const supabase = createClient()  // browser client in component
const { data, error } = await supabase.storage
  .from('receipts')              // bucket name — Claude's discretion per CONTEXT.md
  .upload(`${visitId}/${Date.now()}.jpg`, resizedBlob, {
    contentType: 'image/jpeg',
    upsert: false,
  })
if (error) { /* handle */ }
const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(data.path)
```

### Pattern 6: RecipeForm Pre-fill (generate + URL import)
**What:** RecipeForm already accepts `recipe?: Recipe` prop. Passing a Claude-returned object pre-fills all fields. User reviews and saves normally.
**When to use:** generate-recipe modal (AIREC-01) and URL import section (AIURL-01).
**Example:**
```typescript
// Source: components/recipe-form.tsx (existing, verified)
// The form initializes state from recipe prop — just pass Claude's parsed recipe object
const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null)

// After Claude returns a recipe:
setGeneratedRecipe(claudeResponse as Recipe)

// In JSX:
{generatedRecipe && <RecipeForm recipe={generatedRecipe} />}
```

### Pattern 7: Diff Computation (ingredient and instruction changes)
**What:** Compare original recipe fields against AI-adjusted version. Render additions (green), removals (red), unchanged (neutral) using CSS variables.
**When to use:** recipe-diff-view.tsx component (D-09).
**Implementation notes:**
- Ingredients: compare arrays by `name_en` — additions, deletions, quantity/unit changes
- Instructions: compare line-by-line (split on newlines or numbered steps)
- Use CSS: `background: var(--casa-diff-add-bg)` / `var(--casa-diff-del-bg)` — or define new CSS vars for diff colors if not already in the design system
- No library needed; simple array diff is sufficient for this schema

### Anti-Patterns to Avoid
- **Calling Anthropic API from client components:** Exposes `ANTHROPIC_API_KEY`. All Claude calls go through `app/api/ai/*` route handlers.
- **Using `middleware.ts` file name:** This project uses Next.js 16 where the file convention is `proxy.ts`. The project already has `proxy.ts` correctly in place — do not rename or create a `middleware.ts`.
- **Auto-saving AI-generated content:** D-03 and D-06 both require human confirmation before any write. Never call Supabase insert/update from an AI route response without a user-triggered save action.
- **Streaming Claude responses:** Deferred per CONTEXT.md. Use single JSON response pattern throughout Phase 3.
- **Hardcoded hex colors in new components:** All new components must use `var(--casa-*)` CSS variables. Dark mode compatibility requires this.
- **Sending image data to Claude without Supabase Storage first:** For receipt OCR, upload to Supabase Storage first to get a durable URL, then read back the image bytes for base64 encoding. This gives the client a URL to store in `visits.receipt_image_url`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image size enforcement | Custom binary size checking | Canvas API resize + `toBlob()` | Canvas handles EXIF rotation, compression, and format conversion automatically |
| Markdown fence stripping from Claude | Complex regex | Existing pattern in suggest-menu/route.ts | Already battle-tested: `.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()` |
| Recipe JSON validation after Claude | Custom schema validator | TypeScript type assertion + null-safe access | Claude with good prompts returns valid structures; validate key fields only (title_en, ingredients array) |
| URL content fetching in browser | Client-side fetch with CORS workaround | Server-side fetch in route handler | No CORS issues server-side; also avoids exposing the URL to Claude through client |
| Toast notifications | Custom alert components | `sonner` (already installed) | `toast.error()` / `toast.success()` already used in recipe-form.tsx |

**Key insight:** The Claude API's structured JSON output mode (via prompt engineering "Return JSON only, no markdown") is sufficient for all Phase 3 features — no function calling or tool use needed.

---

## Common Pitfalls

### Pitfall 1: RecipeForm state not resetting on pre-fill
**What goes wrong:** If the generate modal or URL import triggers a new pre-fill after the form has already been edited, React's `useState` initialized from props won't update.
**Why it happens:** `useState(recipe?.field ?? '')` only runs on mount, not when `recipe` prop changes.
**How to avoid:** Use a `key` prop on `RecipeForm` tied to a generation counter: `<RecipeForm key={generationKey} recipe={generatedRecipe} />`. Incrementing `generationKey` unmounts/remounts the form with fresh state.
**Warning signs:** Form shows stale data from a previous generate call.

### Pitfall 2: Supabase Storage bucket not created before first upload
**What goes wrong:** `supabase.storage.from('receipts').upload()` returns a storage error if the bucket doesn't exist.
**Why it happens:** Supabase Storage buckets are created via the Supabase dashboard or SQL migration — not automatically on first upload.
**How to avoid:** Add bucket creation to migration 004, or document as a manual step in Wave 0. SQL: `INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT DO NOTHING;`
**Warning signs:** Upload returns `StorageApiError: Bucket not found`.

### Pitfall 3: Claude Haiku 4.5 prompt caching minimum threshold
**What goes wrong:** Prompt caching `cache_control` added to extract-receipt route, but cache hits never happen.
**Why it happens:** Claude Haiku 4.5 requires a minimum of 4,096 tokens to cache. Receipt OCR prompts with a single image won't typically exceed this.
**How to avoid:** Don't add prompt caching to extract-receipt route. Caching is effective on generate-recipe and adjust-recipe (which inject large cooking rules + recipe history).
**Warning signs:** `cache_creation_input_tokens` is always 0 in the response.

### Pitfall 4: Image base64 encoding in route handler
**What goes wrong:** Trying to decode a File/Blob from the request body as JSON in the route handler.
**Why it happens:** Route handlers receive JSON; binary file data needs multipart or base64 serialization.
**How to avoid:** Upload to Supabase Storage from the client component (using the browser Supabase client), then pass the storage path or public URL to the extract-receipt route. The route handler fetches the image from Supabase Storage using the service key and converts to base64.
**Warning signs:** Route handler throws on `request.json()` when client sends multipart form data.

**Alternative approach (simpler):** Client converts resized image to base64 string using `FileReader.readAsDataURL()`, sends base64 in JSON body. Route handler extracts base64 data and sends directly to Claude. Image upload to Supabase Storage is a separate parallel call. This avoids the need for the route handler to re-fetch from storage.

### Pitfall 5: `parent_recipe_id` self-referential FK migration
**What goes wrong:** Migration fails or creates circular dependency.
**Why it happens:** Self-referential FKs require `ON DELETE SET NULL` (not `CASCADE`) to prevent cascade deletion of originals.
**How to avoid:**
```sql
ALTER TABLE recipes ADD COLUMN parent_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;
```
**Warning signs:** Migration errors on `ON DELETE CASCADE` attempting to delete a parent that has variants.

### Pitfall 6: URL import fetching paywalled or bot-protected recipe sites
**What goes wrong:** Claude URL import returns empty or garbled content.
**Why it happens:** Many recipe sites (Allrecipes, NYT Cooking) block server-side fetches or require JavaScript rendering.
**How to avoid:** The route handler fetches the URL server-side and passes HTML to Claude. If the response is empty or Claude can't parse it, return the `D-17` failure message. Do not add a headless browser — it's out of scope. Preserve any partially parsed fields.
**Warning signs:** Claude returns an empty or "could not parse" response for popular recipe sites.

### Pitfall 7: RLS on `recipe_feedback` INSERT
**What goes wrong:** Feedback form submit fails silently or returns RLS error.
**Why it happens:** The existing INSERT policy on `recipe_feedback` is open to all authenticated users — this is correct. But check that the feedback form uses the browser Supabase client (not the server client), which requires an active session.
**How to avoid:** `feedback-form.tsx` must be a `'use client'` component using `createClient()` from `@/lib/supabase/client`.
**Warning signs:** INSERT to `recipe_feedback` returns 403 or RLS violation.

---

## Code Examples

Verified patterns from official sources and existing codebase:

### Vision API message structure (raw fetch, Haiku)
```typescript
// Source: Anthropic Vision docs (platform.claude.com, verified 2026-03-23)
// base64Data: string — no "data:image/jpeg;base64," prefix, raw base64 only
{
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',  // image/jpeg | image/png | image/gif | image/webp
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: 'Extract: store name, date, line items (name + price each), subtotal, tax, total. Return JSON only, no markdown.',
        },
      ],
    },
  ],
}
```

### Prompt caching on system prompt (raw fetch, Sonnet)
```typescript
// Source: Anthropic Prompt Caching docs (platform.claude.com, verified 2026-03-23)
// Only effective when system content exceeds 2,048 tokens (Sonnet 4.6 minimum)
{
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  system: [
    {
      type: 'text',
      text: buildStaticContext(rules, recentRecipes),  // large static block
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [{ role: 'user', content: userSpecificPrompt }],
}
```

### Migration 004: parent_recipe_id
```sql
-- Source: PostgreSQL self-referential FK pattern
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS parent_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_parent_recipe_id ON recipes(parent_recipe_id);
```

### Client-side base64 conversion (for receipt upload to route)
```typescript
// Source: MDN FileReader API
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Strip the "data:image/jpeg;base64," prefix
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

### Grouping variants in recipe list query
```typescript
// Source: existing Supabase query pattern in project
// Fetch top-level recipes (no parent) + their variants
const { data: recipes } = await supabase
  .from('recipes')
  .select('*, variants:recipes!parent_recipe_id(*)')
  .is('parent_recipe_id', null)   // top-level only
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` file name | `proxy.ts` file name | Next.js v16.0.0 | Project already uses `proxy.ts` — no action needed |
| `claude-3-haiku-20240307` | `claude-haiku-4-5-20251001` | Oct 2025 | Old model deprecated April 19, 2026; must use new model ID |
| `claude-sonnet-3-5` | `claude-sonnet-4-6` | Ongoing | Project already uses `claude-sonnet-4-6` |
| Streaming route handlers (experimental) | Single JSON response | Deferred | Next.js streaming issues #61972/#56529 — non-streaming is safe default |

**Deprecated/outdated:**
- `claude-3-haiku-20240307`: Deprecated, retiring April 19, 2026. Use `claude-haiku-4-5-20251001` (alias: `claude-haiku-4-5`).
- `middleware.ts` filename: Next.js 16 uses `proxy.ts`. Project already compliant.

---

## Open Questions

1. **Supabase Storage bucket policy**
   - What we know: Bucket must exist before first upload; can be public or private
   - What's unclear: Whether a public bucket is appropriate for receipt images (they contain personal financial data)
   - Recommendation: Use a private bucket; generate signed URLs for display. Simpler alternative: upload from client to Supabase Storage via browser client (which uses the user's auth session), then pass the path to the route handler.

2. **Diff display CSS variables**
   - What we know: Project uses `var(--casa-*)` vars; diff highlighting requires add/remove colors
   - What's unclear: Whether `--casa-diff-add-bg` and `--casa-diff-del-bg` exist in the design system
   - Recommendation: Define new CSS vars in the global stylesheet; use `#F0FDF4` / `#FEF2F2` as defaults (matching existing green/red patterns in the codebase).

3. **URL import: server-side fetch headers**
   - What we know: Server-side fetch avoids CORS; some recipe sites block scrapers
   - What's unclear: Whether a custom `User-Agent` header improves success rate
   - Recommendation: Add `User-Agent: Mozilla/5.0` to the fetch call in import-url route; document that bot-protected sites will fail gracefully per D-17.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | None — see Wave 0 gaps |
| Quick run command | `npx vitest run --reporter=verbose` (after setup) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AIREC-01 | generate-recipe route returns valid Recipe shape | unit | `npx vitest run tests/api/generate-recipe.test.ts` | Wave 0 |
| AIREC-02 | feedback-form submits correct payload to Supabase | unit | `npx vitest run tests/components/feedback-form.test.ts` | Wave 0 |
| AIREC-03 | adjust-recipe route returns diff-able recipe object | unit | `npx vitest run tests/api/adjust-recipe.test.ts` | Wave 0 |
| AIREC-04 | recipe update-in-place + duplicate with parent_recipe_id | unit | `npx vitest run tests/api/recipe-mutations.test.ts` | Wave 0 |
| AIOCR-01 | resizeImageToLimit returns Blob ≤5 MB | unit | `npx vitest run tests/lib/image-resize.test.ts` | Wave 0 |
| AIOCR-02 | extract-receipt route returns expected JSON shape | unit | `npx vitest run tests/api/extract-receipt.test.ts` | Wave 0 |
| AIOCR-03 | receipt review UI renders extracted data fields | unit | `npx vitest run tests/components/receipt-review.test.ts` | Wave 0 |
| AIURL-01 | import-url route returns RecipeForm-compatible object | unit | `npx vitest run tests/api/import-url.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/` for the specific feature area
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Install vitest and test infrastructure: `npm install -D vitest @vitest/ui jsdom @testing-library/react`
- [ ] `vitest.config.ts` — framework config
- [ ] `tests/api/generate-recipe.test.ts` — covers AIREC-01
- [ ] `tests/api/adjust-recipe.test.ts` — covers AIREC-03
- [ ] `tests/api/extract-receipt.test.ts` — covers AIOCR-02
- [ ] `tests/api/import-url.test.ts` — covers AIURL-01
- [ ] `tests/lib/image-resize.test.ts` — covers AIOCR-01
- [ ] `tests/components/feedback-form.test.ts` — covers AIREC-02
- [ ] `tests/components/receipt-review.test.ts` — covers AIOCR-03

---

## Sources

### Primary (HIGH confidence)
- Anthropic Vision API docs (platform.claude.com/docs/en/docs/build-with-claude/vision, 2026-03-23) — base64 image format, size limits, supported media types
- Anthropic Prompt Caching docs (platform.claude.com/docs/en/docs/build-with-claude/prompt-caching, 2026-03-23) — cache_control format, model minimums, raw fetch structure
- Anthropic Models overview (platform.claude.com/docs/en/docs/about-claude/models/overview, 2026-03-23) — current model IDs: `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`
- `app/api/ai/suggest-menu/route.ts` — canonical project pattern for Claude calls (verified by reading)
- `supabase/migrations/001_schema.sql` — existing schema columns verified (receipt_image_url, receipt_extracted_data, ai_adjusted_recipe)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — Next.js 16.2.1 proxy.ts convention confirmed

### Secondary (MEDIUM confidence)
- `components/recipe-form.tsx` — RecipeForm prop interface and state initialization confirmed by reading
- `package.json` — dependency versions confirmed by reading
- `proxy.ts` — routing guard file confirmed as existing and correctly named

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies confirmed installed and versioned
- Architecture: HIGH — patterns derived from existing codebase and official docs
- Pitfalls: HIGH — derived from code inspection and verified API constraints
- Model IDs: HIGH — verified against Anthropic models overview (2026-03-23)

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (model IDs and API stable; 30-day estimate)
