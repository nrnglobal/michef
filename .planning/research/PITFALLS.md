# Domain Pitfalls

**Domain:** Bilingual household cook management — AI features, messaging, receipt OCR, offline support
**Researched:** 2026-03-22
**Applies to:** Phase 2 (Menu Planning), Phase 3 (AI Features), Phase 4 (Communication & Finance), Phase 5 (Polish)

---

## Critical Pitfalls

Mistakes that cause rewrites, data corruption, or complete feature failure.

---

### Pitfall 1: Supabase Realtime Silently Delivers No Messages When RLS Is Enabled

**What goes wrong:** Postgres Changes subscriptions return no events even when the underlying rows change. No error is thrown. The WebSocket connects successfully. The subscription appears healthy.

**Why it happens:** Supabase Realtime checks RLS policies on behalf of each subscriber. To do this it needs SELECT permission granted explicitly to the `supabase_realtime` role. If that grant is missing, the realtime server cannot evaluate the policy, silently drops every event, and the client receives nothing. On top of this, RLS policies are not evaluated at all for DELETE events — the record is already gone and cannot be checked.

**Consequences:** Messaging feature appears broken despite correct application code. Hours wasted debugging the WebSocket, channel name, or subscription filter before the root cause (missing role grant) is found.

**Prevention:**
1. After creating every table that uses Realtime, explicitly run: `GRANT SELECT ON [table] TO supabase_realtime;`
2. Add this grant to migrations, not just ad-hoc SQL, so it survives schema resets.
3. For DELETE events, always poll or use a soft-delete pattern (set `deleted_at`) so the row is still readable when the change fires.
4. Test subscriptions using the client SDK from a browser session with a real user token — not the SQL Editor (which bypasses RLS entirely).

**Warning signs:** Subscription callback never fires; Supabase dashboard shows row changes but client receives nothing; no console errors.

**Phase:** Phase 4 (Messaging).

---

### Pitfall 2: Streaming Response Crashes With Unhandled Abort When the Client Navigates Away

**What goes wrong:** The Next.js API route streams a Claude response via `ReadableStream`. The client navigates away before the stream finishes. Node throws an uncaught `ResponseAborted` or `ERR_INVALID_STATE: ReadableStream is already closed` error that can crash the worker.

