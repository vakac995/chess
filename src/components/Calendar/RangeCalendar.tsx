import React from 'react';
import { DayPicker } from 'react-day-picker';
import { useAtom, useAtomValue } from 'jotai';
import type { DateRange } from 'react-day-picker';
import {
  selectedRangeAtom,
  selectDateRangeAtom,
  calendarConfigAtom,
  isRangeCompleteAtom,
} from '@/atoms';
import type { RangeCalendarProps } from './Calendar.types';
import {
  validateCalendarProps,
  getStandardizedDayPickerClasses,
  mergeAccessibilityProps,
  validateCalendarState,
} from './Calendar.utils';
import { WarningInfo } from './WarningInfo';

/**
 * Range selection calendar component (single calendar view)
 * Uses react-day-picker in range selection mode with a single calendar
 * Includes proper accessibility and validation features
 */
export const RangeCalendar = React.forwardRef<HTMLDivElement, RangeCalendarProps>((props, ref) => {
  // Validate props at the top
  const validation = validateCalendarProps(props);
  // All hooks and prop destructuring must be at the top
  const [, selectRange] = useAtom(selectDateRangeAtom);
  const currentSelection = useAtomValue(selectedRangeAtom);
  const config = useAtomValue(calendarConfigAtom);
  const isRangeComplete = useAtomValue(isRangeCompleteAtom);
  const warnings = validation.warnings;
  const {
    selected,
    defaultSelected,
    onSelect,
    min,
    max,
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
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    role: _role,
    tabIndex,
    mode: _,
    ...restProps
  } = props;

  // Use controlled selection if provided, otherwise use atom state
  const currentEffectiveSelection = selected ?? currentSelection;

  // Defensive copy for DayPicker
  const dayPickerSelectedProp = currentEffectiveSelection
    ? {
        from: currentEffectiveSelection.from
          ? new Date(
              currentEffectiveSelection.from.getFullYear(),
              currentEffectiveSelection.from.getMonth(),
              currentEffectiveSelection.from.getDate()
            )
          : undefined,
        to: currentEffectiveSelection.to
          ? new Date(
              currentEffectiveSelection.to.getFullYear(),
              currentEffectiveSelection.to.getMonth(),
              currentEffectiveSelection.to.getDate()
            )
          : undefined,
      }
    : undefined;

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
      console.warn('RangeCalendar validation warnings:', warnings);
    }
  }, [warnings]);

  const handleRangeSelect = React.useCallback(
    (proposedRange: DateRange | undefined, clickedDate: Date) => {
      let rangeToUpdate: DateRange | undefined = proposedRange;
      if (proposedRange?.from && proposedRange?.to) {
        const from = proposedRange.from < proposedRange.to ? proposedRange.from : proposedRange.to;
        const to = proposedRange.from < proposedRange.to ? proposedRange.to : proposedRange.from;
        const diffTime = Math.abs(to.getTime() - from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if ((min !== undefined && diffDays < min) || (max !== undefined && diffDays > max)) {
          rangeToUpdate = { from: clickedDate, to: clickedDate };
        }
      }
      selectRange(rangeToUpdate);
      onSelect?.(rangeToUpdate);
    },
    [selectRange, onSelect, min, max]
  );

  const calendarClassNames = React.useMemo(() => {
    const standardClasses = getStandardizedDayPickerClasses();
    const rootClasses = [standardClasses.root];
    if (classNames?.root) rootClasses.push(classNames.root);
    if (className) rootClasses.push(className);
    return {
      ...standardClasses,
      ...classNames,
      root: rootClasses.join(' ').trim(),
    };
  }, [className, classNames]);

  const calendarStyles = React.useMemo(
    () => ({
      root: { margin: 0 },
      ...styles,
    }),
    [styles]
  );

  const accessibilityProps = React.useMemo(() => {
    const baseProps = {
      'aria-label': ariaLabel ?? 'Select a date range',
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby':
        ariaDescribedBy ?? (!isRangeComplete ? 'range-incomplete-hint' : undefined),
    };
    return mergeAccessibilityProps(baseProps, 'range-single');
  }, [ariaLabel, ariaLabelledBy, ariaDescribedBy, isRangeComplete]);

  const selectedDaysCount = React.useMemo(() => {
    if (!currentEffectiveSelection?.from || !currentEffectiveSelection?.to) return 0;
    const diffTime = Math.abs(
      currentEffectiveSelection.to.getTime() - currentEffectiveSelection.from.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [currentEffectiveSelection]);

  // State validation
  const [stateValidation, setStateValidation] = React.useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  React.useEffect(() => {
    const state = {
      mode: 'range-single' as const,
      selectedDate: undefined,
      selectedRange: currentEffectiveSelection,
    };
    const result = validateCalendarState(state);
    setStateValidation({ isValid: result.isValid, errors: result.errors as string[] });
    if (!result.isValid && process.env.NODE_ENV === 'development') {
      console.error('Calendar state validation error:', result.errors);
    }
  }, [currentEffectiveSelection]);

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
    <div
      ref={ref}
      className={`range-calendar-container ${className ?? ''}`.trim()}
      tabIndex={tabIndex}
      {...accessibilityProps}
    >
      {/* Show warnings if any */}
      <WarningInfo warnings={warnings} />
      <DayPicker
        mode="range"
        selected={dayPickerSelectedProp}
        onSelect={handleRangeSelect}
        defaultMonth={defaultSelected?.from}
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
      {/* Range selection status */}
      {currentEffectiveSelection?.from && !currentEffectiveSelection?.to && (
        <div className="mt-2">
          <p className="text-muted-foreground text-xs" id="range-incomplete-hint">
            Select end date to complete range
          </p>
        </div>
      )}
      {/* Selected range info */}
      {isRangeComplete && (
        <div className="mt-2">
          <p className="text-muted-foreground text-xs">
            {selectedDaysCount} day{selectedDaysCount !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
      {/* Range constraints info */}
      {!isRangeComplete && (min !== undefined || max !== undefined) && (
        <div className="mt-2 space-y-1">
          {min !== undefined && max !== undefined && (
            <p className="text-muted-foreground text-xs" data-testid="min-max-constraint-message">
              Select between {min} and {max} days
            </p>
          )}
          {min !== undefined && max === undefined && (
            <p className="text-muted-foreground text-xs" data-testid="min-constraint-message">
              Select at least {min} day{min !== 1 ? 's' : ''}
            </p>
          )}
          {min === undefined && max !== undefined && (
            <p className="text-muted-foreground text-xs" data-testid="max-constraint-message">
              Select at most {max} day{max !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

RangeCalendar.displayName = 'RangeCalendar';
