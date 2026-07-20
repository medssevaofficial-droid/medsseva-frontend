import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../src/store';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../src/theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess } from '../src/store/slices/authSlice';

import { GlobalSchedulerOverlay } from '../src/components/GlobalSchedulerOverlay';
import { ToastHost } from '../src/components/ToastHost';

const queryClient = new QueryClient();

function AppContent() {
  const dispatch = useDispatch();
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userRaw = await AsyncStorage.getItem('user');
        if (token && userRaw) {
          const user = JSON.parse(userRaw);
          dispatch(loginSuccess(user));
        }
      } catch (e) {
        console.warn('Session restore failed', e);
      } finally {
        setRehydrated(true);
      }
    };
    restoreSession();
  }, []);

  if (!rehydrated) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.textLight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
     <Stack.Screen name="(partner)" options={{ headerShown: false }} />
        <Stack.Screen name="support" options={{ headerShown: false }} />
      </Stack>
      <GlobalSchedulerOverlay />
      <ToastHost />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});