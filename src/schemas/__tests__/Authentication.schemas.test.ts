import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registrationSchema,
  basicInfoSchema,
  personalInfoSchema,
} from '../Authentication.schemas';

describe('Authentication Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should invalidate incorrect email format', () => {
      const data = { email: 'test', password: 'password123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('Invalid email format');
    });

    it('should invalidate short password', () => {
      const data = { email: 'test@example.com', password: 'short' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('Password must be at least 8 characters');
    });
  });

  describe('registrationSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      age: 30,
      agreeToTerms: true,
    };

    it('should validate correct registration data', () => {
      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should invalidate mismatched passwords', () => {
      const data = { ...validData, confirmPassword: 'PasswordMismatch!' };
      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Passwords don't match");
    });

    it('should invalidate weak password', () => {
      const data = { ...validData, password: 'password', confirmPassword: 'password' };
      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
      // Add specific message for weak password if defined in isStrongPasswordCheck
    });

    it('should invalidate if terms not agreed', () => {
      const data = { ...validData, agreeToTerms: false };
      const result = registrationSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('You must agree to the terms');
    });
  });

  describe('basicInfoSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('should validate correct basic info data', () => {
      const result = basicInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should invalidate mismatched passwords', () => {
      const data = { ...validData, confirmPassword: 'mismatch123' };
      const result = basicInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Passwords don't match");
    });
  });

  describe('personalInfoSchema', () => {
    const validData = {
      firstName: 'Test',
      lastName: 'User',
      age: 25,
      agreeToTerms: true,
    };

    it('should validate correct personal info data', () => {
      const result = personalInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should invalidate missing first name', () => {
      const data = { ...validData, firstName: '' };
      const result = personalInfoSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe('First name is required');
    });
  });
});
