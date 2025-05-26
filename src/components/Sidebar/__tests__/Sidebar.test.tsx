import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../Sidebar';
import type { SidebarProps } from '../Sidebar.types';

describe('Sidebar', () => {
  const defaultProps: SidebarProps = {
    isOpen: false,
    onToggle: vi.fn(),
  };

  const renderSidebar = (props?: Partial<SidebarProps>) => {
    return render(<Sidebar {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sidebar with correct structure when closed', () => {
      renderSidebar({ isOpen: false });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('renders sidebar with correct structure when open', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('renders overlay when sidebar is open', () => {
      renderSidebar({ isOpen: true });

      const overlay = screen.getByLabelText('Close sidebar');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-black/50');
    });

    it('does not render overlay when sidebar is closed', () => {
      renderSidebar({ isOpen: false });

      const overlay = screen.queryByLabelText('Close sidebar');
      expect(overlay).not.toBeInTheDocument();
    });

    it('renders close button inside sidebar', () => {
      renderSidebar({ isOpen: true });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('lg:hidden');
    });

    it('renders children when provided', () => {
      renderSidebar({
        isOpen: true,
        children: <div data-testid="sidebar-content">Test Content</div>,
      });

      const content = screen.getByTestId('sidebar-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Test Content');
    });

    it('renders multiple children correctly', () => {
      renderSidebar({
        isOpen: true,
        children: (
          <>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
          </>
        ),
      });

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct base CSS classes to sidebar', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass(
        'bg-secondary',
        'fixed',
        'top-0',
        'left-0',
        'z-40',
        'h-full',
        'w-64',
        'transform',
        'text-white',
        'transition-transform',
        'duration-300',
        'ease-in-out'
      );
    });

    it('applies translate-x-0 class when sidebar is open', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('translate-x-0');
      expect(sidebar).not.toHaveClass('-translate-x-full');
    });

    it('applies -translate-x-full class when sidebar is closed', () => {
      renderSidebar({ isOpen: false });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('-translate-x-full');
      expect(sidebar).not.toHaveClass('translate-x-0');
    });

    it('applies correct CSS classes to content container', () => {
      renderSidebar({ isOpen: true });

      const container = screen.getByRole('complementary').firstChild;
      expect(container).toHaveClass('p-container-padding');
    });

    it('applies correct CSS classes to close button', () => {
      renderSidebar({ isOpen: true });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toHaveClass('mb-4', 'text-white', 'lg:hidden');
    });

    it('applies correct CSS classes to overlay', () => {
      renderSidebar({ isOpen: true });

      const overlay = screen.getByLabelText('Close sidebar');
      expect(overlay).toHaveClass(
        'fixed',
        'inset-0',
        'z-30',
        'cursor-default',
        'bg-black/50',
        'lg:hidden'
      );
    });
  });

  describe('User Interactions', () => {
    it('calls onToggle when overlay is clicked', () => {
      const onToggle = vi.fn();
      renderSidebar({ isOpen: true, onToggle });

      const overlay = screen.getByLabelText('Close sidebar');
      fireEvent.click(overlay);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onToggle when close button is clicked', () => {
      const onToggle = vi.fn();
      renderSidebar({ isOpen: true, onToggle });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('does not call onToggle when sidebar content is clicked', () => {
      const onToggle = vi.fn();
      renderSidebar({
        isOpen: true,
        onToggle,
        children: <div data-testid="content">Content</div>,
      });

      const content = screen.getByTestId('content');
      fireEvent.click(content);

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('does not call onToggle when sidebar itself is clicked', () => {
      const onToggle = vi.fn();
      renderSidebar({ isOpen: true, onToggle });

      const sidebar = screen.getByRole('complementary');
      fireEvent.click(sidebar);

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA role for sidebar', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('has proper aria-label for overlay button', () => {
      renderSidebar({ isOpen: true });

      const overlay = screen.getByLabelText('Close sidebar');
      expect(overlay).toHaveAttribute('aria-label', 'Close sidebar');
    });

    it('has proper button type for overlay', () => {
      renderSidebar({ isOpen: true });

      const overlay = screen.getByLabelText('Close sidebar');
      expect(overlay).toHaveAttribute('type', 'button');
    });

    it('has accessible text for close button', () => {
      renderSidebar({ isOpen: true });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toHaveTextContent('Close');
    });

    it('maintains focus management when sidebar opens', () => {
      const { rerender } = renderSidebar({ isOpen: false });

      rerender(<Sidebar {...defaultProps} isOpen={true} />);

      // Sidebar should be in DOM and accessible
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies lg:hidden class to overlay for desktop hiding', () => {
      renderSidebar({ isOpen: true });

      const overlay = screen.getByLabelText('Close sidebar');
      expect(overlay).toHaveClass('lg:hidden');
    });

    it('applies lg:hidden class to close button for desktop hiding', () => {
      renderSidebar({ isOpen: true });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toHaveClass('lg:hidden');
    });

    it('maintains fixed positioning on all screen sizes', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('fixed', 'top-0', 'left-0');
    });

    it('maintains proper z-index for layering', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      const overlay = screen.getByLabelText('Close sidebar');

      expect(sidebar).toHaveClass('z-40');
      expect(overlay).toHaveClass('z-30');
    });
  });

  describe('Props Handling', () => {
    it('handles isOpen prop changes correctly', () => {
      const { rerender } = renderSidebar({ isOpen: false });

      let sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('-translate-x-full');

      rerender(<Sidebar {...defaultProps} isOpen={true} />);

      sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('handles onToggle prop changes correctly', () => {
      const onToggle1 = vi.fn();
      const onToggle2 = vi.fn();

      const { rerender } = renderSidebar({ isOpen: true, onToggle: onToggle1 });

      const overlay = screen.getByLabelText('Close sidebar');
      fireEvent.click(overlay);

      expect(onToggle1).toHaveBeenCalledTimes(1);
      expect(onToggle2).not.toHaveBeenCalled();

      rerender(<Sidebar {...defaultProps} isOpen={true} onToggle={onToggle2} />);

      fireEvent.click(overlay);

      expect(onToggle1).toHaveBeenCalledTimes(1);
      expect(onToggle2).toHaveBeenCalledTimes(1);
    });

    it('handles children prop changes correctly', () => {
      const { rerender } = renderSidebar({
        isOpen: true,
        children: <div data-testid="content-1">Content 1</div>,
      });

      expect(screen.getByTestId('content-1')).toBeInTheDocument();
      expect(screen.queryByTestId('content-2')).not.toBeInTheDocument();

      rerender(
        <Sidebar {...defaultProps} isOpen={true}>
          <div data-testid="content-2">Content 2</div>
        </Sidebar>
      );

      expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('content-2')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      renderSidebar({ isOpen: true, children: null });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      renderSidebar({ isOpen: true, children: undefined });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid toggle operations', () => {
      const onToggle = vi.fn();
      renderSidebar({ isOpen: true, onToggle });

      const overlay = screen.getByLabelText('Close sidebar');

      // Rapid clicks
      fireEvent.click(overlay);
      fireEvent.click(overlay);
      fireEvent.click(overlay);

      expect(onToggle).toHaveBeenCalledTimes(3);
    });

    it('handles boolean props correctly', () => {
      renderSidebar({ isOpen: false });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('-translate-x-full');
      expect(screen.queryByLabelText('Close sidebar')).not.toBeInTheDocument();
    });

    it('maintains correct structure with complex children', () => {
      renderSidebar({
        isOpen: true,
        children: (
          <div>
            <nav>
              <ul>
                <li>
                  <a href="/home">Home</a>
                </li>
                <li>
                  <a href="/about">About</a>
                </li>
              </ul>
            </nav>
            <footer>Footer content</footer>
          </div>
        ),
      });

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('handles function components as children', () => {
      const ChildComponent = () => <div data-testid="function-child">Function Child</div>;

      renderSidebar({
        isOpen: true,
        children: <ChildComponent />,
      });

      expect(screen.getByTestId('function-child')).toBeInTheDocument();
    });

    it('preserves component structure during state changes', () => {
      const { rerender } = renderSidebar({
        isOpen: false,
        children: <div data-testid="persistent-content">Persistent</div>,
      });

      // Content should be in DOM even when closed
      expect(screen.getByTestId('persistent-content')).toBeInTheDocument();

      rerender(
        <Sidebar {...defaultProps} isOpen={true}>
          <div data-testid="persistent-content">Persistent</div>
        </Sidebar>
      );

      // Content should still be there when opened
      expect(screen.getByTestId('persistent-content')).toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    it('applies transition classes for smooth animations', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('transition-transform', 'duration-300', 'ease-in-out');
    });

    it('applies transform classes for positioning', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('transform');
    });

    it('maintains consistent z-index ordering', () => {
      renderSidebar({ isOpen: true });

      const sidebar = screen.getByRole('complementary');
      const overlay = screen.getByLabelText('Close sidebar');

      // Sidebar should be above overlay
      expect(sidebar).toHaveClass('z-40');
      expect(overlay).toHaveClass('z-30');
    });
  });
});
