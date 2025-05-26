import { describe, it, expect } from 'vitest';
import { useAtom } from 'jotai';
import { renderHook, act } from '@testing-library/react';
import {
  registrationStepAtom,
  basicInfoAtoms,
  personalInfoAtoms,
  loginFormAtoms,
  isRegistrationCompleteAtom,
  registrationFormAtoms,
} from '../Authentication.atoms';
import { LoadingStatus } from '@/types';
import { BasicInfoData, PersonalInfoData, LoginFormData, RegistrationData } from '@/schemas';

describe('Authentication Atoms', () => {
  describe('registrationStepAtom', () => {
    it('should initialize with step 1', () => {
      const { result } = renderHook(() => useAtom(registrationStepAtom));
      expect(result.current[0]).toBe(1);
    });

    it('should update to step 2', () => {
      const { result } = renderHook(() => useAtom(registrationStepAtom));
      act(() => {
        result.current[1](2);
      });
      expect(result.current[0]).toBe(2);
    });
  });

  describe('basicInfoAtoms', () => {
    it('should have initial form values', () => {
      const { result } = renderHook(() => useAtom(basicInfoAtoms.formAtom));
      expect(result.current[0]).toBeNull();
    });

    it('should update form values', () => {
      const { result } = renderHook(() => useAtom(basicInfoAtoms.formAtom));
      const testData: BasicInfoData = {
        email: 'test@example.com',
        password: 'pass',
        confirmPassword: 'pass',
      };
      act(() => {
        result.current[1](testData);
      });
      expect(result.current[0]).toEqual(testData);
    });
  });

  describe('personalInfoAtoms', () => {
    it('should have initial form values', () => {
      const { result } = renderHook(() => useAtom(personalInfoAtoms.formAtom));
      expect(result.current[0]).toBeNull();
    });

    it('should update form values', () => {
      const { result } = renderHook(() => useAtom(personalInfoAtoms.formAtom));
      const testData: PersonalInfoData = {
        firstName: 'Test',
        lastName: 'User',
        age: 30,
        agreeToTerms: true,
      };
      act(() => {
        result.current[1](testData);
      });
      expect(result.current[0]).toEqual(testData);
    });
  });

  describe('loginFormAtoms', () => {
    it('should have initial form values', () => {
      const { result } = renderHook(() => useAtom(loginFormAtoms.formAtom));
      expect(result.current[0]).toBeNull();
    });

    it('should update form values', () => {
      const { result } = renderHook(() => useAtom(loginFormAtoms.formAtom));
      const testData: LoginFormData = { email: 'login@example.com', password: 'loginpass' };
      act(() => {
        result.current[1](testData);
      });
      expect(result.current[0]).toEqual(testData);
    });
  });

  describe('isRegistrationCompleteAtom', () => {
    it('should be false initially', () => {
      const { result } = renderHook(() => useAtom(isRegistrationCompleteAtom));
      expect(result.current[0]).toBe(false);
    });

    it('should be true when both forms are fulfilled', () => {
      const { result: basicResult } = renderHook(() => useAtom(basicInfoAtoms.formStatusAtom));
      const { result: personalResult } = renderHook(() =>
        useAtom(personalInfoAtoms.formStatusAtom)
      );
      const { result: completeResult } = renderHook(() => useAtom(isRegistrationCompleteAtom));

      act(() => {
        basicResult.current[1](LoadingStatus.FULFILLED);
        personalResult.current[1](LoadingStatus.FULFILLED);
      });

      expect(completeResult.current[0]).toBe(true);
    });
  });

  describe('registrationFormAtoms', () => {
    it('should combine data from basic and personal info atoms', () => {
      const { result: basicValuesResult } = renderHook(() => useAtom(basicInfoAtoms.formAtom));
      const { result: personalValuesResult } = renderHook(() =>
        useAtom(personalInfoAtoms.formAtom)
      );
      const { result: registrationValuesResult } = renderHook(() =>
        useAtom(registrationFormAtoms.formAtom)
      );

      const basicData: BasicInfoData = {
        email: 'test@example.com',
        password: 'pass',
        confirmPassword: 'pass',
      };
      const personalData: PersonalInfoData = {
        firstName: 'Test',
        lastName: 'User',
        age: 30,
        agreeToTerms: true,
      };

      act(() => {
        basicValuesResult.current[1](basicData);
        personalValuesResult.current[1](personalData);
      });

      const expectedCombinedData: RegistrationData = { ...basicData, ...personalData };
      expect(registrationValuesResult.current[0]).toEqual(expectedCombinedData);
    });

    it('should reflect combined status, e.g., PENDING if one is PENDING', () => {
      const { result: basicStatusResult } = renderHook(() =>
        useAtom(basicInfoAtoms.formStatusAtom)
      );
      const { result: personalStatusResult } = renderHook(() =>
        useAtom(personalInfoAtoms.formStatusAtom)
      );
      const { result: registrationStatusResult } = renderHook(() =>
        useAtom(registrationFormAtoms.formStatusAtom)
      );

      act(() => {
        basicStatusResult.current[1](LoadingStatus.FULFILLED);
        personalStatusResult.current[1](LoadingStatus.PENDING);
      });

      expect(registrationStatusResult.current[0]).toBe(LoadingStatus.PENDING);
    });
  });
});
