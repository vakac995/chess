import { useState, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Form, FormField, ErrorInfo } from '../../../components/Form';
import { useZodForm } from '../../../hooks/useZodForm';
import { basicInfoAtoms, personalInfoAtoms, registrationFormAtoms } from '../../Registration/atoms';
import { LoadingStatus } from '../../../types/status';
import { createError } from '../../../types/errors';
import {
  BasicInfoData,
  basicInfoSchema,
  PersonalInfoData,
  personalInfoSchema,
} from '../../Registration/schemas';

export function RegistrationForm() {
  const [step, setStep] = useState(1);

  const [basicDataFromAtom, setBasicInfoData] = useAtom(basicInfoAtoms.formAtom);
  const [, setBasicInfoStatus] = useAtom(basicInfoAtoms.formStatusAtom);
  const [, setBasicInfoError] = useAtom(basicInfoAtoms.formErrorAtom);

  const [, setPersonalInfoData] = useAtom(personalInfoAtoms.formAtom);
  const [, setPersonalInfoStatus] = useAtom(personalInfoAtoms.formStatusAtom);
  const [, setPersonalInfoError] = useAtom(personalInfoAtoms.formErrorAtom);

  const combinedDataForDisplay = useAtomValue(registrationFormAtoms.formAtom);
  const combinedStatus = useAtomValue(registrationFormAtoms.formStatusAtom);
  const combinedError = useAtomValue(registrationFormAtoms.formErrorAtom);

  const basicInfoForm = useZodForm({
    schema: basicInfoSchema,
    defaultValues: basicDataFromAtom || {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const personalInfoDataFromAtom = useAtomValue(personalInfoAtoms.formAtom);
  const personalInfoForm = useZodForm({
    schema: personalInfoSchema,
    defaultValues: personalInfoDataFromAtom || {
      firstName: '',
      lastName: '',
      age: 0,
      agreeToTerms: false,
    },
    mode: 'onBlur',
  });

  const onSubmitBasicInfo = useCallback(
    (data: BasicInfoData) => {
      setBasicInfoData(data);
      setBasicInfoStatus(LoadingStatus.FULFILLED);
      setBasicInfoError(null);
      setStep(2);
    },
    [setBasicInfoData, setBasicInfoStatus, setBasicInfoError]
  );

  const onSubmitPersonalInfo = useCallback(
    async (data: PersonalInfoData) => {
      setPersonalInfoData(data);
      setPersonalInfoStatus(LoadingStatus.PENDING);
      setPersonalInfoError(null);

      if (!basicDataFromAtom) {
        setPersonalInfoStatus(LoadingStatus.REJECTED);
        setPersonalInfoError(createError('Basic information is missing. Please go back.'));
        return;
      }

      const combinedDataForApi = { ...basicDataFromAtom, ...data };

      try {
        console.warn('Simulating API call with:', combinedDataForApi);
        await new Promise(resolve => setTimeout(resolve, 150));
        setPersonalInfoStatus(LoadingStatus.FULFILLED);
      } catch (error) {
        setPersonalInfoStatus(LoadingStatus.REJECTED);
        setPersonalInfoError(
          createError(
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred during registration.'
          )
        );
      }
    },
    [setPersonalInfoData, setPersonalInfoStatus, setPersonalInfoError, basicDataFromAtom]
  );

  const handleBack = () => {
    setStep(1);
  };

  const isSubmitting = combinedStatus === LoadingStatus.PENDING;
  const submissionError = combinedError;
  const submissionSuccess = combinedStatus === LoadingStatus.FULFILLED;

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">
        Register {step === 1 ? '(Step 1/2: Basic Info)' : '(Step 2/2: Personal Details)'}
      </h2>

      {combinedStatus === LoadingStatus.REJECTED && submissionError && (
        <div className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
          <ErrorInfo error={submissionError} />
        </div>
      )}

      {submissionSuccess ? (
        <div className="p-4 text-center">
          <div className="mb-2 text-3xl text-green-500">✓</div>
          <h3 className="mb-2 text-lg font-medium">Registration Complete!</h3>
          <p className="text-gray-600">Thank you for registering.</p>
          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-2 text-left text-xs">
            {JSON.stringify(combinedDataForDisplay, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          {step === 1 && (
            <Form form={basicInfoForm} onSubmit={onSubmitBasicInfo} className="space-y-4">
              <FormField
                name="email"
                label="Email"
                render={({ field, error }) => (
                  <>
                    <input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && <ErrorInfo error={error} className="mt-1" />}
                  </>
                )}
              />
              <FormField
                name="password"
                label="Password"
                render={({ field, error }) => (
                  <>
                    <input
                      {...field}
                      type="password"
                      placeholder="Create a password"
                      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && <ErrorInfo error={error} className="mt-1" />}
                  </>
                )}
              />
              <FormField
                name="confirmPassword"
                label="Confirm Password"
                render={({ field, error }) => (
                  <>
                    <input
                      {...field}
                      type="password"
                      placeholder="Confirm your password"
                      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && <ErrorInfo error={error} className="mt-1" />}
                  </>
                )}
              />
              <button
                type="submit"
                disabled={basicInfoForm.formState.isSubmitting}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white transition duration-150 hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </Form>
          )}

          {step === 2 && (
            <Form form={personalInfoForm} onSubmit={onSubmitPersonalInfo} className="space-y-4">
              <FormField
                name="firstName"
                label="First Name"
                render={({ field, error }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter your first name"
                      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && <ErrorInfo error={error} className="mt-1" />}
                  </>
                )}
              />
              <FormField
                name="lastName"
                label="Last Name"
                render={({ field, error }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter your last name"
                      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && <ErrorInfo error={error} className="mt-1" />}
                  </>
                )}
              />
              <FormField
                name="age"
                label="Age"
                render={({ field, error }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      onChange={e =>
                        field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                      }
                      value={field.value === 0 ? '' : field.value}
                      placeholder="Enter your age"
                      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && <ErrorInfo error={error} className="mt-1" />}
                  </>
                )}
              />
              <FormField
                name="agreeToTerms"
                render={({ field, error }) => (
                  <div className="flex items-start space-x-2">
                    <input
                      {...field}
                      type="checkbox"
                      id="agreeToTermsReg"
                      checked={field.value}
                      className={`mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
                    />
                    <div className="flex-1">
                      <label htmlFor="agreeToTermsReg" className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          terms and conditions
                        </a>
                      </label>
                      {error && <ErrorInfo error={error} className="mt-1" />}
                    </div>
                  </div>
                )}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="w-1/2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition duration-150 hover:bg-gray-400 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || personalInfoForm.formState.isSubmitting}
                  className="w-1/2 rounded bg-blue-600 px-4 py-2 text-white transition duration-150 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </Form>
          )}
        </>
      )}
    </div>
  );
}
