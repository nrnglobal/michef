# Feature Landscape

**Domain:** Bilingual household cook management (menu planning, shopping, AI assistance, finance)
**Researched:** 2026-03-22
**Project:** MiChef — Phase 2+ features (Phase 1 complete)

---

## Context

MiChef is a two-user app (household clients + their cook). It is NOT a consumer product competing for downloads. There is no churn risk from missing a trend feature. Every "table stakes" judgment below is made relative to what these two specific users need to accomplish the core value: "The cook arrives prepared — with a confirmed menu in Spanish, a ready-to-check shopping list, and no language barrier."

---

## Feature-by-Feature Analysis

### 1. Menu Planning (assigning recipes to visit dates, AI suggestions)

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Pick a visit date and assign 2–4 recipes to it | Core app purpose — without this, nothing works downstream | Low | Date picker + recipe multi-select; no drag calendar needed (PROJECT.md confirms this decision) |
| Show the confirmed menu to the cook in Spanish | Cook must know what she is cooking before she arrives | Low | Read-only view; recipes already have `_es` fields |
| Prevent duplicate recent recipes (frequency rule) | Meal fatigue is the #1 complaint in meal planning apps; frequency rules are already in the data model | Medium | Rules engine validation on confirm |
| Block excluded ingredient/recipe combinations | Dietary rules are hard constraints, not preferences (no pork, no mole, Andrea's restrictions) | Medium | Warn at assignment, block at confirm |
| "Suggest Menu" AI button | In 2026, AI-generated plans are the baseline expectation — apps requiring full manual selection score lower in every comparison | High | Claude Sonnet call with rules + recency context |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Reasoning transparency on AI suggestions | AI meal planners that explain *why* a recipe is suggested see dramatically higher user trust and acceptance (PMC research) | Medium | Include brief rationale per suggestion: "Not cooked in 3 weeks, fits Neil's preferences" |
| Substitution suggestions on rule violations | Instead of just blocking, propose a compliant alternative | High | Requires substitution rules already in DB |
| Per-visit cook notes attached to menu plan | Client can add prep notes for the cook in English → auto-translated | Medium | Extends Message model or adds notes field to MenuPlan |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full drag-and-drop calendar UI | Over-engineered for 2-user app with 2 visits/week; PROJECT.md explicitly decided against it | Date picker on menu plan creation form |
| Nutritional tracking per meal | Not in scope; household doesn't use calorie tracking (PROJECT.md dietary rules are exclusion-based, not nutritional) | Keep cooking rules focused on ingredients/frequency |
| Multi-week planning horizon | Cook visits ~2x/week; planning horizon is "next visit"; no evidence of need for month-ahead planning | Plan one visit at a time |

---

### 2. Smart Shopping List (ingredient consolidation, category grouping, check-off UX)

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Auto-generate list from confirmed menu recipes | This is the primary output of menu planning; generating it manually defeats the purpose | Medium | Merge ingredient quantities across 2–4 recipes |
| Category grouping (produce, dairy, protein, pantry) | Standard in every grocery app; prevents backtracking in-store | Low | Categories already on Ingredient model |
| Large tap targets for check-off (min 48px) | Cook uses phone in-store; small targets are friction | Low | PROJECT.md constraint; shadcn Checkbox is configurable |
| Visual distinction between checked/unchecked | High contrast is essential — in-store lighting is variable | Low | Strikethrough + dimmed style on checked items |
| Running item count ("3 of 12 items") | Users want progress feedback; standard pattern in all grocery apps | Low | Derived from check state |
| Fridge staples section appended | Cook needs single list; staples are always there but need visibility | Low | Append as separate section, not merged, to keep clarity |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Ingredient consolidation with unit normalization | "2 cups flour" + "1 cup flour" = "3 cups flour" not two rows; Plan to Eat and Mealie both note this is a hard consolidation problem | High | Use Claude to normalize units and synonyms; exact-match merge is insufficient for real recipe data |
| Item-level notes on shopping list | Cook can note brand preference or substitution (e.g., "only EVOO, not vegetable oil") | Low | Optional note field on ShoppingListItem |
| Print/export for offline backup | If phone dies in-store, paper fallback; also useful for handing list to someone else | Low | HTML print stylesheet; Phase 5 scope |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Aisle-by-aisle custom sorting | Valuable in large supermarkets; overkill for Playa del Carmen local market context | Stick to category grouping |
| Shared real-time list (multi-user simultaneous edits) | Only one person (the cook) uses the list at a time | Single-owner check-off is sufficient |
| Barcode scanning for item addition | Shopping list is generated from recipes, not manually assembled | N/A — list generation is automated |

---

### 3. Fridge Staples Management

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| View and edit list of always-available ingredients | Staples define what does NOT need to appear on the shopping list; must be manageable | Low | Phase 1 DB model + seed data already exist |
| Append staples section to every shopping list | Cook must see them as a reminder, but separate from recipe-derived ingredients | Low | Already specified in PROJECT.md Phase 2 |
| Mark a staple as "currently out" | Running low on EVOO, sea salt, etc. — temporarily moves it to the main shopping list | Low | Boolean flag on FridgeStaple |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Currently out" flag auto-removes from excluded list when shopping list is confirmed | Closes the loop: staple was out, cook bought it, it's back | Low | Triggered by list completion or manual toggle |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Expiry date tracking | Pantry inventory apps like KitchenPal do this; it's scope creep for a 2-user cook management app | Staples are managed manually by the household |
| Barcode scanning for staple inventory | Same over-engineering argument; staples list is short and curated | Simple CRUD UI |
| AI-driven staple replenishment predictions | Not enough purchase history to train meaningfully for a 2-user household | Manual "currently out" toggle is sufficient |

---

### 4. Bilingual Messaging with Auto-Translation

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Client writes in English, cook sees Spanish | Core app value proposition — the language barrier is the explicit problem being solved | High | Claude translation server-side; never expose key to browser |
| Cook writes in Spanish, client sees English | Bidirectional; without this, the communication is one-way | High | Same translation pipeline |
| Message thread per visit | Context isolation — messages about next Tuesday's visit shouldn't mix with messages about last Friday's | Low | Visit-scoped message thread |
| Show both original and translated text | "Bilingual display mode" — transparency builds trust; lets each party verify the translation | Low | Store both `content_en` and `content_es` in DB |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Quick-action messages ("skip recipe", "buy X", "reschedule visit") | Reduces typing for the cook on a mobile keyboard; most common communications are predictable | Medium | Pre-templated messages that trigger structured actions, not just text |
| System notifications in each user's language | "Menu confirmed" → English for client, Spanish for cook | Low | Already supported by bilingual data model; just needs notification type + i18n keys |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time push notifications | PROJECT.md explicitly defers push to post-v1 | System notifications visible on next app open |
| Voice messages | Adds complexity with no identified user need; both users are comfortable with text | Text only |
| Group chat / multiple threads | Only two users; threading by visit is sufficient | Per-visit message thread |
| On-device translation | Apple's iOS 26 on-device translation is device-specific and non-programmable; Claude provides consistent server-side quality with context awareness (dietary rules, recipe names) | Server-side Claude translation |

---

### 5. Receipt Upload and AI Extraction

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Cook uploads receipt photo from phone | This is the primary trigger for the finance workflow; without it, there's no data | Low | File input → Supabase Storage; straightforward mobile UX |
| AI extracts total amount and line items | Manual transcription is error-prone and burdensome; auto-extraction is the entire point | High | Claude Vision with base64 image; returns structured JSON |
| Display extracted line items for review | AI extraction is not 100% reliable; user must confirm before amounts are saved | Low | Review screen with edit-in-place for corrections |
| Store receipt image permanently | Audit trail; household may want to verify charges later | Low | Supabase Storage with visit-scoped path |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Pre-fill visit grocery total from receipt | Closes the finance loop automatically — receipt upload → extracted total → pre-fills payment record | Medium | Connect receipt extraction output to Visit.grocery_total field |
| Multi-receipt per visit | Cook may shop at multiple stores (produce market + supermarket) | Low | Allow multiple receipt uploads per visit; sum totals |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Dedicated OCR API (Taggun, Mindee, Klippa) | Additional vendor cost and integration complexity; Claude already handles this well for MXN receipts | Use Claude with vision for OCR |
| Automatic line-item matching to shopping list | Attractive but complex; requires fuzzy matching Spanish product names to recipe ingredients | Manual review screen is sufficient for v1 |
| Email receipt forwarding | Cook doesn't use email for grocery receipts in a Playa del Carmen market context | Photo upload only |

---

### 6. Payment and Financial Tracking

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Per-visit record: grocery total + service fee | Minimum viable finance tracking; household needs to know what to pay | Low | Visit table already has cost fields in DB schema |
| Pending / paid status per visit | Without status, there's no way to know what's outstanding | Low | Enum on Visit or Payment table |
| Monthly summary (total groceries + total service fees) | Household reviews monthly spend; MXN currency | Low | Aggregate query; simple summary view |
| Mark visit as paid | Close the loop on outstanding payments | Low | Toggle action on visit |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Monthly spending trend view | Spending trends over time help household budget; mentioned explicitly in PROJECT.md Phase 5 analytics | Medium | Simple chart or table; Phase 5 scope |
| Receipt image accessible from payment record | Household can click into a payment record and see the original receipt | Low | Foreign key from payment to Supabase Storage URL |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Invoice generation / PDF export | Overkill for an informal household-cook arrangement | Simple on-screen summary |
| Integration with banking / payment apps (Venmo, etc.) | Two users paying in cash/transfer; no API integration needed | Mark-as-paid toggle |
| Multi-currency support | All amounts in MXN; no need for currency conversion | Single currency, clearly labeled |
| Tax calculation | Not a business invoicing tool | N/A |

---

### 7. Recipe Feedback and AI-Driven Adjustment

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Client submits freeform feedback on a recipe ("too spicy", "needs more lime") | Feedback is the input signal for AI adjustment; without capture, improvement is impossible | Low | Text input + optional rating; RecipeFeedback model already in DB |
| AI produces an adjusted recipe from feedback | This is the stated feature; without the adjustment output, feedback collection is a dead end | High | Claude call: original recipe + feedback → revised recipe with rationale |
| Show what changed (diff view) | Users need to understand what the AI changed to trust and use the adjusted recipe | Medium | Side-by-side original vs. adjusted, or inline change highlights; no "diff view" precedent found in cooking apps — this is a differentiator |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Feedback history visible on recipe detail | Shows the evolution of the recipe over time; builds confidence in the system | Low | List of past feedback entries with timestamps |
| Accept / reject adjusted recipe | Client may not like the adjustment; should be able to keep original or accept the new version | Low | Two-button confirmation; on accept, original is archived and adjusted version becomes active |
| Feedback informs AI menu suggestions | Recipes with negative recent feedback are deprioritized in "Suggest Menu" | Medium | Pass recent feedback context into the suggestion prompt |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Star-rating-only feedback | A 3-star rating gives Claude no actionable signal for adjustment | Require freeform text; star rating is optional decoration |
| Automatic recipe replacement on feedback | Risky; the cook has learned the current version | Explicit accept/reject step |
| Community recipe ratings | This is a private household app, not a recipe platform | N/A |

---

### 8. Offline Shopping List Support

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Shopping list loads and functions without internet | Cook uses phone in-store; Mexican mobile data in markets is unreliable | High | Service worker + IndexedDB cache; PWA pattern |
| Check-off works offline | The primary interaction happens in-store; offline read-only is insufficient | High | Writes to IndexedDB, sync to Supabase on reconnect via Background Sync |
| Visual indicator when offline | MDN and PWA best practices: always show connectivity state | Low | "Offline" banner or status dot; don't just silently fail |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Background sync on reconnect | Check-offs made offline sync automatically without cook having to do anything | Medium | Background Sync API; not universally supported — graceful fallback to "sync now" button |

#### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full app offline support | Only the shopping list needs offline capability; recipe library, messaging, payments require connectivity | Scope service worker cache to shopping list route only |
| Push notifications for sync completion | PROJECT.md defers push; and sync is silent/automatic | Silent background sync |

---

## Feature Dependencies

```
Receipt Upload → Receipt AI Extraction → Payment Record Pre-fill
                                       ↓
Menu Planning (date + recipes) → Rules Engine Validation
                              ↓
                    Menu Confirmation → Shopping List Generation
                                     → Cook Notification (message)
                                     ↓
                           Shopping List → Offline Cache (service worker)
                                        → Check-off UX (cook, mobile)

Recipe Feedback → AI Adjustment → Accept/Reject
               → Suggestion Engine (deprioritize in AI menu suggestions)

Fridge Staples → Shopping List (append as section)
              → AI Suggestions (exclude from ingredient lists)
```

---

## MVP Recommendation (Phase 2 scope)

Prioritize for Phase 2 (Menu Planning & Shopping):

1. Menu plan creation: date picker + recipe assignment (no calendar widget)
2. Rules engine validation at confirmation time (frequency + exclusion)
3. "Suggest Menu" AI button with brief rationale per suggestion
4. Auto-generate consolidated shopping list on menu confirmation
5. Category-grouped shopping list with ingredient consolidation via Claude
6. Cook's mobile check-off view (large targets, running count, offline cache)
7. Fridge staples appended as separate section

Defer to Phase 3+:
- Recipe feedback + AI adjustment (Phase 3 — depends on usage data first)
- Receipt OCR (Phase 3 — Claude Vision call)
- Bilingual messaging (Phase 4 — communication layer)
- Payment tracking (Phase 4 — finance layer)
- Offline PWA / service worker (Phase 5 — polish; the shopping list must exist before it can be cached)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Menu planning UX patterns | HIGH | Multiple 2025–2026 sources on meal planning app behavior; AI suggestion as baseline confirmed |
| Shopping list UX | HIGH | Well-documented; grocery app patterns stable for years; consolidation challenge well-evidenced |
| Fridge staples UX | MEDIUM | General pantry app research; MiChef's "staples append" pattern is simpler than tracked inventory |
| Bilingual messaging UX | MEDIUM | Real-time translation patterns well-documented (Apple iOS 26, Slatch); server-side via Claude is MiChef-specific |
| Receipt OCR UX | HIGH | Clear industry consensus on photo-capture → review → confirm flow |
| Payment tracking UX | MEDIUM | General household finance app patterns apply; MiChef's case is simpler (two users, cash) |
| Recipe feedback + AI adjustment | MEDIUM | Feedback loop patterns found; "diff view" pattern not found in cooking apps — treating as novel/differentiator |
| Offline PWA | HIGH | MDN, Fishtank Next.js PWA guide, and HTTP Archive data all consistent on IndexedDB + Background Sync pattern |

---

## Sources

- [Best meal planning apps 2026 — Cooking with Robots](https://cookingwithrobots.com/blog/best-meal-planning-app-2026)
- [AI meal planning UX — Ollie](https://ollie.ai/2025/10/21/best-meal-planning-apps-in-2025/)
- [AI feedback loops in meal planning — PMC reinforcement learning study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10857145/)
- [Shopping list category grouping — Listonic](https://listonic.com/best-grocery-app-features)
- [Ingredient consolidation — Plan to Eat](https://learn.plantoeat.com/help/manually-merge-ingredients-on-your-shopping-list)
- [Ingredient consolidation — Mealie GitHub discussion](https://github.com/mealie-recipes/mealie/discussions/1852)
- [Receipt OCR UX — eWeek AI scanner apps 2025](https://www.eweek.com/artificial-intelligence/best-receipt-scanner-apps/)
- [Receipt OCR accuracy 2025 — Klippa](https://www.klippa.com/en/ocr/financial-documents/receipts/)
- [Bilingual messaging patterns — Slatch](https://www.slatch.io/)
- [Apple Live Translation iOS 26 UX — Multilingual.com](https://multilingual.com/apple-live-ai-translation-ios-26/)
- [Pantry staples UX — KitchenPal](https://kitchenpalapp.com/en/)
- [PWA offline patterns 2025 — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Next.js PWA offline — Fishtank](https://www.getfishtank.com/insights/building-native-like-offline-experience-in-nextjs-pwas)
- [PWA service worker usage — HTTP Archive 2025](https://almanac.httparchive.org/en/2025/pwa)
- [Payment tracking UX — Subframe payment history examples](https://www.subframe.com/tips/payment-history-page-design-examples)
