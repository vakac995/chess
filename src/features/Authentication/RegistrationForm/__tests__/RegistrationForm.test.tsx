import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { RegistrationForm } from '../RegistrationForm';
import { LoadingStatus } from '@/types';
import { useZodForm } from '@/hooks';

// Mock react-hook-form completely to avoid internal property issues
vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(() => ({
    control: {
      _names: {
        mount: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(),
        focus: new Set(),
        watchAll: false,
      },
      _formValues: {},
      _defaultValues: {},
      _formState: {
        isDirty: false,
        isLoading: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValidating: false,
        isValid: true,
        submitCount: 0,
        dirtyFields: {},
        touchedFields: {},
        errors: {},
        defaultValues: {},
      },
      _proxyFormState: {},
      _options: {},
      register: vi.fn(() => ({})),
      unregister: vi.fn(),
      getFieldState: vi.fn(() => ({ isDirty: false, isTouched: false })),
      _executeSchema: vi.fn(),
      _getWatch: vi.fn(),
      _getDirty: vi.fn(),
      _updateValid: vi.fn(),
      _removeUnmounted: vi.fn(),
      _updateFieldArray: vi.fn(),
      _updateDisabledField: vi.fn(),
      _getFieldArray: vi.fn(),
      _reset: vi.fn(),
      _resetDefaultValues: vi.fn(),
      _getValue: vi.fn(),
      _updateFormState: vi.fn(),
      _subjects: {
        state: { next: vi.fn(), subscribe: vi.fn() },
        values: { next: vi.fn(), subscribe: vi.fn() },
        array: { next: vi.fn(), subscribe: vi.fn() },
        watch: { next: vi.fn(), subscribe: vi.fn() },
      },
    },
    handleSubmit: vi.fn(callback => (e?: React.FormEvent) => {
      e?.preventDefault();
      callback({});
    }),
    formState: { isSubmitting: false },
    register: vi.fn(() => ({})),
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(() => ({})),
    reset: vi.fn(),
    clearErrors: vi.fn(),
    setError: vi.fn(),
    trigger: vi.fn(),
  })),
  Controller: ({
    render,
    name,
  }: {
    render: (props: { field: unknown; fieldState: unknown }) => React.ReactElement;
    name: string;
  }) => {
    const getDefaultValue = (fieldName: string) => {
      if (fieldName === 'agreeToTerms') return false;
      if (fieldName === 'age') return 0;
      return '';
    };

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: getDefaultValue(name),
      name: name,
      id: name,
      ref: { current: null },
    };
    const mockFieldState = {
      invalid: false,
      isTouched: false,
      isDirty: false,
      error: undefined,
    };
    return render({ field: mockField, fieldState: mockFieldState });
  },
  FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock hooks and utilities
const mockDefaultForm = {
  control: {
    _names: {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
      focus: new Set(),
      watchAll: false,
    },
    _formValues: {},
    _defaultValues: {},
    _formState: {
      isDirty: false,
      isLoading: false,
      isSubmitted: false,
      isSubmitSuccessful: false,
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      submitCount: 0,
      dirtyFields: {},
      touchedFields: {},
      errors: {},
      defaultValues: {},
    },
    _subjects: {
      values: { next: vi.fn(), subscribe: vi.fn() },
      array: { next: vi.fn(), subscribe: vi.fn() },
      state: { next: vi.fn(), subscribe: vi.fn() },
    },
    _proxyFormState: {},
    _options: {},
    register: vi.fn(() => ({})),
    unregister: vi.fn(),
    getFieldState: vi.fn(() => ({ isDirty: false, isTouched: false })),
    _executeSchema: vi.fn(),
    _getWatch: vi.fn(),
    _getDirty: vi.fn(),
    _updateValid: vi.fn(),
    _removeUnmounted: vi.fn(),
    _updateFieldArray: vi.fn(),
    _updateDisabledField: vi.fn(),
    _getFieldArray: vi.fn(),
    _reset: vi.fn(),
    _resetDefaultValues: vi.fn(),
    _getValue: vi.fn(),
    _updateFormState: vi.fn(),
  },
  handleSubmit: vi.fn(callback => (e?: React.FormEvent) => {
    e?.preventDefault();
    callback({});
  }),
  formState: { isSubmitting: false },
  register: vi.fn(() => ({})),
  watch: vi.fn(),
  setValue: vi.fn(),
  getValues: vi.fn(() => ({})),
  reset: vi.fn(),
  clearErrors: vi.fn(),
  setError: vi.fn(),
  trigger: vi.fn(),
  unregister: vi.fn(),
  getFieldState: vi.fn(() => ({ isDirty: false, isTouched: false })),
  getFieldsErrors: vi.fn(() => ({})),
  setFocus: vi.fn(),
  resetField: vi.fn(),
  subscribe: vi.fn(),
};

