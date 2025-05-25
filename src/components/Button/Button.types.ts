import React from 'react';

// Button variant types - exported for external use
export type ButtonIntent = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Button component props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly intent?: ButtonIntent;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
}
