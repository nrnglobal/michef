---
phase: "03"
plan: "03"
subsystem: receipt-ocr
tags: [ai, ocr, claude-haiku, vision, receipt, supabase-storage]
dependency_graph:
  requires: ["03-01"]
  provides: [extract-receipt-api, receipt-upload-component, receipt-review-component]
  affects: [visita-page]
tech_stack:
  added: [claude-haiku-4-5-20251001-vision, canvas-resize-api, supabase-storage-receipts]
  patterns: [base64-vision-message, client-side-image-resize, parallel-upload-and-ocr]
key_files:
  created:
    - app/api/ai/extract-receipt/route.ts
    - components/receipt-upload.tsx
    - components/receipt-review.tsx
    - components/visita-receipt-section.tsx
  modified:
    - app/(cook)/visita/page.tsx
decisions:
  - "No prompt caching on extract-receipt route — Haiku minimum 4096 tokens not reached by receipt OCR prompts"
  - "Storage upload and OCR run in parallel via Promise.all to minimize total wait time"
  - "Discard calls onSaved without persisting to prevent partial receipt data in visits table"
  - "VisitaReceiptSection wraps upload/review state machine so visita page stays a server component"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_created: 4
  files_modified: 1
---

# Phase 03 Plan 03: Receipt OCR Summary

**One-liner:** Claude Haiku vision receipt OCR pipeline — cook photos receipt, client-side resize, Haiku extracts line items, cook reviews and saves to visits table.

## What Was Built

Complete receipt OCR flow from camera to structured data:

1. **`app/api/ai/extract-receipt/route.ts`** — Server-side Next.js API route that accepts base64 image, calls Claude Haiku with vision message format, strips markdown fences from response, returns parsed JSON. Returns 502 on Claude API failure, 500 on parse failure. No prompt caching (per Pitfall 3 — Haiku minimum 4096 tokens).

2. **`components/receipt-upload.tsx`** — Client component with camera file input. Resizes image client-side using Canvas API to stay under 5 MB limit. Runs Supabase Storage upload and OCR fetch in parallel. Shows "Analizando recibo..." spinner during processing, "No pude leer el recibo. Intenta de nuevo." on failure with retry button. Min 48px touch target for cook mobile use.

3. **`components/receipt-review.tsx`** — Editable review form showing all extracted fields (store name, date, line items with add/remove, subtotal, tax, total). On save: persists `receipt_extracted_data` and `grocery_total` to visits table, shows `toast.success('Recibo guardado')`. Discard calls `onSaved()` without writing (per D-14).

4. **`components/visita-receipt-section.tsx`** — Client wrapper managing upload → review → saved state transitions, so visita page remains a server component.

5. **`app/(cook)/visita/page.tsx`** — Added "Recibo de compras" section after shopping list link, renders `VisitaReceiptSection` when visit record exists.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create extract-receipt API route and receipt-upload component | 77d5811 | app/api/ai/extract-receipt/route.ts, components/receipt-upload.tsx |
| 2 | Create receipt-review component and wire upload into visita page | 9ca4cc7 | components/receipt-review.tsx, components/visita-receipt-section.tsx, app/(cook)/visita/page.tsx |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

**Structural note:** Plan mentioned creating `visita-receipt-section.tsx` as an alternative to inline state. Implemented as the primary approach (not an alternative) since it cleanly keeps the server component page free of client state hooks.

## Success Criteria Verification

- [x] AIOCR-01: Cook can upload receipt photo, client-side resize to 5 MB (resizeImageToLimit with Canvas API)
- [x] AIOCR-02: Claude Haiku extracts store name, date, line items, total (claude-haiku-4-5-20251001 with vision message)
- [x] AIOCR-03: Client can review/correct extracted data before saving (ReceiptReview with editable fields)
- [x] Loading state shows "Analizando recibo..." (D-12)
- [x] Failure shows "No pude leer el recibo" with retry (D-13)
- [x] Uses Haiku without prompt caching (per Pitfall 3)

## Known Stubs

None. All data flows are wired: file input → resize → parallel (storage upload + OCR) → review form → Supabase update.

## Self-Check: PASSED
