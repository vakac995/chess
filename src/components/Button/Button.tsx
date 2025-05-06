import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import clsx from 'clsx';

const buttonStyles = cva(
  'font-semibold border rounded-button transition-colors duration-150 focus:outline-none',
  {
    variants: {
      intent: {
        primary: 'bg-primary text-white border-primary hover:bg-primary/80',
        secondary: 'bg-secondary text-white border-secondary hover:bg-secondary/80',
        danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
        outline: 'bg-transparent text-primary border-primary hover:bg-primary/10',
      },
      size: {
        sm: 'py-1 px-2 text-sm',
        md: 'py-2 px-4 text-base',
        lg: 'py-3 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      {
        intent: 'primary',
        size: 'lg',
        className: 'py-4',
      },
      {
        intent: 'outline',
        className: 'hover:bg-transparent',
      },
    ],
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonStyles>, 'disabled'> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, fullWidth, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          buttonStyles({ intent, size, fullWidth }),
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
