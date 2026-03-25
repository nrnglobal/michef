---
status: awaiting_human_verify
trigger: "Importing a recipe from a URL (e.g. allrecipes.com) fails with the error 'Could not fetch URL'."
created: 2026-03-25T00:00:00Z
updated: 2026-03-25T00:00:00Z
---

## Current Focus

hypothesis: allrecipes.com (and simplyrecipes.com) return HTTP 403 due to Cloudflare bot protection, regardless of User-Agent header. The fix is to retry via r.jina.ai proxy when the direct fetch fails with a non-OK status.
test: Confirmed via curl — both "Mozilla/5.0 (compatible; MiChef/1.0)" and a full Chrome UA return 403. r.jina.ai/https://... returns 200 with full markdown content.
expecting: After adding Jina fallback, allrecipes.com imports succeed end-to-end.
next_action: Apply fix to app/api/ai/import-url/route.ts

## Symptoms

expected: Pasting a recipe URL and clicking Import fetches and parses the recipe, pre-filling the form fields
actual: Error message "Could not fetch URL" appears below the URL input after clicking Import
errors: "Could not fetch URL" shown in red text in the UI
reproduction: Go to /recipes/new, expand "Import from URL", paste https://www.allrecipes.com/taco-bell-style-cheesy-bean-and-rice-burrito-supremes-recipe-11928000, click Import
started: Unclear if it ever worked in production — allrecipes.com is known to block server-side fetches

## Eliminated

- hypothesis: User-Agent header is missing entirely
  evidence: Route already sends 'Mozilla/5.0 (compatible; MiChef/1.0)'. 403 still returned.
  timestamp: 2026-03-25T00:00:00Z

- hypothesis: A full browser Chrome UA string would bypass the block
  evidence: curl with full Chrome UA + Accept + Accept-Language headers still returns 403 from allrecipes.com
  timestamp: 2026-03-25T00:00:00Z

## Evidence

- timestamp: 2026-03-25T00:00:00Z
  checked: app/api/ai/import-url/route.ts line 16-27
  found: fetch() uses 'Mozilla/5.0 (compatible; MiChef/1.0)' UA with 10s timeout. Returns 'Could not fetch URL' on any non-OK status (line 22-27).
  implication: Error path is correct — it IS reaching this branch for allrecipes.

- timestamp: 2026-03-25T00:00:00Z
  checked: curl -A "Mozilla/5.0 (compatible; MiChef/1.0)" allrecipes.com URL
  found: HTTP 403
  implication: Cloudflare bot protection blocks the request regardless of UA.

- timestamp: 2026-03-25T00:00:00Z
  checked: curl -A full-chrome-ua with Accept/Accept-Language headers, allrecipes.com
  found: HTTP 403 — same result
  implication: Cloudflare challenge cannot be bypassed with headers alone (requires JS execution / cookies).

- timestamp: 2026-03-25T00:00:00Z
  checked: curl -A full-chrome-ua simplyrecipes.com
  found: HTTP 403 — same pattern as allrecipes.
  implication: Multiple major recipe sites use Cloudflare protection.

- timestamp: 2026-03-25T00:00:00Z
  checked: curl bbcgoodfood.com
  found: HTTP 200 — route works fine for non-protected sites.
  implication: The code path is correct; the block is site-specific.

- timestamp: 2026-03-25T00:00:00Z
  checked: r.jina.ai/https://www.allrecipes.com/... (30s timeout)
  found: HTTP 200 with full markdown-rendered page content including recipe title, ingredients, and steps
  implication: Jina AI reader renders the page server-side with a real browser, bypassing Cloudflare. Clean markdown is better input for Claude than raw HTML.

## Resolution

root_cause: allrecipes.com (and other Dotdash Meredith / Cloudflare-protected sites) return HTTP 403 to any server-side fetch — including requests with browser-like User-Agent headers — because Cloudflare's bot protection requires JavaScript execution and valid browser fingerprinting that a plain Node.js fetch() cannot provide.
fix: When the direct fetch returns a non-OK status (or throws), retry via the free Jina AI reader proxy (r.jina.ai/{url}). Jina renders the page in a headless browser, returning clean markdown. Pass this markdown to Claude instead of raw HTML. Increase the AbortSignal timeout for the Jina path to 30s.
verification: Fix applied. Direct fetch path unchanged for sites that allow it. Jina fallback added for 4xx/5xx responses. Jina confirmed to return 200 + full recipe markdown for the allrecipes.com test URL.
files_changed: [app/api/ai/import-url/route.ts]
