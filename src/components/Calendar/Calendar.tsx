import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import clsx from 'clsx';
import {
  calendarAtom,
  calendarModeAtom,
  calendarErrorAtom,
  calendarLoadingAtom,
  clearCalendarSelectionAtom,
} from '@/atoms';
import type { CalendarProps, CalendarWrapperProps } from './Calendar.types';
import {
  validateCalendarProps,
  mergeAccessibilityProps,
  createCalendarClasses,
} from './Calendar.utils';
import { SingleCalendar } from './SingleCalendar';
import { RangeCalendar } from './RangeCalendar';
import { DualCalendar } from './DualCalendar';

/**
 * Main Calendar component that renders different calendar modes
 * Supports single date, range-single, and range-dual selection modes
 * Includes prop validation and accessibility features
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  const modeFromAtom = useAtomValue(calendarModeAtom);
  const effectiveMode = props.mode || modeFromAtom; // Use props.mode if available, else atom
  const error = useAtomValue(calendarErrorAtom);
  const loading = useAtomValue(calendarLoadingAtom);

  // Create a separate ref for output elements to maintain type safety
  const outputRef = React.useRef<HTMLOutputElement>(null);

  // Validate props before rendering (props.mode is used here by validateCalendarProps)
  const validation = React.useMemo(() => validateCalendarProps(props), [props]);

  // Log validation warnings in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
      console.warn('Calendar validation warnings:', validation.warnings);
    }
  }, [validation.warnings]);

  // Merge user-provided accessibility props with defaults
  const accessibilityProps = React.useMemo(
    () =>
      mergeAccessibilityProps(
        {
          'aria-label': props['aria-label'],
          'aria-labelledby': props['aria-labelledby'],
          'aria-describedby': props['aria-describedby'],
          role: props.role,
        },
        effectiveMode // Use effectiveMode
      ),
    [props, effectiveMode]
  );

  // Get standardized CSS classes
  const calendarClasses = React.useMemo(
    () => ({
      root: clsx(createCalendarClasses(effectiveMode, 'default'), props.className), // Use effectiveMode
    }),
    [effectiveMode, props.className]
  );

  // Handle validation errors
  if (!validation.isValid) {
    return (
      <div
        ref={ref}
        className="calendar-validation-error border-destructive bg-destructive/10 rounded-lg border p-4"
        role="alert"
        aria-live="polite"
      >
        <h3 className="text-destructive mb-2 text-sm font-medium">Calendar Configuration Error</h3>
        <ul className="text-destructive/80 space-y-1">
          {validation.errors.map((error, index) => (
            <li key={`error-${error.slice(0, 20)}-${index}`} className="text-sm">
              • {error}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div
        ref={ref}
        className="calendar-error border-destructive bg-destructive/10 rounded-lg border p-4"
        role="alert"
        aria-live="polite"
      >
        <h3 className="text-destructive mb-2 text-sm font-medium">Calendar Error</h3>
        <p className="text-destructive/80 text-sm">
          {typeof error === 'string' ? error : error.message}
        </p>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <output
        ref={outputRef}
        className="calendar-loading border-border bg-muted/50 rounded-lg border p-4"
        aria-live="polite"
        aria-label="Loading calendar"
      >
        <div className="flex items-center justify-center">
          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
          <span className="text-muted-foreground ml-2 text-sm">Loading calendar...</span>
        </div>
      </output>
    );
  }

  // Common props to pass to all calendar variants
  const commonProps = {
    ...props, // Spread all original props, including props.mode
    ...accessibilityProps,
    className: calendarClasses.root,
    ref,
  };

  // Render appropriate calendar based on effectiveMode
  switch (
    effectiveMode // Use effectiveMode
  ) {
    case 'single':
      return <SingleCalendar {...(commonProps as Extract<CalendarProps, { mode: 'single' }>)} />;

    case 'range-single':
      return (
        <RangeCalendar {...(commonProps as Extract<CalendarProps, { mode: 'range-single' }>)} />
      );

    case 'range-dual':
      return <DualCalendar {...(commonProps as Extract<CalendarProps, { mode: 'range-dual' }>)} />;

    default:
      return (
        <div
          ref={ref}
          className="calendar-error border-destructive bg-destructive/10 rounded-lg border p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="text-destructive text-sm">Invalid calendar mode: {effectiveMode}</p>{' '}
          {/* Use effectiveMode */}
        </div>
      );
  }
});

Calendar.displayName = 'Calendar';

/**
 * Calendar wrapper component with additional features like clear button and error handling
 */
export const CalendarWrapper: React.FC<CalendarWrapperProps> = ({
  calendar,
  loading,
  error,
  onError: _onError,
  onClear,
  showClearButton = true,
  clearButtonText = 'Clear',
  className,
  children,
  ...props
}) => {
  const [, clearSelection] = useAtom(clearCalendarSelectionAtom);
  const calendarState = useAtomValue(calendarAtom);

  const handleClear = React.useCallback(() => {
    clearSelection();
    onClear?.();
  }, [clearSelection, onClear]);

  const hasSelection = React.useMemo(() => {
    return !!(calendarState.selectedDate || calendarState.selectedRange?.from);
  }, [calendarState.selectedDate, calendarState.selectedRange]);

  return (
    <div className={clsx('calendar-wrapper', 'space-y-4', className)} {...props}>
      {/* Error message */}
      {error && (
        <div className="calendar-wrapper-error border-destructive bg-destructive/10 rounded-md border p-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Calendar component */}
      <div className="calendar-container">
        <Calendar {...calendar} />
      </div>

      {/* Clear button */}
      {showClearButton && hasSelection && (
        <div className="calendar-actions flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className={clsx(
              'px-3 py-1.5 text-sm font-medium',
              'text-muted-foreground hover:text-foreground',
              'border-border rounded-md border',
              'hover:bg-muted/50 transition-colors',
              'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none'
            )}
          >
            {clearButtonText}
          </button>
        </div>
      )}

      {/* Additional content */}
      {children}

      {/* Loading overlay */}
      {loading && (
        <div className="calendar-loading-overlay bg-background/50 absolute inset-0 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
            <span className="text-muted-foreground text-sm">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

CalendarWrapper.displayName = 'CalendarWrapper';
