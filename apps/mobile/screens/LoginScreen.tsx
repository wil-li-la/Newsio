import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';

const logoSource = require('../assets/icon.png');

export default function LoginScreen({ navigation: _navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn, signUp } = useAuth();

  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const validateFields = () => {
    if (!trimmedEmail || !password) {
      setErrorMessage('Email and password are required.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSignIn = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      setSubmitting('signin');
      await signIn(trimmedEmail, password);
    } catch (error) {
      const message = error?.message || 'Unable to sign in. Please try again later.';
      setErrorMessage(message);
      Alert.alert('Sign In Failed', message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSignUp = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      setSubmitting('signup');
      await signUp(trimmedEmail, password);
      Alert.alert(
        'Check Your Email',
        'We sent you a confirmation link. Complete the sign-up process there and then sign in.',
      );
    } catch (error) {
      const message = error?.message || 'Unable to create an account right now. Please try again later.';
      setErrorMessage(message);
      Alert.alert('Sign Up Failed', message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.safeArea}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={logoSource} style={styles.logo} accessibilityRole="image" />
          <Text style={styles.title}>Welcome to NewsFlow</Text>
          <Text style={styles.subtitle}>Sign in to personalize your daily briefing.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            placeholderTextColor="#8E8E93"
          />

          <Text style={[styles.label, styles.labelSpacing]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor="#8E8E93"
          />

          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleSignIn}
            activeOpacity={0.8}
            disabled={!!submitting}
          >
            <Text style={styles.primaryButtonText}>
              {submitting === 'signin' ? 'Signing In…' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, submitting && styles.disabledOutlineButton]}
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={!!submitting}
          >
            <Text style={styles.secondaryButtonText}>
              {submitting === 'signup' ? 'Sending Link…' : 'Create an Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A84FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    backgroundColor: '#0A84FF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#F2F2F7',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  labelSpacing: {
    marginTop: 16,
  },
  input: {
    marginTop: 8,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#F2F2F7',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF453A',
  },
  primaryButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
  },
  disabledOutlineButton: {
    opacity: 0.7,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#D7D7DB',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#fff',
    fontWeight: '600',
  },
});
