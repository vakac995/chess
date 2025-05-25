import type { ReactChildren, NoArgFunction, Optional } from '@/types';

export interface DialogProps extends ReactChildren {
  readonly isOpen: boolean;
  readonly onClose: NoArgFunction;
  readonly title?: Optional<string>;
}
