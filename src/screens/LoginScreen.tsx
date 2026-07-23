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

  // Motion Graphics Curtain Shared Values (1px Klein Blue line expanding outward)
  const curtainScaleX = useSharedValue(0);
  const curtainOpacity = useSharedValue(0);
  const credentialsOpacity = useSharedValue(1);
  const profileOpacity = useSharedValue(0);

  const handleAuthSubmit = async (credentials: AuthCredentials, mode: AuthMode) => {
    const result = mode === 'login'
      ? await signInWithEmail(credentials)
      : await signUpWithEmail(credentials);

    if (result.success) {
      if (result.profileExists) {
        // Skip profile setup if profile already exists in DB/cache
        onLoginSuccess();
      } else {
        triggerCurtainTransitionToProfile();
      }
    }
    return result.success;
  };

  const handleGoogleSubmit = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      if (result.profileExists) {
        onLoginSuccess();
      } else {
        triggerCurtainTransitionToProfile();
      }
    }
    return result.success;
  };

  // Step 1 -> Step 2 Curtain Transition:
  // 1. Credentials form fades.
  // 2. 1px Klein Blue line expands horizontally outward as a curtain reveal.
  // 3. ProfileSetupPanel opens smoothly.
  const triggerCurtainTransitionToProfile = () => {
    credentialsOpacity.value = withTiming(0, { duration: 250 });
    curtainOpacity.value = 1;
    curtainScaleX.value = withTiming(
      1,
      { duration: 400, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setStep)('profile_setup');
          curtainOpacity.value = withTiming(0, { duration: 250 });
          profileOpacity.value = withTiming(1, { duration: 350 });
        }
      }
    );
  };

  const handleProfileSetupComplete = (profile: UserProfile) => {
    console.log('[LoginScreen] Profile setup completed:', profile);
    onLoginSuccess();
  };

  const credentialsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: credentialsOpacity.value,
    };
  });

  const profileAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: profileOpacity.value,
    };
  });

  const curtainAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: curtainOpacity.value,
      transform: [{ scaleX: curtainScaleX.value }],
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

        {/* Transition Container: Credentials Form <-> 1px Curtain Line <-> Profile Setup Panel */}
        <View style={styles.cardContainerWrapper}>
          {/* Horizontal 1px Klein Blue Curtain Line Reveal */}
          <Animated.View style={[styles.curtainLine, curtainAnimatedStyle]} />

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
    position: 'relative',
    overflow: 'hidden', // Layout containment
  },
  curtainLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1, // 1px horizontal Klein Blue curtain
    backgroundColor: COLORS.kleinBlue,
    zIndex: 10,
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
