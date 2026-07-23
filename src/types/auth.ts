import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export type AuthMode = 'login' | 'signup';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SkeuomorphicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'bronze' | 'metal' | 'secondary' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: object;
  testID?: string;
}

export interface SkeuomorphicInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string | null;
  disabled?: boolean;
  testID?: string;
}

export interface EngravedTextProps {
  children: string;
  variant?: 'monumental' | 'title' | 'subtitle';
  color?: string;
  style?: object;
}
