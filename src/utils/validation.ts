import { z, RefinementCtx } from 'zod';
import { FieldErrorInfo, createDetailedError } from '@/types';

/**
 * Creates a type-safe validation function compatible with Zod's `.superRefine()`
 * that adds an issue with enhanced error information if validation fails.
 * @param validationFn The validation function to run (should return true if valid)
 * @param errorInfo Error information or error information generator
 * @returns A function suitable for use with `.superRefine()`
 */
export function createSuperRefine<T>(
  validationFn: (value: T) => boolean,
  errorInfo: FieldErrorInfo | ((value: T) => FieldErrorInfo)
): (arg: T, ctx: RefinementCtx) => void {
  return (value: T, ctx: RefinementCtx) => {
    if (!validationFn(value)) {
      const info = typeof errorInfo === 'function' ? errorInfo(value) : errorInfo;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: info.message,
        params: {
          info: info.info,
          description: info.description,
          icon: info.icon,
        },
      });
    }
  };
}

export const isStrongPasswordCheck = createSuperRefine<string>(
  password => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
    return hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
  },
  createDetailedError(
    'Password is not strong enough',
    'Include uppercase, lowercase, numbers, and special characters',
    'A strong password helps protect your account from unauthorized access.',
    'shield-warning'
  )
);

export const isAdultAgeCheck = createSuperRefine<number>(
  age => age >= 18,
  createDetailedError(
    'Must be at least 18 years old',
    'Age verification required',
    'This application requires users to be 18 years or older.',
    'age-restriction'
  )
);

export function isValidPasswordForEnvironmentCheck(isStrict: boolean) {
  return createSuperRefine<string>(
    password => {
      const hasMinLength = password.length >= 8;
      if (!isStrict) {
        return hasMinLength;
      }
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
      return hasMinLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
    },
    password => {
      if (!isStrict) {
        return createDetailedError(
          'Password must be at least 8 characters',
          'Basic validation mode',
          'In development mode, we only require minimum length.',
          'info-circle'
        );
      }

      const issues = [];
      if (password.length < 8) issues.push('at least 8 characters');
      if (!/[A-Z]/.test(password)) issues.push('an uppercase letter');
      if (!/[a-z]/.test(password)) issues.push('a lowercase letter');
      if (!/\d/.test(password)) issues.push('a number');
      if (!/[^A-Za-z0-9]/.test(password)) issues.push('a special character');

      if (issues.length > 0) {
        return createDetailedError(
          `Password must include ${issues.join(', ')}`,
          'Strict validation mode',
          'In production mode, we require stronger passwords for security.',
          'shield-lock'
        );
      } else {
        return createDetailedError(
          'Password validation failed',
          'Strict validation mode',
          'Please ensure your password meets all security requirements.',
          'shield-lock'
        );
      }
    }
  );
}
