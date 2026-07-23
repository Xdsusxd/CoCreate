import React from 'react';
import { NeoButton, NeoButtonVariant } from './NeoButton';
import { SkeuomorphicButtonProps } from '../../types/auth';

export const SkeuomorphicButton: React.FC<SkeuomorphicButtonProps> = ({
  title,
  onPress,
  variant = 'bronze',
  isLoading = false,
  loading = false,
  icon,
  disabled = false,
  fullWidth = true,
  style,
}) => {
  let mappedVariant: NeoButtonVariant = 'klein';
  const v = variant as string;
  if (v === 'metal' || v === 'secondary') {
    mappedVariant = 'secondary';
  } else if (v === 'danger') {
    mappedVariant = 'danger';
  } else if (v === 'magenta') {
    mappedVariant = 'magenta';
  }

  return (
    <NeoButton
      title={title}
      onPress={onPress}
      variant={mappedVariant}
      isLoading={isLoading || loading}
      icon={icon}
      disabled={disabled}
      fullWidth={fullWidth}
      style={style}
    />
  );
};
