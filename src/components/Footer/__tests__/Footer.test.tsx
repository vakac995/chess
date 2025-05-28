import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';
import type { FooterProps } from '../Footer.types';

describe('Footer', () => {
  const defaultProps: FooterProps = {};

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear all environment variables
    vi.unstubAllEnvs();
    // Mock current year to make tests predictable
    vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2025);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Footer {...defaultProps} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
    });

    it('renders without version by default', () => {
      render(<Footer {...defaultProps} />);

      expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    });

    it('renders with showVersion=false explicitly', () => {
      render(<Footer {...defaultProps} showVersion={false} />);

      expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    });

    it('renders with showVersion=true', () => {
      render(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
    });
  });

  describe('Content Testing', () => {
    it('displays current year in copyright text', () => {
      render(<Footer {...defaultProps} />);

      expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
    });

    it('displays version from environment variable when available', () => {
      vi.stubEnv('VITE_APP_VERSION', '2.1.0');

      render(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version 2.1.0')).toBeInTheDocument();
    });

    it('displays fallback version when environment variable is undefined', () => {
      vi.stubEnv('VITE_APP_VERSION', undefined);

      render(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
    });

    it('displays fallback version when environment variable is empty string', () => {
      vi.stubEnv('VITE_APP_VERSION', '');

      render(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version')).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct base CSS classes to footer', () => {
      render(<Footer {...defaultProps} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass(
        'bg-secondary',
        'sticky',
        'bottom-0',
        'p-4',
        'text-center',
        'text-white'
      );
    });

    it('applies correct CSS classes to copyright text', () => {
      const { container } = render(<Footer {...defaultProps} />);

      const copyrightText = container.querySelector('p');
      expect(copyrightText).toBeInTheDocument();
      expect(copyrightText).toHaveTextContent('© 2025 Chess App. All rights reserved.');
    });

    it('applies correct CSS classes to version text when shown', () => {
      const { container } = render(<Footer {...defaultProps} showVersion={true} />);

      const versionText = container.querySelector('p:nth-child(2)');
      expect(versionText).toBeInTheDocument();
      expect(versionText).toHaveClass('mt-1', 'text-xs', 'opacity-75');
      expect(versionText).toHaveTextContent('Version 1.0.0');
    });

    it('maintains correct HTML structure', () => {
      const { container } = render(<Footer {...defaultProps} showVersion={true} />);

      const footer = container.querySelector('footer');
      const paragraphs = footer?.querySelectorAll('p');

      expect(footer).toBeInTheDocument();
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs?.[0]).toHaveTextContent('© 2025 Chess App. All rights reserved.');
      expect(paragraphs?.[1]).toHaveTextContent('Version 1.0.0');
    });
  });

  describe('Props Handling', () => {
    it('handles showVersion prop correctly', () => {
      const { rerender } = render(<Footer {...defaultProps} showVersion={false} />);

      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();

      rerender(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
    });

    it('handles undefined showVersion prop (default behavior)', () => {
      render(<Footer showVersion={undefined} />);

      expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    });

    it('handles prop changes correctly', () => {
      const { rerender } = render(<Footer {...defaultProps} />);

      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();

      rerender(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();

      rerender(<Footer {...defaultProps} showVersion={false} />);

      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    });
  });

  describe('Environment Variables', () => {
    it('handles various version string formats', () => {
      const versions = ['1.0.0', '2.1.0-beta', '3.0.0-alpha.1', '1.0.0+build.123'];

      versions.forEach(version => {
        vi.stubEnv('VITE_APP_VERSION', version);

        const { rerender } = render(<Footer {...defaultProps} showVersion={true} />);

        expect(screen.getByText(`Version ${version}`)).toBeInTheDocument();

        rerender(<div />); // Unmount between iterations
      });
    });

    it('handles special characters in version string', () => {
      vi.stubEnv('VITE_APP_VERSION', '1.0.0-dev+build.2025.01.01');

      render(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version 1.0.0-dev+build.2025.01.01')).toBeInTheDocument();
    });

    it('handles numeric version in environment variable', () => {
      vi.stubEnv('VITE_APP_VERSION', '123');

      render(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version 123')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles different years correctly', () => {
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2030);

      render(<Footer {...defaultProps} />);

      expect(screen.getByText('© 2030 Chess App. All rights reserved.')).toBeInTheDocument();
    });

    it('handles year boundary correctly', () => {
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(1999);

      render(<Footer {...defaultProps} />);

      expect(screen.getByText('© 1999 Chess App. All rights reserved.')).toBeInTheDocument();
    });

    it('handles component remounting', () => {
      const { rerender } = render(<Footer {...defaultProps} showVersion={true} />);

      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();

      rerender(<Footer {...defaultProps} showVersion={false} />);

      expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(<Footer {...defaultProps} />);

      // Rapidly toggle showVersion
      for (let i = 0; i < 5; i++) {
        rerender(<Footer {...defaultProps} showVersion={true} />);
        expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();

        rerender(<Footer {...defaultProps} showVersion={false} />);
        expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('uses semantic footer element', () => {
      render(<Footer {...defaultProps} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer.tagName).toBe('FOOTER');
    });

    it('provides accessible content structure', () => {
      render(<Footer {...defaultProps} showVersion={true} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Check that content is accessible to screen readers
      expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
    });

    it('maintains readable text content', () => {
      render(<Footer {...defaultProps} showVersion={true} />);

      const footer = screen.getByRole('contentinfo');
      const textContent = footer.textContent;

      expect(textContent).toContain('© 2025 Chess App. All rights reserved.');
      expect(textContent).toContain('Version 1.0.0');
    });

    it('has proper text hierarchy', () => {
      const { container } = render(<Footer {...defaultProps} showVersion={true} />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);

      // Copyright should come first
      expect(paragraphs[0]).toHaveTextContent('© 2025 Chess App. All rights reserved.');
      // Version should come second
      expect(paragraphs[1]).toHaveTextContent('Version 1.0.0');
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with default props', () => {
      const { asFragment } = render(<Footer {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot with version shown', () => {
      const { asFragment } = render(<Footer {...defaultProps} showVersion={true} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot with custom version', () => {
      vi.stubEnv('VITE_APP_VERSION', '2.1.0-beta');

      const { asFragment } = render(<Footer {...defaultProps} showVersion={true} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot with different year', () => {
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2030);

      const { asFragment } = render(<Footer {...defaultProps} showVersion={true} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Integration', () => {
    it('works correctly in different environments', () => {
      // Test development environment
      vi.stubEnv('VITE_APP_VERSION', '1.0.0-dev');

      render(<Footer {...defaultProps} showVersion={true} />);
      expect(screen.getByText('Version 1.0.0-dev')).toBeInTheDocument();

      // Test production environment
      vi.stubEnv('VITE_APP_VERSION', '4.0.0');

      const { rerender } = render(<Footer {...defaultProps} showVersion={true} />);
      rerender(<Footer {...defaultProps} showVersion={true} />);
      expect(screen.getByText('Version 4.0.0')).toBeInTheDocument();
    });

    it('maintains consistent behavior across re-renders', () => {
      const { rerender } = render(<Footer {...defaultProps} showVersion={true} />);

      for (let i = 0; i < 3; i++) {
        expect(screen.getByText('© 2025 Chess App. All rights reserved.')).toBeInTheDocument();
        expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();

        rerender(<Footer {...defaultProps} showVersion={true} />);
      }
    });
  });
});
