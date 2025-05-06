import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  orientation?: 'flex-col' | 'flex-row';
  items?: string;
  justify?: string;
  useGrid?: boolean;
  gridCols?: string;
  gap?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner' | 'none';
}

const Container = ({
  children,
  className = '',
  padding = 'p-4',
  orientation = 'flex-col',
  items = 'items-start',
  justify = 'justify-start',
  useGrid = false,
  gridCols = 'grid-cols-1',
  gap = 'gap-4',
  shadow = 'none',
}: ContainerProps) => {
  const baseClasses = 'w-full';
  const flexClasses = !useGrid ? `flex ${orientation} ${items} ${justify}` : '';
  const gridClasses = useGrid ? `grid ${gridCols} ${gap}` : '';
  const shadowClass = shadow !== 'none' ? `shadow-${shadow}` : '';

  return (
    <div
      className={`${baseClasses} ${padding} ${flexClasses} ${gridClasses} ${shadowClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default Container;
