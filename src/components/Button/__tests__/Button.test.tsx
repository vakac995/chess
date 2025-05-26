import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import type { ButtonProps } from '../Button.types';

describe('Button', () => {
  const defaultProps: ButtonProps = {
    children: 'Click Me',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Clean up the DOM before each test to avoid multiple elements error
    document.body.innerHTML = '';
  });

  it('renders with default props', () => {
    render(<Button {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('bg-primary text-white border-primary hover:bg-primary/80');
    expect(buttonElement).toHaveClass('py-2 px-4 text-base');
  });

  it('renders with different intents', () => {
    const { rerender } = render(<Button {...defaultProps} intent="secondary" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toHaveClass(
      'bg-secondary text-white border-secondary hover:bg-secondary/80'
    );

    rerender(<Button {...defaultProps} intent="danger" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toHaveClass(
      'bg-red-600 text-white border-red-600 hover:bg-red-700'
    );

    rerender(<Button {...defaultProps} intent="outline" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toHaveClass(
      'bg-transparent text-primary border-primary hover:bg-primary/10'
    );
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button {...defaultProps} size="sm" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toHaveClass('py-1 px-2 text-sm');

    rerender(<Button {...defaultProps} size="lg" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toHaveClass('py-3 px-6 text-lg');
  });

  it('renders as full width', () => {
    render(<Button {...defaultProps} fullWidth />);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('cursor-not-allowed opacity-50');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button {...defaultProps} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick handler when disabled and clicked', () => {
    const handleClick = vi.fn();
    render(<Button {...defaultProps} onClick={handleClick} disabled />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button {...defaultProps} className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('renders children correctly', () => {
    render(
      <Button {...defaultProps} >
        <span>Test Child</span>
      </Button>
    );
    // When children is a node, the button's accessible name might change.
    // We should query by the new accessible name or a more generic role if the name is dynamic.
    const buttonElement = screen.getByRole('button', { name: /Test Child/i });
    const childSpan = screen.getByText('Test Child');
    expect(buttonElement).toContainElement(childSpan);
  });

  it('matches snapshot with default props', () => {
    const { asFragment } = render(<Button {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with danger intent and small size', () => {
    const { asFragment } = render(
      <Button {...defaultProps} intent="danger" size="sm">
        Danger Small
      </Button>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('applies compound variants correctly', () => {
    const { rerender } = render(<Button {...defaultProps} intent="primary" size="lg" />);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toHaveClass('py-4');

    rerender(<Button {...defaultProps} intent="outline" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toHaveClass('hover:bg-transparent');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button {...defaultProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
