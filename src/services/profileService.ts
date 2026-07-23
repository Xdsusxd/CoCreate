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
 * Saves user profile locally in AsyncStorage (web localStorage & native)
 * and syncs with Supabase 'profiles' table via upsert.
 */
export const saveUserProfile = async (
  userId: string | undefined,
  username: string,
  avatarUrl: string | null
): Promise<UserProfile> => {
  const profileData: UserProfile = {
    id: userId,
    username: username.replace(/^@/, '').trim(),
    avatarUrl,
    profile_setup_completed: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    // 1. Local Persistence (Multiplatform: AsyncStorage uses localStorage on Web, SQLite/SharedPreferences on native)
    await AsyncStorage.setItem(ASYNC_STORAGE_PROFILE_KEY, JSON.stringify(profileData));
    console.log('[ProfileService] Saved local profile to AsyncStorage:', profileData);

    // 2. Supabase Cloud Sync (Upsert to 'profiles' table)
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
        console.warn('[ProfileService] Supabase upsert warning (table may require migration):', error.message);
      } else {
        console.log('[ProfileService] Supabase upsert successful for user ID:', userId);
      }
    }
  } catch (err) {
    console.error('[ProfileService] Error persisting profile data:', err);
  }

  return profileData;
};

/**
 * Retrieves cached user profile from AsyncStorage.
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
