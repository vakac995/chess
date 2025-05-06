import React from 'react';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const containerStyles = cva('w-full', {
  variants: {
    padding: {
      default: 'p-container-padding',
      none: '',
    },
    display: {
      flex: 'flex',
      grid: 'grid',
      block: 'block',
    },
    orientation: {
      col: 'flex-col',
      row: 'flex-row',
    },
    items: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    shadow: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
      inner: 'shadow-inner',
    },
    rounded: {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
      card: 'rounded-card',
      button: 'rounded-button',
    },
  },
  defaultVariants: {
    padding: 'default',
    display: 'block',
    shadow: 'none',
    rounded: 'none',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerStyles> {
  as?: React.ElementType;
  gridCols?: string;
  gap?: string;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      as: Component = 'div',
      padding,
      display,
      orientation,
      items,
      justify,
      gridCols,
      gap,
      shadow,
      rounded,
      children,
      ...props
    },
    ref
  ) => {
    const gridColsClass = gridCols ? `grid-cols-${gridCols}` : '';
    const gapClass = gap ? `gap-${gap}` : '';

    const computedClasses = containerStyles({
      padding,
      display,
      orientation: display === 'flex' ? orientation : undefined,
      items: display === 'flex' ? items : undefined,
      justify: display === 'flex' ? justify : undefined,
      shadow,
      rounded,
    });

    return (
      <Component
        ref={ref}
        className={clsx(
          computedClasses,
          display === 'grid' ? gridColsClass : '',
          display === 'grid' ? gapClass : '',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';
