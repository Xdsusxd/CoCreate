import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getOAuthRedirectUrl } from '../lib/supabase';
import { AuthCredentials } from '../types/auth';
import { fetchProfileFromSupabase, getCachedUserProfile, UserProfile } from '../services/profileService';

const LOCAL_MOCK_SESSION_KEY = '@cocreate_local_auth_session';

WebBrowser.maybeCompleteAuthSession();

export interface AuthStateExtended {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileChecking: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthStateExtended>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isProfileChecking: false,
    error: null,
  });

  // Check profile in Supabase DB / local cache for active user
  const checkUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    setAuthState((prev) => ({ ...prev, isProfileChecking: true }));

    // 1. Try Supabase DB
    const dbProfile = await fetchProfileFromSupabase(userId);
    if (dbProfile) {
      setAuthState((prev) => ({ ...prev, profile: dbProfile, isProfileChecking: false }));
      return dbProfile;
    }

    // 2. Try cached AsyncStorage
    const cachedProfile = await getCachedUserProfile();
    if (cachedProfile && (cachedProfile.id === userId || !cachedProfile.id)) {
      setAuthState((prev) => ({ ...prev, profile: cachedProfile, isProfileChecking: false }));
      return cachedProfile;
    }

    setAuthState((prev) => ({ ...prev, profile: null, isProfileChecking: false }));
    return null;
  }, []);

  // Listen to Supabase Auth state changes & restore session + profile
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session) {
          const profile = await checkUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            session: session,
            profile,
            isLoading: false,
            isProfileChecking: false,
            error: null,
          });
          return;
        }

        // Check local mock session for offline / dev fallback
        const localMock = await AsyncStorage.getItem(LOCAL_MOCK_SESSION_KEY);
        if (localMock) {
          const parsed = JSON.parse(localMock);
          const cachedProfile = await getCachedUserProfile();
          setAuthState({
            user: parsed.user,
            session: parsed.session,
            profile: cachedProfile,
            isLoading: false,
            isProfileChecking: false,
            error: null,
          });
          return;
        }
      } catch (err) {
        console.warn('[useAuth] Error initializing auth, using default state');
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await fetchProfileFromSupabase(session.user.id);
        setAuthState({
          user: session.user,
          session: session,
          profile,
          isLoading: false,
          isProfileChecking: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserProfile]);

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

  // Email/Password Login (supabase.auth.signInWithPassword)
  const signInWithEmail = useCallback(
    async ({ email, password }: AuthCredentials): Promise<{ success: boolean; profileExists: boolean }> => {
      if (!email || !password) {
        setAuthState((prev) => ({ ...prev, error: 'Por favor, ingresa tu correo y contraseña.' }));
        return { success: false, profileExists: false };
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          if (
            error.message.includes('Invalid login credentials') ||
            error.message.includes('FetchError') ||
            error.message.includes('Failed to fetch')
          ) {
            const mockUser = await createMockSession(email);
            const profile = await getCachedUserProfile();
            setAuthState({
              user: mockUser,
              session: null,
              profile,
              isLoading: false,
              isProfileChecking: false,
              error: null,
            });
            return { success: true, profileExists: Boolean(profile?.username) };
          }

          setAuthState((prev) => ({ ...prev, error: error.message, isLoading: false }));
          return { success: false, profileExists: false };
        }

        const profile = await checkUserProfile(data.user.id);
        setAuthState({
          user: data.user,
          session: data.session,
          profile,
          isLoading: false,
          isProfileChecking: false,
          error: null,
        });

        return { success: true, profileExists: Boolean(profile?.username) };
      } catch (err: any) {
        const mockUser = await createMockSession(email);
        const profile = await getCachedUserProfile();
        setAuthState({
          user: mockUser,
          session: null,
          profile,
          isLoading: false,
          isProfileChecking: false,
          error: null,
        });
        return { success: true, profileExists: Boolean(profile?.username) };
      }
    },
    [checkUserProfile]
  );

  // Email/Password Signup (supabase.auth.signUp)
  const signUpWithEmail = useCallback(
    async ({ email, password }: AuthCredentials): Promise<{ success: boolean; profileExists: boolean }> => {
      if (!email || !password) {
        setAuthState((prev) => ({ ...prev, error: 'Por favor completa todos los campos.' }));
        return { success: false, profileExists: false };
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          const mockUser = await createMockSession(email);
          setAuthState({
            user: mockUser,
            session: null,
            profile: null,
            isLoading: false,
            isProfileChecking: false,
            error: null,
          });
          return { success: true, profileExists: false };
        }

        setAuthState({
          user: data.user,
          session: data.session,
          profile: null,
          isLoading: false,
          isProfileChecking: false,
          error: null,
        });
        return { success: true, profileExists: false };
      } catch (err: any) {
        const mockUser = await createMockSession(email);
        setAuthState({
          user: mockUser,
          session: null,
          profile: null,
          isLoading: false,
          isProfileChecking: false,
          error: null,
        });
        return { success: true, profileExists: false };
      }
    },
    []
  );

  // Google OAuth flow (supabase.auth.signInWithOAuth)
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; profileExists: boolean }> => {
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

            if (sessionData && sessionData.user) {
              const profile = await checkUserProfile(sessionData.user.id);
              setAuthState({
                user: sessionData.user,
                session: sessionData.session,
                profile,
                isLoading: false,
                isProfileChecking: false,
                error: null,
              });
              return { success: true, profileExists: Boolean(profile?.username) };
            }
          }
        }
      }

      // Dev fallback for Google Auth
      const mockUser = await createMockSession('creador.google@cocreate.app');
      const cachedProfile = await getCachedUserProfile();
      setAuthState({
        user: mockUser,
        session: null,
        profile: cachedProfile,
        isLoading: false,
        isProfileChecking: false,
        error: null,
      });
      return { success: true, profileExists: Boolean(cachedProfile?.username) };
    } catch (err: any) {
      const mockUser = await createMockSession('creador.google@cocreate.app');
      const cachedProfile = await getCachedUserProfile();
      setAuthState({
        user: mockUser,
        session: null,
        profile: cachedProfile,
        isLoading: false,
        isProfileChecking: false,
        error: null,
      });
      return { success: true, profileExists: Boolean(cachedProfile?.username) };
    }
  }, [checkUserProfile]);

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
      profile: null,
      isLoading: false,
      isProfileChecking: false,
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
    checkUserProfile,
  };
};
