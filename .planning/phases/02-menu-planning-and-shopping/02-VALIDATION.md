---
phase: 2
slug: menu-planning-and-shopping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest / playwright |
| **Config file** | vitest.config.ts / playwright.config.ts |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test && npm run test:e2e`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-infra-01 | INFRA | 0 | INFRA-01 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-infra-02 | INFRA | 0 | INFRA-02 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-infra-03 | INFRA | 0 | INFRA-03 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-menu-01 | MENU | 1 | MENU-01 | e2e | `npm run test:e2e` | ❌ W0 | ⬜ pending |
| 2-menu-02 | MENU | 1 | MENU-02 | e2e | `npm run test:e2e` | ❌ W0 | ⬜ pending |
| 2-menu-03 | MENU | 1 | MENU-03 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-menu-04 | MENU | 2 | MENU-04 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-menu-05 | MENU | 2 | MENU-05 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-menu-06 | MENU | 2 | MENU-06 | e2e | `npm run test:e2e` | ❌ W0 | ⬜ pending |
| 2-shop-01 | SHOP | 2 | SHOP-01 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-shop-02 | SHOP | 2 | SHOP-02 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-shop-03 | SHOP | 2 | SHOP-03 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-shop-04 | SHOP | 3 | SHOP-04 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 2-shop-05 | SHOP | 3 | SHOP-05 | e2e | `npm run test:e2e` | ❌ W0 | ⬜ pending |
| 2-shop-06 | SHOP | 3 | SHOP-06 | e2e | `npm run test:e2e` | ❌ W0 | ⬜ pending |
| 2-shop-07 | SHOP | 3 | SHOP-07 | e2e | `npm run test:e2e` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/rules-engine.test.ts` — unit stubs for MENU-03, MENU-04, MENU-05
- [ ] `__tests__/shopping-consolidation.test.ts` — unit stubs for SHOP-01, SHOP-02, SHOP-03
- [ ] `__tests__/proxy-routes.test.ts` — stub for INFRA-01 route protection
- [ ] `e2e/menu-planning.spec.ts` — e2e stubs for MENU-01, MENU-02, MENU-06
- [ ] `e2e/shopping-list.spec.ts` — e2e stubs for SHOP-05, SHOP-06, SHOP-07

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AI suggest menu returns relevant, rule-respecting recipes | MENU-04 | Requires LLM call with live Supabase data | Trigger "Suggest Menu", verify ≥2 valid recipes returned that respect exclusion rules |
| Cook sees recipes in Spanish | SHOP-05 | Language rendering requires visual verification | Login as cook, open /lista, confirm recipe names are in Spanish |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
