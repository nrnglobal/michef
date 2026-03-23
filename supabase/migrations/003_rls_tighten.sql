-- ============================================
-- Migration 003: Tighten RLS policies by role
-- ============================================

-- Drop overly broad "manage" policies
DROP POLICY IF EXISTS "Authenticated users can manage menu plans" ON menu_plans;
DROP POLICY IF EXISTS "Authenticated users can manage menu plan items" ON menu_plan_items;
DROP POLICY IF EXISTS "Authenticated users can manage shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Authenticated users can manage shopping lists" ON shopping_lists;

-- Menu plans: only client role can write
CREATE POLICY "Client can insert menu plans"
  ON menu_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Client can update menu plans"
  ON menu_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Client can delete menu plans"
  ON menu_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

-- Menu plan items: only client role can write
CREATE POLICY "Client can insert menu plan items"
  ON menu_plan_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Client can update menu plan items"
  ON menu_plan_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Client can delete menu plan items"
  ON menu_plan_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

-- Shopping list items: INSERT open to both roles (client generates list on confirm, cook adds ad-hoc items per SHOP-07)
CREATE POLICY "Authenticated can insert shopping list items"
  ON shopping_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'client' OR role = 'cook'))
  );

-- Shopping list items: UPDATE restricted to cook only (only cook checks off items)
CREATE POLICY "Cook can update shopping list items"
  ON shopping_list_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'cook')
  );

-- Shopping lists: client creates (on confirm), both read (SELECT policies already exist)
CREATE POLICY "Client can insert shopping lists"
  ON shopping_lists FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Client can update shopping lists"
  ON shopping_lists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Client can delete shopping lists"
  ON shopping_lists FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'client')
  );

-- Add unique constraint on menu_plans.visit_date (per D-04: one plan per date)
ALTER TABLE menu_plans ADD CONSTRAINT menu_plans_visit_date_unique UNIQUE (visit_date);
