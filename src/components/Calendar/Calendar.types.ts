import React from 'react';
import type { DateRange, Matcher } from 'react-day-picker';
import type { Optional, Nullable, BaseComponentProps, ReactChildren } from '@/types';

/**
 * Calendar mode types - defines the three distinct calendar modes
 */
export type CalendarMode = 'single' | 'range-single' | 'range-dual';

/**
 * Date selection types based on calendar mode
 */
export type SingleDateSelection = Date;
export type DateRangeSelection = DateRange;
export type CalendarSelection = SingleDateSelection | DateRangeSelection | undefined;

/**
 * Calendar state interface for managing selection and mode
 */
export interface CalendarState {
  readonly mode: CalendarMode;
  readonly selectedDate?: Optional<Date>;
  readonly selectedRange?: Optional<DateRange>;
  readonly isLoading?: Optional<boolean>;
  readonly error?: Optional<string>;
}

/**
 * Base calendar props extending react-day-picker's common props
 */
export interface BaseCalendarProps extends BaseComponentProps {
  // Date constraints (using v9.x API)
  readonly startMonth?: Optional<Date>;
  readonly endMonth?: Optional<Date>;
  readonly disabled?: Optional<Matcher | Matcher[]>;
  readonly hidden?: Optional<Matcher | Matcher[]>;

  // Calendar behavior
  readonly numberOfMonths?: Optional<number>;
  readonly showOutsideDays?: Optional<boolean>;
  readonly fixedWeeks?: Optional<boolean>;
  readonly showWeekNumber?: Optional<boolean>;

  // Styling and customization
  readonly classNames?: Optional<Record<string, string>>;
  readonly styles?: Optional<Record<string, React.CSSProperties>>;
  readonly modifiers?: Optional<Record<string, Matcher>>;
  readonly modifiersClassNames?: Optional<Record<string, string>>;
  readonly modifiersStyles?: Optional<Record<string, React.CSSProperties>>;

  // Accessibility
  readonly dir?: Optional<'ltr' | 'rtl'>;
  readonly lang?: Optional<string>;
  readonly autoFocus?: Optional<boolean>;
  readonly 'aria-label'?: Optional<string>;
  readonly 'aria-labelledby'?: Optional<string>;
  readonly 'aria-describedby'?: Optional<string>;
  readonly role?: Optional<string>;
  readonly tabIndex?: Optional<number>;

  // Event handlers
  readonly onMonthChange?: Optional<(month: Date) => void>;
  readonly onNextClick?: Optional<(month: Date) => void>;
  readonly onPrevClick?: Optional<(month: Date) => void>;
}

/**
 * Single date calendar props
 */
export interface SingleCalendarProps extends BaseCalendarProps {
  readonly mode: 'single';
  readonly selected?: Optional<Date>;
  readonly defaultSelected?: Optional<Date>;
  readonly onSelect?: Optional<(date: Date | undefined) => void>;
  readonly required?: Optional<boolean>;
}

/**
 * Range calendar props (single calendar view)
 */
export interface RangeCalendarProps extends BaseCalendarProps {
  readonly mode: 'range-single';
  readonly selected?: Optional<DateRange>;
  readonly defaultSelected?: Optional<DateRange>;
  readonly onSelect?: Optional<(range: DateRange | undefined) => void>;
  readonly min?: Optional<number>;
  readonly max?: Optional<number>;
}

/**
 * Dual calendar props (dual calendar view for range selection)
 */
export interface DualCalendarProps extends BaseCalendarProps {
  readonly mode: 'range-dual';
  readonly selected?: Optional<DateRange>;
  readonly defaultSelected?: Optional<DateRange>;
  readonly onSelect?: Optional<(range: DateRange | undefined) => void>;
  readonly min?: Optional<number>;
  readonly max?: Optional<number>;
  readonly spacing?: Optional<'sm' | 'md' | 'lg'>;
}

/**
 * Main Calendar component props - union of all calendar modes
 */
export type CalendarProps = SingleCalendarProps | RangeCalendarProps | DualCalendarProps;

