import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { MotiView, MotiText } from 'moti';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { AuthCredentials, AuthMode } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const [isSuccessDissolving, setIsSuccessDissolving] = useState(false);

  // Success dissolution animation shared values
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);

  const handleAuthSubmit = async (credentials: AuthCredentials, mode: AuthMode) => {
    const success = mode === 'login'
      ? await signInWithEmail(credentials)
      : await signUpWithEmail(credentials);

    if (success) {
      triggerSuccessDissolve();
    }
    return success;
  };

  const handleGoogleSubmit = async () => {
    const success = await signInWithGoogle();
    if (success) {
      triggerSuccessDissolve();
    }
    return success;
  };

  const triggerSuccessDissolve = () => {
    setIsSuccessDissolving(true);
    cardScale.value = withSpring(0.98, { damping: 25, stiffness: 200 });
    cardTranslateY.value = withTiming(-6, { duration: 300 });
    cardOpacity.value = withTiming(0, { duration: 350 }, (finished) => {
      if (finished) {
        runOnJS(onLoginSuccess)();
      }
    });
  };

  const cardDissolveStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [{ scale: cardScale.value }, { translateY: cardTranslateY.value }],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding Section - Seamless Shared Logo Header */}
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 50 }}
          style={styles.headerSection}
        >
          {/* Monumental Logo: "Co" (italic 300) + "Create" (normal 900) in Klein Blue #2C4EC2 */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoCo}>Co</Text>
            <Text style={styles.logoCreate}>Create</Text>
          </View>

          {/* Subtitle in Ash Grey */}
          <MotiText
            from={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 180 }}
            style={[TYPOGRAPHY.subtitle, styles.subtitleText]}
          >
            Donde las mentes visionarias construyen el futuro.
          </MotiText>
        </MotiView>

        {/* Micro-displacement Entrance (6px slide-up with fade-in) */}
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 250 }}
          style={styles.cardContainerWrapper}
        >
          <Animated.View style={[styles.cardAnimatedView, cardDissolveStyle]}>
            <LoginForm
              onEmailSubmit={handleAuthSubmit}
              onGoogleSubmit={handleGoogleSubmit}
              isLoading={isLoading}
              error={error}
              onClearError={clearError}
            />
          </Animated.View>
        </MotiView>

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
    marginBottom: 36,
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 4,
  },
  logoCo: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.kleinBlue, // #2C4EC2
  },
  logoCreate: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '900',
    fontStyle: 'normal',
    color: COLORS.kleinBlue, // #2C4EC2
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
  cardAnimatedView: {
    width: '100%',
  },
  footerInfo: {
    marginTop: 36,
    alignItems: 'center',
  },
  footerInfoText: {
    color: COLORS.textSecondary, // Ash Grey #5A5A5C
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});
