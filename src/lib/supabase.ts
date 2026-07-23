import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';

// Environment variables or fallback defaults for demonstration
const env = process.env as Record<string, string | undefined>;
const SUPABASE_URL = env['EXPO_PUBLIC_SUPABASE_URL'] || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key_for_cocreate_app';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Generates the redirect URL for Google OAuth deep linking.
 * In Expo Go or Standalone builds, this resolves to `cocreate://` scheme.
 */
export const getOAuthRedirectUrl = (): string => {
  return AuthSession.makeRedirectUri({
    scheme: 'cocreate',
    path: 'auth/callback',
  });
};
