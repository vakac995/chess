import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import type { ButtonProps } from '../Button.types';

describe('Button Component', () => {
  const defaultProps: ButtonProps = {
    children: 'Click Me',
  };

  it('should render with default props', () => {
    render(<Button {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('font-semibold border rounded-button'); // Default styles
    expect(buttonElement).toHaveClass('bg-primary text-white border-primary'); // Default intent (primary)
    expect(buttonElement).toHaveClass('py-2 px-4 text-base'); // Default size (md)
  });

  it('should apply intent classes correctly', () => {
    render(<Button {...defaultProps} intent="secondary" />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('bg-secondary text-white border-secondary');
  });

  it('should apply size classes correctly', () => {
    render(<Button {...defaultProps} size="lg" />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('py-3 px-6 text-lg');
  });

  it('should apply fullWidth class correctly', () => {
    render(<Button {...defaultProps} fullWidth />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('w-full');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('cursor-not-allowed opacity-50');
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button {...defaultProps} onClick={handleClick} />);
    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick handler when disabled and clicked', () => {
    const handleClick = vi.fn();
    render(<Button {...defaultProps} onClick={handleClick} disabled />);
    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should pass through other HTML button attributes', () => {
    render(<Button {...defaultProps} aria-label="Custom Button" />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveAttribute('aria-label', 'Custom Button');
  });

  it('should apply custom className', () => {
    render(<Button {...defaultProps} className="custom-class" />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button {...defaultProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
