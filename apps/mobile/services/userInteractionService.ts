/**
 * User Interaction Service
 * 
 * Handles all user interactions with articles:
 * - Sentiments (like/dislike)
 * - Collections (save to folder)
 * - Shares
 * 
 * All operations use Supabase Client with RLS protection.
 * No Edge Functions needed - direct DB access with proper security.
 */

import { supabase } from '../lib/supabase';

// ============================================================================
// Types
// ============================================================================

export type Sentiment = 'like' | 'dislike' | 'neutral';

export interface ArticleSentiment {
  user_id: string;
  article_id: string;
  sentiment: Sentiment;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleCollection {
  collection_id?: string;
  user_id: string;
  article_id: string;
  folder_id?: string;
  created_at?: string;
}

// ============================================================================
// Sentiment Operations
// ============================================================================

/**
 * Record or update user sentiment for an article
 * Uses upsert to handle both new and existing sentiments
 */
export const recordSentiment = async (
  articleId: string,
  sentiment: Sentiment
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('article_sentiments')
      .upsert(
        {
          user_id: user.id,
          article_id: articleId,
          sentiment: sentiment,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,article_id', // Assuming composite unique constraint
        }
      );

    if (error) {
      console.error('Error recording sentiment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

/**
 * Get user's sentiment for a specific article
 */
export const getUserSentiment = async (
  articleId: string
): Promise<Sentiment | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('article_sentiments')
      .select('sentiment')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .single();

    if (error || !data) return null;

    return data.sentiment as Sentiment;
  } catch (err) {
    console.error('Error getting sentiment:', err);
    return null;
  }
};

/**
 * Remove user sentiment for an article
 */
export const removeSentiment = async (
  articleId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('article_sentiments')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId);

    if (error) {
      console.error('Error removing sentiment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

// ============================================================================
// Collection Operations
// ============================================================================

/**
 * Add article to user's collection
 * Uses upsert to prevent duplicates
 */
export const addToCollection = async (
  articleId: string,
  folderId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('article_collections')
      .upsert(
        {
          user_id: user.id,
          article_id: articleId,
          folder_id: folderId || null,
        },
        {
          onConflict: 'user_id,article_id', // Assuming composite unique constraint
        }
      );

    if (error) {
      console.error('Error adding to collection:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

/**
 * Remove article from user's collection
 */
export const removeFromCollection = async (
  articleId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('article_collections')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId);

    if (error) {
      console.error('Error removing from collection:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

/**
 * Check if article is in user's collection
 */
export const isInCollection = async (
  articleId: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('article_collections')
      .select('collection_id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
};

/**
 * Get all articles in user's collection
 */
export const getUserCollection = async (
  folderId?: string
): Promise<ArticleCollection[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    let query = supabase
      .from('article_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting collection:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// ============================================================================
// Batch Operations (for future optimization)
// ============================================================================

/**
 * Record multiple sentiments at once
 * Useful for offline sync or batch processing
 */
export const batchRecordSentiments = async (
  sentiments: Array<{ articleId: string; sentiment: Sentiment }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const records = sentiments.map(s => ({
      user_id: user.id,
      article_id: s.articleId,
      sentiment: s.sentiment,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('article_sentiments')
      .upsert(records);

    if (error) {
      console.error('Error batch recording sentiments:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};
