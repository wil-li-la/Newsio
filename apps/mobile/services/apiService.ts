import { NewsArticle } from '../types';
import { supabase } from '../lib/supabase';

type SummarizedArticlesRequest = {
  limit?: number;
  excludeIds?: string[];
};

type SupabaseArticleRow = {
  article_id: string;
  title: string | null;
  description: string | null;
  ai_summary: string | null;
  original_url: string | null;
  image_url: string | null;
  category: string | null;
  labels: string[] | null;
  published_at: string | null;
  source_id: string | null;
  sources: {
    name: string;
  } | null;
};

const getSummarizedArticles = async ({
  limit = 20,
  excludeIds = [],
}: SummarizedArticlesRequest): Promise<NewsArticle[]> => {
  const uniqueExclude = Array.from(new Set(excludeIds.filter(Boolean)));
  const fetchLimit = limit + uniqueExclude.length;

  const { data, error } = await supabase
    .from('articles')
    .select(`
      article_id,
      title,
      description,
      ai_summary,
      original_url,
      image_url,
      category,
      labels,
      published_at,
      source_id,
      sources (
        name
      )
    `)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(fetchLimit);

  if (error) {
    console.error('❌ Supabase fetch error:', error);
    throw new Error(error.message || 'Failed to load articles from Supabase');
  }

  const rawData = data as unknown;
  const rows: SupabaseArticleRow[] = Array.isArray(rawData)
    ? (rawData as SupabaseArticleRow[])
    : [];
  const excludeSet = new Set(uniqueExclude);

  // Image URL is now a simple string in the new schema
  const mapImageUrl = (raw: string | null): string | undefined => {
    if (typeof raw === 'string' && raw.trim().startsWith('http')) {
      return raw.trim();
    }
    return undefined;
  };

  // Labels are now a proper string array in the new schema
  const mapLabels = (raw: string[] | null): string[] => {
    if (Array.isArray(raw)) {
      return raw.filter((item): item is string => typeof item === 'string');
    }
    return [];
  };

  return rows
    .filter((row) => !excludeSet.has(row.article_id))
    .slice(0, limit)
    .map<NewsArticle>((row) => ({
      id: row.article_id,
      title: row.title ?? undefined,
      description: row.description ?? row.ai_summary ?? undefined,
      structuredSummary: row.ai_summary ?? undefined,
      url: row.original_url ?? undefined,
      imageUrl: mapImageUrl(row.image_url),
      source: row.sources?.name ?? undefined,
      category: row.category ?? undefined,
      publishedAt: row.published_at ?? undefined,
      timestamp: row.published_at ?? undefined,
      labels: mapLabels(row.labels),
    }));
};

export const apiService = {
  getSummarizedArticles,
};

export default apiService;
