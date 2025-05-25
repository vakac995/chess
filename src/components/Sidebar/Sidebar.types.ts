import type { ReactChildren, NoArgFunction } from '@/types';

export interface SidebarProps extends ReactChildren {
  readonly isOpen: boolean;
  readonly onToggle: NoArgFunction;
}
