import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { AuthCredentials, AuthMode } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (username?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuth();

  const handleAuthSubmit = async (credentials: AuthCredentials, mode: AuthMode) => {
    const result = mode === 'login'
      ? await signInWithEmail(credentials)
      : await signUpWithEmail(credentials);

    if (result.success) {
      if (result.username) {
        console.log(`¡Bienvenido de vuelta, ${result.username}!`);
      }
      onLoginSuccess(result.username);
    }
    return result.success;
  };

  const handleGoogleSubmit = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      if (result.username) {
        console.log(`¡Bienvenido de vuelta, ${result.username}!`);
      }
      onLoginSuccess(result.username);
    }
    return result.success;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding Section */}
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 50 }}
          style={styles.headerSection}
        >
          <View style={styles.logoContainer}>
            {/* Glossy Refraction Effect on Logo */}
            <View style={styles.logoGlossyStripe} />
            <Text style={styles.logoCo}>Co</Text>
            <Text style={styles.logoCreate}>Create</Text>
          </View>

          <MotiText
            from={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 180 }}
            style={[TYPOGRAPHY.subtitle, styles.subtitleText]}
          >
            Donde las mentes visionarias construyen el futuro.
          </MotiText>
        </MotiView>

        {/* Consolidated Login / Register Liquid Glass Form */}
        <View style={styles.cardContainerWrapper}>
          <LoginForm
            onEmailSubmit={handleAuthSubmit}
            onGoogleSubmit={handleGoogleSubmit}
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
          />
        </View>

        {/* Professional Team Credits Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 500, delay: 400 }}
          style={styles.footerInfo}
        >
          <Text style={[TYPOGRAPHY.label, styles.footerInfoText]}>
            CREADO POR B-AP TEAM · DIRECCIÓN: KAR AP
          </Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Clean chalk white #FAF9F5
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  logoGlossyStripe: {
    position: 'absolute',
    top: 5,
    left: -10,
    right: -10,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '-8deg' }],
    zIndex: 1,
    pointerEvents: 'none',
  },
  logoCo: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.kleinBlue, // Klein Blue #2C4EC2
  },
  logoCreate: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '900',
    fontStyle: 'normal',
    color: COLORS.kleinBlue, // Klein Blue #2C4EC2
  },
  subtitleText: {
    color: COLORS.textSecondary, // Ash Grey #5A5A5C
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 320,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  cardContainerWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  footerInfo: {
    marginTop: 36,
    alignItems: 'center',
  },
  footerInfoText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});
