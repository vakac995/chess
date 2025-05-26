import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorInfo } from '../ErrorInfo';
import { ErrorSeverity, FieldErrorInfo } from '@/types';

// Mock utils
vi.mock('@/utils', () => ({
  normalizeError: vi.fn((error: unknown) => {
    if (typeof error === 'string') {
      return { message: error };
    }
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'An unknown error occurred' };
  }),
}));

// Mock types
vi.mock('@/types', async () => {
  const actual = await vi.importActual('@/types');
  return {
    ...actual,
    isFieldErrorInfo: vi.fn((error: unknown) => {
      return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as FieldErrorInfo).message === 'string'
      );
    }),
  };
});

describe('ErrorInfo', () => {
  describe('Rendering', () => {
    it('renders nothing when no error is provided', () => {
      const { container } = render(<ErrorInfo error={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when error is null', () => {
      const { container } = render(<ErrorInfo error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when error is empty string', () => {
      const { container } = render(<ErrorInfo error="" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders error container with default classes', () => {
      const error: FieldErrorInfo = { message: 'Test error' };
      render(<ErrorInfo error={error} />);

      const container = screen.getByText('Test error').closest('.error-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('error-container');
    });

    it('renders error container with custom className', () => {
      const error: FieldErrorInfo = { message: 'Test error' };
      render(<ErrorInfo error={error} className="custom-class" />);

      const container = screen.getByText('Test error').closest('.error-container');
      expect(container).toHaveClass('error-container', 'custom-class');
    });

    it('renders basic error message', () => {
      const error: FieldErrorInfo = { message: 'Basic error message' };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Basic error message')).toBeInTheDocument();
    });

    it('renders error message with info', () => {
      const error: FieldErrorInfo = {
        message: 'Main error',
        info: 'Additional info',
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Main error')).toBeInTheDocument();
      expect(screen.getByText('Additional info')).toBeInTheDocument();
    });

    it('renders error message with description', () => {
      const error: FieldErrorInfo = {
        message: 'Main error',
        description: 'Detailed description',
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Main error')).toBeInTheDocument();
      expect(screen.getByText('Detailed description')).toBeInTheDocument();
    });

    it('renders complete error with all fields', () => {
      const error: FieldErrorInfo = {
        message: 'Complete error',
        info: 'Additional info',
        description: 'Detailed description',
        icon: 'mail',
        severity: ErrorSeverity.ERROR,
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Complete error')).toBeInTheDocument();
      expect(screen.getByText('Additional info')).toBeInTheDocument();
      expect(screen.getByText('Detailed description')).toBeInTheDocument();
      expect(screen.getByText('📧')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders mail icon correctly', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: 'mail' };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('📧')).toBeInTheDocument();
    });

    it('renders mail-warning icon correctly', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: 'mail-warning' };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('📧⚠️')).toBeInTheDocument();
    });

    it('renders lock icon correctly', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: 'lock' };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    it('renders network-off icon correctly', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: 'network-off' };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('📶❌')).toBeInTheDocument();
    });

    it('renders shield-warning icon correctly', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: 'shield-warning' };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('🛡️⚠️')).toBeInTheDocument();
    });

    it('renders default warning icon for unknown icon types', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: 'unknown-icon' };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('does not render icon when icon is not provided', () => {
      const error: FieldErrorInfo = { message: 'Test' };
      render(<ErrorInfo error={error} />);

      expect(screen.queryByText('📧')).not.toBeInTheDocument();
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });

    it('does not render icon when icon is empty string', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: '' };
      render(<ErrorInfo error={error} />);

      expect(screen.queryByText('📧')).not.toBeInTheDocument();
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });
  });

  describe('Severity Styling', () => {
    it('applies default accent styling when no severity is provided', () => {
      const error: FieldErrorInfo = { message: 'Test error' };
      render(<ErrorInfo error={error} />);

      const messageElement = screen.getByText('Test error');
      expect(messageElement).toHaveClass('text-accent');
    });

    it('applies info styling for INFO severity', () => {
      const error: FieldErrorInfo = {
        message: 'Info message',
        severity: ErrorSeverity.INFO,
      };
      render(<ErrorInfo error={error} />);

      const messageElement = screen.getByText('Info message');
      expect(messageElement).toHaveClass('text-info');
    });

    it('applies warning styling for WARNING severity', () => {
      const error: FieldErrorInfo = {
        message: 'Warning message',
        severity: ErrorSeverity.WARNING,
      };
      render(<ErrorInfo error={error} />);

      const messageElement = screen.getByText('Warning message');
      expect(messageElement).toHaveClass('text-warning');
    });

    it('applies critical styling for CRITICAL severity', () => {
      const error: FieldErrorInfo = {
        message: 'Critical message',
        severity: ErrorSeverity.CRITICAL,
      };
      render(<ErrorInfo error={error} />);

      const messageElement = screen.getByText('Critical message');
      expect(messageElement).toHaveClass('text-critical');
    });

    it('applies error styling for ERROR severity', () => {
      const error: FieldErrorInfo = {
        message: 'Error message',
        severity: ErrorSeverity.ERROR,
      };
      render(<ErrorInfo error={error} />);

      const messageElement = screen.getByText('Error message');
      expect(messageElement).toHaveClass('text-accent');
    });

    it('applies severity styling to icon', () => {
      const error: FieldErrorInfo = {
        message: 'Test',
        icon: 'mail',
        severity: ErrorSeverity.WARNING,
      };
      render(<ErrorInfo error={error} />);

      const iconElement = screen.getByText('📧');
      expect(iconElement).toHaveClass('text-warning');
    });

    it('applies severity styling to info text', () => {
      const error: FieldErrorInfo = {
        message: 'Test',
        info: 'Additional info',
        severity: ErrorSeverity.INFO,
      };
      render(<ErrorInfo error={error} />);

      const infoElement = screen.getByText('Additional info');
      expect(infoElement).toHaveClass('text-info/80');
    });
  });

  describe('CSS Classes and Layout', () => {
    it('applies correct layout classes to main container', () => {
      const error: FieldErrorInfo = { message: 'Test' };
      render(<ErrorInfo error={error} />);

      const flexContainer = screen.getByText('Test').closest('.flex');
      expect(flexContainer).toHaveClass('flex', 'items-start');
    });

    it('applies correct classes to error message', () => {
      const error: FieldErrorInfo = { message: 'Test message' };
      render(<ErrorInfo error={error} />);

      const messageElement = screen.getByText('Test message');
      expect(messageElement).toHaveClass('text-accent', 'text-sm', 'font-medium');
    });

    it('applies correct classes to info text', () => {
      const error: FieldErrorInfo = {
        message: 'Test',
        info: 'Additional info',
      };
      render(<ErrorInfo error={error} />);

      const infoElement = screen.getByText('Additional info');
      expect(infoElement).toHaveClass('text-accent/80', 'mt-0.5', 'text-xs');
    });

    it('applies correct classes to description text', () => {
      const error: FieldErrorInfo = {
        message: 'Test',
        description: 'Description text',
      };
      render(<ErrorInfo error={error} />);

      const descriptionElement = screen.getByText('Description text');
      expect(descriptionElement).toHaveClass('text-text-muted', 'mt-1', 'text-xs');
    });

    it('applies correct classes to icon span', () => {
      const error: FieldErrorInfo = { message: 'Test', icon: 'mail' };
      render(<ErrorInfo error={error} />);

      const iconElement = screen.getByText('📧');
      expect(iconElement).toHaveClass('error-icon', 'text-accent', 'mr-2');
    });

    it('applies error-content class to content container', () => {
      const error: FieldErrorInfo = { message: 'Test' };
      render(<ErrorInfo error={error} />);

      const contentContainer = screen.getByText('Test').closest('.error-content');
      expect(contentContainer).toHaveClass('error-content');
    });
  });

  describe('Error Type Handling', () => {
    it('handles string errors through normalizeError', () => {
      render(<ErrorInfo error="String error message" />);

      expect(screen.getByText('String error message')).toBeInTheDocument();
    });

    it('handles Error objects through normalizeError', () => {
      const error = new Error('Error object message');
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Error object message')).toBeInTheDocument();
    });

    it('handles FieldErrorInfo objects directly', () => {
      const error: FieldErrorInfo = {
        message: 'Direct FieldErrorInfo',
        info: 'Direct info',
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Direct FieldErrorInfo')).toBeInTheDocument();
      expect(screen.getByText('Direct info')).toBeInTheDocument();
    });

    it('handles unknown error types through normalizeError', () => {
      const unknownError = { someProperty: 'value' };
      render(<ErrorInfo error={unknownError} />);

      expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders message only when message exists', () => {
      const error: FieldErrorInfo = {
        message: '',
        info: 'Info only',
        description: 'Description only',
      };
      render(<ErrorInfo error={error} />);

      // Should not render empty message paragraph
      const textElements = screen.getAllByText(/Info only|Description only/);
      expect(textElements).toHaveLength(2);
      expect(screen.getByText('Info only')).toBeInTheDocument();
      expect(screen.getByText('Description only')).toBeInTheDocument();
    });

    it('renders info only when info exists', () => {
      const error: FieldErrorInfo = {
        message: 'Message only',
        description: 'Description only',
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Message only')).toBeInTheDocument();
      expect(screen.getByText('Description only')).toBeInTheDocument();
      // No info text should be rendered
      const messageContainer = screen.getByText('Message only').closest('.error-content');
      const paragraphs = messageContainer?.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2); // message + description
    });

    it('renders description only when description exists', () => {
      const error: FieldErrorInfo = {
        message: 'Message only',
        info: 'Info only',
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Message only')).toBeInTheDocument();
      expect(screen.getByText('Info only')).toBeInTheDocument();
      // No description text should be rendered
      const messageContainer = screen.getByText('Message only').closest('.error-content');
      const paragraphs = messageContainer?.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2); // message + info
    });

    it('renders empty content when only icon is provided', () => {
      const error: FieldErrorInfo = {
        message: '',
        icon: 'mail',
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('📧')).toBeInTheDocument();
      // No text content should be rendered
      const contentContainer = screen
        .getByText('📧')
        .closest('.error-container')
        ?.querySelector('.error-content');
      expect(contentContainer?.textContent).toBe('');
    });
  });

  describe('Props Handling', () => {
    it('handles className prop correctly', () => {
      const error: FieldErrorInfo = { message: 'Test' };
      const { rerender } = render(<ErrorInfo error={error} className="initial-class" />);

      let container = screen.getByText('Test').closest('.error-container');
      expect(container).toHaveClass('error-container', 'initial-class');

      rerender(<ErrorInfo error={error} className="updated-class" />);

      container = screen.getByText('Test').closest('.error-container');
      expect(container).toHaveClass('error-container', 'updated-class');
      expect(container).not.toHaveClass('initial-class');
    });

    it('handles empty className gracefully', () => {
      const error: FieldErrorInfo = { message: 'Test' };
      render(<ErrorInfo error={error} className="" />);

      const container = screen.getByText('Test').closest('.error-container');
      expect(container).toHaveClass('error-container');
    });

    it('handles undefined className gracefully', () => {
      const error: FieldErrorInfo = { message: 'Test' };
      render(<ErrorInfo error={error} className={undefined} />);

      const container = screen.getByText('Test').closest('.error-container');
      expect(container).toHaveClass('error-container');
    });

    it('handles error prop changes correctly', () => {
      const error1: FieldErrorInfo = { message: 'First error' };
      const error2: FieldErrorInfo = { message: 'Second error' };

      const { rerender } = render(<ErrorInfo error={error1} />);

      expect(screen.getByText('First error')).toBeInTheDocument();
      expect(screen.queryByText('Second error')).not.toBeInTheDocument();

      rerender(<ErrorInfo error={error2} />);

      expect(screen.queryByText('First error')).not.toBeInTheDocument();
      expect(screen.getByText('Second error')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles falsy error values gracefully', () => {
      const { rerender } = render(<ErrorInfo error={false} />);
      expect(document.body.textContent).toBe('');

      rerender(<ErrorInfo error={0} />);
      expect(document.body.textContent).toBe('');

      rerender(<ErrorInfo error={NaN} />);
      expect(document.body.textContent).toBe('');
    });

    it('handles very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error: FieldErrorInfo = { message: longMessage };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles special characters in error messages', () => {
      const specialMessage = '< > & " \' / \\ 🎉 💻 ⚡';
      const error: FieldErrorInfo = { message: specialMessage };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('handles nested object errors through normalizeError', () => {
      const nestedError = {
        error: {
          nested: {
            message: 'Deeply nested error',
          },
        },
      };
      render(<ErrorInfo error={nestedError} />);

      expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
    });

    it('handles multiple consecutive spaces in messages', () => {
      const spacedMessage = 'Error   with     multiple    spaces';
      const error: FieldErrorInfo = { message: spacedMessage };
      render(<ErrorInfo error={error} />);

      // Check that the content exists using a regex to handle multiple spaces
      expect(screen.getByText(/Error\s+with\s+multiple\s+spaces/)).toBeInTheDocument();
    });

    it('handles HTML-like content in messages safely', () => {
      const htmlMessage = '<script>alert("xss")</script>Safe content';
      const error: FieldErrorInfo = { message: htmlMessage };
      render(<ErrorInfo error={error} />);

      // Should render as text, not execute as HTML
      expect(screen.getByText(htmlMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders text content that is screen reader accessible', () => {
      const error: FieldErrorInfo = {
        message: 'Accessible error message',
        info: 'Additional accessible info',
        description: 'Accessible description',
      };
      render(<ErrorInfo error={error} />);

      expect(screen.getByText('Accessible error message')).toBeInTheDocument();
      expect(screen.getByText('Additional accessible info')).toBeInTheDocument();
      expect(screen.getByText('Accessible description')).toBeInTheDocument();
    });

    it('maintains proper heading hierarchy with paragraph elements', () => {
      const error: FieldErrorInfo = {
        message: 'Main message',
        info: 'Info text',
        description: 'Description text',
      };
      render(<ErrorInfo error={error} />);

      const messageP = screen.getByText('Main message');
      const infoP = screen.getByText('Info text');
      const descriptionP = screen.getByText('Description text');

      expect(messageP.tagName).toBe('P');
      expect(infoP.tagName).toBe('P');
      expect(descriptionP.tagName).toBe('P');
    });

    it('provides meaningful content for screen readers', () => {
      const error: FieldErrorInfo = {
        message: 'Form validation failed',
        info: 'Please check the highlighted fields',
        description: 'Ensure all required fields are filled correctly',
        icon: 'shield-warning',
      };
      render(<ErrorInfo error={error} />);

      // All text content should be present and accessible
      expect(screen.getByText('Form validation failed')).toBeInTheDocument();
      expect(screen.getByText('Please check the highlighted fields')).toBeInTheDocument();
      expect(
        screen.getByText('Ensure all required fields are filled correctly')
      ).toBeInTheDocument();
      expect(screen.getByText('🛡️⚠️')).toBeInTheDocument();
    });
  });
});
