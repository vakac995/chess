import React from 'react';

export interface ScrollableContentProps {
  readonly children: React.ReactNode;
  readonly onScroll?: (scrollTop: number) => void;
  readonly className?: string;
}
