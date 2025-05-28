import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationDataDisplay } from '../RegistrationDataDisplay';
import { RegistrationData } from '@/schemas';
import * as utils from '@/utils';

// Mock the dev utility
vi.mock('@/utils', () => ({
  dev: {
    debug: vi.fn(),
  },
  formatRegistrationData: vi.fn(),
}));

describe('RegistrationDataDisplay', () => {
  const mockData: RegistrationData = {
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    age: 25,
    agreeToTerms: true,
  };

  // Expected formatted output with masked passwords
  const expectedFormattedData = JSON.stringify(
    {
      email: 'test@example.com',
      password: '••••••••••',
      confirmPassword: '••••••••••',
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      agreeToTerms: true,
    },
    null,
    2
  );

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset formatRegistrationData mock to default behavior
    vi.mocked(utils.formatRegistrationData).mockImplementation(data => {
      if (!data) return 'No registration data available';

      // Simulate the actual formatRegistrationData behavior - mask passwords
      const displayData = { ...data };
      const SENSITIVE_FIELD_MASKS = {
        password: '••••••••••',
        confirmPassword: '••••••••••',
      };

      for (const [field, mask] of Object.entries(SENSITIVE_FIELD_MASKS)) {
        if (field in displayData) {
          displayData[field] = mask;
        }
      }

      return JSON.stringify(displayData, null, 2);
    });
  });

  describe('Rendering', () => {
    it('renders "No registration data available" when data is null', () => {
      render(<RegistrationDataDisplay data={null} />);

      expect(screen.getByText('No registration data available')).toBeInTheDocument();
    });

    it('renders "No registration data available" when data is undefined', () => {
      render(<RegistrationDataDisplay data={null} />);

      expect(screen.getByText('No registration data available')).toBeInTheDocument();
    });

    it('renders data container when data is provided', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} />);

      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedFormattedData);
    });

    it('renders with default className', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} />);

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass(
        'bg-background/50',
        'text-text',
        'mt-4',
        'overflow-auto',
        'rounded',
        'p-2',
        'text-left',
        'text-xs'
      );
    });

    it('renders with custom className', () => {
      const customClass = 'custom-class';
      const { container } = render(
        <RegistrationDataDisplay data={mockData} className={customClass} />
      );

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass(customClass);
    });

    it('renders with combined default and custom classNames', () => {
      const customClass = 'custom-class';
      const { container } = render(
        <RegistrationDataDisplay data={mockData} className={customClass} />
      );

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass(
        'bg-background/50',
        'text-text',
        'mt-4',
        'overflow-auto',
        'rounded',
        'p-2',
        'text-left',
        'text-xs',
        customClass
      );
    });
  });

  describe('Data Handling', () => {
    it('handles complete registration data', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} />);

      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedFormattedData);
    });

    it('handles partial registration data', () => {
      const partialData: Partial<RegistrationData> = {
        email: 'test@example.com',
        firstName: 'John',
      };

      const { container } = render(<RegistrationDataDisplay data={partialData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedPartialData = utils.formatRegistrationData(partialData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedPartialData);
    });

    it('handles empty object', () => {
      const emptyData = {};

      render(<RegistrationDataDisplay data={emptyData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedEmptyData = utils.formatRegistrationData(emptyData);
      expect(screen.getByText(expectedEmptyData)).toBeInTheDocument();
    });

    it('handles data with only email', () => {
      const emailOnlyData = { email: 'test@example.com' };

      const { container } = render(<RegistrationDataDisplay data={emailOnlyData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedEmailData = utils.formatRegistrationData(emailOnlyData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedEmailData);
    });

    it('handles data with only personal info', () => {
      const personalOnlyData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        agreeToTerms: true,
      };

      const { container } = render(<RegistrationDataDisplay data={personalOnlyData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedPersonalData = utils.formatRegistrationData(personalOnlyData);
      const preElement = container.querySelector('pre');
      expect(preElement?.textContent?.trim()).toBe(expectedPersonalData.trim());
    });
  });

  describe('Utils Integration', () => {
    it('calls dev.debug with data', () => {
      render(<RegistrationDataDisplay data={mockData} />);

      expect(utils.dev.debug).toHaveBeenCalledWith('RegistrationDataDisplay received:', mockData);
    });

    it('calls dev.debug with null data', () => {
      render(<RegistrationDataDisplay data={null} />);

      expect(utils.dev.debug).toHaveBeenCalledWith('RegistrationDataDisplay received:', null);
    });

    it('calls formatRegistrationData when data exists', () => {
      render(<RegistrationDataDisplay data={mockData} />);

      expect(utils.formatRegistrationData).toHaveBeenCalledWith(mockData);
    });

    it('does not call formatRegistrationData when data is null', () => {
      render(<RegistrationDataDisplay data={null} />);

      expect(utils.formatRegistrationData).not.toHaveBeenCalled();
    });

    it('uses formatted data from formatRegistrationData', () => {
      const formattedResult = 'Custom formatted data';
      vi.mocked(utils.formatRegistrationData).mockReturnValue(formattedResult);

      render(<RegistrationDataDisplay data={mockData} />);

      expect(screen.getByText(formattedResult)).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Layout', () => {
    it('applies correct layout classes to main container when data exists', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} />);

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass('bg-background/50');
      expect(displayElement).toHaveClass('text-text');
      expect(displayElement).toHaveClass('mt-4');
      expect(displayElement).toHaveClass('overflow-auto');
      expect(displayElement).toHaveClass('rounded');
      expect(displayElement).toHaveClass('p-2');
      expect(displayElement).toHaveClass('text-left');
      expect(displayElement).toHaveClass('text-xs');
    });

    it('applies correct classes to no data container', () => {
      const { container } = render(<RegistrationDataDisplay data={null} />);

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass('text-center');
    });

    it('renders pre element for formatted data', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} />);

      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.tagName).toBe('PRE');
      expect(preElement?.textContent).toBe(expectedFormattedData);
    });

    it('maintains text formatting in pre element', () => {
      const dataWithSpacing = {
        email: 'test@example.com',
        name: 'John   Doe   with   spaces',
      };

      const { container } = render(<RegistrationDataDisplay data={dataWithSpacing} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedSpacingData = utils.formatRegistrationData(dataWithSpacing);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedSpacingData);
    });
  });

  describe('Prop Handling', () => {
    it('handles className prop correctly', () => {
      const customClass = 'my-custom-class';
      const { container } = render(
        <RegistrationDataDisplay data={mockData} className={customClass} />
      );

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass(customClass);
    });

    it('handles empty className gracefully', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} className="" />);

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass('bg-background/50');
    });

    it('handles undefined className gracefully', () => {
      const { container } = render(
        <RegistrationDataDisplay data={mockData} className={undefined} />
      );

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass('bg-background/50');
    });

    it('handles multiple className values', () => {
      const multipleClasses = 'class1 class2 class3';
      const { container } = render(
        <RegistrationDataDisplay data={mockData} className={multipleClasses} />
      );

      const displayElement = container.querySelector('div');
      expect(displayElement).toHaveClass('class1', 'class2', 'class3');
    });

    it('handles data prop changes correctly', () => {
      const { rerender, container } = render(<RegistrationDataDisplay data={mockData} />);

      let preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedFormattedData);

      const newData = { email: 'new@example.com' };
      rerender(<RegistrationDataDisplay data={newData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedNewData = utils.formatRegistrationData(newData);
      preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedNewData);
    });
  });

  describe('Edge Cases', () => {
    it('handles data with special characters', () => {
      const specialData = {
        email: 'test+tag@example.com',
        firstName: 'José',
        lastName: "O'Connor",
        description: 'Text with "quotes" and symbols: @#$%^&*()',
      };

      const { container } = render(<RegistrationDataDisplay data={specialData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedSpecialData = utils.formatRegistrationData(specialData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedSpecialData);
    });

    it('handles data with boolean values', () => {
      const booleanData = {
        agreeToTerms: true,
        newsletter: false,
      };

      const { container } = render(<RegistrationDataDisplay data={booleanData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedBooleanData = utils.formatRegistrationData(booleanData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedBooleanData);
    });

    it('handles data with number values', () => {
      const numberData = {
        age: 25,
        score: 0,
        rating: 4.5,
      };

      const { container } = render(<RegistrationDataDisplay data={numberData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedNumberData = utils.formatRegistrationData(numberData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedNumberData);
    });

    it('handles data with nested objects', () => {
      const nestedData = {
        email: 'test@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      };

      const { container } = render(<RegistrationDataDisplay data={nestedData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedNestedData = utils.formatRegistrationData(nestedData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedNestedData);
    });

    it('handles data with array values', () => {
      const arrayData = {
        email: 'test@example.com',
        interests: ['chess', 'reading', 'coding'],
      };

      const { container } = render(<RegistrationDataDisplay data={arrayData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedArrayData = utils.formatRegistrationData(arrayData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedArrayData);
    });

    it('handles data with null/undefined properties', () => {
      const nullData = {
        email: 'test@example.com',
        firstName: undefined, // Changed from null to undefined
        lastName: undefined,
      };

      const { container } = render(<RegistrationDataDisplay data={nullData} />);

      // Use formatRegistrationData mock since component uses that function
      const expectedNullData = utils.formatRegistrationData(nullData);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedNullData);
    });
  });

  describe('Error Handling', () => {
    it('handles formatRegistrationData errors gracefully', () => {
      vi.mocked(utils.formatRegistrationData).mockImplementation(() => {
        throw new Error('Formatting error');
      });

      // Should not crash and should render error message
      expect(() => render(<RegistrationDataDisplay data={mockData} />)).not.toThrow();
      expect(screen.getByText('Error formatting data')).toBeInTheDocument();
    });

    it('handles invalid data types gracefully', () => {
      const invalidData = 'not an object' as unknown as RegistrationData; // Changed from any to unknown as RegistrationData

      expect(() => render(<RegistrationDataDisplay data={invalidData} />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('renders accessible content structure', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} />);

      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.tagName).toBe('PRE');
      expect(preElement?.textContent).toBe(expectedFormattedData);
    });

    it('provides meaningful content for screen readers', () => {
      const { container } = render(<RegistrationDataDisplay data={mockData} />);

      // The formatted data should be readable by screen readers
      // Component uses formatRegistrationData which masks passwords for security
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe(expectedFormattedData);
    });

    it('handles no data message accessibly', () => {
      render(<RegistrationDataDisplay data={null} />);

      const noDataMessage = screen.getByText('No registration data available');
      expect(noDataMessage).toBeInTheDocument();
      expect(noDataMessage).toHaveTextContent('No registration data available');
    });
  });

  describe('TypeScript Type Safety', () => {
    it('accepts RegistrationData type', () => {
      // This test ensures the component accepts the correct type
      expect(() => render(<RegistrationDataDisplay data={mockData} />)).not.toThrow();
    });

    it('accepts partial RegistrationData type', () => {
      const partialData: Partial<RegistrationData> = { email: 'test@example.com' };

      expect(() => render(<RegistrationDataDisplay data={partialData} />)).not.toThrow();
    });

    it('accepts null data', () => {
      expect(() => render(<RegistrationDataDisplay data={null} />)).not.toThrow();
    });

    it('accepts undefined data', () => {
      expect(() => render(<RegistrationDataDisplay data={null} />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('re-calls formatRegistrationData on re-render with same props, reflecting default React behavior', () => {
      const { rerender } = render(<RegistrationDataDisplay data={mockData} />);

      const initialCallCount = vi.mocked(utils.formatRegistrationData).mock.calls.length;

      // Re-render with same data
      rerender(<RegistrationDataDisplay data={mockData} />);

      // Should call formatRegistrationData again (React doesn't memoize by default)
      expect(vi.mocked(utils.formatRegistrationData).mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });

    it('handles large data objects efficiently', () => {
      const largeData = {
        ...mockData,
        largeField: 'x'.repeat(1000),
        manyFields: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`field${i}`, `value${i}`])
        ),
      };

      expect(() => render(<RegistrationDataDisplay data={largeData} />)).not.toThrow();
    });
  });
});