vi.mock('@/hooks', () => ({
  useZodForm: vi.fn(() => mockDefaultForm),
}));

vi.mock('@/utils', () => ({
  dev: {
    debug: vi.fn(),
    logData: vi.fn(),
    when: vi.fn((_condition: unknown, callback?: () => unknown) => callback?.()),
  },
  // Mock validation functions for schema tests
  isStrongPasswordCheck: vi.fn((_password: string, _ctx: unknown) => {
    // Mock implementation that always passes
    return true;
  }),
  isAdultAgeCheck: vi.fn((_age: number, _ctx: unknown) => {
    // Mock implementation that always passes
    return true;
  }),
  isValidPasswordForEnvironmentCheck: vi.fn(() => (_password: string, _ctx: unknown) => {
    // Mock implementation that always passes
    return true;
  }),
  // Mock formatting functions
  formatRegistrationData: vi.fn(data => {
    if (!data) return 'No registration data available';
    return JSON.stringify(data, null, 2);
  }),
  extractReactHookFormError: vi.fn(error => error),
}));

vi.mock('@/atoms', () => ({
  registrationStepAtom: { toString: () => 'registrationStepAtom' },
  basicInfoAtoms: {
    formAtom: { toString: () => 'basicInfoFormAtom' },
    formStatusAtom: { toString: () => 'basicInfoStatusAtom' },
    formErrorAtom: { toString: () => 'basicInfoErrorAtom' },
  },
  personalInfoAtoms: {
    formAtom: { toString: () => 'personalInfoFormAtom' },
    formStatusAtom: { toString: () => 'personalInfoStatusAtom' },
    formErrorAtom: { toString: () => 'personalInfoErrorAtom' },
  },
  registrationFormAtoms: {
    formAtom: { toString: () => 'registrationFormAtom' },
    formStatusAtom: { toString: () => 'registrationFormStatusAtom' },
    formErrorAtom: { toString: () => 'registrationFormErrorAtom' },
  },
}));

// Mock jotai
const mockAtomValues = {
  step: 1,
  registrationData: null as unknown,
  combinedStatus: LoadingStatus.IDLE,
  combinedError: null as unknown,
  basicInfo: null as unknown,
  basicInfoStatus: LoadingStatus.IDLE,
  personalInfo: null as unknown,
  personalInfoStatus: LoadingStatus.IDLE,
};

