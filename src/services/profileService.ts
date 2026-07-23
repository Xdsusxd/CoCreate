import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  updatedAt: string;
}

/**
 * Fetches user profile from Supabase DB by User ID.
 * Returns null if no profile row exists or username is missing.
 */
export const fetchProfileFromSupabase = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, updated_at')
      .eq('id', userId)
      .single();

    if (error || !data || !data.username) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error('[ProfileService] Error fetching profile:', err);
    return null;
  }
};

/**
 * Checks if a username is already taken by another user in Supabase DB.
 * Returns true if the username is available, false if taken.
 */
export const checkUsernameAvailable = async (
  username: string,
  currentUserId?: string
): Promise<boolean> => {
  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) return false;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername);

    if (error) {
      console.warn('[ProfileService] Username check error:', error.message);
      // Fail closed: treat as unavailable on error
      return false;
    }

    if (!data || data.length === 0) return true;

    // Available if the only match is the current user's own profile
    return data.every((row) => row.id === currentUserId);
  } catch (err) {
    console.error('[ProfileService] Error checking username:', err);
    return false;
  }
};

/**
 * Saves/updates user profile in Supabase DB via upsert.
 * Throws on validation failure or DB error — callers must handle.
 */
export const saveUserProfile = async (
  userId: string,
  username: string
): Promise<UserProfile> => {
  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername.length < 3) {
    throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
  }

  // 1. Check availability
  const isAvailable = await checkUsernameAvailable(cleanUsername, userId);
  if (!isAvailable) {
    throw new Error('El nombre de usuario no está disponible.');
  }

  // 2. Upsert to Supabase DB
  const now = new Date().toISOString();
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      username: cleanUsername,
      updated_at: now,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('[ProfileService] Supabase upsert error:', error);
    throw new Error('Error al guardar el perfil en la base de datos.');
  }

  return {
    id: userId,
    username: cleanUsername,
    updatedAt: now,
  };
};
