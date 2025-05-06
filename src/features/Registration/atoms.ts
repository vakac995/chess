import { createFormAtom, combineFormAtoms, FormAtomReturn } from '../../hooks/useJotaiForm';
import { BasicInfoData, PersonalInfoData, RegistrationData } from './schemas';

export const basicInfoAtoms = createFormAtom<BasicInfoData>();
export const personalInfoAtoms = createFormAtom<PersonalInfoData>();

export const registrationFormAtoms = combineFormAtoms<RegistrationData>(
  basicInfoAtoms as FormAtomReturn<unknown>,
  personalInfoAtoms as FormAtomReturn<unknown>
);
