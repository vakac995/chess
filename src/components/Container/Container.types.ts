import React from 'react';
import type { Optional } from '@/types';

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

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly as?: Optional<React.ElementType>;
  readonly padding?: Optional<ContainerPadding>;
  readonly display?: Optional<ContainerDisplay>;
  readonly orientation?: Optional<ContainerOrientation>;
  readonly items?: Optional<ContainerItems>;
  readonly justify?: Optional<ContainerJustify>;
  readonly shadow?: Optional<ContainerShadow>;
  readonly rounded?: Optional<ContainerRounded>;
  readonly gridCols?: Optional<string>;
  readonly gap?: Optional<string>;
}
