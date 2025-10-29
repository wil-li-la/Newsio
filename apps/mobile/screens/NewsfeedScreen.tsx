import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SwipeCard from '../components/SwipeCard';
import ArticleCard from '../components/ArticleCard';
import { apiService } from '../services/apiService';
import {
  NewsArticle,
  SwipeDirection,
  SwipeHistoryEntry,
} from '../types';

const DEFAULT_BATCH_SIZE = 20;

export default function NewsfeedScreen() {
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<NewsArticle[]>([]);
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);
  const [history, setHistory] = useState<SwipeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const currentCard = cards[index];

  const fetchArticles = useCallback(
    async (limit: number, exclude: string[]): Promise<NewsArticle[]> => {
      const uniqueExclude = Array.from(new Set(exclude));
      return apiService.getSummarizedArticles({
        limit,
        excludeIds: uniqueExclude,
      });
    },
    [],
  );

  const load = useCallback(
    async (withSeen: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const fresh = await fetchArticles(DEFAULT_BATCH_SIZE, withSeen);
        setCards(fresh);
        setIndex(0);
      } catch (err) {
        console.error('Newsfeed: failed to load articles', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load news';
        setCards([]);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchArticles],
  );

  useEffect(() => {
    load([]);
  }, [load]);

  const onSwipe = useCallback(
    async (direction: SwipeDirection) => {
      const active = cards[index];
      if (!active) {
        return;
      }

      const nextSeen = [...seen, active.id];
      setSeen(nextSeen);
      setHistory((prev) => [...prev, { id: active.id, direction }]);

      const remaining = cards.length - index - 1;

      if (cards.length - index <= 3 && !isFetchingMore) {
        setIsFetchingMore(true);
        fetchArticles(DEFAULT_BATCH_SIZE, [
          ...nextSeen,
          ...cards.map((item) => item.id),
        ])
          .then((more) => {
            if (!more.length) {
              return;
            }
            setCards((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const unique = more.filter((item) => !existingIds.has(item.id));
              if (!unique.length) {
                return prev;
              }
              return [...prev, ...unique];
            });
          })
          .finally(() => setIsFetchingMore(false));
      }

      if (remaining > 0) {
        setIndex((prev) => prev + 1);
      } else {
        load(nextSeen);
      }
    },
    [cards, fetchArticles, index, isFetchingMore, load, seen],
  );

  const onSwipeLeft = useCallback(() => onSwipe('left'), [onSwipe]);
  const onSwipeRight = useCallback(() => onSwipe('right'), [onSwipe]);

  const goBack = useCallback(() => {
    if (!history.length || index === 0) {
      return;
    }
    setHistory((prev) => prev.slice(0, -1));
    setSeen((prev) => prev.slice(0, -1));
    setIndex((prev) => Math.max(0, prev - 1));
  }, [history.length, index]);

  useEffect(() => {
    const upcoming = cards.slice(index, index + 3);
    upcoming.forEach((item) => {
      if (item?.imageUrl) {
        Image.prefetch(item.imageUrl).catch(() => {});
      }
    });
  }, [cards, index]);

  const deckContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading fresh headlines…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Unable to load articles</Text>
          <Text style={styles.loadingText}>{error}</Text>
          <Pressable style={styles.refreshButton} onPress={() => load(seen)}>
            <Text style={styles.refreshText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (!currentCard) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
          <Pressable style={styles.refreshButton} onPress={() => load(seen)}>
            <Text style={styles.refreshText}>Refresh feed</Text>
          </Pressable>
        </View>
      );
    }

    const layers = cards.slice(index, index + 3);

    return (
      <View style={styles.cardStack}>
        {layers.map((article, offset) => {
          const position = offset === 0 ? 'current' : offset === 1 ? 'next' : 'third';
          const key = article.id ?? `${index}-${offset}`;
          const layerStyle =
            position === 'current'
              ? styles.currentLayer
              : position === 'next'
                ? styles.nextLayer
                : styles.thirdLayer;

          if (position === 'current') {
            return (
              <View key={key} style={[styles.cardLayer, layerStyle]}>
                <SwipeCard
                  isActive
                  onSwipeLeft={onSwipeLeft}
                  onSwipeRight={onSwipeRight}
                  style={styles.cardShadow}
                >
                  <ArticleCard
                    article={article}
                    showActions
                    onPass={onSwipeLeft}
                    onLike={onSwipeRight}
                  />
                </SwipeCard>
              </View>
            );
          }

          return (
            <View key={key} style={[styles.cardLayer, layerStyle]} pointerEvents="none">
              <View style={styles.cardShadow}>
                <ArticleCard article={article} />
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [cards, currentCard, error, index, load, loading, onSwipeLeft, onSwipeRight, seen]);

  const BOTTOM_BAR_HEIGHT = 64;
  const paddingBottom = insets.bottom + BOTTOM_BAR_HEIGHT + 24;

  return (
    <View style={styles.container}>
      <View style={[styles.appBar, { paddingTop: insets.top + 10 }]}>
        <Pressable
          onPress={() => load(seen)}
          style={[styles.iconButton, styles.iconButtonMuted]}
          accessibilityRole="button"
          accessibilityLabel="Refresh news feed"
        >
          <Ionicons name="refresh" size={16} color="#1F2937" />
        </Pressable>
        <Text style={styles.appBarTitle}>For You</Text>
        <Pressable
          onPress={goBack}
          style={[styles.iconButton, styles.iconButtonPrimary]}
          accessibilityRole="button"
          accessibilityLabel="Undo last swipe"
        >
          <Ionicons name="arrow-undo" size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.deck, { paddingBottom }]}>
        {deckContent}
        {isFetchingMore ? (
          <View style={styles.fetchingBadge}>
            <ActivityIndicator size="small" color="#0A84FF" />
            <Text style={styles.fetchingText}>Loading more…</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F1F5F9',
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconButtonMuted: {
    backgroundColor: '#E2E8F0',
  },
  iconButtonPrimary: {
    backgroundColor: '#0A84FF',
  },
  deck: {
    flex: 1,
    paddingHorizontal: 16,
    position: 'relative',
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLayer: {
    zIndex: 3,
  },
  nextLayer: {
    zIndex: 2,
    transform: [{ scale: 0.95 }, { translateY: 20 }],
    opacity: 0.75,
  },
  thirdLayer: {
    zIndex: 1,
    transform: [{ scale: 0.9 }, { translateY: 36 }],
    opacity: 0.5,
  },
  cardShadow: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fetchingBadge: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 24,
  },
  fetchingText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
});
