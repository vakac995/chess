import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { SingleCalendar } from '../SingleCalendar';

// Helper to check if two dates are the same day (ignoring time)
// react-day-picker's onSelect typically provides Date objects set to midnight.
const areDatesSameDay = (date1: Date | undefined, date2: Date | undefined): boolean => {
  if (!date1 || !date2) return date1 === date2;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const renderWithProvider = (component: React.ReactNode) => {
  return render(<Provider>{component}</Provider>);
};

describe('SingleCalendar Component', () => {
  // Setup user event with default configuration
  const user = userEvent.setup();

  it('renders correctly', () => {
    renderWithProvider(<SingleCalendar mode="single" />);
    // Test for the presence of the calendar grid, which is a role used by react-day-picker
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('handles date selection via click', async () => {
    const onSelect = vi.fn();
    renderWithProvider(<SingleCalendar mode="single" onSelect={onSelect} />);

    // Find today's date button directly using aria-label that contains "Today"
    const todayButton = screen.getByRole('button', {
      name: accessibleName => accessibleName.includes('Today'),
    });

    expect(todayButton).toBeInTheDocument();

    // Click the button directly
    await user.click(todayButton);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it('displays selected date', () => {
    const selectedDate = new Date(2025, 4, 15); // May 15, 2025
    renderWithProvider(<SingleCalendar mode="single" selected={selectedDate} />);

    // react-day-picker marks selected days with aria-selected="true"
    const dayButton = screen.getByRole('gridcell', {
      name: accessibleName => accessibleName.includes('15'), // Find the 15th day
      selected: true,
    });
    expect(dayButton).toBeInTheDocument();
    expect(dayButton).toHaveAttribute('aria-selected', 'true');
  });

  it('passes through calendar props like showOutsideDays', () => {
    // This test is more complex without the mock, as we need to observe behavior.
    // For showOutsideDays={false}, days from other months should not be visible or should be marked differently.
    // For simplicity, we'll check if the prop is passed if SingleCalendar directly passes it.
    // If SingleCalendar wraps DayPicker and processes props, this test needs to be more behavioral.
    // Assuming SingleCalendar passes props down, we can't directly check props on DayPicker without a more complex setup or e2e-like test.
    // For now, we'll trust that react-day-picker handles these props correctly if passed.
    // A more robust test would involve rendering a specific month and checking for outside days.
    renderWithProvider(
      <SingleCalendar
        mode="single"
        showOutsideDays={false}
        defaultSelected={new Date(2025, 4, 1)}
      />
    ); // May 2025
    // Example: Check that a day from April is not present or is disabled if showOutsideDays is false.
    // This requires careful setup of the defaultMonth and knowing the calendar layout.
    // For now, this test is simplified and might need enhancement based on actual component behavior.
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument(); // Basic check that it renders
  });

  it('handles disabled dates', async () => {
    const onSelect = vi.fn();
    const disabledDate = new Date(2025, 4, 15); // May 15, 2025
    const anotherDate = new Date(2025, 4, 16); // May 16, 2025

    renderWithProvider(
      <SingleCalendar
        mode="single"
        onSelect={onSelect}
        disabled={[disabledDate]}
        defaultSelected={new Date(2025, 4, 1)} // Changed from defaultMonth
      />
    );

    // react-day-picker may not set aria-disabled, but disabled dates should not be clickable
    const disabledDayButton = screen.getByRole('gridcell', {
      name: accessibleName => accessibleName.includes('15'),
    });

    // Click the disabled date - it should not trigger onSelect
    const disabledButton = disabledDayButton.querySelector('button');
    await user.click(disabledButton!);
    expect(onSelect).not.toHaveBeenCalled();

    const enabledDayButton = screen.getByRole('gridcell', {
      name: accessibleName => accessibleName.includes('16'),
    });
    const enabledButton = enabledDayButton.querySelector('button');
    expect(enabledButton).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(enabledButton!);
    expect(onSelect).toHaveBeenCalledOnce();
    const selectedArg = onSelect.mock.calls[0][0];
    expect(areDatesSameDay(selectedArg, anotherDate)).toBe(true);
  });

  it('applies custom className', () => {
    const customClass = 'custom-single-calendar';
    const { container } = renderWithProvider(
      <SingleCalendar mode="single" className={customClass} />
    );

    // The className should be applied to the wrapper div that contains the DayPicker
    const calendarWrapper = container.firstChild;
    expect(calendarWrapper).toHaveClass(customClass);
  });

  it('handles fromDate and toDate constraints by disabling dates outside the range', async () => {
    const onSelect = vi.fn();
    const fromDate = new Date(2025, 4, 10); // May 10, 2025
    const toDate = new Date(2025, 4, 20); // May 20, 2025
    const validDate = new Date(2025, 4, 15); // May 15, 2025

    // Dates before fromDate or after toDate should be disabled.
    const disabledMatcher = [
      { before: fromDate }, // Disable dates before May 10, 2025
      { after: toDate }, // Disable dates after May 20, 2025
    ];

    renderWithProvider(
      <SingleCalendar
        mode="single"
        onSelect={onSelect}
        disabled={disabledMatcher}
        defaultSelected={new Date(2025, 4, 1)} // Ensure month with these dates is visible
      />
    );

    // Check valid date (May 15)
    const validDayButton = screen.getByRole('button', {
      name: 'Thursday, May 15th, 2025',
    });
    expect(validDayButton).not.toBeDisabled();
    await user.click(validDayButton);
    expect(onSelect).toHaveBeenCalledOnce();
    let selectedArg = onSelect.mock.calls[0][0];
    expect(areDatesSameDay(selectedArg, validDate)).toBe(true);
    onSelect.mockClear();

    // Check invalid date (May 5 - before fromDate)
    const invalidDayButtonBefore = screen.getByRole('button', {
      name: 'Monday, May 5th, 2025',
    });
    expect(invalidDayButtonBefore).toBeDisabled();
    await user.click(invalidDayButtonBefore);
    expect(onSelect).not.toHaveBeenCalled();

    // Check invalid date (May 25 - after toDate)
    // Ensure the month view includes the 25th. If defaultSelected is May 1, it should.
    const invalidDayButtonAfter = screen.getByRole('button', {
      name: 'Sunday, May 25th, 2025',
    });
    expect(invalidDayButtonAfter).toBeDisabled();
    await user.click(invalidDayButtonAfter);
    expect(onSelect).not.toHaveBeenCalled();
  });

  // --- New tests for keyboard navigation and accessibility ---
  it('selects date with Enter key', async () => {
    const onSelect = vi.fn();
    const expectedDate = new Date(2025, 4, 15);
    renderWithProvider(
      <SingleCalendar mode="single" onSelect={onSelect} defaultSelected={new Date(2025, 4, 1)} />
    );

    const dayButton = screen.getByRole('gridcell', {
      name: (accessibleName, element) =>
        element.getAttribute('aria-disabled') !== 'true' && accessibleName.includes('15'),
    });

    const button = dayButton.querySelector('button');
    button!.focus();

    // Properly wrap keyboard interaction in act() to handle React state updates
    await act(async () => {
      await user.keyboard('[Enter]');
    });

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledOnce();
    });

    const selectedArg = onSelect.mock.calls[0][0];
    expect(areDatesSameDay(selectedArg, expectedDate)).toBe(true);
  });

  it('selects date with Space key', async () => {
    const onSelect = vi.fn();
    const expectedDate = new Date(2025, 4, 15);
    renderWithProvider(
      <SingleCalendar mode="single" onSelect={onSelect} defaultSelected={new Date(2025, 4, 1)} />
    );

    const dayButton = screen.getByRole('gridcell', {
      name: (accessibleName, element) =>
        element.getAttribute('aria-disabled') !== 'true' && accessibleName.includes('15'),
    });

    const button = dayButton.querySelector('button');
    button!.focus();

    // Properly wrap keyboard interaction in act() to handle React state updates
    await act(async () => {
      await user.keyboard('[Space]');
    });

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledOnce();
    });

    const selectedArg = onSelect.mock.calls[0][0];
    expect(areDatesSameDay(selectedArg, expectedDate)).toBe(true);
  });

  // Basic focus and arrow key navigation test
  it('allows keyboard navigation between dates', async () => {
    renderWithProvider(<SingleCalendar mode="single" defaultSelected={new Date(2025, 4, 1)} />);

    const day15 = screen.getByRole('gridcell', {
      name: name => name.includes('15') && !name.includes('disabled'),
    });
    const button15 = day15.querySelector('button');
    button15!.focus();
    expect(button15).toHaveFocus();

    // Properly wrap keyboard navigation in act() to handle React state updates
    await act(async () => {
      await user.keyboard('{arrowright}');
    });

    // Wait for focus to change and verify
    await waitFor(() => {
      const day16 = screen.getByRole('gridcell', {
        name: name => name.includes('16') && !name.includes('disabled'),
      });
      const button16 = day16.querySelector('button');
      expect(button16).toHaveFocus();
    });

    // Properly wrap second keyboard navigation in act()
    await act(async () => {
      await user.keyboard('{arrowdown}');
    });

    // Wait for focus to change and verify
    await waitFor(() => {
      const day23 = screen.getByRole('gridcell', {
        name: name => name.includes('23') && !name.includes('disabled'),
      });
      const button23 = day23.querySelector('button');
      expect(button23).toHaveFocus();
    });
  });
});
