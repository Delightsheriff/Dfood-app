import { HugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';

export function Icon({
  icon,
  size = 18,
  color = '#262B33',
  ...props
}: {
  icon: any;
  size?: number;
  color?: string;
  className?: string;
}) {
  return <HugeiconsIcon icon={icon} size={size} color={color} {...props} />;
}
