import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const useHaptics = () => {
  const triggerImpact = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.impactAsync(style);
      } catch (e) {
        // Fallback silently if haptics unavailable on device
      }
    }
  };

  const triggerNotification = async (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.notificationAsync(type);
      } catch (e) {
        // Fallback silently
      }
    }
  };

  return { triggerImpact, triggerNotification };
};
