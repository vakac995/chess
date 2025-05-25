import type { Optional, NoArgFunction } from '@/types';

export interface LoginFormProps {
  readonly onSwitchToRegister?: Optional<NoArgFunction>;
}
