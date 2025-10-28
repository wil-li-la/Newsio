import React, { useMemo, useCallback } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';

type Article = {
  id?: string;
  title?: string;
  summary?: string;
  content?: string;
  url?: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

type RootStackParamList = {
  ArticleDetail: {
    article?: Article;
  };
  [key: string]: undefined | object;
};

type ArticleDetailRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;
type ArticleDetailNavProp = StackNavigationProp<RootStackParamList, 'ArticleDetail'>;

export default function ArticleDetailScreen() {
  const navigation = useNavigation<ArticleDetailNavProp>();
  const route = useRoute<ArticleDetailRouteProp>();

  const article = route.params?.article;

  const publishedText = useMemo(() => {
    if (!article?.publishedAt) {
      return '';
    }
    try {
      const date = new Date(article.publishedAt);
      return date.toLocaleString();
    } catch {
      return article.publishedAt;
    }
  }, [article?.publishedAt]);

  const handleOpenSource = useCallback(() => {
    if (!article?.url) {
      return;
    }
    Linking.openURL(article.url).catch(() => {});
  }, [article?.url]);

  if (!article) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No article data</Text>
        <Text style={styles.emptySubtitle}>
          Try opening an article from the newsfeed again.
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.backButtonLabel}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.closeButtonPressed,
        ]}
      >
        <Ionicons name="arrow-back" size={20} color="#0F172A" />
        <Text style={styles.closeButtonLabel}>Back</Text>
      </Pressable>

      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.metaContainer}>
        {article.source ? (
          <Text style={styles.sourceLabel}>{article.source}</Text>
        ) : null}
        {publishedText ? (
          <Text style={styles.dateLabel}>{publishedText}</Text>
        ) : null}
      </View>

      <Text style={styles.title}>{article.title || 'Untitled article'}</Text>

      {article.summary ? (
        <Text style={styles.summary}>{article.summary}</Text>
      ) : null}

      <Text style={styles.content}>{article.content || 'No content available.'}</Text>

      {article.url ? (
        <Pressable
          onPress={handleOpenSource}
          style={({ pressed }) => [
            styles.readMoreButton,
            pressed && styles.readMoreButtonPressed,
          ]}
        >
          <Ionicons name="open-outline" size={20} color="#ffffff" />
          <Text style={styles.readMoreLabel}>Read full story</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  sourceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A84FF',
  },
  dateLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summary: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E293B',
    marginBottom: 24,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#0A84FF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  readMoreButtonPressed: {
    opacity: 0.75,
  },
  readMoreLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#0A84FF',
  },
  backButtonPressed: {
    opacity: 0.75,
  },
  backButtonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
