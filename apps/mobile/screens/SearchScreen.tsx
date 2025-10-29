import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export default function SearchScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search News</Text>
      <Text style={styles.subtitle}>Use keywords to find the stories you care about.</Text>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('Newsfeed')}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>Browse Latest Articles</Text>
      </TouchableOpacity>
      <Text style={styles.helperText}>Full search experience coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  ctaButton: {
    marginTop: 32,
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
});
