import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { EngravedTextProps } from '../../types/auth';

export const EngravedText: React.FC<EngravedTextProps> = ({
  children,
  variant = 'monumental',
  color = COLORS.kleinBlue,
  style,
}) => {
  const getTypographyStyle = () => {
    switch (variant) {
      case 'monumental':
        return TYPOGRAPHY.monumental;
      case 'title':
        return TYPOGRAPHY.title;
      case 'subtitle':
        return TYPOGRAPHY.subtitle;
      default:
        return TYPOGRAPHY.monumental;
    }
  };

  const textStyle = getTypographyStyle();

  return (
    <View style={styles.container}>
      <Text style={[textStyle, { color }, style]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
