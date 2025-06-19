import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSetAtom } from 'jotai';
import { RangeCalendar } from '../RangeCalendar';
import { initializeCalendarAtom, clearCalendarSelectionAtom } from '@/atoms';
import type { RangeCalendarProps } from '../Calendar.types';
import type { DayPickerProps, DateRange } from 'react-day-picker';

// Helper functions for the mock DayPicker component
const createMockDayPickerHelpers = (props: DayPickerProps & { mode: 'range'; selected?: DateRange }) => {
  // Helper to check if a date is disabled
  const isDateDisabled = (date: Date) => {
    if (props.disabled) {
      if (typeof props.disabled === 'function') {
        return props.disabled(date);
      } else if (Array.isArray(props.disabled)) {
        return props.disabled.some(d => {
          if (d instanceof Date) {
            return (
              d.getFullYear() === date.getFullYear() &&
              d.getMonth() === date.getMonth() &&
              d.getDate() === date.getDate()
            );
          }
          return false;
        });
      }
    }
    return false;
  };

  // Helper to handle date selection
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    const currentSelected = props.selected;
    let newSelection: DateRange | undefined;

    if (!currentSelected?.from) {
      // No selection, start new range
      newSelection = { from: date, to: undefined };
    } else if (!currentSelected.to) {
      // Has 'from', now set 'to'
      if (date < currentSelected.from) {
        newSelection = { from: date, to: currentSelected.from };
      } else {
        newSelection = { from: currentSelected.from, to: date };
      }
    } else {
      // Complete range exists, start new selection
      newSelection = { from: date, to: undefined };
    }

    // Call onSelect with the new selection and the clicked date
    if (props.onSelect) {
      // Mock the modifiers and event objects to match the expected signature
      const mockModifiers = {};
      const mockEvent = {
        type: 'click',
        preventDefault: () => {},
        stopPropagation: () => {},
      } as React.MouseEvent;
      props.onSelect(newSelection, date, mockModifiers, mockEvent);
    }
  };

  // Helper to handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDateClick(date);
    }
  };

  return { isDateDisabled, handleDateClick, handleKeyDown };
};

// Helper to create a calendar day cell
const createCalendarDayCell = (
  day: number,
  dayIndex: number,
  year: number,
  month: number,
  props: DayPickerProps & { mode: 'range'; selected?: DateRange },
  helpers: ReturnType<typeof createMockDayPickerHelpers>
) => {
  const date = new Date(year, month, day);
  const isDisabled = helpers.isDateDisabled(date);
  const isSelected =
    (props.selected?.from &&
      props.selected.from.getFullYear() === date.getFullYear() &&
      props.selected.from.getMonth() === date.getMonth() &&
      props.selected.from.getDate() === date.getDate()) ||
    (props.selected?.to &&
      props.selected.to.getFullYear() === date.getFullYear() &&
      props.selected.to.getMonth() === date.getMonth() &&
      props.selected.to.getDate() === date.getDate());

  return (
    <td key={dayIndex}>
      <button
        aria-label={date.toDateString()}
        data-testid={`date-${day}`}
        disabled={isDisabled}
        data-selected={isSelected}
        onClick={() => helpers.handleDateClick(date)}
        onKeyDown={e => helpers.handleKeyDown(e, date)}
        tabIndex={day === 1 ? 0 : -1}
      >
        {day}
      </button>
    </td>
  );
};

