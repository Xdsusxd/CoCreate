import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { MotiView, MotiText } from 'moti';
import { LoginForm } from '../components/auth/LoginForm';
import { ProfileSetupPanel } from '../components/auth/ProfileSetupPanel';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { AuthCredentials, AuthMode } from '../types/auth';
import { UserProfile } from '../services/profileService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const [step, setStep] = useState<'credentials' | 'profile_setup'>('credentials');

  // Motion Graphics Shared Values for Lateral Collapse / Elastic Expand Transition
  const credentialsScaleX = useSharedValue(1);
  const credentialsOpacity = useSharedValue(1);
  const profileScaleX = useSharedValue(0);
  const profileOpacity = useSharedValue(0);

  const handleAuthSubmit = async (credentials: AuthCredentials, mode: AuthMode) => {
    const success = mode === 'login'
      ? await signInWithEmail(credentials)
      : await signUpWithEmail(credentials);

    if (success) {
      triggerTransitionToProfile();
    }
    return success;
  };

  const handleGoogleSubmit = async () => {
    const success = await signInWithGoogle();
    if (success) {
      triggerTransitionToProfile();
    }
    return success;
  };

  // Step 1 -> Step 2 Motion Graphics Transition:
  // 1. Credentials form fades & collapses horizontally toward center (scaleX: 1 -> 0).
  // 2. Profile Setup Panel opens elastically (scaleX: 0 -> 1 with Spring interpolation).
  const triggerTransitionToProfile = () => {
    credentialsOpacity.value = withTiming(0, { duration: 250 });
    credentialsScaleX.value = withTiming(
      0,
      { duration: 320, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setStep)('profile_setup');
          profileScaleX.value = withSpring(1, { damping: 16, stiffness: 130 });
          profileOpacity.value = withTiming(1, { duration: 350 });
        }
      }
    );
  };

  const handleProfileSetupComplete = (profile: UserProfile) => {
    console.log('[LoginScreen] Profile setup completed successfully:', profile);
    // Flow halted here as requested by prompt guidelines (profile_setup_completed: true saved in AsyncStorage & Supabase)
  };

  const credentialsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: credentialsOpacity.value,
      transform: [{ scaleX: credentialsScaleX.value }],
    };
  });

  const profileAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: profileOpacity.value,
      transform: [{ scaleX: profileScaleX.value }],
    };
  });

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

        {/* Transition Container: Credentials Form <-> Profile Setup Panel */}
        <View style={styles.cardContainerWrapper}>
          {step === 'credentials' ? (
            <Animated.View style={[styles.cardAnimatedView, credentialsAnimatedStyle]}>
              <LoginForm
                onEmailSubmit={handleAuthSubmit}
                onGoogleSubmit={handleGoogleSubmit}
                isLoading={isLoading}
                error={error}
                onClearError={clearError}
              />
            </Animated.View>
          ) : (
            <Animated.View style={[styles.cardAnimatedView, profileAnimatedStyle]}>
              <ProfileSetupPanel onCompleteSetup={handleProfileSetupComplete} />
            </Animated.View>
          )}
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
    color: COLORS.textSecondary,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});
