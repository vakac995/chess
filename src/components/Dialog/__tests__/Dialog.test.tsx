import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../Dialog';

// Mock HTMLDialogElement methods since they're not implemented in jsdom
const mockShowModal = vi.fn();
const mockClose = vi.fn();

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = mockShowModal;
  HTMLDialogElement.prototype.close = mockClose;
});

describe('Dialog', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    children: <div>Dialog content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any open dialogs
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
      if (dialog.open) {
        dialog.close();
      }
    });
  });

  describe('Rendering', () => {
    it('renders dialog with children', () => {
      render(<Dialog {...defaultProps}>Test content</Dialog>);

      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders dialog with title when provided', () => {
      render(
        <Dialog {...defaultProps} title="Test Dialog">
          Test content
        </Dialog>
      );

      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, hidden: true })).toHaveTextContent(
        'Test Dialog'
      );
    });

    it('renders dialog without title when not provided', () => {
      render(<Dialog {...defaultProps}>Test content</Dialog>);

      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { hidden: true })).not.toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<Dialog {...defaultProps}>Test content</Dialog>);

      expect(screen.getByRole('button', { name: /close/i, hidden: true })).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
      render(<Dialog {...defaultProps}>Test content</Dialog>);

      const dialog = screen.getByRole('dialog', { hidden: true });
      expect(dialog).toHaveClass(
        'rounded-card',
        'bg-background',
        'mx-auto',
        'w-full',
        'max-w-md',
        'p-6',
        'shadow-xl'
      );
    });
  });

  describe('Dialog State Management', () => {
    it('calls showModal when isOpen becomes true', async () => {
      const { rerender } = render(
        <Dialog {...defaultProps} isOpen={false}>
          Test content
        </Dialog>
      );

      expect(mockShowModal).not.toHaveBeenCalled();

      rerender(
        <Dialog {...defaultProps} isOpen={true}>
          Test content
        </Dialog>
      );

      await waitFor(() => {
        expect(mockShowModal).toHaveBeenCalledTimes(1);
      });
    });

    it('calls close when isOpen becomes false', async () => {
      // Mock that dialog is open
      Object.defineProperty(HTMLDialogElement.prototype, 'open', {
        get: vi.fn(() => true),
        configurable: true,
      });

      const { rerender } = render(
        <Dialog {...defaultProps} isOpen={true}>
          Test content
        </Dialog>
      );

      rerender(
        <Dialog {...defaultProps} isOpen={false}>
          Test content
        </Dialog>
      );

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call showModal if dialog is already open', async () => {
      // Mock that dialog is already open
      Object.defineProperty(HTMLDialogElement.prototype, 'open', {
        get: vi.fn(() => true),
        configurable: true,
      });

      render(
        <Dialog {...defaultProps} isOpen={true}>
          Test content
        </Dialog>
      );

      await waitFor(() => {
        expect(mockShowModal).not.toHaveBeenCalled();
      });
    });

    it('does not call close if dialog is already closed', async () => {
      // Mock that dialog is closed
      Object.defineProperty(HTMLDialogElement.prototype, 'open', {
        get: vi.fn(() => false),
        configurable: true,
      });

      render(
        <Dialog {...defaultProps} isOpen={false}>
          Test content
        </Dialog>
      );

      await waitFor(() => {
        expect(mockClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const mockOnClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog {...defaultProps} onClose={mockOnClose}>
          Test content
        </Dialog>
      );

      const closeButton = screen.getByRole('button', { name: /close/i, hidden: true });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel event is triggered', () => {
      const mockOnClose = vi.fn();

      render(
        <Dialog {...defaultProps} onClose={mockOnClose}>
          Test content
        </Dialog>
      );

      const dialog = screen.getByRole('dialog', { hidden: true });

      // Simulate cancel event (ESC key)
      const cancelEvent = new Event('cancel', { cancelable: true });
      fireEvent(dialog, cancelEvent);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('prevents default behavior on cancel event', () => {
      const mockOnClose = vi.fn();

      render(
        <Dialog {...defaultProps} onClose={mockOnClose}>
          Test content
        </Dialog>
      );

      const dialog = screen.getByRole('dialog', { hidden: true });

      // Simulate cancel event with preventDefault spy
      const cancelEvent = new Event('cancel', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(cancelEvent, 'preventDefault');

      fireEvent(dialog, cancelEvent);

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Listeners', () => {
    it('adds cancel event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(HTMLDialogElement.prototype, 'addEventListener');

      render(<Dialog {...defaultProps}>Test content</Dialog>);

      expect(addEventListenerSpy).toHaveBeenCalledWith('cancel', expect.any(Function));
    });

    it('removes cancel event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(HTMLDialogElement.prototype, 'removeEventListener');

      const { unmount } = render(<Dialog {...defaultProps}>Test content</Dialog>);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('cancel', expect.any(Function));
    });

    it('updates event listener when onClose prop changes', () => {
      const addEventListenerSpy = vi.spyOn(HTMLDialogElement.prototype, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(HTMLDialogElement.prototype, 'removeEventListener');

      const firstOnClose = vi.fn();
      const secondOnClose = vi.fn();

      const { rerender } = render(
        <Dialog {...defaultProps} onClose={firstOnClose}>
          Test content
        </Dialog>
      );

      // Clear initial calls
      addEventListenerSpy.mockClear();
      removeEventListenerSpy.mockClear();

      rerender(
        <Dialog {...defaultProps} onClose={secondOnClose}>
          Test content
        </Dialog>
      );

      expect(removeEventListenerSpy).toHaveBeenCalledWith('cancel', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('cancel', expect.any(Function));
    });
  });

  describe('Accessibility', () => {
    it('has correct dialog role', () => {
      render(<Dialog {...defaultProps}>Test content</Dialog>);

      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
    });

    it('has proper heading hierarchy when title is provided', () => {
      render(
        <Dialog {...defaultProps} title="Dialog Title">
          Content
        </Dialog>
      );

      const heading = screen.getByRole('heading', { level: 2, hidden: true });
      expect(heading).toHaveTextContent('Dialog Title');
    });

    it('close button is accessible', () => {
      render(<Dialog {...defaultProps}>Test content</Dialog>);

      const closeButton = screen.getByRole('button', { name: /close/i, hidden: true });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAccessibleName();
    });
  });

  describe('Content Rendering', () => {
    it('renders complex children content', () => {
      const complexContent = (
        <div>
          <p>Paragraph content</p>
          <button>Action button</button>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </div>
      );

      render(<Dialog {...defaultProps}>{complexContent}</Dialog>);
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Action button', hidden: true })
      ).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });

    it('renders text content correctly', () => {
      render(<Dialog {...defaultProps}>Simple text content</Dialog>);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('handles missing title gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <Dialog {...defaultProps} title={undefined}>
          Test content
        </Dialog>
      );

      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { hidden: true })).not.toBeInTheDocument();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('handles empty title', () => {
      render(
        <Dialog {...defaultProps} title="">
          Test content
        </Dialog>
      );

      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { hidden: true })).not.toBeInTheDocument();
    });

    it('works with different onClose implementations', async () => {
      const syncOnClose = vi.fn();
      const asyncOnClose = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      // Test synchronous onClose
      const { rerender } = render(
        <Dialog {...defaultProps} onClose={syncOnClose}>
          Test content
        </Dialog>
      );
      await user.click(screen.getByRole('button', { name: /close/i, hidden: true }));
      expect(syncOnClose).toHaveBeenCalledTimes(1);

      // Test asynchronous onClose
      rerender(
        <Dialog {...defaultProps} onClose={asyncOnClose}>
          Test content
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /close/i, hidden: true }));
      expect(asyncOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles null children', () => {
      render(<Dialog {...defaultProps}>{null}</Dialog>);

      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i, hidden: true })).toBeInTheDocument();
    });

    it('handles rapid isOpen state changes', async () => {
      const { rerender } = render(
        <Dialog {...defaultProps} isOpen={false}>
          Test
        </Dialog>
      );

      // Rapidly toggle state
      rerender(
        <Dialog {...defaultProps} isOpen={true}>
          Test
        </Dialog>
      );
      rerender(
        <Dialog {...defaultProps} isOpen={false}>
          Test
        </Dialog>
      );
      rerender(
        <Dialog {...defaultProps} isOpen={true}>
          Test
        </Dialog>
      );

      await waitFor(() => {
        expect(mockShowModal).toHaveBeenCalled();
      });
    });

    it('handles dialog element that does not exist', () => {
      // Mock dialogRef.current to be null
      const originalUseRef = React.useRef;
      vi.spyOn(React, 'useRef').mockReturnValue({ current: null });

      expect(() => {
        render(
          <Dialog {...defaultProps} isOpen={true}>
            Test
          </Dialog>
        );
      }).not.toThrow();

      // Restore useRef
      React.useRef = originalUseRef;
    });
  });
});
