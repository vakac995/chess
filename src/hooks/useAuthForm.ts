import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { loginAtom, authErrorAtom } from '../store/authStore';
import { useZodForm } from './useZodForm';
import { loginFormAtoms, LoginFormData } from '../features/Authentication/atoms';
import { loginSchema } from '../features/Authentication/schemas';
import { LoadingStatus } from '../types/status';
import { createError } from '../types/errors';

/**
 * Custom hook that connects React Hook Form with Jotai atoms for authentication
 * @returns Form methods, submission handler, and relevant state
 */
export function useAuthForm() {
  const [, login] = useAtom(loginAtom);
  const [, setFormData] = useAtom(loginFormAtoms.formAtom);
  const [formError, setFormError] = useAtom(loginFormAtoms.formErrorAtom);
  const [formStatus, setFormStatus] = useAtom(loginFormAtoms.formStatusAtom);
  const [authError] = useAtom(authErrorAtom);

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setFormError(null);
      setFormStatus(LoadingStatus.PENDING);
      setFormData(data);

      try {
        const success = await login(data);

        if (success) {
          setFormStatus(LoadingStatus.FULFILLED);
          return true;
        } else {
          setFormStatus(LoadingStatus.REJECTED);
          return false;
        }
      } catch (error) {
        setFormStatus(LoadingStatus.REJECTED);
        setFormError(
          createError(
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred during form submission'
          )
        );
        return false;
      }
    },
    [login, setFormData, setFormError, setFormStatus]
  );

  const displayError = formError ?? authError;
  const isPending = formStatus === LoadingStatus.PENDING || form.formState.isSubmitting;

  return {
    form,
    onSubmit,
    isPending,
    displayError,
    formStatus,
  };
}
