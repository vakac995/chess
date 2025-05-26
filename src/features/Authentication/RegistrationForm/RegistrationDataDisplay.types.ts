import type { ReactClassNameProps, Nullable } from '@/types';
import { RegistrationData } from '@/schemas';

export interface RegistrationDataDisplayProps extends ReactClassNameProps {
  readonly data: Nullable<Partial<RegistrationData>>;
}
