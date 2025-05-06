import { z } from 'zod';
import {
  isStrongPasswordCheck,
  isAdultAgeCheck,
  isValidPasswordForEnvironmentCheck,
} from '../../utils/validation';

const isProduction = import.meta.env.PROD;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Email is required',
    })
    .email({
      message: 'Invalid email format',
    }),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters',
    })
    .transform(val => val.trim()),
});

export const baseRegistrationObjectSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().int(),
  agreeToTerms: z.boolean(),
});

export const registrationSchema = baseRegistrationObjectSchema
  .extend({
    password: baseRegistrationObjectSchema.shape.password
      .transform(val => val.trim())
      .superRefine(isStrongPasswordCheck),
    age: baseRegistrationObjectSchema.shape.age.superRefine(isAdultAgeCheck),
    agreeToTerms: baseRegistrationObjectSchema.shape.agreeToTerms.refine(value => value === true, {
      message: 'You must agree to the terms',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const environmentAwareSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .transform(val => val.trim())
      .superRefine(isValidPasswordForEnvironmentCheck(isProduction)),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
export type EnvironmentAwareData = z.infer<typeof environmentAwareSchema>;
