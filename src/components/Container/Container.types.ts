import React from 'react';

// Container variant types
export type ContainerPadding = 'default' | 'none';
export type ContainerDisplay = 'flex' | 'grid' | 'block';
export type ContainerOrientation = 'col' | 'row';
export type ContainerItems = 'start' | 'center' | 'end' | 'stretch';
export type ContainerJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type ContainerShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
export type ContainerRounded =
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'full'
  | 'card'
  | 'button';

// Container component props interface
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly as?: React.ElementType;
  readonly padding?: ContainerPadding;
  readonly display?: ContainerDisplay;
  readonly orientation?: ContainerOrientation;
  readonly items?: ContainerItems;
  readonly justify?: ContainerJustify;
  readonly shadow?: ContainerShadow;
  readonly rounded?: ContainerRounded;
  readonly gridCols?: string;
  readonly gap?: string;
}
