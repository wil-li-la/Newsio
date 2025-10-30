import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { signOut, session } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              console.log('🚪 Signing out...');
              await signOut();
              console.log('✅ Sign out successful');
            } catch (error) {
              console.error('❌ Sign out error:', error);
              const message =
                error instanceof Error
                  ? error.message
                  : 'Unable to sign out. Please try again.';
              Alert.alert('Sign Out Failed', message);
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
  };

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

      {session && (
        <>
          <Text style={styles.header}>Account</Text>
          <View style={styles.card}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{session.user?.email || 'N/A'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]}
              onPress={handleSignOut}
              disabled={signingOut}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutButtonText}>
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  accountInfo: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  signOutButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
