import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { TabParamList } from '../types/navigation';

type LibraryScreenProps = BottomTabScreenProps<TabParamList, 'Library'>;

export default function LibraryScreen({ navigation }: LibraryScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Library</Text>
      <Text style={styles.description}>
        Articles you like will appear here once the swipe experience is in place.
      </Text>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('Newsfeed')}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>Browse Headlines</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    marginTop: 28,
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
