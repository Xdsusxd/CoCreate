import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Image, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
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

  // Animation shared values for avatar fade-in & focus line expansion
  const avatarOpacity = useSharedValue(0);
  const focusAnim = useSharedValue(0);

  // Image Picker Handler
  const handlePickImage = useCallback(async () => {
    try {
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
        avatarOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
        setError(null);
      }
    } catch (err) {
      console.error('[ProfileSetup] Error picking image:', err);
      setError('No se pudo cargar la imagen seleccionada.');
    }
  }, [avatarOpacity]);

  // Username Input Sanitization (strip spaces and non-alphanumeric/underscore chars)
  const handleUsernameChange = useCallback((text: string) => {
    setError(null);
    const sanitized = text.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(sanitized);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
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

    // Persist to AsyncStorage and Supabase
    const savedProfile = await saveUserProfile(user?.id, cleanUsername, avatarUri);

    setIsSubmitting(false);
    setIsComplete(true);
    console.log('[ProfileSetup] Setup Halt Reached. Profile persisted:', savedProfile);

    if (onCompleteSetup) {
      onCompleteSetup(savedProfile);
    }
  }, [username, avatarUri, user, onCompleteSetup]);

  // Animated Underline Style
  const underlineAnimatedStyle = useAnimatedStyle(() => {
    const borderBottomColor = isFocused ? COLORS.borderFocus : COLORS.borderLine;
    const borderBottomWidth = isFocused ? 2 : 1;
    return {
      borderBottomColor,
      borderBottomWidth,
    };
  });

  const animatedAvatarStyle = useAnimatedStyle(() => {
    return {
      opacity: avatarOpacity.value,
    };
  });

  return (
    <SkeuomorphicPanel style={styles.panelContainer}>
      <View style={styles.contentContainer}>
        {/* Title: Monumental "CREA TU IDENTIDAD" in Klein Blue */}
        <Text style={styles.titleText}>CREA TU IDENTIDAD</Text>
        <Text style={styles.subtitleText}>Configura tu avatar y alias público en CoCreate.</Text>

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {/* Avatar Selector Container */}
        <Pressable onPress={handlePickImage} style={styles.avatarPickerWrapper}>
          <View style={styles.avatarFrame}>
            {avatarUri ? (
              <Animated.Image
                source={{ uri: avatarUri }}
                style={[styles.avatarImage, animatedAvatarStyle]}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.uploadText}>SUBIR IMAGEN</Text>
              </View>
            )}
          </View>
        </Pressable>

        {/* Username Field with Static "@" Prefix */}
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
    fontSize: 32,
    lineHeight: 36,
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
  },
  avatarFrame: {
    width: 104,
    height: 104,
    borderRadius: 2, // Sharp 90-degree corners with micro 2px radius
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  uploadText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textSecondary, // #5A5A5C
    letterSpacing: 0.5,
    fontWeight: '400',
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
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.kleinBlue, // #2C4EC2
    marginRight: 6,
  },
  inputField: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
});
