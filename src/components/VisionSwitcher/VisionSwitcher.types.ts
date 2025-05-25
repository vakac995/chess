import type { Optional } from '@/types';

export type Vision = 'corporate' | 'casual';

export interface VisionSwitcherProps {
  readonly defaultVision?: Optional<Vision>;
}
