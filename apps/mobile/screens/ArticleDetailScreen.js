import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';

export default function ArticleDetailScreen({ route, navigation }) {
  const { article } = route.params;

  const handleOpenUrl = async () => {
    if (article.url) {
      const supported = await Linking.canOpenURL(article.url);
      if (supported) {
        await Linking.openURL(article.url);
      } else {
        console.error("無法打開 URL:", article.url);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>文章詳情</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>來源：</Text>
            <Text style={styles.metaValue}>{article.source}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>分類：</Text>
            <Text style={styles.metaValue}>{article.category || '未分類'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>地區：</Text>
            <Text style={styles.metaValue}>{article.region || '全球'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>發布時間：</Text>
            <Text style={styles.metaValue}>
              {new Date(article.published_at).toLocaleString('zh-TW')}
            </Text>
          </View>
        </View>

        {/* Description */}
        {article.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>摘要</Text>
            <Text style={styles.description}>{article.description}</Text>
          </View>
        )}

        {/* Image Placeholder */}
        {article.image_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>圖片</Text>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                🖼️ 圖片 URL: {article.image_url}
              </Text>
              <Text style={styles.imageNote}>
                (需要安裝 react-native-fast-image 或 expo-image 來顯示圖片)
              </Text>
            </View>
          </View>
        )}

        {/* Original URL */}
        {article.url && (
          <TouchableOpacity 
            style={styles.urlButton}
            onPress={handleOpenUrl}
          >
            <Text style={styles.urlButtonText}>🔗 閱讀原文</Text>
          </TouchableOpacity>
        )}

        {/* Article ID */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            文章 ID: {article.article_id || article.id}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    lineHeight: 32,
  },
  metaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 80,
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  imagePlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  imageNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  urlButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  urlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
