import React from 'react';
import { NeoInput } from './NeoInput';
import { SkeuomorphicInputProps } from '../../types/auth';

export const SkeuomorphicInput: React.FC<SkeuomorphicInputProps> = (props) => {
  return <NeoInput {...props} />;
};
