import React, { useCallback } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  // Implement Clerk authentication using the official Hosted Web UI redirect flow via useOAuth
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPressRegister = useCallback(async () => {
    try {
      // Use makeRedirectUri from expo-linking
      const redirectUrl = Linking.createURL('/(tabs)/home', { scheme: 'frontend' });

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl,
      });

      // Store the session after successful login
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to CityTrail</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <TouchableOpacity style={styles.button} onPress={onPressRegister}>
          <Text style={styles.buttonText}>Sign Up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  logoContainer: { width: 240, height: 80, justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: '100%', height: '100%' },
  formContainer: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', marginBottom: 30, textAlign: 'center' },
  button: {
    backgroundColor: '#136dec',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#136dec', fontSize: 14 },
});
