import React from 'react';
import type { Optional } from '@/types';

// Button variant types for cva (specific to what the component actually supports)
export type ButtonIntent = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Button component props interface using consolidated types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly intent?: Optional<ButtonIntent>;
  readonly size?: Optional<ButtonSize>;
  readonly fullWidth?: Optional<boolean>;
}
