import { RegistrationData } from '../schemas';

export interface RegistrationDataDisplayProps {
  readonly data: Partial<RegistrationData> | null;
  readonly className?: string;
}
