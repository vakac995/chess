// Authentication Feature Exports
// This file provides a clean API surface for the Authentication feature

// Components
export { LoginForm } from './LoginForm';
export { RegistrationForm, RegistrationDataDisplay } from './RegistrationForm';

// Atoms and State
export {
  loginFormAtoms,
  registrationStepAtom,
  basicInfoAtoms,
  personalInfoAtoms,
  registrationFormAtoms,
  isRegistrationCompleteAtom,
} from './atoms';

// Schemas and Types
export {
  loginSchema,
  baseRegistrationObjectSchema,
  registrationSchema,
  basicInfoSchema,
  personalInfoSchema,
  environmentAwareSchema,
} from './schemas';

export type {
  LoginFormData,
  BasicInfoData,
  PersonalInfoData,
  RegistrationData,
  EnvironmentAwareData,
} from './schemas';

// Component Types
export type { LoginFormProps } from './LoginForm';
export type { RegistrationFormProps, RegistrationDataDisplayProps } from './RegistrationForm';

// Re-export the LoginFormData type from atoms for convenience
export type { LoginFormData as LoginFormAtomData } from './atoms';
