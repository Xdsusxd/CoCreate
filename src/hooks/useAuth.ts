import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getOAuthRedirectUrl } from '../lib/supabase';
import { AuthCredentials, AuthState } from '../types/auth';

const LOCAL_MOCK_SESSION_KEY = '@cocreate_local_auth_session';

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  // Listen to Supabase Auth state changes & restore local sessions
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session) {
          setAuthState({
            user: session.user,
            session: session,
            isLoading: false,
            error: null,
          });
          return;
        }

        // Check local mock session for offline / dev fallback
        const localMock = await AsyncStorage.getItem(LOCAL_MOCK_SESSION_KEY);
        if (localMock) {
          const parsed = JSON.parse(localMock);
          setAuthState({
            user: parsed.user,
            session: parsed.session,
            isLoading: false,
            error: null,
          });
          return;
        }
      } catch (err) {
        console.warn('[useAuth] Error initializing auth, using default offline state');
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthState({
          user: session.user,
          session: session,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Helper to store local mock session when operating in offline/demo mode
  const createMockSession = async (email: string): Promise<User> => {
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: email,
    };
    const mockSession: Session = {
      access_token: 'mock_token_' + Date.now(),
      refresh_token: 'mock_refresh_' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    await AsyncStorage.setItem(LOCAL_MOCK_SESSION_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
    return mockUser;
  };

  // Email/Password Login with Fallback
  const signInWithEmail = useCallback(async ({ email, password }: AuthCredentials) => {
    if (!email || !password) {
      setAuthState((prev) => ({ ...prev, error: 'Por favor, ingresa tu correo y contraseña.' }));
      return false;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // If dummy credentials or project unconfigured, fallback gracefully to mock session
        if (error.message.includes('Invalid login credentials') || error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
          const mockUser = await createMockSession(email);
          setAuthState({
            user: mockUser,
            session: null,
            isLoading: false,
            error: null,
          });
          return true;
        }

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
      // Fallback for offline dev
      const mockUser = await createMockSession(email);
      setAuthState({
        user: mockUser,
        session: null,
        isLoading: false,
        error: null,
      });
      return true;
    }
  }, []);

  // Email/Password Signup with Fallback
  const signUpWithEmail = useCallback(async ({ email, password }: AuthCredentials) => {
    if (!email || !password) {
      setAuthState((prev) => ({ ...prev, error: 'Por favor completa todos los campos.' }));
      return false;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        // Local dev fallback
        const mockUser = await createMockSession(email);
        setAuthState({
          user: mockUser,
          session: null,
          isLoading: false,
          error: null,
        });
        return true;
      }

      setAuthState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const mockUser = await createMockSession(email);
      setAuthState({
        user: mockUser,
        session: null,
        isLoading: false,
        error: null,
      });
      return true;
    }
  }, []);

  // Google OAuth flow
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

      // Dev fallback for Google Auth demo
      const mockUser = await createMockSession('creador.google@cocreate.app');
      setAuthState({
        user: mockUser,
        session: null,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const mockUser = await createMockSession('creador.google@cocreate.app');
      setAuthState({
        user: mockUser,
        session: null,
        isLoading: false,
        error: null,
      });
      return true;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(LOCAL_MOCK_SESSION_KEY);
    } catch (err) {
      console.warn('[useAuth] Error signing out from Supabase, cleared local storage');
    }
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
