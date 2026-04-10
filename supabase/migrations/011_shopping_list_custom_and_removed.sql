-- Track user customizations on shopping list items so that syncShoppingList()
-- can preserve them across recipe add/remove operations.
--
-- is_custom: true for items the client manually added (never touched by sync)
-- manually_removed: true for recipe-derived items the client explicitly deleted
--   (acts as a tombstone so sync skips re-adding the ingredient)

ALTER TABLE shopping_list_items
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manually_removed BOOLEAN NOT NULL DEFAULT false;
