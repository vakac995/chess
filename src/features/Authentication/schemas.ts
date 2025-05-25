import { z } from 'zod';
import {
  isStrongPasswordCheck,
  isAdultAgeCheck,
  isValidPasswordForEnvironmentCheck,
} from '@/utils/validation';

const isProduction = import.meta.env.PROD;

// ================================
// REUSABLE FIELD VALIDATORS
// ================================

/**
 * Reusable email field validator
 */
const emailField = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email format' });

/**
 * Basic password field validator (minimum requirements)
 */
const basicPasswordField = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .transform(val => val.trim());

/**
 * Strong password field validator (with additional strength checks)
 */
const strongPasswordField = basicPasswordField.superRefine(isStrongPasswordCheck);

/**
 * Environment-aware password field validator
 */
const environmentAwarePasswordField = basicPasswordField.superRefine(
  isValidPasswordForEnvironmentCheck(isProduction)
);

/**
 * Password confirmation field validator
 */
const confirmPasswordField = basicPasswordField;

/**
 * Age field validator
 */
const ageField = z.number().int();

/**
 * Adult age field validator (with age check)
 */
const adultAgeField = ageField.superRefine(isAdultAgeCheck);

/**
 * Terms agreement field validator
 */
const agreeToTermsField = z.boolean();

/**
 * Required terms agreement field validator
 */
const requiredAgreeToTermsField = agreeToTermsField.refine(value => value === true, {
  message: 'You must agree to the terms',
});

/**
 * Reusable name field validator factory
 */
const createNameField = (fieldName: string) => z.string().min(1, `${fieldName} is required`);

/**
 * First name field validator
 */
const firstNameField = createNameField('First name');

/**
 * Last name field validator
 */
const lastNameField = createNameField('Last name');

// ================================
// REUSABLE REFINEMENT FUNCTIONS
// ================================

/**
 * Password confirmation error configuration
 */
const passwordConfirmationError = {
  message: "Passwords don't match",
  path: ['confirmPassword'] as ['confirmPassword'],
};

/**
 * Reusable password confirmation refinement function
 * Validates that password and confirmPassword fields match
 */
const passwordConfirmationRefinement = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

// ================================
// MAIN SCHEMAS
// ================================

/**
 * Login schema for authentication
 */
export const loginSchema = z.object({
  email: emailField,
  password: basicPasswordField,
});

/**
 * Base registration object schema with core fields
 */
export const baseRegistrationObjectSchema = z.object({
  email: emailField,
  password: basicPasswordField,
  confirmPassword: confirmPasswordField,
  age: ageField,
  agreeToTerms: agreeToTermsField,
});

/**
 * Full registration schema with strong validation
 */
export const registrationSchema = z
  .object({
    email: emailField,
    password: strongPasswordField,
    confirmPassword: confirmPasswordField,
    firstName: firstNameField,
    lastName: lastNameField,
    age: adultAgeField,
    agreeToTerms: requiredAgreeToTermsField,
  })
  .refine(passwordConfirmationRefinement, passwordConfirmationError);

/**
 * Multi-step registration: Basic info step schema
 */
export const basicInfoSchema = z
  .object({
    email: emailField,
    password: basicPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordConfirmationRefinement, passwordConfirmationError);

/**
 * Multi-step registration: Personal info step schema
 */
export const personalInfoSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  age: ageField,
  agreeToTerms: agreeToTermsField,
});

/**
 * Environment-aware schema for development/testing purposes
 * Note: Currently exported but not actively used - consider removal if unused
 */
export const environmentAwareSchema = z
  .object({
    email: emailField,
    password: environmentAwarePasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordConfirmationRefinement, passwordConfirmationError);

// ================================
// EXPORTED TYPES
// ================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type RegistrationData = BasicInfoData & PersonalInfoData;
export type EnvironmentAwareData = z.infer<typeof environmentAwareSchema>;
