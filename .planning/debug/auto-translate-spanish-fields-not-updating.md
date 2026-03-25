---
status: awaiting_human_verify
trigger: "auto-translate-spanish-fields-not-updating"
created: 2026-03-25T00:00:00Z
updated: 2026-03-25T00:00:00Z
---

## Current Focus

hypothesis: The API filters ingredients to only those with a non-empty name_en before building the translated list, but the form handler maps the translated array back using the ORIGINAL ingredient indices — causing an index mismatch when any ingredient has a blank name_en. Additionally, the API prompt uses 0-based renumbered indices (0, 1, 2... for filtered items) but the handler iterates the full original array by idx, so even if some ingredients translate they land in wrong slots.
test: Trace the index used in ingredientsToTranslate (re-indexed from 0 after filter) vs the index used in setIngredients (original array idx) — they diverge when any ingredient has a blank name_en. Even with all names filled, the array length still matches, so the only visible failure is the blank-name case.
expecting: Fix by mapping translated names back using the same filtered subset logic, or by sending all ingredients (including blanks) so the array positions stay stable.
next_action: Apply fix — send all ingredient positions to the API (keep blanks as empty strings) so response array indices align with the form state array indices.

## Symptoms

expected: Clicking "Auto-translate to Spanish" populates title_es, description_es, ingredient Spanish names, and instructions_es fields
actual: Button shows success message but Spanish fields remain empty/unchanged
errors: No visible error — UI reports success
reproduction: /recipes/new or /recipes/[id]/edit — fill English fields, click Auto-translate, Spanish fields stay empty
started: New feature added in quick task 260325-trx (today)

## Eliminated

- hypothesis: Race condition — success toast fires before state setters are called
  evidence: All setters (setTitleEs, setDescEs, etc.) are called synchronously before toast.success(). No race.
  timestamp: 2026-03-25

- hypothesis: API returns wrong shape (e.g. returns { title } instead of { title_es })
  evidence: Route explicitly returns parsed JSON which the prompt instructs to be { title_es, description_es, instructions_es, ingredient_names_es } — shape matches what the handler reads.
  timestamp: 2026-03-25

## Evidence

- timestamp: 2026-03-25
  checked: components/recipe-form.tsx handleAutoTranslate (lines 84-137)
  found: Handler reads translated.title_es, translated.description_es, translated.instructions_es, translated.ingredient_names_es — all correct keys. State setters called conditionally (only if current _es field is blank). Logic looks correct for the simple case.
  implication: The simple field translations (title, desc, instructions) should work. The ingredient array is the suspect.

- timestamp: 2026-03-25
  checked: app/api/ai/translate-recipe/route.ts lines 13-16
  found: ingredientsToTranslate is built by FILTERING to only name_en-non-empty items, then re-numbering from 0: `ingredients.filter(ing => ing.name_en?.trim()).map((ing, idx) => \`${idx}: ${ing.name_en}\`)`
  implication: The prompt sends indices 0, 1, 2... for only the non-blank ingredients. Claude returns ingredient_names_es as an array of that same filtered length. But the handler maps back using the FULL array index. If any ingredient row has a blank name_en (e.g. the default empty row at the bottom), the indices desync and translated names land in wrong slots or get dropped.

- timestamp: 2026-03-25
  checked: form sends ingredientsForApi = ingredients.map(ing => ({ name_en: ing.name_en })) — ALL ingredients, including blanks
  found: The form sends ALL ingredients (including blank rows) to the API. But the API then filters them down before building the prompt. This is the mismatch: form sends N items, API translates M < N items (filtered), returns array of length M, but handler iterates N items expecting array of length N.
  implication: ROOT CAUSE CONFIRMED. When a blank ingredient row exists (guaranteed on a new recipe — it always starts with one empty ingredient), ingredient_names_es has fewer entries than the ingredients array. The handler checks `translated.ingredient_names_es[idx]` where idx runs over the full array — so translated names land at the wrong positions or the match never fires.

## Resolution

root_cause: The API route filters out blank-name ingredients before building the translation prompt, resulting in a shorter ingredient_names_es array than the full ingredients list. The form handler then maps by original array index, causing all translated names to land in wrong positions (or the array to be too short). Because the first row is almost always blank on a new recipe, the translated array is effectively empty from the handler's perspective.
fix: Remove the filter in the API route — send ALL ingredient name_en values to the prompt (even blank ones, as empty strings). This keeps the response array length equal to the input array length, so indices stay aligned. Alternatively (and more robust): keep the filter but return a sparse/indexed response. The simpler fix is to remove the filter.
verification: Fix applied to app/api/ai/translate-recipe/route.ts — removed the filter that was dropping blank-name ingredients from the prompt. All ingredient positions are now sent, keeping response array length equal to input array length so handler idx mapping is correct.
files_changed:
  - app/api/ai/translate-recipe/route.ts
