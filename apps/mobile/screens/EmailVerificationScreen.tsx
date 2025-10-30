import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../types/navigation';

type EmailVerificationScreenProps = StackScreenProps<
  RootStackParamList,
  'EmailVerification'
>;

export default function EmailVerificationScreen({ navigation, route }: EmailVerificationScreenProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const { type } = route.params || {};

  useEffect(() => {
    // 模擬驗證過程
    const timer = setTimeout(() => {
      if (type === 'signup' || type === 'email_change') {
        setStatus('success');
        // 3秒後自動跳轉
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          );
        }, 3000);
      } else {
        setStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [type, navigation]);

  return (
    <View style={styles.container}>
      {status === 'verifying' && (
        <>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.title}>Verifying your email...</Text>
          <Text style={styles.subtitle}>Please wait a moment</Text>
        </>
      )}

      {status === 'success' && (
        <>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          </View>
          <Text style={styles.title}>Email Verified!</Text>
          <Text style={styles.subtitle}>
            Your email has been successfully verified.{'\n'}
            Redirecting to the app...
          </Text>
        </>
      )}

      {status === 'error' && (
        <>
          <View style={styles.iconContainer}>
            <Ionicons name="close-circle" size={80} color="#FF3B30" />
          </View>
          <Text style={styles.title}>Verification Failed</Text>
          <Text style={styles.subtitle}>
            Unable to verify your email.{'\n'}
            Please try again or contact support.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
