-- ============================================
-- Casa Cook - Database Schema
-- Migration 001: All Tables + RLS
-- ============================================

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'cook')),
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions_en TEXT,
  instructions_es TEXT,
  youtube_url TEXT,
  category TEXT NOT NULL,
  protein_type TEXT,
  prep_time_minutes INTEGER,
  servings INTEGER DEFAULT 2,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- recipe_feedback table
CREATE TABLE IF NOT EXISTS recipe_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  visit_id UUID,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  adjustment_type TEXT,
  adjustment_detail TEXT,
  ai_adjusted_recipe JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- menu_plans table
CREATE TABLE IF NOT EXISTS menu_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'shopping', 'cooking', 'done')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- menu_plan_items table
CREATE TABLE IF NOT EXISTS menu_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_plan_id UUID REFERENCES menu_plans(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  servings INTEGER DEFAULT 2,
  sort_order INTEGER DEFAULT 0
);

-- cooking_rules table
CREATE TABLE IF NOT EXISTS cooking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL,
  rule_definition JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_plan_id UUID REFERENCES menu_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  ingredient_name_en TEXT NOT NULL,
  ingredient_name_es TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  category TEXT,
  source_recipe_ids UUID[],
  is_checked BOOLEAN DEFAULT false,
  is_always_stock BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ
);

-- visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_date DATE NOT NULL,
  menu_plan_id UUID REFERENCES menu_plans(id),
  grocery_total NUMERIC,
  service_fee NUMERIC,
  total_payment NUMERIC,
  receipt_image_url TEXT,
  receipt_extracted_data JSONB,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'cook')),
  original_text TEXT NOT NULL,
  translated_text TEXT,
  original_language TEXT NOT NULL CHECK (original_language IN ('en', 'es')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- fridge_staples table
CREATE TABLE IF NOT EXISTS fridge_staples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name_en TEXT NOT NULL,
  item_name_es TEXT NOT NULL,
  quantity TEXT,
  notes_en TEXT,
  notes_es TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_staples ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- recipes (all authenticated users)
CREATE POLICY "Authenticated users can read recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (true);

-- recipe_feedback
CREATE POLICY "Authenticated users can read feedback"
  ON recipe_feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert feedback"
  ON recipe_feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- menu_plans
CREATE POLICY "Authenticated users can read menu plans"
  ON menu_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage menu plans"
  ON menu_plans FOR ALL
  TO authenticated
  USING (true);

-- menu_plan_items
CREATE POLICY "Authenticated users can read menu plan items"
  ON menu_plan_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage menu plan items"
  ON menu_plan_items FOR ALL
  TO authenticated
  USING (true);

-- cooking_rules
CREATE POLICY "Authenticated users can read rules"
  ON cooking_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage rules"
  ON cooking_rules FOR ALL
  TO authenticated
  USING (true);

-- shopping_lists
CREATE POLICY "Authenticated users can read shopping lists"
  ON shopping_lists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage shopping lists"
  ON shopping_lists FOR ALL
  TO authenticated
  USING (true);

-- shopping_list_items
CREATE POLICY "Authenticated users can read shopping list items"
  ON shopping_list_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage shopping list items"
  ON shopping_list_items FOR ALL
  TO authenticated
  USING (true);

-- visits
CREATE POLICY "Authenticated users can read visits"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage visits"
  ON visits FOR ALL
  TO authenticated
  USING (true);

-- messages
CREATE POLICY "Authenticated users can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- fridge_staples
CREATE POLICY "Authenticated users can read fridge staples"
  ON fridge_staples FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage fridge staples"
  ON fridge_staples FOR ALL
  TO authenticated
  USING (true);

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON recipes(is_active);
CREATE INDEX IF NOT EXISTS idx_recipes_title_en ON recipes USING gin(to_tsvector('english', title_en));
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_recipe_id ON recipe_feedback(recipe_id);
CREATE INDEX IF NOT EXISTS idx_menu_plan_items_menu_plan_id ON menu_plan_items(menu_plan_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);