// Mock the DayPicker component
vi.mock('react-day-picker', async importOriginal => {
  const actual = await importOriginal();
  const actualExports = typeof actual === 'object' && actual !== null ? actual : {};

  const mockDayPicker = vi.fn((props: DayPickerProps & { mode: 'range'; selected?: DateRange }) => {
    // Generate a grid of clickable dates for the given month
    const startMonth = props.startMonth || new Date(2025, 5, 1); // Default to June 2025
    const year = startMonth.getFullYear();
    const month = startMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const helpers = createMockDayPickerHelpers(props);

    return (
      <div
        data-testid="mocked-daypicker"
        aria-label={
          props.captionLayout === 'dropdown'
            ? 'Month dropdown'
            : (props.startMonth?.toLocaleString('default', { month: 'long', year: 'numeric' }) ??
              'Calendar grid')
        }
        data-start-month={props.startMonth?.toISOString()}
        data-selected-from={props.selected?.from?.toISOString()}
        data-selected-to={props.selected?.to?.toISOString()}
        data-classnames-root={props.classNames?.root}
        role="grid"
      >
        <div>
          Mocked DayPicker. Displayed Month:{' '}
          {props.startMonth?.toLocaleString('default', { month: 'long', year: 'numeric' }) ?? 'N/A'}
          {props.selected?.from && <span>Selected From: {props.selected.from.toDateString()}</span>}
          {props.selected?.to && <span>Selected To: {props.selected.to.toDateString()}</span>}
        </div>
        <table aria-label="Calendar grid">
          <tbody>
            {Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, weekIndex) => (
              <tr key={weekIndex}>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = weekIndex * 7 + dayIndex + 1;
                  if (day > daysInMonth) {
                    return <td key={dayIndex}></td>;
                  }

                  return createCalendarDayCell(day, dayIndex, year, month, props, helpers);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  });

  return {
    ...actualExports,
    DayPicker: mockDayPicker,
  };
});

// Get a reference to the mocked DayPicker
import { DayPicker } from 'react-day-picker';
const mockDayPicker = vi.mocked(DayPicker);

// After mocking, importing DayPicker will give us the mock function directly.
// We can then use dayPickerMockFn for assertions.

const defaultTestProps: RangeCalendarProps = {
  mode: 'range-single',
  startMonth: new Date(2025, 5, 1), // June 2025
  onSelect: vi.fn(),
  classNames: {},
};

describe('RangeCalendar', () => {
  beforeEach(() => {
    if (mockDayPicker && typeof mockDayPicker.mockClear === 'function') {
      mockDayPicker.mockClear();
    }

    const { result: initResult } = renderHook(() => useSetAtom(initializeCalendarAtom));
    act(() => {
      initResult.current({ mode: 'range-single' });
    });
    const { result: clearResult } = renderHook(() => useSetAtom(clearCalendarSelectionAtom));
    act(() => {
      clearResult.current();
    });

    // Clear mock after state setup to avoid counting initialization renders
    if (mockDayPicker && typeof mockDayPicker.mockClear === 'function') {
      mockDayPicker.mockClear();
    }
  });

  it('renders without crashing', () => {
    render(<RangeCalendar {...defaultTestProps} />);
    expect(mockDayPicker).toHaveBeenCalled();

    // Check that DayPicker was called with correct basic props
    const firstCall = mockDayPicker.mock.calls[0];
    if (firstCall && firstCall[0]) {
      expect(firstCall[0]).toMatchObject({
        startMonth: defaultTestProps.startMonth,
        mode: 'range',
      });
    }

    const mockElement = screen.queryByTestId('mocked-daypicker');
    expect(mockElement).toBeInTheDocument();
    if (mockElement) {
      expect(mockElement).toHaveAttribute('aria-label', 'June 2025');
      expect(mockElement).toHaveTextContent(/Mocked DayPicker. Displayed Month: June 2025/);
    }
  });

  it('applies custom className to the DayPicker component via classNames.root prop', () => {
    const customClass = 'custom-range-calendar';
    const classNamesRoot = 'other-rdp-root-class';
    render(
      <RangeCalendar
        {...defaultTestProps}
        className={customClass} // This is for the RangeCalendar's own wrapper div
        classNames={{ root: classNamesRoot, month_caption: 'test-month_caption-class' }} // This is for DayPicker
      />
    );

    // Check that RangeCalendar's wrapper div gets the className prop
    const mockedDayPicker = screen.queryByTestId('mocked-daypicker');
    const rangeCalendarWrapper = mockedDayPicker?.parentElement;
    expect(rangeCalendarWrapper).toHaveClass('range-calendar-container');

    // Verify what DayPicker mock receives for classNames.root
    expect(mockDayPicker).toHaveBeenCalled();
    const lastCall = mockDayPicker.mock.calls[mockDayPicker.mock.calls.length - 1];
    expect(lastCall[0].classNames?.root).toContain(classNamesRoot);
    expect(lastCall[0].classNames?.root).toContain(customClass);
    expect(lastCall[0].classNames?.month_caption).toBe('test-month_caption-class');

    const mockElement = screen.getByTestId('mocked-daypicker');
    // The mock renders `props.classNames.root` directly for easy checking
    const rootClassAttr = mockElement.getAttribute('data-classnames-root');
    expect(rootClassAttr).toContain(classNamesRoot);
    expect(rootClassAttr).toContain(customClass);
  });

  it('displays a pre-selected range', () => {
    const initialFrom = new Date(2025, 5, 5);
    const initialTo = new Date(2025, 5, 10);
    const startMonth = new Date(2025, 5, 1);

    render(
      <RangeCalendar
        mode="range-single"
        numberOfMonths={1}
        startMonth={startMonth}
        selected={{ from: initialFrom, to: initialTo }}
        onSelect={() => {}}
      />
    );

    expect(mockDayPicker).toHaveBeenCalled();
    // Get the last call since component may re-render
    const lastCallIndex = mockDayPicker.mock.calls.length - 1;
    const callArgs = mockDayPicker.mock.calls[lastCallIndex][0] as DayPickerProps & {
      mode: 'range';
      selected?: DateRange;
    };
    expect(callArgs.selected).toEqual(
      expect.objectContaining({
        from: expect.any(Date),
        to: expect.any(Date),
      })
    );
    if (callArgs.selected?.from && callArgs.selected?.to) {
      // Compare normalized local dates (the component normalizes dates to local midnight)
      expect(callArgs.selected.from.toISOString().substring(0, 10)).toBe(
        new Date(2025, 5, 5).toISOString().substring(0, 10)
      );
      expect(callArgs.selected.to.toISOString().substring(0, 10)).toBe(
        new Date(2025, 5, 10).toISOString().substring(0, 10)
      );
    } else {
      throw new Error('Selected from/to dates were not passed to DayPicker as expected.');
    }

    const mockElementWithSelection = screen.getByTestId('mocked-daypicker');
    expect(mockElementWithSelection).toHaveTextContent(
      `Selected From: ${initialFrom.toDateString()}`
    );
    expect(mockElementWithSelection).toHaveTextContent(`Selected To: ${initialTo.toDateString()}`);
    // Verify the mock element displays the correct month
    expect(mockElementWithSelection).toHaveTextContent('Displayed Month: June 2025');
  });

  // Test for clearing selection by passing undefined to 'selected' prop
  it('clears selection when selected prop is undefined', () => {
    const initialFrom = new Date(2025, 5, 5);
    const initialTo = new Date(2025, 5, 10);
    const startMonth = new Date(2025, 5, 1);

    const { rerender } = render(
      <RangeCalendar
        mode="range-single"
        startMonth={startMonth}
        selected={{ from: initialFrom, to: initialTo }}
        onSelect={() => {}}
      />
    );

    expect(mockDayPicker).toHaveBeenCalled();
    let lastCallIndex = mockDayPicker.mock.calls.length - 1;
    let callArgs = mockDayPicker.mock.calls[lastCallIndex][0] as DayPickerProps & {
      mode: 'range';
      selected?: DateRange;
    };
    expect(callArgs.selected).toBeDefined();

    // Clear mock calls to track only new renders
    mockDayPicker.mockClear();

    // Rerender with selected as undefined
    rerender(
      <RangeCalendar
        mode="range-single"
        startMonth={startMonth}
        selected={undefined} // Explicitly pass undefined
        onSelect={() => {}}
      />
    );

    expect(mockDayPicker).toHaveBeenCalled();
    lastCallIndex = mockDayPicker.mock.calls.length - 1;
    callArgs = mockDayPicker.mock.calls[lastCallIndex][0] as DayPickerProps & {
      mode: 'range';
      selected?: DateRange;
    };
    // The dayPickerSelectedProp in RangeCalendar should become undefined
    expect(callArgs.selected).toBeUndefined();

    const mockElementAfterClear = screen.getByTestId('mocked-daypicker');
    expect(mockElementAfterClear).not.toHaveTextContent('Selected From:');
    expect(mockElementAfterClear).not.toHaveTextContent('Selected To:');
    expect(mockElementAfterClear).toMatchSnapshot();
  });

  it('handles basic range selection via click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<RangeCalendar {...defaultTestProps} onSelect={onSelect} />);

    // Click on day 5 to start selection
    const day5 = screen.getByTestId('date-5');
    await user.click(day5);

    // Should be called with partial range
    expect(onSelect).toHaveBeenCalledWith({ from: new Date(2025, 5, 5), to: undefined });

    onSelect.mockClear();

    // Click on day 10 to complete selection
    const day10 = screen.getByTestId('date-10');
    await user.click(day10);

    // Should be called with complete range
    expect(onSelect).toHaveBeenCalledWith({
      from: new Date(2025, 5, 5),
      to: new Date(2025, 5, 10),
    });
  });

  it('handles min and max day count constraints', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<RangeCalendar {...defaultTestProps} min={3} max={5} onSelect={onSelect} />);

    // Click on day 5 to start selection
    const day5 = screen.getByTestId('date-5');
    await user.click(day5);

    expect(onSelect).toHaveBeenCalledWith({ from: new Date(2025, 5, 5), to: undefined });

    onSelect.mockClear();

    // Click on day 6 to create a 2-day range (violates min=3)
    const day6 = screen.getByTestId('date-6');
    await user.click(day6);

    // Should reject the range and make the clicked date the new single selection
    expect(onSelect).toHaveBeenCalledWith({ from: new Date(2025, 5, 6), to: new Date(2025, 5, 6) });
  });

  it('handles disabled dates within a range attempt', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const disabledDates = [new Date(2025, 5, 7)]; // Disable June 7th

    render(<RangeCalendar {...defaultTestProps} onSelect={onSelect} disabled={disabledDates} />);

    // Disabled date should not be clickable
    const disabledDay = screen.getByTestId('date-7');
    expect(disabledDay).toBeDisabled();

    // Click on day 5 to start selection
    const day5 = screen.getByTestId('date-5');
    await user.click(day5);

    expect(onSelect).toHaveBeenCalledWith({ from: new Date(2025, 5, 5), to: undefined });

    onSelect.mockClear();

    // Clicking on disabled date should not trigger onSelect
    await user.click(disabledDay);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selects range with Enter/Space key', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<RangeCalendar {...defaultTestProps} onSelect={onSelect} />);

    // Focus and press Enter on day 5
    const day5 = screen.getByTestId('date-5');
    day5.focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith({ from: new Date(2025, 5, 5), to: undefined });

    onSelect.mockClear();

    // Focus and press Space on day 10
    const day10 = screen.getByTestId('date-10');
    day10.focus();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledWith({
      from: new Date(2025, 5, 5),
      to: new Date(2025, 5, 10),
    });
  });

  it('displays min only constraint message', async () => {
    render(
      <RangeCalendar {...defaultTestProps} min={3} selected={{ from: new Date(2025, 5, 10) }} />
    );
    expect(screen.getByTestId('min-constraint-message')).toBeInTheDocument();
    expect(screen.getByTestId('min-constraint-message')).toHaveTextContent(
      'Select at least 3 days'
    );
  });

  it('displays max only constraint message', async () => {
    render(
      <RangeCalendar {...defaultTestProps} max={5} selected={{ from: new Date(2025, 5, 10) }} />
    );
    expect(screen.getByTestId('max-constraint-message')).toBeInTheDocument();
    expect(screen.getByTestId('max-constraint-message')).toHaveTextContent('Select at most 5 days');
  });

  it('displays min and max constraint message', async () => {
    render(
      <RangeCalendar
        {...defaultTestProps}
        min={3}
        max={5}
        selected={{ from: new Date(2025, 5, 10) }}
      />
    );
    expect(screen.getByTestId('min-max-constraint-message')).toBeInTheDocument();
    expect(screen.getByTestId('min-max-constraint-message')).toHaveTextContent(
      'Select between 3 and 5 days'
    );
  });
});
