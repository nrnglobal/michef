# Requirements: MiChef

**Defined:** 2026-03-22
**Core Value:** The cook arrives prepared — with a confirmed menu in Spanish, a ready-to-check shopping list, and no language barrier between her and the household.

## v1 Requirements

### Infrastructure (Tech Debt — Phase 2 prerequisites)

- [x] **INFRA-01**: Middleware file is named `middleware.ts` (not `proxy.ts`) so Next.js edge runtime picks it up correctly
- [x] **INFRA-02**: RLS policies are scoped to role-based writes (cook can only write to her own check-offs; client can only write to their own menu plans)
- [x] **INFRA-03**: Supabase URL env var has no placeholder fallback that masks misconfiguration in production

### Menu Planning

- [ ] **MENU-01**: Client can create a menu plan for an upcoming visit by selecting a date and assigning 2–4 recipes
- [ ] **MENU-02**: Client can edit a menu plan (add/remove/reorder recipes) before confirming it
- [ ] **MENU-03**: Client can confirm a menu plan, making it visible to the cook
- [ ] **MENU-04**: Client can request an AI-suggested menu that respects active cooking rules, avoids recently cooked recipes, and incorporates recent feedback
- [ ] **MENU-05**: Rules engine validates a menu plan and surfaces warnings (frequency violations, exclusion matches, substitution suggestions) before confirmation
- [ ] **MENU-06**: Cook can see the next confirmed visit with its assigned recipes in Spanish

### Shopping List

- [ ] **SHOP-01**: Confirmed menu plan auto-generates a consolidated shopping list (ingredients from all recipes merged by item, units normalised, grouped by category)
- [ ] **SHOP-02**: Cook can view shopping list items in Spanish with quantity and unit
- [ ] **SHOP-03**: Cook can check off individual items on the shopping list (large touch targets, min 48px)
- [ ] **SHOP-04**: Shopping list shows a running count of checked vs total items
- [ ] **SHOP-05**: Checked items visually de-emphasise (grey out or move to bottom)
- [ ] **SHOP-06**: Shopping list includes a fridge staples section at the bottom (from `fridge_staples` table), separate from recipe ingredients
- [ ] **SHOP-07**: Cook can add ad-hoc items to the shopping list during shopping

### AI — Recipe

- [ ] **AIREC-01**: Client can generate a new recipe idea via Claude API using household dietary rules, preferences, and recent history as context
- [ ] **AIREC-02**: Client can leave structured feedback on a cooked recipe (1–5 star rating, feedback text, adjustment type)
- [ ] **AIREC-03**: App generates an AI-adjusted version of a recipe incorporating the client's feedback, shown with a highlighted diff of what changed
- [ ] **AIREC-04**: Adjusted recipe can be saved as the new version (original preserved in history) or saved as a named variant

### AI — Import & OCR

- [ ] **AIOCR-01**: Cook can upload a receipt photo after shopping (client-side resize to ≤5 MB before upload to Supabase Storage)
- [ ] **AIOCR-02**: App uses Claude vision to extract store name, date, line items, and total from the uploaded receipt image
- [ ] **AIOCR-03**: Client can review and correct extracted receipt data before saving
- [ ] **AIURL-01**: Client can import a recipe by pasting a URL; Claude parses the page and populates the recipe form

### Messaging

- [ ] **MSG-01**: Client can send a message to the cook in English; cook receives it in Spanish (Claude translates using Mexican Spanish with regional vocabulary)
- [ ] **MSG-02**: Cook can reply in Spanish; client receives it in English
- [ ] **MSG-03**: Messages appear in real-time using Supabase Realtime (no page refresh required)
- [ ] **MSG-04**: Client can send quick-action messages: "Please also buy ___", "Skip recipe ___ this visit", "Visit rescheduled to ___"
- [ ] **MSG-05**: System sends automatic notifications to the cook when a menu is confirmed and when a shopping list is ready

### Finance

