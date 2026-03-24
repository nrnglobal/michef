---
phase: 3
slug: ai-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (Wave 0 installs) |
| **Config file** | `vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `npx vitest run tests/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/` for the specific feature area
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-W0-01 | W0 | 0 | AIREC-01 | unit | `npx vitest run tests/api/generate-recipe.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-02 | W0 | 0 | AIREC-02 | unit | `npx vitest run tests/components/feedback-form.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-03 | W0 | 0 | AIREC-03 | unit | `npx vitest run tests/api/adjust-recipe.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-04 | W0 | 0 | AIREC-04 | unit | `npx vitest run tests/api/recipe-mutations.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-05 | W0 | 0 | AIOCR-01 | unit | `npx vitest run tests/lib/image-resize.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-06 | W0 | 0 | AIOCR-02 | unit | `npx vitest run tests/api/extract-receipt.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-07 | W0 | 0 | AIOCR-03 | unit | `npx vitest run tests/components/receipt-review.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-08 | W0 | 0 | AIURL-01 | unit | `npx vitest run tests/api/import-url.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest @vitest/ui jsdom @testing-library/react` — install test framework
- [ ] `vitest.config.ts` — framework config
- [ ] `tests/api/generate-recipe.test.ts` — covers AIREC-01
- [ ] `tests/api/adjust-recipe.test.ts` — covers AIREC-03
- [ ] `tests/api/extract-receipt.test.ts` — covers AIOCR-02
- [ ] `tests/api/import-url.test.ts` — covers AIURL-01
- [ ] `tests/lib/image-resize.test.ts` — covers AIOCR-01
- [ ] `tests/components/feedback-form.test.ts` — covers AIREC-02
- [ ] `tests/components/receipt-review.test.ts` — covers AIOCR-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Receipt photo upload flow on `/visita` | AIOCR-01, AIOCR-02 | Requires camera/file input in browser | Open `/visita`, tap receipt upload, select photo, verify spinner shows "Analizando recibo...", verify extracted line items appear for review |
| Generate recipe modal opens and pre-fills form | AIREC-01 | DOM interaction + modal state | Open `/recipes`, click "✨ Generate", select category, verify RecipeForm pre-fills with Claude output |
| AI adjustment diff view before/after highlighting | AIREC-03 | Visual diff rendering | Leave feedback on a recipe, accept AI adjustment offer, verify diff shows changed ingredients/instructions highlighted |
| URL import populates Add Recipe form | AIURL-01 | External URL fetch | Open `/recipes/new`, expand "Import from URL", paste a URL, verify form fields populate |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
