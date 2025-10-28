import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Personalization</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Daily briefing</Text>
          <Switch value disabled trackColor={{ true: '#34C759' }} />
        </View>
        <Text style={styles.helper}>Customize topics once backend preferences are wired up.</Text>
      </View>

      <Text style={styles.header}>Notifications</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Breaking news alerts</Text>
          <Switch value={false} disabled trackColor={{ true: '#34C759' }} />
        </View>
        <Text style={styles.helper}>Alerts will be configurable in a later release.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  helper: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
