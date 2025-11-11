-- Migration: Add missing fields to articles table for RSS ingestion
-- Date: 2025-11-09
-- Description: Add image_url, category, labels, and description fields

-- Add new columns to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS labels JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
ON articles(published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_articles_category 
ON articles(category) WHERE category IS NOT NULL;

-- GIN index for JSONB labels (supports array operations)
CREATE INDEX IF NOT EXISTS idx_articles_labels 
ON articles USING GIN (labels);

-- Add comment for documentation
COMMENT ON COLUMN articles.image_url IS 'URL of the article''s featured image';
COMMENT ON COLUMN articles.category IS 'Article category (e.g., Technology, Business, etc.)';
COMMENT ON COLUMN articles.labels IS 'Array of labels/tags in JSONB format';
COMMENT ON COLUMN articles.description IS 'Short description or excerpt of the article';
