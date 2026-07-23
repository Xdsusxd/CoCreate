import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -4 }}
      transition={{ type: 'timing', duration: 180 }}
      style={styles.bannerWrapper}
    >
      <View style={styles.bannerSurface}>
        <View style={styles.contentRow}>
          <Text style={[TYPOGRAPHY.body, styles.messageText]}>{message}</Text>
          {onDismiss && (
            <Pressable onPress={onDismiss} hitSlop={10} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    width: '100%',
    marginVertical: 6,
  },
  bannerSurface: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    color: '#000000',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 10,
  },
  closeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});
