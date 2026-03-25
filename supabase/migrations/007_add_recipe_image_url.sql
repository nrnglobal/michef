-- Migration 007: Add image_url column to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_url TEXT;
