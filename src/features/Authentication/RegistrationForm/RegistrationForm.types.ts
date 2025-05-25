import type { Optional, NoArgFunction } from '@/types';

export interface RegistrationFormProps {
  readonly onSwitchToLogin?: Optional<NoArgFunction>;
}
