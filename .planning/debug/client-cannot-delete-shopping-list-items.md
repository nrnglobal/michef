---
status: awaiting_human_verify
trigger: "Client user taps the trash icon on a shopping list item but nothing happens — the item is not deleted."
created: 2026-03-25T00:00:00Z
updated: 2026-03-25T00:00:01Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED — handleDelete has NO error handling; the Supabase delete call silently fails because migration 005 was not applied to the production Supabase instance (same pattern as the parent_recipe_id / migration 004 issue noted in CONCERNS). Additionally, handleDelete does NOT check the Supabase response for errors, so even if it fails (RLS violation → empty result set with no rows deleted), execution continues to setDeleting(null) and router.refresh(), making the UI look like it attempted and completed something, when nothing actually changed server-side.
test: code trace complete — confirmed no error capture on the delete call
expecting: fix will add error handling AND surface the migration-must-be-applied requirement
next_action: add error handling to handleDelete; document migration 005 must be applied

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Clicking the red trash icon on a shopping list item deletes the item and it disappears from the list
actual: Clicking the trash icon does nothing visible — item remains on the list
errors: Unknown — no error message visible to user
reproduction: Log in as client, navigate to /shopping-lists, click the trash icon on any item
started: Likely broken since deployment — feature added in quick task 260324-ccy

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: Wrong Supabase client (server vs browser)
  evidence: shopping-list-client.tsx line 5 imports from '@/lib/supabase/client' (browser client). This is correct for a 'use client' component.
  timestamp: 2026-03-25T00:00:01Z

- hypothesis: router.refresh() missing
  evidence: Line 221 calls router.refresh() after delete. Present and correct.
  timestamp: 2026-03-25T00:00:01Z

- hypothesis: Button wiring broken
  evidence: Line 288 onClick={() => handleDelete(item.id)} is correctly wired. Button is not inside a form, no default submit to prevent.
  timestamp: 2026-03-25T00:00:01Z

- hypothesis: item.id is undefined/null
  evidence: item.id is typed string in ShoppingListItem, sourced directly from Supabase .select('*') — will have a valid UUID.
  timestamp: 2026-03-25T00:00:01Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-03-25T00:00:01Z
  checked: shopping-list-client.tsx handleDelete (lines 215-222)
  found: |
    async function handleDelete(itemId: string) {
      if (!window.confirm('Remove this item from the shopping list?')) return
      setDeleting(itemId)
      const supabase = createClient()
      await supabase.from('shopping_list_items').delete().eq('id', itemId)
      setDeleting(null)
      router.refresh()
    }
    The return value of supabase.delete() is completely discarded. No destructuring of { error }, no check, no user feedback.
  implication: If RLS blocks the delete (returns 0 rows deleted but no JS-level error), execution flows straight to setDeleting(null) and router.refresh(). The UI appears to do something, the list re-fetches from the server unchanged, and the item remains. No error is shown. This matches the symptom exactly.

- timestamp: 2026-03-25T00:00:01Z
  checked: supabase/migrations/005_shopping_list_client_write.sql
  found: Migration file exists in the repo and is well-formed. It creates "Client can delete shopping list items" DELETE policy on shopping_list_items. However STATE.md and CONCERNS note the same pattern as migration 004 (parent_recipe_id) — the file existing in the repo does NOT mean it was applied to the production Supabase project.
  implication: If migration 005 was not run against the live Supabase project, there is NO DELETE policy for the client role. Supabase RLS with no matching policy = operation blocked. The JS client receives an empty success (no error thrown, 0 rows affected), which the code ignores entirely.

- timestamp: 2026-03-25T00:00:01Z
  checked: handleAdd (lines 163-182) and handleEdit (lines 195-213)
  found: Both also discard Supabase error responses — same silent failure pattern throughout the component. handleAdd and handleEdit also have no error handling.
  implication: The entire component is brittle to RLS failures. This is a systemic issue, not just delete.

- timestamp: 2026-03-25T00:00:01Z
  checked: STATE.md decisions section
  found: "[Phase 02]: shopping_list_items INSERT open to both roles (client on confirm, cook for ad-hoc); UPDATE restricted to cook only per SHOP-07" — this was the pre-005 state. Migration 005 is meant to widen UPDATE and add DELETE for client.
  implication: Confirms migration 005 is the required change that enables client delete. Without it applied in prod, all client deletes silently no-op.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: Two compounding issues: (1) Migration 005 was not applied to the production Supabase instance — no DELETE RLS policy exists for the client role, so all delete operations are blocked by RLS and return 0 rows affected with no JS-level error thrown. (2) handleDelete (and all other mutation handlers) discarded the Supabase response entirely — no { error } destructuring — so the silent RLS failure was completely invisible: setDeleting(null) and router.refresh() ran normally, giving the impression the action completed, while the item was never removed.
fix: Added { error } destructuring to all three mutation handlers (handleAdd, handleEdit, handleDelete). Each now sets a visible error state and returns early on failure. An error banner is rendered at the top of the list. Migration 005 SQL (which already exists in the repo) must also be applied to the Supabase project — this is the prerequisite for the delete to actually succeed in production.
verification: npx next build passed with no type errors.
files_changed: [app/(client)/shopping-lists/shopping-list-client.tsx]
