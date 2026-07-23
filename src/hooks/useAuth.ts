import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase, getOAuthRedirectUrl } from '../lib/supabase';
import { AuthCredentials, AuthState } from '../types/auth';

// WebBrowser warm up for smooth OAuth popup in Expo
WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  // Listen to Supabase Auth state changes (persistent session)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setAuthState((prev) => ({ ...prev, error: error.message, isLoading: false }));
      } else {
        setAuthState({
          user: session?.user ?? null,
          session: session,
          isLoading: false,
          error: null,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        isLoading: false,
        error: null,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Email/Password Login
  const signInWithEmail = useCallback(async ({ email, password }: AuthCredentials) => {
    if (!email || !password) {
      setAuthState((prev) => ({ ...prev, error: 'Por favor, ingresa tu correo y contraseña.' }));
      return false;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        let localizedError = error.message;
        if (error.message.includes('Invalid login credentials')) {
          localizedError = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        }
        setAuthState((prev) => ({ ...prev, error: localizedError, isLoading: false }));
        return false;
      }
      setAuthState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        error: err.message || 'Error de conexión. Intenta de nuevo.',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  // Email/Password Signup
  const signUpWithEmail = useCallback(async ({ email, password }: AuthCredentials) => {
    if (!email || !password) {
      setAuthState((prev) => ({ ...prev, error: 'Por favor completa todos los campos.' }));
      return false;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthState((prev) => ({ ...prev, error: error.message, isLoading: false }));
        return false;
      }
      setAuthState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      setAuthState((prev) => ({ ...prev, error: err.message, isLoading: false }));
      return false;
    }
  }, []);

  // Google OAuth flow via expo-web-browser / expo-auth-session
  const signInWithGoogle = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const redirectUrl = getOAuthRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success' && result.url) {
          // Parse access_token or refresh_token from redirect url
          const params = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;

            setAuthState({
              user: sessionData.user,
              session: sessionData.session,
              isLoading: false,
              error: null,
            });
            return true;
          }
        }
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return false;
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        error: err.message || 'Error durante el inicio de sesión con Google.',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      session: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    clearError,
  };
};
