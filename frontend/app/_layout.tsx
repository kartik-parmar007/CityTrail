import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="booking-success" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