**Why it happens:** `ReadableStream` in Next.js App Router API routes does not automatically suppress writes after the client disconnects. If the stream controller tries to enqueue after abort, it throws. This is a known open issue with multiple threads in the Next.js GitHub discussions (vercel/next.js #61972, #56529).

**Consequences:** Server error logs fill with noise; in some configurations the streamed request leaks a Claude API call that was never read, wasting tokens; in edge runtimes the isolated worker crashes and affects other requests.

**Prevention:**
1. Wrap every `controller.enqueue()` call in a check against `request.signal.aborted`.
2. Add an `AbortSignal` listener: `request.signal.addEventListener('abort', () => controller.close())`.
3. Wrap the entire stream body in a `try/catch` and call `controller.close()` in the `finally` block.
4. Pass `request.signal` into the Anthropic SDK call so Claude's HTTP connection is also cancelled upstream, stopping token spend.

**Warning signs:** `ResponseAborted` errors in production logs; Claude API usage spikes on pages with navigation-heavy UX.

**Phase:** Phase 3 (AI Features — recipe generation, adjustment, OCR).

---

### Pitfall 3: Receipt Photo Sent as Raw Mobile Camera JPEG Blows Past 5 MB API Limit

**What goes wrong:** A phone camera photo at default settings is 4–12 MB. The Claude API enforces a hard 5 MB per-image limit for the Messages API. The upload succeeds (Supabase Storage accepts large files), but the subsequent Claude vision call returns a 400 error at runtime.

**Why it happens:** The app stores the receipt image in Supabase Storage, then reads it back and base64-encodes it to send to Claude. No resize step exists in between. The official docs note the hard limit is 5 MB per image via the API (distinct from the 10 MB claude.ai UI limit).

**Consequences:** Receipt OCR silently fails after upload; the cook sees a spinner or error with no actionable feedback; finance tracking cannot be completed.

**Prevention:**
1. Resize and compress images client-side before upload using the browser `Canvas` API or a library like `browser-image-compression`. Target < 1.15 megapixels (per Anthropic's recommended ceiling for optimal time-to-first-token).
2. Enforce 1092×1092 px maximum (the 1:1 optimal dimension from official docs) since receipts are roughly portrait.
3. Convert to JPEG at 85% quality before sending.
4. Log the final byte size before the API call to catch regressions early.

**Warning signs:** Occasional 400 errors on OCR endpoint; error messages referencing image size; works in testing (where screenshots are small) but fails in production (where real phone photos are used).

**Phase:** Phase 3 (Receipt OCR).

---

### Pitfall 4: Service Worker Caches Stale App Shell and Cook Is Stuck on Old UI

**What goes wrong:** After deploying a new version, the cook's phone continues loading the cached app shell. The old service worker stays active until every open tab is closed — which may never happen if she keeps the tab open in her browser throughout a shopping trip.

**Why it happens:** Service workers are long-lived by design. The new worker registers in a `waiting` state and only activates when all controlled clients close. If the cook opens the app at the grocery store and never closes it, she may use the old version for hours or days.

**Consequences:** UI shows stale shopping list data or old recipe text; emergency fixes (typos in ingredient names, price corrections) are invisible to the cook until she manually clears the cache.

**Prevention:**
1. In the service worker's `activate` event, call `self.skipWaiting()` combined with `clients.claim()` to force immediate takeover. Evaluate whether this is safe for the cook's open sessions.
2. Show a toast "New version available — tap to refresh" using `navigator.serviceWorker.addEventListener('controllerchange')` in the app shell.
3. Cache the cook's shopping list data in IndexedDB (not the Cache API) so it survives service worker updates independently of the shell cache.
4. Disable the service worker in development entirely (Serwist supports `disable: process.env.NODE_ENV === 'development'`) to avoid development-cache hell.

**Warning signs:** Cook reports seeing old recipes after a deploy; `skipWaiting` not called in `activate` event; no update notification UI exists.

**Phase:** Phase 5 (Offline Support).

---

### Pitfall 5: RLS Policies Use `TO authenticated USING (true)` — Any User Can Modify Any Row

**What goes wrong:** The existing RLS policies (confirmed in CONCERNS.md) grant every authenticated user full INSERT/UPDATE/DELETE on every table. In Phase 4, the cook gains the ability to upload receipts and send messages. With current policies, she can also edit or delete recipes, cooking rules, and menu plans she should never touch.

**Why it happens:** Phase 1 used blanket `TO authenticated USING (true)` policies as a placeholder. There is no `owner_id` or role check on most tables.

**Consequences:** Data integrity breach; accidental or malicious modification of client-owned data (recipes, rules, menu plans) by the cook; impossible to audit who changed what.

**Prevention:**
1. Before Phase 2 ships any write operations, add a helper function `is_client()` that checks `(SELECT role FROM profiles WHERE id = auth.uid()) = 'client'` and use it in write policies.
2. For messages: scope `INSERT` to the sender's own user ID (`auth.uid() = sender_id`); scope `SELECT` to participants only.
3. For receipts/uploads: scope `INSERT` to the cook role; scope `SELECT` to both roles (it is a shared document).
4. Fix middleware (`proxy.ts` → `middleware.ts`) as a prerequisite so route protection is not layout-only.

**Warning signs:** The current CONCERNS.md audit already flags this as a security issue; any new table added without role-scoped policies inherits the same vulnerability.

**Phase:** Address in Phase 2 before any new write surfaces are added. Affects Phases 3 and 4.

---

## Moderate Pitfalls

### Pitfall 6: Claude Translation Drifts From Mexican Spanish Into Neutral/Castilian Spanish

**What goes wrong:** Claude's default Spanish output tends toward a neutral Latin American or Castilian register. For a cook in Playa del Carmen, vocabulary mismatches cause confusion: "zumo" instead of "jugo", "patata" instead of "papa", formal "usted" forms instead of familiar "tú" or regional "vos" patterns, or ignoring Nahuatl-origin food words that are everyday vocabulary in Mexico ("jitomate" vs "tomate", "elote" vs "maíz").

**Why it happens:** LLM training corpora are weighted toward written Spanish from multiple regions. Without explicit regional instruction, the model defaults to a prestige neutral register that feels foreign to a Playa del Carmen native speaker.

**Consequences:** Cook finds instructions awkward or confusing; credibility of the app erodes; cooking errors from misunderstood ingredient names.

**Prevention:**
1. In every translation and recipe-generation system prompt, specify: "Respond in Mexican Spanish as spoken in Playa del Carmen, Quintana Roo. Use Mexican vocabulary: jitomate (not tomate rojo), papa (not patata), jugo (not zumo), cacahuate (not maní). Use tú (not usted) for instructions."
2. Build and maintain a cooking glossary in `lib/constants.ts` with canonical Spanish terms for ingredients used in this household. Include it in relevant system prompts.
3. For Phase 4 message translation, add a spot-check flow: after Claude translates a message, optionally show both the source and translation so the client can verify before sending.
4. Never translate in isolation — always include culinary context in the prompt (e.g., "this is a recipe instruction for a Mexican home cook").

**Warning signs:** Cook feedback that words are "strange" or "from Spain"; ingredient names not matching local market labels; "usted" forms appearing in recipe instructions.

**Phase:** Phase 3 (recipe generation), Phase 4 (messaging translation).

---

### Pitfall 7: Ingredient Consolidation Merges Incompatible Items or Refuses Obvious Duplicates

**What goes wrong:** When generating a consolidated shopping list from multiple recipes, the consolidation logic either: (a) fails to merge "1 diente de ajo" and "2 dientes de ajo" into "3 dientes de ajo", or (b) incorrectly merges "200g pechuga de pollo" (chicken breast) and "200g muslo de pollo" (thigh) into "400g pollo" — violating Andrea's dietary rule that she eats breast only.

**Why it happens:** String matching on ingredient names without semantic understanding conflates different items. Unit mismatches (grams vs. cups vs. pieces) prevent numeric aggregation. Recipe ingredients use free-text descriptions rather than structured `{quantity, unit, ingredient}` tuples.

**Consequences:** Shopping list is wrong; cook buys the wrong cut of meat; dietary rules are violated after surviving the menu validation step.

**Prevention:**
1. Store ingredients as structured data (`{quantity: number, unit: string, ingredient: string, notes: string}`) in the recipe schema from the start of Phase 2, not as free text.
2. During consolidation, only aggregate items where the `ingredient` field matches exactly (normalised to lowercase, singular form) AND the `unit` is compatible (same unit type: mass–mass, volume–volume, count–count).
3. Never auto-merge items that differ by a qualifier that maps to a dietary rule (breast/thigh/whole, salmon/shrimp/generic seafood). Match against the dietary rules list before consolidating.
4. Add a "review consolidated list" step in the client UI before the list is finalised — show what was merged and flag anything ambiguous.

**Warning signs:** Shopping list items disappearing that should be separate; quantity totals that are obviously wrong; merged items that violate the cooking rules listed in PROJECT.md.

**Phase:** Phase 2 (Shopping List generation).

---

### Pitfall 8: Claude API Costs Grow Unexpectedly Due to Long System Prompts Repeated on Every Request

**What goes wrong:** Each Phase 3 AI call (recipe generation, adjustment, translation) includes a large system prompt containing all dietary rules, preferences, and cooking constraints. At ~800–1200 tokens per system prompt, sending this on every request adds up quickly, especially for the translation use case in Phase 4 where every message generates a call.

**Why it happens:** System prompts are not cached by default. The project plans to use Claude Sonnet for all AI features ($3/MTok input). With two users sending dozens of messages, recipe adjustments, and OCR calls, input token accumulation is the dominant cost driver at Tier 1 limits.

**Consequences:** Monthly Claude API spend grows faster than expected; Tier 1 rate limits (30,000 ITPM for Sonnet) throttle the app during busy cooking-prep sessions (Tuesday/Friday afternoons).

**Prevention:**
1. Enable prompt caching (`cache_control: {type: "ephemeral"}`) on the system prompt block for all requests. Cached tokens cost 0.1x on reads after the first write, giving a 90% discount on repeated system prompts.
2. Keep the system prompt under 1024 tokens (the minimum for caching to be cost-effective). Extract the full rules list and pass only the relevant subset per call type (OCR does not need dietary rules; translation does not need recipe structure instructions).
3. Use Claude Haiku (not Sonnet) for pure translation tasks in Phase 4 where quality requirements are lower. Reserve Sonnet for recipe generation and adjustment where output quality matters.
4. Log `usage.input_tokens` and `usage.output_tokens` on every API response in development. Set a per-request alert threshold.

**Warning signs:** API spend increasing faster than user activity; rate limit 429 errors appearing mid-session; response times degrading (Tier 1 ITPM limit reached).

**Phase:** Phase 3 (AI Features), Phase 4 (Translation).

---

### Pitfall 9: OCR Extraction Returns Inconsistent JSON Structure, Breaking the Parser

**What goes wrong:** Claude's receipt OCR returns the extracted line items in a slightly different JSON structure on each call — sometimes nesting totals inside `items`, sometimes as a top-level key, sometimes omitting fields when they are unclear in the image. The application parser throws or silently drops data.

**Why it happens:** Without a strict output schema enforced in the prompt, Claude will use "reasonable" JSON structures that vary based on what it sees in the image. Receipts from different Mexican grocery stores (Walmart, Chedraui, local mercado) have different layouts and information densities.

**Consequences:** Receipt line items are partially imported or fail entirely; finance tracking has inconsistent data; the cook gets a confusing error after uploading.

**Prevention:**
1. Specify an exact JSON schema in the system prompt and instruct Claude to always return that structure even when fields are unknown (`null` values, not omitted keys).
2. Example schema to enforce: `{ "store": string|null, "date": string|null, "items": [{name: string, qty: number|null, unit_price: number|null, total: number|null}], "subtotal": number|null, "total": number|null, "currency": "MXN" }`.
3. Use Zod to validate and parse the response before committing to the database. Any validation failure returns a structured error to the UI rather than crashing.
4. Instruct Claude to output prices in MXN as plain numbers (no "$" symbol) to avoid parsing issues with the peso sign.

**Warning signs:** Occasional 500 errors on the OCR endpoint correlated with specific receipt photos; database receipt records with `null` totals that should have values.

**Phase:** Phase 3 (Receipt OCR).

---

### Pitfall 10: `_en` / `_es` Fields Drift Out of Sync When Only One Language Is Updated

**What goes wrong:** An AI-generated recipe is saved with both `title_en` and `title_es` populated. Later, the client edits only the English title in the recipe form (which shows English fields). The Spanish title in the database now describes a different recipe than the English one. The cook sees the outdated Spanish version.

**Why it happens:** CONCERNS.md confirms that the codebase already has precedent for this: the `categoryLabels` inline object in `app/(cook)/recetas/page.tsx` has drifted from `es.json`. The same pattern will repeat for dynamic content unless enforced at the form and API level.

**Consequences:** Cook receives incorrect Spanish recipe names or instructions; trust in the bilingual system erodes; dietary violations possible if a substituted ingredient is not reflected in the Spanish version.

**Prevention:**
1. In the recipe edit form, show both `_en` and `_es` fields side by side. Never hide the other language. Make it visually obvious when they differ (character count mismatch, staleness indicator).
2. When the client edits only the English text, automatically queue a re-translation via Claude and update the `_es` field. Flag it as "auto-translated, pending review" until the client confirms.
3. Add a Postgres `CHECK` constraint or trigger that sets a `translation_needs_review` boolean when `updated_at` is newer than `translated_at`.
4. For the existing category label drift in `recetas/page.tsx`: fix as part of Phase 2 setup by extracting to `lib/constants.ts` (already flagged in CONCERNS.md).

**Warning signs:** Cook reports recipe names that do not match what the client set up; `title_en` and `title_es` describe different dishes in the database; Spanish text referencing ingredients excluded by household rules.

**Phase:** Phase 2 setup (category drift fix), Phase 3 (recipe generation saves both fields atomically).

---

## Minor Pitfalls

### Pitfall 11: Duplicate Supabase Realtime Subscriptions From Unmounted Components

**What goes wrong:** In Phase 4, the messaging component subscribes to the `messages` table on mount. If the component re-renders (e.g. React Strict Mode double-invoke in development, or a navigation that keeps the component alive), a second subscription is created. Events are received twice, causing duplicate messages in the UI.

**Prevention:** Always return a cleanup function from `useEffect` that calls `supabase.removeChannel(channel)`. Use a ref to track whether a subscription is already active before creating a new one. Test in React Strict Mode explicitly.

**Phase:** Phase 4 (Messaging).

---

### Pitfall 12: iOS PWA Does Not Prompt Install and Has Limited Service Worker Support

**What goes wrong:** On iOS, the "Add to Home Screen" banner does not appear automatically (it must be triggered manually by the user via the Share menu). Additionally, some PWA features like Background Sync are not available in iOS Safari, and IndexedDB quota enforcement differs from Android Chrome.

**Prevention:** Add a visible in-app instruction for iOS users explaining how to install (with a screenshot of the Share icon). Do not rely on `BackgroundSync` for the offline-to-online data sync; use a foreground sync triggered when the cook's page regains focus (`window.addEventListener('online')`). Test the offline shopping list flow on a real iOS device, not just Chrome DevTools.

**Phase:** Phase 5 (Offline Support).

---

### Pitfall 13: Supabase Environment Variable Falls Back to Placeholder String in Production

**What goes wrong:** CONCERNS.md confirms that `lib/supabase/server.ts` falls back to `'https://placeholder.supabase.co'` when `NEXT_PUBLIC_SUPABASE_URL` is unset. A misconfigured deployment silently connects to a non-existent project. All data operations return errors that are indistinguishable from network failures.

**Prevention:** Remove the fallback string. Throw a startup error instead: `if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')`. Do this before Phase 2 ships any new features.

**Phase:** Phase 2 setup (pre-requisite fix).

---

### Pitfall 14: Missing `middleware.ts` Means API Routes in Phases 3 and 4 Are Unprotected

**What goes wrong:** CONCERNS.md confirms `proxy.ts` is never loaded as Next.js middleware. When Phase 3 adds `app/api/ai/*` routes and Phase 4 adds `app/api/messages/*` routes, those endpoints have no edge-level authentication check. Any request with a valid session cookie passes through — but an unauthenticated request also reaches the route handler if the route handler itself does not call `supabase.auth.getUser()`.

**Prevention:** Rename `proxy.ts` to `middleware.ts` (or re-export) before Phase 3 adds API routes. Every API route handler must additionally call `supabase.auth.getUser()` and return 401 for unauthenticated requests — do not rely solely on middleware. Treat middleware as defence-in-depth, not the sole gate.

**Phase:** Phase 2 setup (prerequisite), Phases 3 and 4 (enforce in every new route).

---

## Phase-Specific Warning Summary

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Phase 2 — Shopping list consolidation | Merging incompatible ingredient cuts (breast vs thigh) | Structured ingredient schema + dietary rule cross-check before merge |
| Phase 2 — New tables (menu_plans, etc.) | Blank RLS policies giving cook write access to client data | Role-scoped write policies before any UI ships |
| Phase 3 — Claude recipe generation | Long system prompts burning tokens on every call | Prompt caching on system prompt block |
| Phase 3 — Recipe generation/adjustment | EN/ES fields saved but only one language updated on edit | Atomic save of both languages; re-translation trigger on edit |
| Phase 3 — Receipt OCR | Inconsistent JSON from vision model; phone photos > 5 MB | Enforce output schema via prompt + Zod; client-side resize before upload |
| Phase 3 — Streaming AI responses | Stream crash on client navigation / abort | AbortSignal propagation to Claude SDK; try/finally on stream controller |
| Phase 4 — Messaging | Realtime subscription fires nothing due to missing role grant | `GRANT SELECT ON messages TO supabase_realtime` in migration |
| Phase 4 — Translation | Neutral Spanish drifting from Mexican register | Mexican Spanish system prompt with regional vocabulary glossary |
| Phase 4 — Translation cost | Per-message Claude calls accumulate input tokens quickly | Use Haiku for translation; prompt caching on system prompt |
| Phase 5 — Offline PWA | Cook stuck on stale cached app after deploy | `skipWaiting` + update notification toast |
| Phase 5 — Offline PWA (iOS) | Background Sync not available; no auto-install prompt | Foreground sync on `online` event; manual iOS install instructions |

---

## Sources

- [Claude Vision API — Official Docs](https://platform.claude.com/docs/en/build-with-claude/vision) — image size limits, token costs, accuracy limitations (HIGH confidence)
- [Supabase Realtime Authorization — Official Docs](https://supabase.com/docs/guides/realtime/authorization) — RLS with Postgres Changes (HIGH confidence)
- [Supabase Realtime Troubleshooting — Official Docs](https://supabase.com/docs/guides/realtime/troubleshooting) — connection management (HIGH confidence)
- [Supabase RLS Issue: Updates Fail When RLS Enabled](https://github.com/supabase/supabase/issues/35195) — real-world confirmation of supabase_realtime role requirement (MEDIUM confidence)
- [LogRocket: Next.js 16 PWA with Serwist](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) — Serwist setup, offline patterns (MEDIUM confidence)
- [Serwist GitHub Discussion #191 — Server Actions + Offline](https://github.com/serwist/serwist/discussions/191) — App Router service worker gotchas (MEDIUM confidence)
- [Next.js Discussion #61972 — ResponseAborted SSE](https://github.com/vercel/next.js/discussions/61972) — streaming abort error (MEDIUM confidence)
- [Next.js Issue #56529 — uncaughtException with SSE](https://github.com/vercel/next.js/issues/56529) — streaming abort patterns (MEDIUM confidence)
- [Supabase RLS Best Practices — Leanware](https://www.leanware.co/insights/supabase-best-practices) — policy patterns (MEDIUM confidence)
- [Novita AI: Fine-tuning for Mexican Spanish Translation](https://blogs.novita.ai/how-to-finetune-llm-into-a-mexican-spanish-translator/) — regional Spanish LLM pitfalls (LOW confidence — single source)
- [Mealie Discussion #1852 — Ingredient Grouping](https://github.com/mealie-recipes/mealie/discussions/1852) — real-world ingredient consolidation problems (MEDIUM confidence)
- Claude API rate limits and prompt caching — [Anthropic rate limits docs](https://platform.claude.com/docs/en/api/rate-limits) and [support article](https://support.claude.com/en/articles/8243635-our-approach-to-rate-limits-for-the-claude-api) (HIGH confidence)
- MiChef codebase CONCERNS.md — direct audit of existing tech debt and security issues (HIGH confidence — primary source)
