import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SignUpSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="mail-outline" size={80} color="#0A84FF" />
      </View>

      <Text style={styles.title}>註冊成功！</Text>
      <Text style={styles.subtitle}>請檢查您的電子郵件</Text>

      <View style={styles.card}>
        <Text style={styles.message}>
          我們已經發送一封確認郵件到您的信箱。{'\n\n'}
          請點擊郵件中的連結來啟用您的帳戶。
        </Text>
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>📧 沒收到郵件？</Text>
        <Text style={styles.tipsText}>• 檢查垃圾郵件資料夾</Text>
        <Text style={styles.tipsText}>• 確認電子郵件地址正確</Text>
        <Text style={styles.tipsText}>• 等待幾分鐘後重試</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>返回登入頁面</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#81C784',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#2E7D32',
    lineHeight: 24,
    textAlign: 'center',
  },
  tips: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
    marginLeft: 8,
  },
  button: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
