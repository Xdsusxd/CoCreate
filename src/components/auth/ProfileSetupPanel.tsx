import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Image, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { SkeuomorphicPanel } from '../common/SkeuomorphicPanel';
import { SkeuomorphicButton } from '../common/SkeuomorphicButton';
import { ErrorBanner } from './ErrorBanner';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { saveUserProfile, UserProfile } from '../../services/profileService';
import { useAuth } from '../../hooks/useAuth';

interface ProfileSetupPanelProps {
  onCompleteSetup?: (profile: UserProfile) => void;
}

export const ProfileSetupPanel: React.FC<ProfileSetupPanelProps> = ({ onCompleteSetup }) => {
  const { user } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Reanimated Shared Values for IG/FB Style Micro-animations
  const avatarScale = useSharedValue(1);
  const avatarOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const focusAnim = useSharedValue(0);

  // Image Picker Handler with IG-Style Spring Scale Feedback
  const handlePickImage = useCallback(async () => {
    try {
      // Tap spring pulse animation
      avatarScale.value = withSequence(
        withSpring(0.9, { damping: 10, stiffness: 200 }),
        withSpring(1.05, { damping: 12, stiffness: 180 }),
        withSpring(1.0, { damping: 14, stiffness: 140 })
      );

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('Se requiere permiso para acceder a la galería de fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setAvatarUri(selectedUri);
        avatarOpacity.value = 0;
        avatarOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) });
        setError(null);
      }
    } catch (err) {
      console.error('[ProfileSetup] Error picking image:', err);
      setError('No se pudo cargar la imagen seleccionada.');
    }
  }, [avatarScale, avatarOpacity]);

  // Username Input Sanitization & Real-time Checkmark Trigger
  const handleUsernameChange = useCallback((text: string) => {
    setError(null);
    const sanitized = text.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(sanitized);

    if (sanitized.length >= 3) {
      checkmarkScale.value = withSpring(1, { damping: 12, stiffness: 180 });
    } else {
      checkmarkScale.value = withTiming(0, { duration: 150 });
    }
  }, [checkmarkScale]);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withSpring(1, { damping: 16, stiffness: 150 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
  };

  // Submit & Save Handler
  const handleSubmit = useCallback(async () => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Por favor ingresa un nombre de usuario.');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const savedProfile = await saveUserProfile(user?.id, cleanUsername, avatarUri);

    setIsSubmitting(false);
    setIsComplete(true);
    console.log('[ProfileSetup] Profile setup completed & persisted:', savedProfile);

    if (onCompleteSetup) {
      onCompleteSetup(savedProfile);
    }
  }, [username, avatarUri, user, onCompleteSetup]);

  // Animated Styles
  const animatedAvatarContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: avatarScale.value }],
    };
  });

  const animatedAvatarImageStyle = useAnimatedStyle(() => {
    return {
      opacity: avatarOpacity.value,
    };
  });

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkmarkScale.value }],
      opacity: checkmarkScale.value,
    };
  });

  const underlineAnimatedStyle = useAnimatedStyle(() => {
    const borderBottomColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [COLORS.borderLine, COLORS.borderFocus]
    );
    const borderBottomWidth = 1 + focusAnim.value * 1; // 1px -> 2px

    return {
      borderBottomColor,
      borderBottomWidth,
    };
  });

  return (
    <SkeuomorphicPanel style={styles.panelContainer}>
      <View style={styles.contentContainer}>
        {/* Title: Instagram/FB Editorial Style */}
        <Text style={styles.titleText}>CREA TU IDENTIDAD</Text>
        <Text style={styles.subtitleText}>Configura tu foto de perfil y alias único.</Text>

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {/* IG/FB Style Circular Avatar Picker with Badge */}
        <Pressable onPress={handlePickImage} style={styles.avatarPickerWrapper}>
          <Animated.View style={[styles.avatarRingOuter, animatedAvatarContainerStyle]}>
            <View style={styles.avatarCircleInner}>
              {avatarUri ? (
                <Animated.Image
                  source={{ uri: avatarUri }}
                  style={[styles.avatarImage, animatedAvatarImageStyle]}
                />
              ) : (
                <View style={styles.avatarPlaceholderBox}>
                  <Text style={styles.userIconSymbol}>👤</Text>
                  <Text style={styles.uploadText}>FOTO</Text>
                </View>
              )}
            </View>

            {/* IG/FB Style Floating Camera / Plus Badge */}
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeIcon}>{avatarUri ? '✎' : '+'}</Text>
            </View>
          </Animated.View>
        </Pressable>

        {/* IG/FB Style Username Input with Real-time Checkmark */}
        <View style={styles.usernameSection}>
          <Text style={[TYPOGRAPHY.label, styles.fieldLabel]}>NOMBRE DE USUARIO</Text>

          <Animated.View style={[styles.inputUnderlineWrapper, underlineAnimatedStyle]}>
            <Text style={styles.atPrefix}>@</Text>
            <TextInput
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="tu_alias"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={!isSubmitting && !isComplete}
              style={[TYPOGRAPHY.body, styles.inputField]}
            />

            {/* Live Validity Checkmark */}
            <Animated.View style={[styles.checkmarkBadge, animatedCheckmarkStyle]}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Action Button */}
        <SkeuomorphicButton
          title={isSubmitting ? 'REGISTRANDO...' : isComplete ? 'PERFIL REGISTRADO' : 'CONFIRMAR PERFIL'}
          onPress={handleSubmit}
          variant="bronze"
          isLoading={isSubmitting}
          disabled={isSubmitting || isComplete}
        />
      </View>
    </SkeuomorphicPanel>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    maxWidth: 420,
    alignSelf: 'center',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: COLORS.kleinBlue, // #2C4EC2
    textAlign: 'center',
  },
  subtitleText: {
    color: COLORS.textSecondary, // #5A5A5C
    fontSize: 13,
    textAlign: 'center',
    marginTop: -12,
  },
  avatarPickerWrapper: {
    marginVertical: 6,
  },
  avatarRingOuter: {
    width: 114,
    height: 114,
    borderRadius: 57, // Circular avatar like IG/FB
    borderWidth: 2,
    borderColor: COLORS.kleinBlue, // Klein Blue accent ring
    padding: 3,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#000000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIconSymbol: {
    fontSize: 28,
    marginBottom: 2,
  },
  uploadText: {
    fontSize: 10,
    fontStyle: 'italic',
    fontWeight: '700',
    color: COLORS.textSecondary, // #5A5A5C
    letterSpacing: 0.8,
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.kleinBlue, // #2C4EC2
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  cameraBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: -1,
  },
  usernameSection: {
    width: '100%',
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontWeight: '700',
  },
  inputUnderlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLine,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  atPrefix: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.kleinBlue, // #2C4EC2
    marginRight: 6,
  },
  inputField: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  checkmarkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#5ECB99', // Mint success green
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmarkIcon: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
});
