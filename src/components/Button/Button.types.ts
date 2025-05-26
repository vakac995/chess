import React from 'react';
import type { Optional } from '@/types';

export type ButtonIntent = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly intent?: Optional<ButtonIntent>;
  readonly size?: Optional<ButtonSize>;
  readonly fullWidth?: Optional<boolean>;
}
