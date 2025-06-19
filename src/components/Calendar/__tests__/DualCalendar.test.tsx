import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { DualCalendar } from '../DualCalendar';
import {
  initializeCalendarAtom,
  clearCalendarSelectionAtom,
  selectedRangeAtom,
  calendarConfigAtom,
} from '@/atoms';
import type { DualCalendarProps, CalendarMode } from '../Calendar.types'; // Added CalendarMode
import type {
  DayPickerProps,
  DateRange,
  Modifiers,
  Matcher,
  SelectHandler,
} from 'react-day-picker'; // Added Matcher
import { isSameDay, addMonths, format, startOfMonth } from 'date-fns';

// Define the expected props for our mocked DayPicker more precisely
type MockedDayPickerRangeProps = Omit<
  DayPickerProps,
  'mode' | 'selected' | 'onSelect' | 'numberOfMonths'
> & {
  mode: 'range';
  selected?: DateRange;
  onSelect?: SelectHandler<{ mode: 'range' }>;
  numberOfMonths?: 2; // DualCalendar always passes 2
  month?: Date; // Initial month for the first calendar
  disabled?: Matcher | Matcher[]; // Corrected type to Matcher | Matcher[]
  classNames?: DayPickerProps['classNames'];
  styles?: DayPickerProps['styles'];
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  showWeekNumber?: boolean;
  onMonthChange?: (month: Date) => void; // Added from DayPickerProps
  onNextClick?: (month: Date) => void; // Custom for mock interaction
  onPrevClick?: (month: Date) => void; // Custom for mock interaction
  // Include other props DualCalendar is expected to pass, e.g., from BaseCalendarProps
  dir?: 'ltr' | 'rtl';
  lang?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
  captionLayout?: DayPickerProps['captionLayout'];
  startMonth?: Date; // DayPicker's own startMonth for initial view if `month` isn't primary
  defaultSelected?: DateRange; // Added defaultSelected to the mock props
};

