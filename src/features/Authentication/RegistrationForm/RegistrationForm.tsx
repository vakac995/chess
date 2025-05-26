import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { Form, FormField, ErrorInfo } from '@/components/Form';
import { useZodForm } from '@/hooks';
import {
  registrationStepAtom,
  basicInfoAtoms,
  personalInfoAtoms,
  registrationFormAtoms,
} from '@/atoms';
import { createError, LoadingStatus } from '@/types';
import { BasicInfoData, basicInfoSchema, PersonalInfoData, personalInfoSchema } from '@/schemas';
import { RegistrationDataDisplay } from './RegistrationDataDisplay';
import { dev } from '@/utils';
import type { RegistrationFormProps } from './RegistrationForm.types';

export function RegistrationForm({ onSwitchToLogin }: Readonly<RegistrationFormProps>) {
  const [step, setStep] = useAtom(registrationStepAtom);

  const [registrationData] = useAtom(registrationFormAtoms.formAtom);
  const [combinedStatus] = useAtom(registrationFormAtoms.formStatusAtom);
  const [combinedError] = useAtom(registrationFormAtoms.formErrorAtom);

  const [basicInfo, setBasicInfo] = useAtom(basicInfoAtoms.formAtom);
  const [basicInfoStatus, setBasicInfoStatus] = useAtom(basicInfoAtoms.formStatusAtom);
  const [, setBasicInfoError] = useAtom(basicInfoAtoms.formErrorAtom);

  const [personalInfo, setPersonalInfo] = useAtom(personalInfoAtoms.formAtom);
  const [personalInfoStatus, setPersonalInfoStatus] = useAtom(personalInfoAtoms.formStatusAtom);
  const [, setPersonalInfoError] = useAtom(personalInfoAtoms.formErrorAtom);

  const basicInfoForm = useZodForm({
    schema: basicInfoSchema,
    defaultValues: basicInfo || {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const personalInfoForm = useZodForm({
    schema: personalInfoSchema,
    defaultValues: personalInfo || {
      firstName: '',
      lastName: '',
      age: 0,
      agreeToTerms: false,
    },
    mode: 'onBlur',
  });

  /**
   * Handle form submission for the basic information step (first step)
   */
  const onSubmitBasicInfo = useCallback(
    (data: BasicInfoData) => {
      setBasicInfo(data);
      setBasicInfoStatus(LoadingStatus.FULFILLED);
      setBasicInfoError(null);

      dev.debug('Basic info data stored', data);

      setStep(2);
    },
    [setBasicInfo, setBasicInfoStatus, setBasicInfoError, setStep]
  );

  /**
   * Handle form submission for the personal information step (final step)
   */
  const onSubmitPersonalInfo = useCallback(
    async (data: PersonalInfoData) => {
      setPersonalInfoStatus(LoadingStatus.PENDING);
      setPersonalInfoError(null);

      if (!basicInfo) {
        setPersonalInfoStatus(LoadingStatus.REJECTED);
        setPersonalInfoError(
          createError('Basic information is missing. Please go back and complete step 1.')
        );
        return;
      }

      const personalInfoComplete =
        data &&
        typeof data.firstName === 'string' &&
        typeof data.lastName === 'string' &&
        typeof data.age === 'number' &&
        typeof data.agreeToTerms === 'boolean';

      if (!personalInfoComplete) {
        console.warn('Personal info data is incomplete:', data);
        setPersonalInfoStatus(LoadingStatus.REJECTED);
        setPersonalInfoError(
          createError('Personal information is incomplete. Please fill all required fields.')
        );
        return;
      }

      try {
        dev.logData('Simulating API call with registration data', {
          ...basicInfo,
          ...data,
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        setPersonalInfo(data);

        setPersonalInfoStatus(LoadingStatus.FULFILLED);
      } catch (error) {
        console.warn('Registration failed:', error);

        setPersonalInfoStatus(LoadingStatus.REJECTED);
        setPersonalInfoError(
          createError(
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred during registration. Please try again.'
          )
        );
      }
    },
    [basicInfo, setPersonalInfo, setPersonalInfoStatus, setPersonalInfoError]
  );

  const handleBack = () => {
    setStep(1);
  };

  const isSubmitting = personalInfoStatus === LoadingStatus.PENDING;
  const submissionError = combinedError;
  const submissionSuccess =
    basicInfoStatus === LoadingStatus.FULFILLED && personalInfoStatus === LoadingStatus.FULFILLED;

  const handleRetry = useCallback(() => {
    setPersonalInfoStatus(LoadingStatus.IDLE);
    setPersonalInfoError(null);

    if (!basicInfo) {
      setStep(1);
    }
  }, [setPersonalInfoStatus, setPersonalInfoError, basicInfo, setStep]);

  return (
    <div className="rounded-card bg-background p-container-padding mx-auto max-w-md shadow-md">
      <h2 className="text-text mb-4 text-xl font-bold">
        Register {step === 1 ? '(Step 1/2: Basic Info)' : '(Step 2/2: Personal Details)'}
      </h2>

      {combinedStatus === LoadingStatus.REJECTED && submissionError && (
        <div className="border-accent/30 bg-accent/10 text-accent mb-4 rounded border p-3">
          <ErrorInfo error={submissionError} />
          <button onClick={handleRetry} className="text-primary mt-2 text-sm underline">
            Try again
          </button>
        </div>
      )}

      {submissionSuccess ? (
        <div className="p-4">
          <div className="mb-2 text-center text-3xl text-green-500">✓</div>
          <h3 className="text-text mb-2 text-center text-lg font-medium">Registration Complete!</h3>
          <p className="text-text-muted mb-4 text-center">Thank you for registering.</p>

          <RegistrationDataDisplay data={registrationData} className="mt-4" />

          {dev.when('debugUI', () => (
            <div className="border-border bg-background/30 mt-4 rounded border p-3 text-xs">
              <h4 className="mb-1 font-semibold">Registration Data (Debug)</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-primary font-medium">Basic Info:</p>
                  <pre className="mt-1 overflow-auto">
                    {JSON.stringify(basicInfo, null, 2) || 'null'}
                  </pre>
                </div>
                <div>
                  <p className="text-primary font-medium">Personal Info:</p>
                  <pre className="mt-1 overflow-auto">
                    {JSON.stringify(personalInfo, null, 2) || 'null'}
                  </pre>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-primary font-medium">Combined Data:</p>
                <pre className="mt-1 overflow-auto">
                  {JSON.stringify(registrationData, null, 2) || 'null'}
                </pre>
              </div>
            </div>
          ))}
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
                      className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
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
                      className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
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
                      className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
                    />
                    {error && <ErrorInfo error={error} className="mt-1" />}
                  </>
                )}
              />
              <button
                type="submit"
                disabled={basicInfoForm.formState.isSubmitting}
                className="rounded-button bg-primary hover:bg-primary/80 w-full px-4 py-2 text-white transition duration-150 disabled:opacity-50"
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
                      className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
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
                      className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
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
                      className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
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
                      className={`border-border text-primary mt-1 h-4 w-4 rounded ${error ? 'border-accent' : ''}`}
                    />
                    <div className="flex-1">
                      <label htmlFor="agreeToTermsReg" className="text-text-muted text-sm">
                        I agree to the{' '}
                        <a href="#" className="text-primary hover:underline">
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
                  className="rounded-button bg-secondary/80 hover:bg-secondary w-1/2 px-4 py-2 text-white transition duration-150 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || personalInfoForm.formState.isSubmitting}
                  className="rounded-button bg-primary hover:bg-primary/80 w-1/2 px-4 py-2 text-white transition duration-150 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </Form>
          )}
        </>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToLogin}
          className="text-primary hover:text-primary/80 text-sm underline"
        >
          Already have an account? Login here
        </button>
      </div>
    </div>
  );
}