- [ ] **FIN-01**: Each visit record stores grocery total, service fee, and total payment
- [ ] **FIN-02**: Client can set the service fee amount per visit
- [ ] **FIN-03**: Client can mark a visit payment as paid
- [ ] **FIN-04**: Client can view a per-visit payment breakdown (grocery + service fee = total)
- [ ] **FIN-05**: Client can view a monthly summary of grocery spend, service fees, and total payments
- [ ] **FIN-06**: Receipt OCR data is linked to the visit record and pre-populates the grocery total

### Offline

- [ ] **OFFL-01**: Cook's shopping list is accessible and usable without an internet connection (service worker caches the list route)
- [ ] **OFFL-02**: Check-off state updates made offline are synced when connectivity is restored

### Export & Analytics

- [ ] **EXP-01**: Client can export or print the shopping list
- [ ] **EXP-02**: Client can export a recipe as a PDF or shareable link
- [ ] **ANLX-01**: Client can view a summary of most-cooked recipes
- [ ] **ANLX-02**: Client can view monthly spending trends over time

## v2 Requirements

### Notifications

- **NOTF-01**: Push notifications to cook's phone when menu is confirmed
- **NOTF-02**: Push notifications to client when receipt is uploaded

### Advanced Analytics

- **ANLX-03**: Preference pattern analysis (what the household rates highest)
- **ANLX-04**: Per-category spending breakdown

## Out of Scope

| Feature | Reason |
|---------|--------|
| Push notifications (v1) | PWA offline is sufficient; push adds complexity; deferred to v2 |
| Mobile native app | Web-first; cook uses mobile browser |
| OAuth / social login | Email/password sufficient for two known users |
| Multi-household support | Single household only by design |
| Real-time collaborative editing | One client user; no concurrency requirement |
| Full-app offline | Service worker scoped to shopping list route only; full-app offline is unnecessary complexity |

## Traceability

*Populated during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 2 | Complete |
| INFRA-02 | Phase 2 | Complete |
| INFRA-03 | Phase 2 | Complete |
| MENU-01 | Phase 2 | Pending |
| MENU-02 | Phase 2 | Pending |
| MENU-03 | Phase 2 | Pending |
| MENU-04 | Phase 2 | Pending |
| MENU-05 | Phase 2 | Pending |
| MENU-06 | Phase 2 | Pending |
| SHOP-01 | Phase 2 | Pending |
| SHOP-02 | Phase 2 | Pending |
| SHOP-03 | Phase 2 | Pending |
| SHOP-04 | Phase 2 | Pending |
| SHOP-05 | Phase 2 | Pending |
| SHOP-06 | Phase 2 | Pending |
| SHOP-07 | Phase 2 | Pending |
| AIREC-01 | Phase 3 | Pending |
| AIREC-02 | Phase 3 | Pending |
| AIREC-03 | Phase 3 | Pending |
| AIREC-04 | Phase 3 | Pending |
| AIOCR-01 | Phase 3 | Pending |
| AIOCR-02 | Phase 3 | Pending |
| AIOCR-03 | Phase 3 | Pending |
| AIURL-01 | Phase 3 | Pending |
| MSG-01 | Phase 4 | Pending |
| MSG-02 | Phase 4 | Pending |
| MSG-03 | Phase 4 | Pending |
| MSG-04 | Phase 4 | Pending |
| MSG-05 | Phase 4 | Pending |
| FIN-01 | Phase 4 | Pending |
| FIN-02 | Phase 4 | Pending |
| FIN-03 | Phase 4 | Pending |
| FIN-04 | Phase 4 | Pending |
| FIN-05 | Phase 4 | Pending |
| FIN-06 | Phase 4 | Pending |
| OFFL-01 | Phase 5 | Pending |
| OFFL-02 | Phase 5 | Pending |
| EXP-01 | Phase 5 | Pending |
| EXP-02 | Phase 5 | Pending |
| ANLX-01 | Phase 5 | Pending |
| ANLX-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after initial definition*
