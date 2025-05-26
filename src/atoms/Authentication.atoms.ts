import { z } from 'zod';
import { atom } from 'jotai';
import { createFormAtom, combineFormAtoms, FormAtomReturn } from '@/hooks';
import { loginSchema, BasicInfoData, PersonalInfoData, RegistrationData } from '@/schemas';
import { LoadingStatus } from '@/types';

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration flow atoms
export const registrationStepAtom = atom<1 | 2>(1);

// Form state atoms for registration
export const basicInfoAtoms = createFormAtom<BasicInfoData>();
export const personalInfoAtoms = createFormAtom<PersonalInfoData>();

// Login form state atoms
export const loginFormAtoms = createFormAtom<LoginFormData>();

// Derived atoms
export const isRegistrationCompleteAtom = atom<boolean>(get => {
  const basicInfoStatus = get(basicInfoAtoms.formStatusAtom);
  const personalInfoStatus = get(personalInfoAtoms.formStatusAtom);

  return (
    basicInfoStatus === LoadingStatus.FULFILLED && personalInfoStatus === LoadingStatus.FULFILLED
  );
});

// Combined form atoms
export const registrationFormAtoms = combineFormAtoms<RegistrationData>(
  basicInfoAtoms as FormAtomReturn<unknown>,
  personalInfoAtoms as FormAtomReturn<unknown>
);
