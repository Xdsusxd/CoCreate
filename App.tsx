import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen, SplashResult } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { useAuth } from './src/hooks/useAuth';
import { COLORS } from './src/theme/colors';

export default function App() {
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedAndVerified, setIsLoggedAndVerified] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState<string | null>(null);

  const handleSplashFinish = (result: SplashResult) => {
    setShowSplash(false);
    if (result.hasSession && result.hasProfile && result.username) {
      console.log(`¡Bienvenido de vuelta, ${result.username}!`);
      setVerifiedUsername(result.username);
      setIsLoggedAndVerified(true);
    }
  };

  const handleLoginSuccess = (username?: string) => {
    if (username) {
      console.log(`¡Bienvenido de vuelta, ${username}!`);
      setVerifiedUsername(username);
    }
    setIsLoggedAndVerified(true);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <View style={styles.rootContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>CoCreate</Text>
          </View>
        ) : showSplash ? (
          <SplashScreen onFinishSplash={handleSplashFinish} />
        ) : isLoggedAndVerified ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>CoCreate</Text>
            <Text style={styles.welcomeSubtitle}>
              ¡Bienvenido de vuelta, {verifiedUsername || 'usuario'}!
            </Text>
            <Text style={styles.sessionStatusText}>Sesión activa y autenticada en Supabase</Text>
          </View>
        ) : (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background, // Clean chalk white #FAF9F5
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.kleinBlue,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
