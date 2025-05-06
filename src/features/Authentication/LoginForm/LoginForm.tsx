import { Form, FormField, ErrorInfo } from '../../../components/Form';
import { useAuthForm } from '../../../hooks/useAuthForm';
import { LoadingStatus } from '../../../types/status';

export function LoginForm() {
  const { form, onSubmit, isPending, displayError, formStatus } = useAuthForm();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {displayError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
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
                className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
                aria-invalid={error ? 'true' : 'false'}
              />
              {error && <ErrorInfo error={error} className="mt-1" />}
            </>
          )}
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </Form>

      {formStatus === LoadingStatus.FULFILLED && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
          Login successful! Redirecting or showing authenticated content...
        </div>
      )}
    </div>
  );
}