/**
 * Calendar wrapper props for the main Calendar component
 */
export interface CalendarWrapperProps extends ReactChildren {
  readonly calendar: CalendarProps;
  readonly loading?: Optional<boolean>;
  readonly error?: Optional<string>;
  readonly onError?: Optional<(error: string) => void>;
  readonly onClear?: Optional<() => void>;
  readonly showClearButton?: Optional<boolean>;
  readonly clearButtonText?: Optional<string>;
  readonly className?: Optional<string>;
}

/**
 * Calendar context type for sharing state between calendar components
 */
export interface CalendarContextValue {
  readonly state: CalendarState;
  readonly updateState: (updates: Partial<CalendarState>) => void;
  readonly clearSelection: () => void;
  readonly isDateSelected: (date: Date) => boolean;
  readonly isDateInRange: (date: Date) => boolean;
  readonly isRangeComplete: () => boolean;
}

/**
 * Calendar utilities interface for date operations
 */
export interface CalendarUtils {
  readonly formatDate: (date: Date, format?: string) => string;
  readonly parseDate: (dateString: string, format?: string) => Nullable<Date>;
  readonly isValidDate: (date: unknown) => date is Date;
  readonly isDateInPast: (date: Date) => boolean;
  readonly isDateInFuture: (date: Date) => boolean;
  readonly getDaysBetween: (start: Date, end: Date) => number;
  readonly addDays: (date: Date, days: number) => Date;
  readonly subtractDays: (date: Date, days: number) => Date;
  readonly startOfDay: (date: Date) => Date;
  readonly endOfDay: (date: Date) => Date;
  readonly isSameDay: (date1: Date, date2: Date) => boolean;
  readonly isWeekend: (date: Date) => boolean;
}

/**
 * Calendar validation result
 */
export interface CalendarValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Calendar theme configuration
 */
export interface CalendarTheme {
  readonly primary: string;
  readonly secondary: string;
  readonly background: string;
  readonly foreground: string;
  readonly muted: string;
  readonly accent: string;
  readonly destructive: string;
  readonly border: string;
  readonly input: string;
  readonly ring: string;
}

/**
 * Calendar configuration for different modes
 */
export interface CalendarConfig {
  readonly defaultMode: CalendarMode;
  readonly allowModeSwitch: boolean;
  readonly theme: CalendarTheme;
  readonly dateFormat: string;
  readonly weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly showWeekNumbers: boolean;
  readonly numberOfMonths: number;
  readonly fixedWeeks: boolean;
  readonly showOutsideDays: boolean;
}

/**
 * Hook props interface for useCalendar
 */
export interface UseCalendarProps {
  readonly mode?: Optional<CalendarMode>;
  readonly initialDate?: Optional<Date>;
  readonly initialRange?: Optional<DateRange>;
  readonly onDateSelect?: Optional<(date: Date | undefined) => void>;
  readonly onRangeSelect?: Optional<(range: DateRange | undefined) => void>;
  readonly onModeChange?: Optional<(mode: CalendarMode) => void>;
  readonly validate?: Optional<boolean>;
}

/**
 * Hook return interface for useCalendar - follows project patterns
 */
export interface UseCalendarReturn {
  // State
  readonly mode: CalendarMode;
  readonly config: CalendarConfig;
  readonly loading: boolean;
  readonly error: Nullable<string>;

  // Selection
  readonly selectedDate: Nullable<Date>;
  readonly selectedRange: Nullable<DateRange>;
  readonly currentSelection: Nullable<CalendarSelection>;
  readonly hasSelection: boolean;
  readonly isValidSelection: boolean;
  readonly isRangeComplete: boolean;

  // Validation
  readonly validation: CalendarValidationResult;

  // Actions
  readonly actions: {
    readonly selectDate: (date: Date | undefined) => void;
    readonly selectRange: (range: DateRange | undefined) => void;
    readonly changeMode: (mode: CalendarMode) => void;
    readonly clear: () => void;
  };
}
