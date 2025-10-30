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
  structuredSummary: string | null;
  imageUrl: unknown;
  source: string | null;
  category: string | null;
  labels: unknown;
  publishedAt: string | null;
  timestamp: string | null;
  url: string | null;
};

const getSummarizedArticles = async ({
  limit = 20,
  excludeIds = [],
}: SummarizedArticlesRequest): Promise<NewsArticle[]> => {
  const uniqueExclude = Array.from(new Set(excludeIds.filter(Boolean)));
  const fetchLimit = limit + uniqueExclude.length;

  const { data, error } = await supabase
    .from('newstable')
    .select(
      [
        'article_id',
        'title',
        'description',
        '"structuredSummary"',
        '"imageUrl"',
        'source',
        'category',
        'labels',
        '"publishedAt"',
        'timestamp',
        'url',
      ].join(', '),
    )
    .order('publishedAt', { ascending: false, nullsFirst: false })
    .order('timestamp', { ascending: false, nullsFirst: false })
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

  const mapImageUrl = (raw: unknown): string | undefined => {
    const pickFromObject = (value: Record<string, unknown>): string | undefined => {
      const preferredKeys = ['url', 'src', 'href', 'original', 'large', 'medium', 'small'];
      for (const key of preferredKeys) {
        const candidate = value[key];
        if (typeof candidate === 'string' && candidate.trim().startsWith('http')) {
          return candidate.trim();
        }
      }

      // Fallback: search any string value within the object
      for (const candidate of Object.values(value)) {
        if (typeof candidate === 'string' && candidate.trim().startsWith('http')) {
          return candidate.trim();
        }
      }

      return undefined;
    };

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      return trimmed.startsWith('http') ? trimmed : undefined;
    }

    if (Array.isArray(raw)) {
      for (const item of raw) {
        const candidate = mapImageUrl(item);
        if (candidate) {
          return candidate;
        }
      }
      return undefined;
    }

    if (raw && typeof raw === 'object') {
      return pickFromObject(raw as Record<string, unknown>);
    }

    return undefined;
  };

  const mapLabels = (raw: unknown): string[] => {
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
      description: row.description ?? undefined,
      structuredSummary: row.structuredSummary ?? undefined,
      url: row.url ?? undefined,
      imageUrl: mapImageUrl(row.imageUrl),
      source: row.source ?? undefined,
      category: row.category ?? undefined,
      publishedAt: row.publishedAt ?? undefined,
      timestamp: row.timestamp ?? row.publishedAt ?? undefined,
      labels: mapLabels(row.labels),
    }));
};

export const apiService = {
  getSummarizedArticles,
};

export default apiService;
