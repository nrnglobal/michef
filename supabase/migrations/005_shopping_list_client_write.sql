-- ============================================
-- Migration 005: Allow client to UPDATE and DELETE shopping list items
-- ============================================

-- Drop the existing cook-only UPDATE policy
DROP POLICY IF EXISTS "Cook can update shopping list items" ON shopping_list_items;

-- New UPDATE policy allowing BOTH client and cook roles
-- Cook still needs it for checking off items in /lista
CREATE POLICY "Authenticated can update shopping list items"
  ON shopping_list_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'client' OR role = 'cook'))
  );

-- DELETE policy for client role only (cook should not delete items from the shopping list)
CREATE POLICY "Client can delete shopping list items"
  ON shopping_list_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );
