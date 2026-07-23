import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { useAuth } from './src/hooks/useAuth';
import { COLORS } from './src/theme/colors';

export default function App() {
  const { user, isLoading, signOut } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    }
  }, [user]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAuthenticated(false);
    setShowSplash(false); // Skip splash on sign out back to login
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <View style={styles.rootContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>CoCreate</Text>
          </View>
        ) : isAuthenticated ? (
          <HomeScreen user={user} onSignOut={handleSignOut} />
        ) : showSplash ? (
          <SplashScreen onFinishSplash={handleSplashFinish} />
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
    backgroundColor: COLORS.background, // Chalk White #FAF9F5
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.kleinBlue,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
});
