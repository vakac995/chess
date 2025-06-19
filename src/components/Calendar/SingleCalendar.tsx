import React from 'react';
import { DayPicker } from 'react-day-picker';
import { useAtom, useAtomValue } from 'jotai';
import { selectedDateAtom, selectSingleDateAtom, calendarConfigAtom } from '@/atoms';
import type { SingleCalendarProps } from './Calendar.types';
import {
  validateCalendarProps,
  getStandardizedDayPickerClasses,
  validateCalendarState,
} from './Calendar.utils';
import { WarningInfo } from './WarningInfo';

/**
 * Single date selection calendar component
 * Uses react-day-picker in single selection mode with proper accessibility and validation
 */
export const SingleCalendar = React.forwardRef<HTMLDivElement, SingleCalendarProps>(
  (props, ref) => {
    // Validate props at the top
    const validation = validateCalendarProps(props);

    // All hooks must be called before any early return
    const [, selectDate] = useAtom(selectSingleDateAtom);
    const currentSelection = useAtomValue(selectedDateAtom);
    const config = useAtomValue(calendarConfigAtom);

    // Show warnings if any
    const warnings = validation.warnings;

    // Destructure props only after validation
    const {
      selected,
      defaultSelected,
      onSelect,
      required = false,
      className,
      classNames,
      styles,
      startMonth,
      endMonth,
      disabled,
      hidden,
      numberOfMonths = 1,
      showOutsideDays = true,
      fixedWeeks = true,
      showWeekNumber = false,
      modifiers,
      modifiersClassNames,
      modifiersStyles,
      dir,
      lang,
      autoFocus,
      onMonthChange,
      onNextClick,
      onPrevClick,
      // Accessibility props
      'aria-label': _ariaLabel,
      'aria-labelledby': _ariaLabelledBy,
      'aria-describedby': _ariaDescribedBy,
      role: _role, // Don't pass role to DayPicker as it has specific role requirements
      tabIndex: _tabIndex,
      mode = 'single',
      ...restProps
    } = props;

    // Use controlled selection if provided, otherwise use atom state
    const selectedDate = selected ?? currentSelection;

    const handleDateSelect = React.useCallback(
      (date: Date | undefined) => {
        // Update atom state
        selectDate(date);

        // Call external handler if provided
        onSelect?.(date);
      },
      [selectDate, onSelect]
    );

    // Enhanced class names using standardized classes
    const calendarClassNames = React.useMemo(() => {
      const standardClasses = getStandardizedDayPickerClasses();
      return {
        ...standardClasses,
        ...classNames,
        root: `${standardClasses.root} ${className ?? ''}`.trim(),
      };
    }, [className, classNames]);

    // Enhanced styles
    const calendarStyles = React.useMemo(
      () => ({
        root: {
          margin: 0,
        },
        ...styles,
      }),
      [styles]
    );

    // Determine the default month to display
    const defaultMonth = React.useMemo(() => {
      return defaultSelected || selectedDate || new Date();
    }, [defaultSelected, selectedDate]);

    // Validate props (development only warnings)
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
        console.warn('SingleCalendar validation warnings:', warnings);
      }
    }, [warnings]);

    // State validation
    const [stateValidation, setStateValidation] = React.useState<{
      isValid: boolean;
      errors: string[];
    }>({ isValid: true, errors: [] });

    React.useEffect(() => {
      const state = { mode, selectedDate, selectedRange: undefined };
      const result = validateCalendarState(state);
      setStateValidation({ isValid: result.isValid, errors: result.errors as string[] });
      if (!result.isValid && process.env.NODE_ENV === 'development') {
        console.error('Calendar state validation error:', result.errors);
      }
    }, [mode, selectedDate]);

    // Handle validation errors after all hooks
    if (!validation.isValid) {
      return (
        <div
          ref={ref}
          className="calendar-validation-error border-destructive bg-destructive/10 rounded-lg border p-4"
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-destructive mb-2 text-sm font-medium">
            Calendar Configuration Error
          </h3>
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

    if (!stateValidation.isValid) {
      return (
        <div
          ref={ref}
          className="calendar-validation-error border-destructive bg-destructive/10 rounded-lg border p-4"
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-destructive mb-2 text-sm font-medium">Calendar State Error</h3>
          <ul className="text-destructive/80 space-y-1">
            {stateValidation.errors.map((error, index) => (
              <li key={`state-error-${String(error).slice(0, 20)}-${index}`} className="text-sm">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div ref={ref} className={className}>
        {/* Show warnings if any */}
        <WarningInfo warnings={warnings} />
        <DayPicker
          mode={mode}
          selected={selectedDate}
          onSelect={handleDateSelect}
          defaultMonth={defaultMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabled}
          hidden={hidden}
          numberOfMonths={numberOfMonths}
          showOutsideDays={showOutsideDays}
          fixedWeeks={fixedWeeks}
          showWeekNumber={showWeekNumber}
          weekStartsOn={config.weekStartsOn}
          classNames={calendarClassNames}
          styles={calendarStyles}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          modifiersStyles={modifiersStyles}
          dir={dir}
          lang={lang}
          autoFocus={autoFocus}
          onMonthChange={onMonthChange}
          onPrevClick={onPrevClick}
          onNextClick={onNextClick}
          {...restProps}
        />

        {/* Accessibility helper text */}
        {required && !selectedDate && (
          <div className="mt-2">
            <p className="text-muted-foreground text-xs" id="calendar-required-hint">
              Date selection is required
            </p>
          </div>
        )}
      </div>
    );
  }
);

SingleCalendar.displayName = 'SingleCalendar';
