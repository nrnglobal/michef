-- Add parent_recipe_id for recipe variant support (D-07)
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS parent_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_parent_recipe_id ON recipes(parent_recipe_id);

-- Create storage bucket for receipt images (AIOCR-01)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT DO NOTHING;

-- Storage policy: authenticated users can upload to receipts bucket
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts');

-- Storage policy: authenticated users can read receipts
CREATE POLICY "Authenticated users can read receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts');
