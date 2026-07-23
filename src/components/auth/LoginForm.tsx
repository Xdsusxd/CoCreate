import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SkeuomorphicInput } from '../common/SkeuomorphicInput';
import { SkeuomorphicButton } from '../common/SkeuomorphicButton';
import { LiquidGlassPanel } from '../common/LiquidGlassPanel';
import { GoogleOfficialIcon } from '../common/GoogleOfficialIcon';
import { ErrorBanner } from './ErrorBanner';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { AuthMode, AuthCredentials } from '../../types/auth';
import { checkUsernameAvailable } from '../../services/profileService';

interface LoginFormProps {
  onEmailSubmit: (credentials: AuthCredentials, mode: AuthMode) => Promise<boolean>;
  onGoogleSubmit: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onEmailSubmit,
  onGoogleSubmit,
  isLoading,
  error,
  onClearError,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleMode = useCallback(() => {
    onClearError();
    setValidationError(null);
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  }, [onClearError]);

  const handleSubmit = useCallback(async () => {
    onClearError();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('El correo electrónico es requerido.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setValidationError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (mode === 'signup') {
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername) {
        setValidationError('El nombre de usuario es requerido.');
        return;
      }
      if (cleanUsername.length < 3) {
        setValidationError('El nombre de usuario debe tener al menos 3 caracteres.');
        return;
      }

      // Pre-validation check for duplicate username
      const available = await checkUsernameAvailable(cleanUsername);
      if (!available) {
        setValidationError('El nombre de usuario ya está registrado por otra cuenta.');
        return;
      }
    }

    await onEmailSubmit({ email: email.trim(), password, username: username.trim() }, mode);
  }, [email, password, username, mode, onEmailSubmit, onClearError]);

  return (
    <LiquidGlassPanel style={styles.panelContainer}>
      <View style={styles.flexContainer}>
        <ErrorBanner message={validationError || error} onDismiss={onClearError} />

        {/* Inputs Group */}
        <View style={styles.inputGroup}>
          <SkeuomorphicInput
            label="CORREO ELECTRÓNICO"
            value={email}
            onChangeText={setEmail}
            placeholder="usuario@cocreate.app"
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading}
          />

          <SkeuomorphicInput
            label="CONTRASEÑA"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            secureTextEntry
            disabled={isLoading}
          />

          {mode === 'signup' && (
            <SkeuomorphicInput
              label="NOMBRE DE USUARIO (USERNAME)"
              value={username}
              onChangeText={setUsername}
              placeholder="tu_username"
              autoCapitalize="none"
              disabled={isLoading}
            />
          )}
        </View>

        {/* Primary Action Button */}
        <SkeuomorphicButton
          title={mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
          onPress={handleSubmit}
          variant="bronze"
          isLoading={isLoading}
        />

        {/* Fine Line Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={[TYPOGRAPHY.label, styles.dividerText]}>O CONTINÚA CON</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google OAuth Button with Official 4-Color SVG Icon */}
        <SkeuomorphicButton
          title="GOOGLE OAUTH"
          onPress={onGoogleSubmit}
          variant="metal"
          isLoading={isLoading}
          icon={<GoogleOfficialIcon size={18} />}
        />

        {/* Footer Mode Switch */}
        <View style={styles.footerRow}>
          <Text style={[TYPOGRAPHY.body, styles.footerQuestion]}>
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </Text>
          <Pressable onPress={toggleMode} hitSlop={10}>
            <Text style={[TYPOGRAPHY.bodyBold, styles.footerActionText]}>
              {mode === 'login' ? ' Registrarse' : ' Iniciar Sesión'}
            </Text>
          </Pressable>
        </View>
      </View>
    </LiquidGlassPanel>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    maxWidth: 420,
    alignSelf: 'center',
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLine,
  },
  dividerText: {
    color: COLORS.textSecondary,
    marginHorizontal: 12,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerQuestion: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
  footerActionText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
