-- ============================================
-- Migration 006: Add is_staple column to fridge_staples
-- ============================================

ALTER TABLE fridge_staples ADD COLUMN IF NOT EXISTS is_staple BOOLEAN DEFAULT false;
