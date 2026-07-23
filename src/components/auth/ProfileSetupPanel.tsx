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
import { AsymmetricDiagonalIcon, CheckIcon } from '../common/SvgIcons';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { saveUserProfile, checkUsernameAvailable, UserProfile } from '../../services/profileService';
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

  // Shared Animation Values
  const avatarOpacity = useSharedValue(0);
  const focusAnim = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const shakeTranslateX = useSharedValue(0);

  // Shake animation for unavailable username / submission error
  const triggerShake = useCallback(() => {
    shakeTranslateX.value = withSequence(
      withTiming(-8, { duration: 35 }),
      withTiming(8, { duration: 35 }),
      withTiming(-6, { duration: 35 }),
      withTiming(6, { duration: 35 }),
      withTiming(-3, { duration: 35 }),
      withTiming(0, { duration: 35 })
    );
  }, [shakeTranslateX]);

  // Image Picker Handler
  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('Se requiere permiso para acceder a la galería de fotos.');
        triggerShake();
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
        avatarOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
        setError(null);
      }
    } catch (err) {
      console.error('[ProfileSetup] Error picking image:', err);
      setError('No se pudo cargar la imagen seleccionada.');
      triggerShake();
    }
  }, [avatarOpacity, triggerShake]);

  // Username Input Sanitization & Real-time Checkmark Trigger
  const handleUsernameChange = useCallback(
    (text: string) => {
      setError(null);
      const sanitized = text.replace(/[^a-zA-Z0-9_]/g, '');
      setUsername(sanitized);

      if (sanitized.length >= 3) {
        checkmarkScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      } else {
        checkmarkScale.value = withTiming(0, { duration: 150 });
      }
    },
    [checkmarkScale]
  );

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withSpring(1, { damping: 16, stiffness: 150 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
  };

  // Submit & Save Handler (with Supabase DB duplicate check)
  const handleSubmit = useCallback(async () => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Por favor ingresa un nombre de usuario.');
      triggerShake();
      return;
    }
    if (cleanUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Verify username availability in Supabase DB
      const isAvailable = await checkUsernameAvailable(cleanUsername, user?.id);
      if (!isAvailable) {
        setError('El nombre de usuario no está disponible.');
        setIsSubmitting(false);
        triggerShake();
        return;
      }

      // 2. Persist profile atomically to Supabase DB
      const savedProfile = await saveUserProfile(user?.id || '', cleanUsername);

      setIsSubmitting(false);
      setIsComplete(true);
      console.log('[ProfileSetup] Atomic profile persistence complete:', savedProfile);

      if (onCompleteSetup) {
        onCompleteSetup(savedProfile);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Error al guardar el perfil.');
      triggerShake();
    }
  }, [username, avatarUri, user, triggerShake, onCompleteSetup]);

  // Animated Styles
  const underlineAnimatedStyle = useAnimatedStyle(() => {
    const borderBottomColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [COLORS.borderLine, COLORS.borderFocus]
    );
    const borderBottomWidth = 1 + focusAnim.value * 1;
    return {
      borderBottomColor,
      borderBottomWidth,
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

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeTranslateX.value }],
    };
  });

  return (
    <Animated.View style={shakeAnimatedStyle}>
      <SkeuomorphicPanel style={styles.panelContainer}>
        <View style={styles.contentContainer}>
          {/* Title: Monumental "CREA TU IDENTIDAD" in Klein Blue */}
          <Text style={styles.titleText}>CREA TU IDENTIDAD</Text>
          <Text style={styles.subtitleText}>Configura tu avatar y alias público en CoCreate.</Text>

          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          {/* Non-Generic Editorial Asymmetric Block Avatar Selector */}
          <Pressable onPress={handlePickImage} style={styles.avatarPickerWrapper}>
            <View style={styles.asymmetricBlockFrame}>
              {avatarUri ? (
                <Animated.Image
                  source={{ uri: avatarUri }}
                  style={[styles.avatarImage, animatedAvatarImageStyle]}
                />
              ) : (
                <View style={styles.asymmetricContentRow}>
                  {/* Fine 1px SVG diagonal line */}
                  <View style={styles.diagonalWrapper}>
                    <AsymmetricDiagonalIcon size={32} color="#000000" />
                  </View>
                  <Text style={styles.asymmetricText}>SUBIR ARCHIVO / AVATAR</Text>
                </View>
              )}
            </View>
          </Pressable>

          {/* Username Section with Static "@" Prefix in Klein Blue */}
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

              {/* Real-time Validity SVG Checkmark */}
              <Animated.View style={[styles.checkmarkBadge, animatedCheckmarkStyle]}>
                <CheckIcon size={12} color="#000000" />
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    maxWidth: 420,
    alignSelf: 'center',
    overflow: 'hidden', // Layout containment
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 30,
    lineHeight: 34,
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
    marginVertical: 4,
    width: '100%',
    alignItems: 'center',
  },
  asymmetricBlockFrame: {
    width: 220,
    height: 80,
    borderRadius: 2, // 90-degree sharp angles with micro 2px radius
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden', // Layout containment
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  asymmetricContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagonalWrapper: {
    marginRight: 10,
  },
  asymmetricText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textSecondary, // #5A5A5C
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  usernameSection: {
    width: '100%',
    overflow: 'hidden', // Layout containment
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
    overflow: 'hidden',
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5ECB99', // Mint success green
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
