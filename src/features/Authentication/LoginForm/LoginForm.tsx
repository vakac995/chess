import React from 'react';
import { Form, FormField, ErrorInfo } from '@/components/Form';
import { AutoLogoutSelector } from '@/components/AutoLogoutSelector';
import { useAuthForm } from '@/hooks';
import { LoadingStatus } from '@/types';
import type { LoginFormProps } from './LoginForm.types';
import type { AutoLogoutPreference } from '@/components/AutoLogoutSelector';

const getAutoLogoutDescription = (preference: AutoLogoutPreference): string => {
  if (preference.mode === 'duration') {
    return `Session expires after ${preference.durationHours} hours`;
  }
  if (preference.mode === 'specific-date') {
    return `Logout on ${preference.specificDate?.toLocaleDateString()}`;
  }
  return 'Custom schedule set';
};

export function LoginForm({ onSwitchToRegister }: Readonly<LoginFormProps>) {
  const { form, onSubmit, isPending, displayError, formStatus } = useAuthForm();
  const [autoLogoutPreference, setAutoLogoutPreference] = React.useState<AutoLogoutPreference>({
    mode: 'duration',
    durationHours: 8,
    enabled: false,
  });

  const handleLoginSubmit = async (data: { email: string; password: string }) => {
    // Include auto-logout preference in the login data
    const loginData = {
      ...data,
      autoLogout: autoLogoutPreference,
    };

    // In a real application, you would send this to your authentication service
    console.warn('Login with auto-logout settings:', loginData);
    return await onSubmit(data); // For now, just use the original form submission
  };

  return (
    <div className="rounded-card bg-background p-container-padding mx-auto max-w-md shadow-md">
      <h2 className="text-text mb-4 text-xl font-bold">Login</h2>

      {displayError && (
        <div className="border-accent/30 bg-accent/10 text-accent mb-4 rounded border p-3">
          <ErrorInfo error={displayError} />
        </div>
      )}

      <Form form={form} onSubmit={handleLoginSubmit} className="space-y-4">
        <FormField
          name="email"
          label="Email"
          render={({ field, error }) => (
            <>
              <input
                {...field}
                type="email"
                placeholder="Enter your email (user@example.com)"
                className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
                aria-invalid={error ? 'true' : 'false'}
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
                placeholder="Enter your password (password123)"
                className={`rounded-button text-text w-full border px-3 py-2 ${error ? 'border-accent' : 'border-border'}`}
                aria-invalid={error ? 'true' : 'false'}
              />
              {error && <ErrorInfo error={error} className="mt-1" />}
            </>
          )}
        />

        {/* Auto-Logout Configuration */}
        <div className="pt-2">
          <AutoLogoutSelector
            value={autoLogoutPreference}
            onChange={setAutoLogoutPreference}
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-button bg-primary hover:bg-primary/80 w-full px-4 py-2 text-white transition duration-150 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </Form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToRegister}
          className="text-primary hover:text-primary/80 text-sm underline"
        >
          Don&apos;t have an account? Register here
        </button>
      </div>

      {formStatus === LoadingStatus.FULFILLED && (
        <div className="mt-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">
          Login successful!
          {autoLogoutPreference.enabled && (
            <div className="mt-1 text-sm">
              Auto-logout configured: {getAutoLogoutDescription(autoLogoutPreference)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
