import { z } from 'zod';
import { atom } from 'jotai';
import { createFormAtom, combineFormAtoms, FormAtomReturn } from '@/hooks/useJotaiForm';
import { loginSchema, BasicInfoData, PersonalInfoData, RegistrationData } from './schemas';
import { LoadingStatus } from '@/types/status';

export type LoginFormData = z.infer<typeof loginSchema>;

export const loginFormAtoms = createFormAtom<LoginFormData>();

// Registration step tracking
export const registrationStepAtom = atom<1 | 2>(1);

// Registration atoms
export const basicInfoAtoms = createFormAtom<BasicInfoData>();
export const personalInfoAtoms = createFormAtom<PersonalInfoData>();

// Registration state (derived atoms)
export const isRegistrationCompleteAtom = atom<boolean>(get => {
  const basicInfoStatus = get(basicInfoAtoms.formStatusAtom);
  const personalInfoStatus = get(personalInfoAtoms.formStatusAtom);

  return (
    basicInfoStatus === LoadingStatus.FULFILLED && personalInfoStatus === LoadingStatus.FULFILLED
  );
});

// Combined registration data
export const registrationFormAtoms = combineFormAtoms<RegistrationData>(
  basicInfoAtoms as FormAtomReturn<unknown>,
  personalInfoAtoms as FormAtomReturn<unknown>
);
