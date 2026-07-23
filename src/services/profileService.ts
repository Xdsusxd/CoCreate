import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id?: string;
  username: string;
  avatarUrl: string | null;
  profile_setup_completed: boolean;
  updatedAt: string;
}

export const ASYNC_STORAGE_PROFILE_KEY = '@cocreate_user_profile';

/**
 * Queries Supabase DB to check if a username is already taken by another user.
 */
export const checkUsernameAvailable = async (
  username: string,
  currentUserId?: string
): Promise<boolean> => {
  const cleanUsername = username.replace(/^@/, '').trim();
  if (!cleanUsername) return false;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername);

    if (error) {
      console.warn('[ProfileService] Supabase check error, assuming available:', error.message);
      return true;
    }

    if (data && data.length > 0) {
      // Taken if record belongs to a different user
      const takenByOther = data.some((row) => row.id !== currentUserId);
      return !takenByOther;
    }
  } catch (err) {
    console.error('[ProfileService] Error checking username availability:', err);
  }

  return true;
};

/**
 * Fetches user profile directly from Supabase DB by User ID.
 */
export const fetchProfileFromSupabase = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, updated_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    if (data.username) {
      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url,
        profile_setup_completed: true,
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      // Cache locally
      await AsyncStorage.setItem(ASYNC_STORAGE_PROFILE_KEY, JSON.stringify(profile));
      return profile;
    }
  } catch (err) {
    console.error('[ProfileService] Error fetching profile from Supabase DB:', err);
  }

  return null;
};

/**
 * Persists user profile to Supabase DB and local AsyncStorage atomically.
 */
export const saveUserProfile = async (
  userId: string | undefined,
  username: string,
  avatarUrl: string | null
): Promise<UserProfile> => {
  const cleanUsername = username.replace(/^@/, '').trim();

  // 1. Check availability in Supabase DB
  const isAvailable = await checkUsernameAvailable(cleanUsername, userId);
  if (!isAvailable) {
    throw new Error('El nombre de usuario no está disponible.');
  }

  const profileData: UserProfile = {
    id: userId,
    username: cleanUsername,
    avatarUrl,
    profile_setup_completed: true,
    updatedAt: new Date().toISOString(),
  };

  // 2. Persist locally to AsyncStorage (Multiplatform: localStorage on Web, SQLite on native)
  await AsyncStorage.setItem(ASYNC_STORAGE_PROFILE_KEY, JSON.stringify(profileData));

  // 3. Upsert to Supabase DB table 'profiles'
  if (userId) {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        username: profileData.username,
        avatar_url: avatarUrl,
        updated_at: profileData.updatedAt,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[ProfileService] Supabase upsert error:', error.message);
    }
  }

  return profileData;
};

/**
 * Reads cached profile from local AsyncStorage.
 */
export const getCachedUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch (err) {
    console.error('[ProfileService] Error reading cached profile:', err);
  }
  return null;
};
