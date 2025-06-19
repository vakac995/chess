import React from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { useAtom, useAtomValue } from 'jotai';
import { isBefore, isAfter } from 'date-fns';
import {
  selectedRangeAtom,
  selectDateRangeAtom,
  calendarConfigAtom,
  isRangeCompleteAtom,
} from '@/atoms';
import type { DualCalendarProps } from './Calendar.types';
import {
  validateCalendarProps,
  getStandardizedDayPickerClasses,
  mergeAccessibilityProps,
  createCalendarClasses,
  validateCalendarState,
} from './Calendar.utils';
import { WarningInfo } from './WarningInfo';

/**
 * Dual calendar component for range selection with proper accessibility and validation
 * Shows two calendars side by side for easier range selection across months
 * Supports comprehensive prop forwarding, validation, and WCAG 2.1 AA compliance
 */
export const DualCalendar = React.forwardRef<HTMLDivElement, DualCalendarProps>((props, ref) => {
  // Validate props at the top
  const validation = validateCalendarProps(props);

  // All hooks and prop destructuring must be at the top
  const [, selectRange] = useAtom(selectDateRangeAtom);
  const currentSelection = useAtomValue(selectedRangeAtom);
  const config = useAtomValue(calendarConfigAtom);
  const isRangeComplete = useAtomValue(isRangeCompleteAtom);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const warnings = validation.warnings;
  const {
    selected,
    defaultSelected,
    onSelect,
    min,
    max,
    spacing = 'md',
    className,
    classNames,
    styles,
    startMonth,
    endMonth,
    disabled,
    hidden,
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
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    role: _role,
    tabIndex,
    mode: _,
    ...restProps
  } = props;

  // Use controlled selection if provided, otherwise use atom state
  const selectedRange = selected ?? currentSelection;

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
      console.warn('DualCalendar validation warnings:', warnings);
    }
  }, [warnings]);

  // Enhanced range validation with error feedback
  const validateRange = React.useCallback(
    (range: DateRange | undefined): DateRange | undefined => {
      if (!range?.from || !range?.to) {
        setValidationError(null);
        return range;
      }

      const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (min !== undefined && diffDays < min) {
        setValidationError(`Range must be at least ${min} day${min !== 1 ? 's' : ''}`);
        return undefined;
      }
      if (max !== undefined && diffDays > max) {
        setValidationError(`Range cannot exceed ${max} day${max !== 1 ? 's' : ''}`);
        return undefined;
      }

      setValidationError(null);
      return range;
    },
    [min, max]
  );

  const handleRangeSelect = React.useCallback(
    (range: DateRange | undefined) => {
      const validatedRange = validateRange(range);
      if (validatedRange !== undefined) {
        selectRange(validatedRange);
        onSelect?.(validatedRange);
      }
    },
    [selectRange, onSelect, validateRange]
  );

  // Build disabled date function
  const isDateDisabled = React.useCallback(
    (date: Date): boolean => {
      if (startMonth && isBefore(date, startMonth)) return true;
      if (endMonth && isAfter(date, endMonth)) return true;

      if (typeof disabled === 'function') return disabled(date);
      if (disabled instanceof Date) return disabled.getTime() === date.getTime();
      if (Array.isArray(disabled)) {
        return disabled.some(d => {
          if (d instanceof Date) return d.getTime() === date.getTime();
          if (typeof d === 'function') return d(date);
          return false;
        });
      }

      return false;
    },
    [disabled, startMonth, endMonth]
  );

  // Generate unique IDs for accessibility
  const errorId = React.useId();
  const statusId = React.useId();
  const constraintsId = React.useId();

  // Merge accessibility props with defaults
  const accessibilityProps = React.useMemo(() => {
    return mergeAccessibilityProps(
      {
        'aria-label': ariaLabel ?? 'Dual range calendar',
        'aria-labelledby': ariaLabelledBy,
        'aria-describedby': [ariaDescribedBy, statusId, constraintsId].filter(Boolean).join(' '),
        role: 'group',
      },
      'range-dual'
    );
  }, [ariaLabel, ariaLabelledBy, ariaDescribedBy, statusId, constraintsId]);

  // Create standardized CSS classes
  const containerClasses = React.useMemo(() => {
    const baseClasses = createCalendarClasses('range-dual', 'default');
    return className ? `${baseClasses} ${className}` : baseClasses;
  }, [className]);

  // Get standardized DayPicker classes
  const dayPickerClasses = React.useMemo(() => {
    const standardClasses = getStandardizedDayPickerClasses();
    return classNames ? { ...standardClasses, ...classNames } : standardClasses;
  }, [classNames]);

  // Calculate selected days count
  const selectedDaysCount = React.useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) return 0;
    const diffTime = Math.abs(selectedRange.to.getTime() - selectedRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [selectedRange]);

  // Spacing classes for dual calendar layout
  const spacingClasses = React.useMemo(() => {
    switch (spacing) {
      case 'sm':
        return 'gap-2';
      case 'lg':
        return 'gap-8';
      default:
        return 'gap-4';
    }
  }, [spacing]);

  // Calculate default months for dual display
  const today = new Date();
  const defaultMonth = defaultSelected?.from || selectedRange?.from || today;
  const secondMonth = new Date(defaultMonth.getFullYear(), defaultMonth.getMonth() + 1, 1);

  // State validation
  const [stateValidation, setStateValidation] = React.useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  React.useEffect(() => {
    const state = { mode: 'range-dual' as const, selectedDate: undefined, selectedRange };
    const result = validateCalendarState(state);
    setStateValidation({ isValid: result.isValid, errors: result.errors as string[] });
    if (!result.isValid && process.env.NODE_ENV === 'development') {
      console.error('Calendar state validation error:', result.errors);
    }
  }, [selectedRange]);

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

  // Handle validation errors after all hooks
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

  return (
    <div ref={ref} className={containerClasses} tabIndex={tabIndex} {...accessibilityProps}>
      {/* Show warnings if any */}
      <WarningInfo warnings={warnings} />

      {/* Error message display */}
      {validationError && (
        <div
          id={errorId}
          className="bg-destructive/10 border-destructive/20 mb-4 rounded-md border p-3"
          role="alert"
          aria-live="polite"
        >
          <p className="text-destructive text-sm font-medium">{validationError}</p>
        </div>
      )}

      {/* Dual calendar layout */}
      <div className={`dual-calendar-grid flex flex-col md:flex-row ${spacingClasses}`}>
        {/* First calendar */}
        <div className="calendar-month flex-1">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelect}
            month={defaultMonth}
            disabled={isDateDisabled}
            hidden={hidden}
            numberOfMonths={1}
            showOutsideDays={showOutsideDays}
            fixedWeeks={fixedWeeks}
            showWeekNumber={showWeekNumber}
            weekStartsOn={config.weekStartsOn}
            classNames={dayPickerClasses}
            styles={styles}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            modifiersStyles={modifiersStyles}
            dir={dir}
            lang={lang}
            autoFocus={autoFocus}
            onMonthChange={onMonthChange}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            aria-label="First month of range selection"
            {...restProps}
          />
        </div>

        {/* Second calendar */}
        <div className="calendar-month flex-1">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelect}
            month={secondMonth}
            disabled={isDateDisabled}
            hidden={hidden}
            numberOfMonths={1}
            showOutsideDays={showOutsideDays}
            fixedWeeks={fixedWeeks}
            showWeekNumber={showWeekNumber}
            weekStartsOn={config.weekStartsOn}
            classNames={dayPickerClasses}
            styles={styles}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            modifiersStyles={modifiersStyles}
            dir={dir}
            lang={lang}
            onMonthChange={onMonthChange}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            aria-label="Second month of range selection"
            {...restProps}
          />
        </div>
      </div>

      {/* Range information and status */}
      <div className="mt-4 space-y-2">
        {/* Live region for selection status */}
        <div id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
          {selectedRange?.from &&
            !selectedRange?.to &&
            'Start date selected. Please select an end date.'}
          {isRangeComplete && selectedDaysCount > 0 && `${selectedDaysCount} days selected`}
        </div>

        {/* Visual selection status */}
        {selectedRange?.from && !selectedRange?.to && (
          <p className="text-muted-foreground text-center text-sm" aria-hidden="true">
            Start date selected. Please select an end date.
          </p>
        )}

        {/* Selected range info */}
        {isRangeComplete && (
          <div className="text-center" aria-hidden="true">
            <p className="text-sm font-medium">
              {selectedDaysCount} day{selectedDaysCount !== 1 ? 's' : ''} selected
            </p>
            {selectedRange?.from && selectedRange?.to && (
              <p className="text-muted-foreground text-xs">
                {selectedRange.from.toLocaleDateString()} - {selectedRange.to.toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Constraint information */}
        {(min !== undefined || max !== undefined) && (
          <div
            id={constraintsId}
            className="text-muted-foreground text-center text-xs"
            aria-label="Range constraints"
          >
            {min !== undefined && max !== undefined && (
              <p>
                Select between {min} and {max} days
              </p>
            )}
            {min !== undefined && max === undefined && (
              <p>
                Select at least {min} day{min !== 1 ? 's' : ''}
              </p>
            )}
            {min === undefined && max !== undefined && (
              <p>
                Select at most {max} day{max !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

DualCalendar.displayName = 'DualCalendar';
