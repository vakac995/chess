import { Form, FormField, ErrorInfo } from '../../../components/Form';
import { useAuthForm } from '../../../hooks/useAuthForm';
import { LoadingStatus } from '../../../types/status';

export function LoginForm() {
  const { form, onSubmit, isPending, displayError, formStatus } = useAuthForm();

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Login</h2>

      {displayError && (
        <div className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
          <ErrorInfo error={displayError} />
        </div>
      )}

      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        <FormField
          name="email"
          label="Email"
          render={({ field, error }) => (
            <>
              <input
                {...field}
                type="email"
                placeholder="Enter your email (user@example.com)"
                className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                aria-invalid={error ? 'true' : 'false'}
              />
              {error && <ErrorInfo error={error} className="mt-1" />}
            </>
          )}
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white transition duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </Form>

      {formStatus === LoadingStatus.FULFILLED && (
        <div className="mt-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">
          Login successful! Redirecting or showing authenticated content...
        </div>
      )}
    </div>
  );
}
