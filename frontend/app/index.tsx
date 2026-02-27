import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

import LoadingScreen from '../src/components/LoadingScreen';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/login" />;
}