vi.mock('jotai', () => ({
  useAtom: vi.fn(atom => {
    const atomString = atom.toString();

    if (atomString.includes('registrationStepAtom')) {
      return [mockAtomValues.step, vi.fn()];
    }
    if (atomString.includes('registrationFormAtom')) {
      return [mockAtomValues.registrationData, vi.fn()];
    }
    if (atomString.includes('registrationFormStatusAtom')) {
      return [mockAtomValues.combinedStatus, vi.fn()];
    }
    if (atomString.includes('registrationFormErrorAtom')) {
      return [mockAtomValues.combinedError, vi.fn()];
    }
    if (atomString.includes('basicInfoFormAtom')) {
      return [mockAtomValues.basicInfo, vi.fn()];
    }
    if (atomString.includes('basicInfoStatusAtom')) {
      return [mockAtomValues.basicInfoStatus, vi.fn()];
    }
    if (atomString.includes('basicInfoErrorAtom')) {
      return [null, vi.fn()];
    }
    if (atomString.includes('personalInfoFormAtom')) {
      return [mockAtomValues.personalInfo, vi.fn()];
    }
    if (atomString.includes('personalInfoStatusAtom')) {
      return [mockAtomValues.personalInfoStatus, vi.fn()];
    }
    if (atomString.includes('personalInfoErrorAtom')) {
      return [null, vi.fn()];
    }

    return [null, vi.fn()];
  }),
  Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('RegistrationForm', () => {
  const defaultProps = {
    onSwitchToLogin: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock atom values
    mockAtomValues.step = 1;
    mockAtomValues.registrationData = null;
    mockAtomValues.combinedStatus = LoadingStatus.IDLE;
    mockAtomValues.combinedError = null;
    mockAtomValues.basicInfo = null;
    mockAtomValues.basicInfoStatus = LoadingStatus.IDLE;
    mockAtomValues.personalInfo = null;
    mockAtomValues.personalInfoStatus = LoadingStatus.IDLE;
  });

  describe('Rendering', () => {
    it('renders registration form with step 1 initially', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Register (Step 1/2: Basic Info)')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    it('renders step 2 when step is 2', () => {
      mockAtomValues.step = 2;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Register (Step 2/2: Personal Details)')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Age')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });

    it('renders success state when registration is complete', () => {
      mockAtomValues.basicInfoStatus = LoadingStatus.FULFILLED;
      mockAtomValues.personalInfoStatus = LoadingStatus.FULFILLED;
      mockAtomValues.registrationData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        agreeToTerms: true,
      };

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Registration Complete!')).toBeInTheDocument();
      expect(screen.getByText('Thank you for registering.')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders switch to login button', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Already have an account? Login here')).toBeInTheDocument();
    });
  });

  describe('Step 1 - Basic Info', () => {
    it('renders all basic info form fields', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    it('has proper form field types', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByPlaceholderText('Enter your email')).toHaveAttribute('type', 'email');
      expect(screen.getByPlaceholderText('Create a password')).toHaveAttribute('type', 'password');
      expect(screen.getByPlaceholderText('Confirm your password')).toHaveAttribute(
        'type',
        'password'
      );
    });

    it('disables continue button when form is submitting', () => {
      // Mock the form to be in submitting state
      const mockSubmittingForm = {
        ...mockDefaultForm,
        formState: {
          ...mockDefaultForm.formState,
          isSubmitting: true,
        },
      };

      // Override the useZodForm mock for this test
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(useZodForm).mockReturnValueOnce(mockSubmittingForm as any);

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Step 2 - Personal Info', () => {
    beforeEach(() => {
      mockAtomValues.step = 2;
      mockAtomValues.basicInfo = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
    });

    it('renders all personal info form fields', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your age')).toBeInTheDocument();
      expect(screen.getByText('I agree to the')).toBeInTheDocument();
    });

    it('has proper form field types', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByPlaceholderText('Enter your first name')).toHaveAttribute('type', 'text');
      expect(screen.getByPlaceholderText('Enter your last name')).toHaveAttribute('type', 'text');
      expect(screen.getByPlaceholderText('Enter your age')).toHaveAttribute('type', 'number');
      expect(screen.getByRole('checkbox')).toHaveAttribute('type', 'checkbox');
    });

    it('renders back and register buttons', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });

    it('disables buttons when submitting', () => {
      mockAtomValues.personalInfoStatus = LoadingStatus.PENDING;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Registering...' })).toBeDisabled();
    });

    it('shows registering text when submitting', () => {
      mockAtomValues.personalInfoStatus = LoadingStatus.PENDING;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Registering...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error when registration fails', () => {
      const errorMessage = 'Registration failed';
      mockAtomValues.combinedStatus = LoadingStatus.REJECTED;
      mockAtomValues.combinedError = { message: errorMessage };

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('handles retry functionality', async () => {
      const errorMessage = 'Registration failed';
      mockAtomValues.combinedStatus = LoadingStatus.REJECTED;
      mockAtomValues.combinedError = { message: errorMessage };
      const user = userEvent.setup();

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const retryButton = screen.getByText('Try again');
      await user.click(retryButton);

      // The click should trigger the retry logic
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onSwitchToLogin when login link is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const loginLink = screen.getByText('Already have an account? Login here');
      await user.click(loginLink);

      expect(defaultProps.onSwitchToLogin).toHaveBeenCalledTimes(1);
    });

    it('handles back button click in step 2', async () => {
      mockAtomValues.step = 2;
      const user = userEvent.setup();

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const backButton = screen.getByRole('button', { name: 'Back' });
      await user.click(backButton);

      // Should trigger handleBack function
      expect(backButton).toBeInTheDocument();
    });

    it('handles form submission in step 1', async () => {
      const user = userEvent.setup();

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await user.click(continueButton);

      // Should trigger form submission
      expect(continueButton).toBeInTheDocument();
    });

    it('handles form submission in step 2', async () => {
      mockAtomValues.step = 2;
      const user = userEvent.setup();

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const registerButton = screen.getByRole('button', { name: 'Register' });
      await user.click(registerButton);

      // Should trigger form submission
      expect(registerButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('renders error info components for form fields', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      // Form fields should be present, error handling is managed by FormField
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('applies error styling to form fields', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const emailField = screen.getByPlaceholderText('Enter your email');
      expect(emailField).toHaveClass('border-border'); // Default state
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct container classes', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const container = screen.getByText('Register (Step 1/2: Basic Info)').closest('div');
      expect(container).toHaveClass(
        'rounded-card',
        'bg-background',
        'p-container-padding',
        'mx-auto',
        'max-w-md',
        'shadow-md'
      );
    });

    it('applies correct form styling', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      expect(continueButton).toHaveClass(
        'rounded-button',
        'bg-primary',
        'hover:bg-primary/80',
        'w-full',
        'px-4',
        'py-2',
        'text-white',
        'transition',
        'duration-150',
        'disabled:opacity-50'
      );
    });

    it('applies correct step 2 button styling', () => {
      mockAtomValues.step = 2;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const backButton = screen.getByRole('button', { name: 'Back' });
      const registerButton = screen.getByRole('button', { name: 'Register' });

      expect(backButton).toHaveClass('w-1/2');
      expect(registerButton).toHaveClass('w-1/2');
    });
  });

  describe('Debug Mode', () => {
    it('renders debug information when registration is complete', () => {
      mockAtomValues.basicInfoStatus = LoadingStatus.FULFILLED;
      mockAtomValues.personalInfoStatus = LoadingStatus.FULFILLED;
      mockAtomValues.registrationData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        agreeToTerms: true,
      };

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      // Debug info should be rendered when dev.when is called
      expect(screen.getByText('Registration Data (Debug)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('has proper form labels in step 2', () => {
      mockAtomValues.step = 2;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Age')).toBeInTheDocument();
    });

    it('has proper checkbox labeling', () => {
      mockAtomValues.step = 2;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'agreeToTermsReg');
      const label = screen.getByText('I agree to the');
      expect(label.closest('label')).toHaveAttribute('for', 'agreeToTermsReg');
    });

    it('has proper button roles and accessibility', () => {
      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles missing onSwitchToLogin prop gracefully', () => {
      render(
        <Provider>
          <RegistrationForm />
        </Provider>
      );

      const loginLink = screen.getByText('Already have an account? Login here');
      expect(loginLink).toBeInTheDocument();
    });

    it('calls onSwitchToLogin when provided', async () => {
      const mockSwitchToLogin = vi.fn();
      const user = userEvent.setup();

      render(
        <Provider>
          <RegistrationForm onSwitchToLogin={mockSwitchToLogin} />
        </Provider>
      );

      const loginLink = screen.getByText('Already have an account? Login here');
      await user.click(loginLink);

      expect(mockSwitchToLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles null registration data in success state', () => {
      mockAtomValues.basicInfoStatus = LoadingStatus.FULFILLED;
      mockAtomValues.personalInfoStatus = LoadingStatus.FULFILLED;
      mockAtomValues.registrationData = null;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Registration Complete!')).toBeInTheDocument();
    });

    it('handles missing basic info in step 2', () => {
      mockAtomValues.step = 2;
      mockAtomValues.basicInfo = null;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Register (Step 2/2: Personal Details)')).toBeInTheDocument();
    });

    it('handles different loading states', () => {
      mockAtomValues.combinedStatus = LoadingStatus.PENDING;

      render(
        <Provider>
          <RegistrationForm {...defaultProps} />
        </Provider>
      );

      expect(screen.getByText('Register (Step 1/2: Basic Info)')).toBeInTheDocument();
    });
  });
});
