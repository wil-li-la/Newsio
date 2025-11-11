-- Drop old tables that are no longer needed
-- These tables have been replaced by the new user interaction system

-- Drop user_liked_articles table
DROP TABLE IF EXISTS user_liked_articles CASCADE;

-- Drop newstable table  
DROP TABLE IF EXISTS newstable CASCADE;

-- Note: The new system uses:
-- - article_sentiments table for likes/dislikes
-- - article_collections table for saved articles
-- - Both tables have proper RLS policies in place
