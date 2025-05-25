import type { ReactChildren, ReactClassNameProps, Optional } from '@/types';

export interface ScrollableContentProps extends ReactChildren, ReactClassNameProps {
  readonly onScroll?: Optional<(scrollTop: number) => void>;
}