// Helper functions for the mock DayPicker component
const createMockDayPickerHelpers = (props: MockedDayPickerRangeProps) => {
  const isDateDisabled = (date: Date): boolean => {
    if (!props.disabled) return false;

    const isDisabledMatcher = (matcher: Matcher): boolean => {
      if (typeof matcher === 'boolean') return matcher;
      if (matcher instanceof Date) return isSameDay(matcher, date);
      if (typeof matcher === 'function') return matcher(date);
      if (typeof matcher === 'object' && matcher !== null) {
        if (
          'from' in matcher &&
          'to' in matcher &&
          matcher.from instanceof Date &&
          matcher.to instanceof Date
        ) {
          // DateRange
          return date >= matcher.from && date <= matcher.to;
        }
        // Type guard for objects with specific date properties
        if ('before' in matcher && matcher.before instanceof Date && date < matcher.before)
          return true;
        if ('after' in matcher && matcher.after instanceof Date && date > matcher.after)
          return true;
        if ('daysOfWeek' in matcher && Array.isArray(matcher.daysOfWeek))
          return (matcher.daysOfWeek as number[]).includes(date.getDay());
      }
      return false;
    };

    if (Array.isArray(props.disabled)) {
      return (props.disabled as Matcher[]).some(isDisabledMatcher);
    }
    return isDisabledMatcher(props.disabled as Matcher);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (props.onSelect) {
      const mockModifiers: Modifiers = { outside: false }; // Example
      const mockEvent = {
        type: 'click',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;
      props.onSelect(date, mockModifiers, mockEvent);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDateClick(date);
    }
  };
  return { isDateDisabled, handleDateClick, handleKeyDown };
};

const createCalendarDayCell = (
  date: Date,
  props: MockedDayPickerRangeProps,
  helpers: ReturnType<typeof createMockDayPickerHelpers>
) => {
  const isDisabled = helpers.isDateDisabled(date);
  const isSelected =
    (props.selected?.from && isSameDay(props.selected.from, date)) ||
    (props.selected?.to && isSameDay(props.selected.to, date));
  const isInRange = !!(
    props.selected?.from &&
    props.selected?.to &&
    props.selected.from instanceof Date &&
    props.selected.to instanceof Date &&
    date > props.selected.from &&
    date < props.selected.to
  );

  return (
    <td key={date.toISOString()}>
      <button
        aria-label={date.toDateString()}
        data-testid={`date-${format(date, 'yyyy-MM-dd')}`}
        disabled={isDisabled}
        data-selected={isSelected ? 'true' : 'false'}
        data-in-range={isInRange ? 'true' : 'false'}
        onClick={() => helpers.handleDateClick(date)}
        onKeyDown={e => helpers.handleKeyDown(e, date)}
        tabIndex={date.getDate() === 1 ? 0 : -1}
      >
        {date.getDate()}
      </button>
    </td>
  );
};

vi.mock('react-day-picker', async importOriginal => {
  const actual = await importOriginal();
  const actualExports = typeof actual === 'object' && actual !== null ? actual : {};

  const mockDayPicker = vi.fn((props: MockedDayPickerRangeProps) => {
    const firstMonthDate = startOfMonth(props.month || props.startMonth || new Date(2025, 5, 1));
    const displayMonths: Date[] = [firstMonthDate, addMonths(firstMonthDate, 1)];
    const helpers = createMockDayPickerHelpers(props);

    return (
      <div
        data-testid="mocked-daypicker"
        aria-label={props['aria-label'] || 'Calendar grid'}
        data-month={firstMonthDate.toISOString()}
        data-number-of-months={props.numberOfMonths}
        data-selected-from={props.selected?.from?.toISOString()}
        data-selected-to={props.selected?.to?.toISOString()}
        data-classnames={JSON.stringify(props.classNames)}
        data-disabled-prop={JSON.stringify(props.disabled)} // For debugging disabled prop
        role="grid"
      >
        {displayMonths.map((monthDate, index) => {
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          return (
            <div
              key={monthDate.toISOString()}
              data-testid={`mocked-month-${format(monthDate, 'yyyy-MM')}`}
            >
              <div data-testid={`month-caption-${format(monthDate, 'yyyy-MM')}`}>
                {format(monthDate, 'MMMM yyyy')}
              </div>
              {index === 0 && props.selected?.from && (
                <span>Selected From: {props.selected.from.toDateString()}</span>
              )}
              {index === 0 && props.selected?.to && (
                <span>Selected To: {props.selected.to.toDateString()}</span>
              )}
              <table aria-label={`Calendar grid for ${format(monthDate, 'MMMM yyyy')}`}>
                <tbody>
                  {Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, weekIndex) => (
                    <tr key={weekIndex}>
                      {Array.from({ length: 7 }, (_, dayIndexInWeek) => {
                        const dayOfMonth = weekIndex * 7 + dayIndexInWeek + 1;
                        if (dayOfMonth > daysInMonth) {
                          return <td key={dayIndexInWeek}></td>;
                        }
                        const cellDate = new Date(year, month, dayOfMonth);
                        return createCalendarDayCell(cellDate, props, helpers);
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        {props.onPrevClick && (
          <button
            data-testid="rdp-prev-button"
            onClick={() => props.onPrevClick && props.onPrevClick(displayMonths[0])}
          >
            Prev
          </button>
        )}
        {props.onNextClick && (
          <button
            data-testid="rdp-next-button"
            onClick={() =>
              props.onNextClick && props.onNextClick(displayMonths[displayMonths.length - 1])
            }
          >
            Next
          </button>
        )}
      </div>
    );
  });

  return {
    ...actualExports,
    DayPicker: mockDayPicker,
  };
});

import { DayPicker } from 'react-day-picker';
const mockDayPicker = vi.mocked(DayPicker);

const defaultTestProps: Omit<DualCalendarProps, 'onSelect'> & {
  onSelect?: DualCalendarProps['onSelect'];
} = {
  mode: 'range-dual',
  // onSelect will be set in beforeEach
};

const today = new Date(2025, 5, 6); // June 6, 2025, a Friday

describe('DualCalendar', () => {
  let setInitializeCalendarAtom: (options: { mode?: CalendarMode; config?: Partial<any> }) => void; // Used CalendarMode
  let setClearCalendarSelectionAtom: () => void;
  let currentTestProps: DualCalendarProps;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(today);

    currentTestProps = {
      ...defaultTestProps,
      onSelect: vi.fn(),
    };

    const { result: initResult } = renderHook(() => useSetAtom(initializeCalendarAtom));
    setInitializeCalendarAtom = initResult.current;
    const { result: clearResult } = renderHook(() => useSetAtom(clearCalendarSelectionAtom));
    setClearCalendarSelectionAtom = clearResult.current;
    const { result: configResult } = renderHook(() => useSetAtom(calendarConfigAtom));

    act(() => {
      // DualCalendar itself sets numberOfMonths to 2, so DayPicker receives it.
      // No need to set via calendarConfigAtom for this specific prop for DayPicker.
      configResult.current({}); // Apply default or minimal config
      setInitializeCalendarAtom({ mode: 'range-dual' });
      setClearCalendarSelectionAtom();
    });

    mockDayPicker.mockClear();
    // Clear the mock function associated with the current test props
    if (
      currentTestProps.onSelect &&
      typeof (currentTestProps.onSelect as any).mockClear === 'function'
    ) {
      (currentTestProps.onSelect as any).mockClear();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders without crashing and displays two months by default (current and next)', () => {
    render(<DualCalendar {...currentTestProps} />);
    expect(mockDayPicker).toHaveBeenCalled();

    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    expect(callArgs.mode).toBe('range');
    expect(callArgs.numberOfMonths).toBe(2);
    // Default month should be 'today' (June 2025) if no selected/defaultSelected/startMonth
    expect(format(callArgs.month!, 'yyyy-MM')).toBe('2025-06');

    expect(screen.getByTestId('mocked-month-2025-06')).toBeInTheDocument();
    expect(screen.getByTestId('month-caption-2025-06')).toHaveTextContent('June 2025');
    expect(screen.getByTestId('mocked-month-2025-07')).toBeInTheDocument();
    expect(screen.getByTestId('month-caption-2025-07')).toHaveTextContent('July 2025');
  });

  it('renders with a specific startMonth and shows that and the next month', () => {
    const startCalendarMonth = new Date(2025, 0, 1); // January 2025
    render(<DualCalendar {...currentTestProps} startMonth={startCalendarMonth} />);

    expect(mockDayPicker).toHaveBeenCalled();
    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    // DualCalendar passes its 'startMonth' prop as 'month' to DayPicker
    expect(format(callArgs.month!, 'yyyy-MM')).toBe('2025-01');
    expect(callArgs.numberOfMonths).toBe(2);

    expect(screen.getByTestId('mocked-month-2025-01')).toBeInTheDocument();
    expect(screen.getByTestId('month-caption-2025-01')).toHaveTextContent('January 2025');
    expect(screen.getByTestId('mocked-month-2025-02')).toBeInTheDocument();
    expect(screen.getByTestId('month-caption-2025-02')).toHaveTextContent('February 2025');
  });

  it('applies custom className to container and classNames to DayPicker', () => {
    const customContainerClass = 'custom-dual-calendar-container';
    const rdpRootClass = 'my-rdp-root';
    const rdpDayClass = 'my-custom-day';
    render(
      <DualCalendar
        {...currentTestProps}
        className={customContainerClass} // For DualCalendar's wrapper
        classNames={{ root: rdpRootClass, day: rdpDayClass }} // For DayPicker
      />
    );

    const container = screen.getByRole('group'); // DualCalendar's main div
    expect(container).toHaveClass(customContainerClass);
    // Default class from createCalendarClasses('range-dual', 'default')
    // The actual class name might be 'calendar-container-range-dual-default' or similar
    // For this test, we check the one passed by DualCalendar.tsx's own logic
    expect(container.className).toMatch(/dual-calendar-container/);

    expect(mockDayPicker).toHaveBeenCalled();
    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    // DualCalendar merges its own standard DayPicker classes with user-provided ones.
    // The exact class string for root might be complex. Check for inclusion.
    expect(callArgs.classNames?.root).toContain(rdpRootClass);
    expect(callArgs.classNames?.root).toMatch(/dual-calendar-daypicker/); // Default class from DualCalendar
    expect(callArgs.classNames?.day).toBe(rdpDayClass);
  });

  it('displays a pre-selected range across two months', () => {
    const selectedRangeValue = { from: new Date(2025, 5, 28), to: new Date(2025, 6, 5) }; // June 28 to July 5
    render(<DualCalendar {...currentTestProps} selected={selectedRangeValue} />);

    expect(mockDayPicker).toHaveBeenCalled();
    // Use last call as component might re-render with Jotai state
    const callArgs = mockDayPicker.mock.calls[
      mockDayPicker.mock.calls.length - 1
    ][0] as MockedDayPickerRangeProps;
    expect(callArgs.selected?.from).toEqual(selectedRangeValue.from);
    expect(callArgs.selected?.to).toEqual(selectedRangeValue.to);
    // The month displayed should be June 2025 (from selectedRangeValue.from)
    expect(format(callArgs.month!, 'yyyy-MM')).toBe('2025-06');

    expect(screen.getByTestId('mocked-daypicker')).toHaveTextContent(
      `Selected From: ${selectedRangeValue.from.toDateString()}`
    );
    expect(screen.getByTestId('mocked-daypicker')).toHaveTextContent(
      `Selected To: ${selectedRangeValue.to.toDateString()}`
    );

    expect(screen.getByTestId('month-caption-2025-06')).toHaveTextContent('June 2025');
    expect(screen.getByTestId('month-caption-2025-07')).toHaveTextContent('July 2025');

    expect(screen.getByTestId('date-2025-06-28')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('date-2025-07-05')).toHaveAttribute('data-selected', 'true');
  });

  it('handles basic range selection via click, spanning two months', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // Use currentTestProps.onSelect which is a fresh mock
    render(<DualCalendar {...currentTestProps} startMonth={new Date(2025, 5, 1)} />);

    const dayJune28 = screen.getByTestId('date-2025-06-28');
    await user.click(dayJune28);

    const expectedFrom = new Date(2025, 5, 28);
    expect(currentTestProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ from: expectedFrom, to: undefined })
    );

    // Check Jotai atom state
    const { result: rangeAtom } = renderHook(() => useAtomValue(selectedRangeAtom));
    expect(rangeAtom.current?.from).toEqual(expectedFrom);
    expect(rangeAtom.current?.to).toBeUndefined();

    // currentTestProps.onSelect?.mockClear();

    const dayJuly5 = screen.getByTestId('date-2025-07-05');
    await user.click(dayJuly5);

    const expectedTo = new Date(2025, 6, 5);
    expect(currentTestProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ from: expectedFrom, to: expectedTo })
    );

    const { result: finalRangeAtom } = renderHook(() => useAtomValue(selectedRangeAtom));
    expect(finalRangeAtom.current?.from).toEqual(expectedFrom);
    expect(finalRangeAtom.current?.to).toEqual(expectedTo);
  });

  it('respects min day count constraint and shows validation error', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DualCalendar {...currentTestProps} min={3} startMonth={new Date(2025, 5, 1)} />);

    await user.click(screen.getByTestId('date-2025-06-05')); // Day 5
    expect(currentTestProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ from: new Date(2025, 5, 5), to: undefined })
    );
    // currentTestProps.onSelect?.mockClear();

    await user.click(screen.getByTestId('date-2025-06-06')); // Day 6 (range is 2 days, min is 3)
    expect(currentTestProps.onSelect).not.toHaveBeenCalled(); // Validation fails, onSelect not called with new range

    const errorAlert = await screen.findByRole('alert'); // Validation error displayed by DualCalendar
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Range must be at least 3 days');

    const { result: rangeAtom } = renderHook(() => useAtomValue(selectedRangeAtom));
    // Atom still holds the 'from' date, but range is not completed due to validation
    expect(rangeAtom.current?.from).toEqual(new Date(2025, 5, 5));
    expect(rangeAtom.current?.to).toBeUndefined();
  });

  it('respects max day count constraint and shows validation error', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DualCalendar {...currentTestProps} max={3} startMonth={new Date(2025, 5, 1)} />);

    await user.click(screen.getByTestId('date-2025-06-05')); // Day 5
    expect(currentTestProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ from: new Date(2025, 5, 5), to: undefined })
    );
    // currentTestProps.onSelect?.mockClear();

    await user.click(screen.getByTestId('date-2025-06-10')); // Day 10 (range is 6 days, max is 3)
    expect(currentTestProps.onSelect).not.toHaveBeenCalled();

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Range cannot exceed 3 days');

    const { result: rangeAtom } = renderHook(() => useAtomValue(selectedRangeAtom));
    expect(rangeAtom.current?.from).toEqual(new Date(2025, 5, 5));
    expect(rangeAtom.current?.to).toBeUndefined();
  });

  it('clears validation error when a valid range is subsequently selected', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DualCalendar {...currentTestProps} min={3} startMonth={new Date(2025, 5, 1)} />);

    await user.click(screen.getByTestId('date-2025-06-05'));
    await user.click(screen.getByTestId('date-2025-06-06')); // Invalid (2 days)

    expect(await screen.findByRole('alert')).toHaveTextContent('Range must be at least 3 days');

    // Start new selection
    await user.click(screen.getByTestId('date-2025-06-10')); // New 'from'
    // Error should clear if new 'from' is selected, or remain until valid 'to'
    // Based on DualCalendar.tsx, error clears if !range.from || !range.to, or if valid.
    // Clicking a new 'from' resets the range, so error should clear.
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId('date-2025-06-15')); // Valid 'to' (6 days, min 3)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const { result: rangeAtom } = renderHook(() => useAtomValue(selectedRangeAtom));
    expect(rangeAtom.current?.from).toEqual(new Date(2025, 5, 10));
    expect(rangeAtom.current?.to).toEqual(new Date(2025, 5, 15));
  });

  it('applies spacing classes correctly based on spacing prop', () => {
    const { rerender } = render(<DualCalendar {...currentTestProps} spacing="md" />);
    // The DayPicker mock is inside a div.dual-calendar-grid. We need its parent.
    let gridHost = screen.getByTestId('mocked-daypicker').closest('.dual-calendar-grid');
    expect(gridHost).toHaveClass('gap-4'); // Default for md

    rerender(<DualCalendar {...currentTestProps} spacing="sm" />);
    gridHost = screen.getByTestId('mocked-daypicker').closest('.dual-calendar-grid');
    // As per DualCalendar.tsx, 'sm' and 'lg' fall through to default 'gap-4' if not explicitly handled
    // The provided DualCalendar.tsx has 'sm' and 'lg' cases empty, falling to default.
    expect(gridHost).toHaveClass('gap-4');

    rerender(<DualCalendar {...currentTestProps} spacing="lg" />);
    gridHost = screen.getByTestId('mocked-daypicker').closest('.dual-calendar-grid');
    expect(gridHost).toHaveClass('gap-4');
  });

  it('calls onNextClick and onPrevClick from DayPicker for month navigation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onMonthChangeMock = vi.fn(); // Passed to DualCalendar, then to DayPicker
    const onNextClickMock = vi.fn(); // Passed to DualCalendar, then to DayPicker
    const onPrevClickMock = vi.fn(); // Passed to DualCalendar, then to DayPicker

    render(
      <DualCalendar
        {...currentTestProps}
        startMonth={new Date(2025, 5, 1)} // June 2025
        onMonthChange={onMonthChangeMock} // This prop is on BaseCalendarProps
        onNextClick={onNextClickMock} // This prop is on BaseCalendarProps
        onPrevClick={onPrevClickMock} // This prop is on BaseCalendarProps
      />
    );

    expect(mockDayPicker).toHaveBeenCalled();
    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    // Check that DayPicker mock received these handlers from DualCalendar
    expect(callArgs.onMonthChange).toBe(onMonthChangeMock);
    // The mock itself uses props.onNextClick/onPrevClick to simulate button clicks
    // DualCalendar passes its onNextClick/onPrevClick props to DayPicker's onNextClick/onPrevClick

    const nextButton = screen.getByTestId('rdp-next-button');
    await user.click(nextButton);
    // The mock's button calls props.onNextClick, which is onNextClickMock
    expect(onNextClickMock).toHaveBeenCalledTimes(1);
    // The mock calls it with the last month of the current display (July 2025)
    expect(onNextClickMock).toHaveBeenCalledWith(new Date(2025, 6, 1));

    const prevButton = screen.getByTestId('rdp-prev-button');
    await user.click(prevButton);
    expect(onPrevClickMock).toHaveBeenCalledTimes(1);
    // The mock calls it with the first month of the current display (June 2025)
    expect(onPrevClickMock).toHaveBeenCalledWith(new Date(2025, 5, 1));
  });

  it('disables dates correctly based on "disabled" prop (array of dates)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const disabledDates = [new Date(2025, 5, 10), new Date(2025, 6, 15)];
    render(
      <DualCalendar
        {...currentTestProps}
        disabled={disabledDates}
        startMonth={new Date(2025, 5, 1)}
      />
    );

    // Check that DayPicker received the disabled prop
    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    expect(callArgs.disabled).toEqual(disabledDates);

    // Test disabled state in the mock's rendering
    expect(screen.getByTestId('date-2025-06-10')).toBeDisabled();
    expect(screen.getByTestId('date-2025-07-15')).toBeDisabled();
    expect(screen.getByTestId('date-2025-06-11')).not.toBeDisabled();

    await user.click(screen.getByTestId('date-2025-06-10'));
    expect(currentTestProps.onSelect).not.toHaveBeenCalled(); // DualCalendar's onSelect should not be called
  });

  it('disables dates correctly based on "disabled" prop (function)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // June 1, 2025 is Sunday. June 7 is Saturday.
    const disableWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    render(
      <DualCalendar
        {...currentTestProps}
        onSelect={vi.fn()} // Pass the local mock here
        disabled={disableWeekend}
        startMonth={new Date(2025, 5, 1)}
      />
    );

    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    expect(callArgs.disabled).toBe(disableWeekend);

    expect(screen.getByTestId('date-2025-06-01')).toBeDisabled(); // Sunday
    expect(screen.getByTestId('date-2025-06-07')).toBeDisabled(); // Saturday
    expect(screen.getByTestId('date-2025-06-02')).not.toBeDisabled(); // Monday

    await user.click(screen.getByTestId('date-2025-06-01'));
    expect(currentTestProps.onSelect).not.toHaveBeenCalled();
  });

  it('limits selection with DualCalendar startMonth and endMonth props (via DayPicker disabled prop)', () => {
    mockDayPicker.mockClear();
    const calendarStart = new Date(2025, 5, 5); // June 5
    const calendarEnd = new Date(2025, 6, 10); // July 10
    render(
      <DualCalendar
        {...currentTestProps}
        startMonth={calendarStart} // This sets the initial displayed month
        endMonth={calendarEnd} // This contributes to the disabled logic
      />
    );

    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    const rdpDisabledFn = callArgs.disabled as (date: Date) => boolean;

    // Dates passed to DualCalendar's startMonth/endMonth should make dates outside this range disabled
    // The isDateDisabled in DualCalendar.tsx implements this logic.
    expect(rdpDisabledFn(new Date(2025, 5, 4))).toBe(true); // Before calendarStart (June 4)
    expect(rdpDisabledFn(new Date(2025, 5, 5))).toBe(false); // On calendarStart (June 5)
    expect(rdpDisabledFn(new Date(2025, 6, 10))).toBe(false); // On calendarEnd (July 10)
    expect(rdpDisabledFn(new Date(2025, 6, 11))).toBe(true); // After calendarEnd (July 11)
  });

  it('initializes with defaultSelected range and displays corresponding months', () => {
    const defaultSelectedRange = { from: new Date(2025, 7, 10), to: new Date(2025, 7, 15) }; // August
    render(<DualCalendar {...currentTestProps} defaultSelected={defaultSelectedRange} />);

    expect(mockDayPicker).toHaveBeenCalled();
    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;

    // DualCalendar passes defaultSelected to DayPicker
    expect(callArgs.defaultSelected).toEqual(defaultSelectedRange);
    // The initial month for DayPicker should be derived from defaultSelected.from
    expect(format(callArgs.month!, 'yyyy-MM')).toBe('2025-08');
    expect(callArgs.numberOfMonths).toBe(2);
    // `selected` prop on DayPicker should be undefined initially if only defaultSelected is used
    // and DualCalendar uses its internal atom state, which is initially populated by defaultSelected.
    // The selectedRangeForDayPicker in DualCalendar will pick up defaultSelected via atom.
    expect(callArgs.selected?.from).toEqual(defaultSelectedRange.from);
    expect(callArgs.selected?.to).toEqual(defaultSelectedRange.to);

    expect(screen.getByTestId('month-caption-2025-08')).toHaveTextContent('August 2025');
    expect(screen.getByTestId('month-caption-2025-09')).toHaveTextContent('September 2025');
  });

  it('applies tabIndex to the main container', () => {
    render(<DualCalendar {...currentTestProps} tabIndex={0} />);
    const container = screen.getByRole('group');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('passes through DayPicker specific props like showOutsideDays, fixedWeeks, showWeekNumber', () => {
    render(
      <DualCalendar
        {...currentTestProps}
        showOutsideDays={false}
        fixedWeeks={false}
        showWeekNumber={true}
      />
    );
    expect(mockDayPicker).toHaveBeenCalled();
    const callArgs = mockDayPicker.mock.calls[0][0] as MockedDayPickerRangeProps;
    expect(callArgs.showOutsideDays).toBe(false);
    expect(callArgs.fixedWeeks).toBe(false);
    expect(callArgs.showWeekNumber).toBe(true);
  });
});
