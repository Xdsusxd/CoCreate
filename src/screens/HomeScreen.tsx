import React from 'react';
import { MainMenuScreen } from './MainMenuScreen';
import { User } from '@supabase/supabase-js';

interface HomeScreenProps {
  user: User | null;
  onSignOut: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onSignOut }) => {
  const username = user?.email?.split('@')[0] || 'creador';
  return <MainMenuScreen username={username} onLogout={onSignOut} />;
};
