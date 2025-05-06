import { z } from 'zod';
import { baseRegistrationObjectSchema } from '../Authentication/schemas';

const registrationObjectSchema = baseRegistrationObjectSchema;

export const basicInfoSchema = z
  .object({
    email: registrationObjectSchema.shape.email,
    password: registrationObjectSchema.shape.password,
    confirmPassword: registrationObjectSchema.shape.confirmPassword,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  age: registrationObjectSchema.shape.age,
  agreeToTerms: registrationObjectSchema.shape.agreeToTerms,
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type RegistrationData = BasicInfoData & PersonalInfoData;
