export type SwipeDirection = 'left' | 'right';

export type NewsArticle = {
  id: string;
  title?: string | null;
  description?: string | null;
  structuredSummary?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  source?: string | null;
  labels?: string[];
  category?: string | null;
  publishedAt?: string | null;
  timestamp?: string | null;
};

export type SwipeHistoryEntry = {
  id: string;
  direction: SwipeDirection;
};
