import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen, SplashResult } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardNavigator } from './src/navigation/DashboardNavigator';
import { useAuth } from './src/hooks/useAuth';
import { COLORS } from './src/theme/colors';

export default function App() {
  const { isLoading, user, profile, signOut } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedAndVerified, setIsLoggedAndVerified] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState<string | null>(null);

  const handleSplashFinish = (result: SplashResult) => {
    setShowSplash(false);
    if (result.hasSession && result.hasProfile && result.username) {
      setVerifiedUsername(result.username);
      setIsLoggedAndVerified(true);
    }
  };

  const handleLoginSuccess = (username?: string) => {
    if (username) {
      setVerifiedUsername(username);
    }
    setIsLoggedAndVerified(true);
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedAndVerified(false);
    setVerifiedUsername(null);
  };

  const activeUsername = verifiedUsername || profile?.username || user?.email?.split('@')[0] || 'usuario';
  const activeUserId = user?.id || profile?.id;

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
          <DashboardNavigator
            onLogout={handleLogout}
            username={activeUsername}
            userId={activeUserId}
          />
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
});
