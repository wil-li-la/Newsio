import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import LoginScreen from './screens/LoginScreen';
import ArticleDetailScreen from './screens/ArticleDetailScreen';
import SearchScreen from './screens/SearchScreen';
import NewsfeedScreen from './screens/NewsfeedScreen';
import LibraryScreen from './screens/LibraryScreen';
import SettingsScreen from './screens/SettingsScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import SignUpSuccessScreen from './screens/SignUpSuccessScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICON = {
  Newsfeed: 'newspaper-outline',
  Search: 'search-outline',
  Library: 'bookmark-outline',
  Settings: 'settings-outline',
};

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Newsfeed"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingVertical: 6,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICON[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Newsfeed" component={NewsfeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { session, initializing } = useAuth();
  const navigationRef = useRef();

  useEffect(() => {
    // 處理 Deep Linking
    const handleDeepLink = async (event) => {
      const url = event.url;
      console.log('📱 Deep link received:', url);
      
      if (url) {
        // 解析 URL 參數
        const hashPart = url.split('#')[1];
        const queryPart = url.split('?')[1];
        const params = new URLSearchParams(hashPart || queryPart || '');
        
        const type = params.get('type');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        console.log('🔑 URL params:', { type, hasToken: !!accessToken });
        
        // 如果有 access token，設定 session
        if (accessToken && refreshToken) {
          try {
            console.log('🔐 Setting session from tokens...');
            const { supabase } = require('./lib/supabase');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('❌ Failed to set session:', error);
            } else {
              console.log('✅ Session set successfully:', data);
            }
          } catch (err) {
            console.error('❌ Error setting session:', err);
          }
        }
        
        // 如果是註冊或 email 變更的驗證
        if (type === 'signup' || type === 'email_change') {
          // 導航到驗證頁面
          setTimeout(() => {
            navigationRef.current?.navigate('EmailVerification', { type });
          }, 100);
        }
      }
    };

    // 監聽 Deep Link
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 檢查初始 URL（app 被 deep link 啟動）
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      ref={navigationRef}
      screenOptions={{
        headerShown: false,
      }}
    >
      {session ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="ArticleDetail"
            component={ArticleDetailScreen}
            options={{ title: '文章詳情' }}
          />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
            options={{ title: 'Email Verification' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Welcome' }}
          />
          <Stack.Screen
            name="SignUpSuccess"
            component={SignUpSuccessScreen}
            options={{ title: 'Sign Up Success' }}
          />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
            options={{ title: 'Email Verification' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
