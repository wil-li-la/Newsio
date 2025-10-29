import React, { useMemo } from 'react';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NewsArticle } from '../types';

type Props = {
  article: NewsArticle;
  showActions?: boolean;
  onPass?: () => void;
  onLike?: () => void;
  onOpenLink?: () => void;
};

export default function ArticleCard({
  article,
  showActions = false,
  onPass,
  onLike,
  onOpenLink,
}: Props) {
  const summary = article?.structuredSummary || article?.description || '';
  const labels = useMemo(
    () => (article?.labels && article.labels.length ? article.labels.slice(0, 6) : []),
    [article?.labels],
  );

  const formattedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleOpenLink = () => {
    if (article?.url) {
      if (onOpenLink) {
        onOpenLink();
      } else {
        Linking.openURL(article.url).catch(() => {});
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.source}>{article?.source || 'Unknown source'}</Text>
        {formattedDate ? <Text style={styles.date}>{formattedDate}</Text> : null}
      </View>

      <Text style={styles.title}>{article?.title || 'Untitled story'}</Text>

      {article?.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.image} />
      ) : null}

      {summary ? (
        <Text style={styles.summary} numberOfLines={8}>
          {summary}
        </Text>
      ) : null}

      {labels.length ? (
        <View style={styles.labels}>
          {labels.map((label) => (
            <View key={label} style={styles.labelChip}>
              <Text style={styles.labelText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, styles.passBtn]} onPress={onPass}>
            <Ionicons name="close" size={18} color="#EF4444" />
            <Text style={styles.actionText}>Pass</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.openBtn]} onPress={handleOpenLink}>
            <Ionicons name="open-outline" size={18} color="#0F172A" />
            <Text style={styles.actionText}>Open</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.likeBtn]} onPress={onLike}>
            <Ionicons name="heart" size={18} color="#F97316" />
            <Text style={styles.actionText}>Like</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  source: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  date: {
    fontSize: 13,
    color: '#64748B',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 30,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  summary: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  passBtn: {
    borderColor: '#FECACA',
  },
  openBtn: {
    borderColor: '#BFDBFE',
  },
  likeBtn: {
    borderColor: '#FED7AA',
  },
});
