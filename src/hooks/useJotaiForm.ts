import { atom, Atom } from 'jotai';
import { StatusType, LoadingStatus } from '@/types/status';
import { FieldErrorInfo } from '@/types/errors';
import { dev } from '@utils/dev';

/**
 * Creates a set of form atoms for managing form state
 * @template T The type of form data
 * @param initialValue Initial form data value
 * @returns Object containing form atoms
 */
export function createFormAtom<T>(initialValue: T | null = null) {
  const formAtom = atom<T | null>(initialValue);
  const formErrorAtom = atom<FieldErrorInfo | null>(null);
  const formStatusAtom = atom<StatusType>(LoadingStatus.IDLE);

  return {
    formAtom,
    formErrorAtom,
    formStatusAtom,
  };
}

/**
 * Type representing the return type of createFormAtom
 */
export type FormAtomReturn<T> = ReturnType<typeof createFormAtom<T>>;

/**
 * Type representing a read-only version of FormAtomReturn
 */
export type ReadonlyFormAtomReturn<T> = {
  formAtom: Atom<T | null>;
  formErrorAtom: Atom<FieldErrorInfo | null>;
  formStatusAtom: Atom<StatusType>;
};

/**
 * Combines multiple form atoms into a single derived atom set
 * @template TCombined The expected shape of the combined data
 * @param atoms Array of FormAtomReturn objects to combine
 * @returns Readonly combined form atoms
 */
export function combineFormAtoms<TCombined>(
  ...atoms: FormAtomReturn<unknown>[]
): ReadonlyFormAtomReturn<TCombined> {
  const combinedFormAtom = atom<TCombined | null>(get => {
    const values = atoms.map(a => get(a.formAtom));

    // Debug information to help identify issues
    dev.debug('combineFormAtoms values:', values);

    // Filter out null values but proceed if at least one value exists
    const validValues = values.filter(v => v !== null);
    if (validValues.length === 0) {
      return null;
    }

    try {
      // Combine all non-null values
      const result = validValues.reduce<Partial<TCombined>>((acc, val) => {
        if (typeof val === 'object' && val !== null) {
          return { ...acc, ...(val as Record<string, unknown>) };
        }
        return acc;
      }, {} as Partial<TCombined>);

      // Log the combined data for debugging
      dev.debug('Combined form data:', result);

      return result as TCombined;
    } catch (error) {
      console.error('Error combining form atoms:', error);
      return null;
    }
  });

  const combinedErrorAtom = atom<FieldErrorInfo | null>(get => {
    for (const a of atoms) {
      const error = get(a.formErrorAtom);
      if (error) return error;
    }
    return null;
  });

  const combinedStatusAtom = atom<StatusType>(get => {
    const statuses = atoms.map(a => get(a.formStatusAtom));
    if (statuses.includes(LoadingStatus.REJECTED)) return LoadingStatus.REJECTED;
    if (statuses.includes(LoadingStatus.PENDING)) return LoadingStatus.PENDING;
    if (statuses.every(s => s === LoadingStatus.FULFILLED || s === LoadingStatus.IDLE)) {
      if (statuses.includes(LoadingStatus.FULFILLED)) return LoadingStatus.FULFILLED;
    }
    return LoadingStatus.IDLE;
  });

  return {
    formAtom: combinedFormAtom,
    formErrorAtom: combinedErrorAtom,
    formStatusAtom: combinedStatusAtom,
  };
}
