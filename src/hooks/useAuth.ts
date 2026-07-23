import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { supabase, getOAuthRedirectUrl } from '../lib/supabase';
import { fetchProfileFromSupabase, saveUserProfile, UserProfile, checkUsernameAvailable } from '../services/profileService';
import { AuthCredentials } from '../types/auth';

WebBrowser.maybeCompleteAuthSession();

export interface AuthStateExtended {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Secure authentication hook.
 * - NO mock sessions. NO local fallback. NO access without valid Supabase JWT.
 * - Every auth method returns { success, profileExists, username } for navigation logic.
 * - Profile is fetched from Supabase DB after successful auth.
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthStateExtended>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Fetch profile from Supabase DB for authenticated user
  const loadProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      return await fetchProfileFromSupabase(userId);
    } catch (err) {
      console.warn('[useAuth] Error loading profile:', err);
      return null;
    }
  }, []);

  // Initialize: restore persisted Supabase session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const profile = await loadProfile(session.user.id);
        if (profile?.username) {
          console.log(`¡Bienvenido de vuelta, ${profile.username}!`);
        }

        setAuthState({
          user: session.user,
          session,
          profile,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.warn('[useAuth] Init error:', err);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Listen to realtime auth state changes (token refresh, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const profile = await loadProfile(session.user.id);
        if (profile?.username) {
          console.log(`¡Bienvenido de vuelta, ${profile.username}!`);
        }
        setAuthState({
          user: session.user,
          session,
          profile,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Email/Password Login.
   * Calls supabase.auth.signInWithPassword exclusively.
   */
  const signInWithEmail = useCallback(
    async (
      emailOrCredentials: string | AuthCredentials,
      passwordArg?: string
    ): Promise<{ success: boolean; profileExists: boolean; username?: string }> => {
      const email = typeof emailOrCredentials === 'string' ? emailOrCredentials : emailOrCredentials.email;
      const password = typeof emailOrCredentials === 'string' ? passwordArg || '' : emailOrCredentials.password;

      if (!email?.trim() || !password) {
        setAuthState((prev) => ({ ...prev, error: 'Por favor, ingresa tu correo y contraseña.' }));
        return { success: false, profileExists: false };
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        }
        setAuthState((prev) => ({ ...prev, error: msg, isLoading: false }));
        return { success: false, profileExists: false };
      }

      const profile = await loadProfile(data.user.id);
      if (profile?.username) {
        console.log(`¡Bienvenido de vuelta, ${profile.username}!`);
      }

      setAuthState({
        user: data.user,
        session: data.session,
        profile,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        profileExists: Boolean(profile?.username),
        username: profile?.username,
      };
    },
    [loadProfile]
  );

  /**
   * Email/Password/Username Signup.
   * Calls supabase.auth.signUp with username in raw_user_meta_data.
   * Validates and saves profile directly in Supabase DB.
   */
  const signUpWithEmail = useCallback(
    async (
      emailOrCredentials: string | AuthCredentials,
      passwordArg?: string,
      usernameArg?: string
    ): Promise<{ success: boolean; profileExists: boolean; username?: string }> => {
      const email = typeof emailOrCredentials === 'string' ? emailOrCredentials : emailOrCredentials.email;
      const password = typeof emailOrCredentials === 'string' ? passwordArg || '' : emailOrCredentials.password;
      const username = typeof emailOrCredentials === 'string' ? usernameArg || '' : emailOrCredentials.username || '';

      if (!email?.trim() || !password || !username?.trim()) {
        setAuthState((prev) => ({ ...prev, error: 'Por favor completa todos los campos (Email, Contraseña, Username).' }));
        return { success: false, profileExists: false };
      }

      if (password.length < 6) {
        setAuthState((prev) => ({
          ...prev,
          error: 'La contraseña debe tener al menos 6 caracteres.',
        }));
        return { success: false, profileExists: false };
      }

      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        setAuthState((prev) => ({
          ...prev,
          error: 'El nombre de usuario debe tener al menos 3 caracteres (letras, números, _).',
        }));
        return { success: false, profileExists: false };
      }

      // Check username availability in Supabase DB before proceeding
      const isAvailable = await checkUsernameAvailable(cleanUsername);
      if (!isAvailable) {
        setAuthState((prev) => ({
          ...prev,
          error: 'El nombre de usuario ya está registrado por otra cuenta.',
          isLoading: false,
        }));
        return { success: false, profileExists: false };
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { username: cleanUsername },
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('already registered')) {
          msg = 'Este correo electrónico ya está registrado.';
        }
        setAuthState((prev) => ({ ...prev, error: msg, isLoading: false }));
        return { success: false, profileExists: false };
      }

      if (data?.user) {
        // Explicitly write profile to Supabase DB profiles table to ensure atomicity
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('[useAuth] Profile explicit upsert fallback note:', dbErr);
        }
      }

      if (!data.session || !data.user) {
        // Supabase requires email confirmation — user signed up but no active session yet
        setAuthState((prev) => ({
          ...prev,
          error: 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.',
          isLoading: false,
        }));
        return { success: false, profileExists: false };
      }

      const profile = await loadProfile(data.user.id);
      if (profile?.username) {
        console.log(`¡Bienvenido de vuelta, ${profile.username}!`);
      }

      setAuthState({
        user: data.user,
        session: data.session,
        profile,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        profileExists: true,
        username: cleanUsername,
      };
    },
    [loadProfile]
  );

  /**
   * Google OAuth flow via expo-web-browser.
   */
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; profileExists: boolean; username?: string }> => {
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
          const params = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;

            if (sessionData?.user) {
              const profile = await loadProfile(sessionData.user.id);
              if (profile?.username) {
                console.log(`¡Bienvenido de vuelta, ${profile.username}!`);
              }
              setAuthState({
                user: sessionData.user,
                session: sessionData.session,
                profile,
                isLoading: false,
                error: null,
              });
              return { success: true, profileExists: Boolean(profile?.username), username: profile?.username };
            }
          }
        }
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, profileExists: false };
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        error: err.message || 'Error durante el inicio de sesión con Google.',
        isLoading: false,
      }));
      return { success: false, profileExists: false };
    }
  }, [loadProfile]);

  /**
   * Sign out and clear Supabase session.
   */
  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      session: null,
      profile: null,
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
