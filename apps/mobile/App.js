import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
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
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Welcome' }}
        />
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
