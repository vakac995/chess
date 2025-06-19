import React from 'react';
import { isBefore, isAfter, isValid, format, parse } from 'date-fns';
import clsx from 'clsx';
import type {
  CalendarProps,
  CalendarValidationResult,
  CalendarUtils,
  CalendarMode,
  CalendarState,
  SingleCalendarProps,
  RangeCalendarProps,
  DualCalendarProps,
} from './Calendar.types';

/**
 * Validates single calendar mode props
 */
function validateSingleModeProps(props: SingleCalendarProps, errors: string[]): void {
  if (props.selected && !isValid(props.selected)) {
    errors.push('Selected date is not a valid date');
  }
  if (props.defaultSelected && !isValid(props.defaultSelected)) {
    errors.push('Default selected date is not a valid date');
  }
}

/**
 * Validates range calendar mode props
 */
function validateRangeModeProps(
  props: RangeCalendarProps | DualCalendarProps,
  errors: string[]
): void {
  validateSelectedRange(props, errors);
  validateRangeConstraints(props, errors);
}

/**
 * Validates selected range in range mode
 */
function validateSelectedRange(
  props: RangeCalendarProps | DualCalendarProps,
  errors: string[]
): void {
  if (props.selected) {
    if (props.selected.from && !isValid(props.selected.from)) {
      errors.push('Selected range start date is not valid');
    }
    if (props.selected.to && !isValid(props.selected.to)) {
      errors.push('Selected range end date is not valid');
    }
    if (
      props.selected.from &&
      props.selected.to &&
      isAfter(props.selected.from, props.selected.to)
    ) {
      errors.push('Range start date cannot be after end date');
    }
  }
}

/**
 * Validates range constraints (min/max days)
 */
function validateRangeConstraints(
  props: RangeCalendarProps | DualCalendarProps,
  errors: string[]
): void {
  if (props.min !== undefined && props.min < 0) {
    errors.push('Minimum range days cannot be negative');
  }
  if (props.max !== undefined && props.max < 0) {
    errors.push('Maximum range days cannot be negative');
  }
  if (props.min !== undefined && props.max !== undefined && props.min > props.max) {
    errors.push('Minimum range days cannot be greater than maximum');
  }
}

/**
 * Validates date constraint props
 */
function validateDateConstraints(props: CalendarProps, errors: string[]): void {
  if (props.startMonth && props.endMonth && isAfter(props.startMonth, props.endMonth)) {
    errors.push('Start month cannot be after end month');
  }
}

/**
 * Validates behavioral props
 */
function validateBehavioralProps(props: CalendarProps, errors: string[], warnings: string[]): void {
  if (props.numberOfMonths !== undefined) {
    if (props.numberOfMonths < 1) {
      errors.push('Number of months must be at least 1');
    }
    if (props.numberOfMonths > 12) {
      warnings.push('Number of months greater than 12 may affect performance');
    }
  }
}

/**
 * Validates accessibility props
 */
function validateAccessibilityProps(props: CalendarProps, warnings: string[]): void {
  if (!props['aria-label'] && !props['aria-labelledby']) {
    warnings.push('Calendar should have aria-label or aria-labelledby for accessibility');
  }
}

/**
 * Validates calendar props and returns validation result
 */
export function validateCalendarProps(props: CalendarProps): CalendarValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  // Mode-specific validation
  switch (props.mode) {
    case 'single': {
      validateSingleModeProps(props, errors);
      break;
    }
    case 'range-single':
    case 'range-dual': {
      validateRangeModeProps(props, errors);
      break;
    }
  }

  // Validate other aspects
  validateDateConstraints(props, errors);
  validateBehavioralProps(props, errors, warnings);
  validateAccessibilityProps(props, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates calendar state for consistency
 */
export function validateCalendarState(state: CalendarState): CalendarValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check mode consistency
  if (state.mode === 'single' && state.selectedRange) {
    errors.push('Single mode should not have selectedRange');
  }
  if ((state.mode === 'range-single' || state.mode === 'range-dual') && state.selectedDate) {
    errors.push('Range modes should not have selectedDate');
  }

  // Validate selected dates
  if (state.selectedDate && !isValid(state.selectedDate)) {
    errors.push('Selected date is not valid');
  }
  if (state.selectedRange) {
    if (state.selectedRange.from && !isValid(state.selectedRange.from)) {
      errors.push('Selected range start date is not valid');
    }
    if (state.selectedRange.to && !isValid(state.selectedRange.to)) {
      errors.push('Selected range end date is not valid');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Creates calendar utilities for date operations
 */
export function createCalendarUtils(): CalendarUtils {
  return {
    formatDate: (date: Date, formatStr = 'yyyy-MM-dd') => {
      try {
        return format(date, formatStr);
      } catch {
        return '';
      }
    },

    parseDate: (dateString: string, formatStr = 'yyyy-MM-dd') => {
      try {
        const parsed = parse(dateString, formatStr, new Date());
        return isValid(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    isValidDate: (date: unknown): date is Date => {
      return date instanceof Date && isValid(date);
    },

    isDateInPast: (date: Date) => {
      return isBefore(date, new Date());
    },

    isDateInFuture: (date: Date) => {
      return isAfter(date, new Date());
    },

    getDaysBetween: (start: Date, end: Date) => {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    addDays: (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },

    subtractDays: (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    },

    startOfDay: (date: Date) => {
      const result = new Date(date);
      result.setHours(0, 0, 0, 0);
      return result;
    },

    endOfDay: (date: Date) => {
      const result = new Date(date);
      result.setHours(23, 59, 59, 999);
      return result;
    },

    isSameDay: (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    },

    isWeekend: (date: Date) => {
      const day = date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    },
  };
}

/**
 * Gets default accessibility props for calendar components
 */
export function getDefaultAccessibilityProps(mode: CalendarMode) {
  const ariaLabel = mode === 'single' ? 'Date picker calendar' : getDateRangePickerLabel(mode);

  const baseProps = {
    role: 'grid',
    'aria-multiselectable': mode.startsWith('range'),
    'aria-label': ariaLabel,
  };

  return baseProps;
}

/**
 * Helper function to get date range picker label
 */
function getDateRangePickerLabel(mode: CalendarMode): string {
  return mode === 'range-dual'
    ? 'Date range picker calendar (dual view)'
    : 'Date range picker calendar';
}

/**
 * Merges user-provided accessibility props with defaults
 */
export function mergeAccessibilityProps(
  userProps: Partial<{
    'aria-label': string;
    'aria-labelledby': string;
    'aria-describedby': string;
    role: string;
  }>,
  mode: CalendarMode
) {
  const defaults = getDefaultAccessibilityProps(mode);

  return {
    ...defaults,
    ...userProps,
    // Always preserve user's aria-label or aria-labelledby if provided
    ...(userProps['aria-label'] || userProps['aria-labelledby']
      ? { 'aria-label': userProps['aria-label'] }
      : {}),
  };
}

/**
 * Creates standardized calendar CSS classes following project patterns
 * Includes responsive design, theme support, and accessibility
 */
export function createCalendarClasses(
  mode: CalendarMode,
  variant: 'default' | 'compact' = 'default'
) {
  const baseClasses = clsx(
    'calendar-container',
    'w-full max-w-fit mx-auto',
    'bg-background border border-border',
    'rounded-lg shadow-sm',
    'transition-all duration-200',
    'focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50'
  );

  const modeClasses = {
    single: clsx('calendar-single', 'max-w-sm'),
    'range-single': clsx('calendar-range-single', 'max-w-sm'),
    'range-dual': clsx('calendar-range-dual', 'max-w-none', 'sm:max-w-2xl lg:max-w-4xl'),
  };

  const variantClasses = {
    default: clsx('shadow-md hover:shadow-lg', 'p-4 sm:p-6'),
    compact: clsx('shadow-sm hover:shadow-md', 'p-2 sm:p-3'),
  };

  return clsx(baseClasses, modeClasses[mode], variantClasses[variant]);
}

/**
 * Gets standardized react-day-picker class names following project patterns
 * Includes comprehensive theming, responsive design, and accessibility
 */
export function getStandardizedDayPickerClasses() {
  return {
    // Root container with responsive spacing and theme support
    root: clsx(
      'rdp-root',
      'w-full font-sans',
      'text-text bg-background',
      'transition-colors duration-200',
      '[&_*]:transition-colors [&_*]:duration-200'
    ),

    // Months container with responsive layout
    months: clsx(
      'rdp-months',
      'flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8',
      'justify-center items-start'
    ),

    // Individual month container
    month: clsx(
      'rdp-month',
      'w-full max-w-sm mx-auto sm:mx-0',
      'bg-background border border-border rounded-lg',
      'shadow-sm hover:shadow-md transition-shadow duration-200',
      'p-4 sm:p-5'
    ),

    // Month caption with navigation
    month_caption: clsx(
      'rdp-month_caption',
      'flex items-center justify-between mb-4',
      'px-1 py-2',
      'border-b border-border/50'
    ),

    // Caption label with responsive typography
    caption_label: clsx(
      'rdp-caption_label',
      'text-text font-semibold',
      'text-base sm:text-lg',
      'select-none'
    ),

    // Navigation container
    nav: clsx('rdp-nav', 'flex gap-1', 'items-center'),

    // Navigation buttons with enhanced hover states
    button_previous: clsx(
      'rdp-button_previous',
      'inline-flex items-center justify-center',
      'h-8 w-8 sm:h-9 sm:w-9',
      'rounded-md border border-border',
      'bg-background hover:bg-accent',
      'text-text hover:text-accent-foreground',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95'
    ),

    button_next: clsx(
      'rdp-button_next',
      'inline-flex items-center justify-center',
      'h-8 w-8 sm:h-9 sm:w-9',
      'rounded-md border border-border',
      'bg-background hover:bg-accent',
      'text-text hover:text-accent-foreground',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95'
    ),

    // Grid layout for calendar
    month_grid: clsx('rdp-month_grid', 'w-full border-collapse border-spacing-0', 'table-auto'),

    // Weekdays header
    weekdays: clsx('rdp-weekdays', 'border-b border-border/30', 'mb-1'),

    // Individual weekday cell
    weekday: clsx(
      'rdp-weekday',
      'text-text-muted font-medium',
      'text-xs sm:text-sm',
      'p-2 text-center',
      'select-none uppercase tracking-wide'
    ),

    // Week row
    week: 'rdp-week',

    // Day cell container
    day: clsx('rdp-day', 'p-0.5 text-center relative', 'focus-within:relative focus-within:z-10'),

    // Day button with comprehensive states
    day_button: clsx(
      'rdp-day_button',
      'relative w-full h-9 sm:h-10',
      'rounded-md border-0 bg-transparent',
      'text-sm font-medium cursor-pointer',
      'text-text',
      'transition-all duration-200',
      'hover:bg-accent hover:text-accent-foreground hover:scale-105',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
      'active:scale-95',
      'disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed',
      'select-none'
    ),

    // Selected date styling
    selected: clsx(
      'rdp-selected',
      'bg-primary text-white',
      'hover:bg-primary/90 hover:text-white',
      'shadow-sm',
      'font-semibold',
      'transform scale-105'
    ),

    // Today styling with subtle emphasis
    today: clsx(
      'rdp-today',
      'font-bold relative',
      'before:absolute before:bottom-1 before:left-1/2 before:transform before:-translate-x-1/2',
      'before:w-1 before:h-1 before:bg-accent before:rounded-full',
      'text-accent'
    ),

    // Outside month dates
    outside: clsx('rdp-outside', 'text-text-muted/40', 'hover:text-text-muted/60'),

    // Disabled dates
    disabled: clsx(
      'rdp-disabled',
      'text-text-muted/30',
      'cursor-not-allowed opacity-40',
      'hover:bg-transparent hover:text-text-muted/30'
    ),

    // Range selection start
    range_start: clsx(
      'rdp-range_start',
      'bg-primary text-white',
      'hover:bg-primary/90',
      'rounded-l-md rounded-r-none',
      'font-semibold shadow-sm',
      'relative z-10'
    ),

    // Range selection end
    range_end: clsx(
      'rdp-range_end',
      'bg-primary text-white',
      'hover:bg-primary/90',
      'rounded-r-md rounded-l-none',
      'font-semibold shadow-sm',
      'relative z-10'
    ),

    // Range selection middle
    range_middle: clsx(
      'rdp-range_middle',
      'bg-primary/10 text-primary',
      'hover:bg-primary/20',
      'rounded-none',
      'font-medium'
    ),

    // Hidden elements
    hidden: 'rdp-hidden invisible',
  };
}

// Export utilities as a namespace for convenient access
export const calendarUtils = createCalendarUtils();

/**
 * Calendar styling system - Centralized styling utilities for all calendar variants
 */

/**
 * Base calendar container styles that are common across all calendar types
 * Enhanced with responsive design and theme integration
 */
export function getBaseCalendarContainerStyles() {
  return {
    root: clsx(
      'calendar-container relative',
      'w-full max-w-fit',
      'bg-background border border-border',
      'rounded-lg overflow-hidden',
      'transition-all duration-200'
    ),
    wrapper: clsx(
      'calendar-wrapper',
      'bg-background border border-border rounded-lg overflow-hidden',
      'shadow-sm hover:shadow-md transition-shadow duration-200'
    ),
    content: clsx('calendar-content', 'p-4 sm:p-6', 'space-y-4'),
    header: clsx(
      'calendar-header',
      'flex items-center justify-between',
      'mb-4 pb-2',
      'border-b border-border/30'
    ),
    body: clsx('calendar-body', 'min-h-0 flex-1'),
    footer: clsx(
      'calendar-footer',
      'mt-4 pt-2',
      'border-t border-border/30',
      'flex items-center justify-between'
    ),
  };
}

/**
 * Responsive layout utilities for different calendar modes
 */
export function getResponsiveLayoutStyles(mode: CalendarMode) {
  const layouts = {
    single: {
      container: 'max-w-sm',
      months: 'w-full',
      month: 'w-full',
    },
    'range-single': {
      container: 'max-w-sm',
      months: 'w-full',
      month: 'w-full',
    },
    'range-dual': {
      container: clsx('max-w-none', 'sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl'),
      months: clsx('flex flex-col sm:flex-row', 'gap-4 sm:gap-6 lg:gap-8', 'justify-center'),
      month: clsx('flex-1 min-w-0', 'max-w-sm mx-auto sm:mx-0'),
    },
  };

  return layouts[mode];
}

/**
 * Dark mode and theme-aware color utilities
 */
export function getThemeAwareColors() {
  return {
    // Calendar background and surface colors
    surface: {
      primary: 'bg-background border-border',
      elevated: 'bg-background/95 border-border/70 shadow-lg',
      overlay: 'bg-background/80 backdrop-blur-sm',
    },

    // Interactive element colors
    interactive: {
      default: clsx(
        'bg-transparent hover:bg-accent',
        'text-text hover:text-accent-foreground',
        'border-transparent hover:border-border'
      ),
      primary: clsx('bg-primary hover:bg-primary/90', 'text-white', 'border-primary'),
      secondary: clsx('bg-secondary hover:bg-secondary/90', 'text-white', 'border-secondary'),
      accent: clsx('bg-accent hover:bg-accent/90', 'text-accent-foreground', 'border-accent'),
    },

    // State-based colors
    states: {
      selected: 'bg-primary text-white border-primary',
      today: 'text-accent font-bold relative',
      disabled: 'text-text-muted/30 cursor-not-allowed',
      outside: 'text-text-muted/40',
      hovered: 'bg-accent/50 text-accent-foreground',
    },

    // Range selection colors
    range: {
      start: 'bg-primary text-white border-primary shadow-sm',
      end: 'bg-primary text-white border-primary shadow-sm',
      middle: 'bg-primary/10 text-primary border-primary/20',
    },
  };
}

/**
 * Animation and transition utilities
 */
export function getAnimationStyles() {
  return {
    // Smooth transitions for all interactive elements
    smooth: 'transition-all duration-200 ease-in-out',

    // Hover effects
    hover: {
      scale: 'hover:scale-105 active:scale-95',
      lift: 'hover:shadow-md hover:-translate-y-0.5',
      glow: 'hover:ring-2 hover:ring-primary/20',
    },

    // Focus states
    focus: clsx(
      'focus:outline-none',
      'focus:ring-2 focus:ring-primary focus:ring-offset-1',
      'focus:border-primary'
    ),

    // Loading animations
    loading: {
      spin: 'animate-spin',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
    },

    // Calendar-specific animations
    calendar: {
      monthTransition: 'transition-transform duration-300 ease-in-out',
      dayAppear: 'transition-opacity duration-200 ease-in-out',
      selectionGrow: 'transition-transform duration-150 ease-out',
    },
  };
}

/**
 * Accessibility helper styles for calendar components
 * Enhanced with better color contrast and screen reader support
 */
export function getAccessibilityHelperStyles() {
  return {
    // Error states with enhanced visibility
    errorContainer: clsx(
      'calendar-error',
      'border-red-500 bg-red-50 dark:bg-red-950/50',
      'rounded-md border-2 p-3',
      'shadow-sm'
    ),
    errorText: clsx('text-red-700 dark:text-red-300', 'text-sm font-medium'),

    // Warning states
    warningContainer: clsx(
      'calendar-warning',
      'border-amber-500 bg-amber-50 dark:bg-amber-950/50',
      'rounded-md border-2 p-3',
      'shadow-sm'
    ),
    warningText: clsx('text-amber-700 dark:text-amber-300', 'text-sm font-medium'),

    // Helper text with proper contrast
    helpText: clsx('text-text-muted', 'text-xs leading-relaxed mt-2'),
    requiredHint: clsx(
      'text-text-muted',
      'text-xs',
      'after:content-["*"] after:text-red-500 after:ml-1'
    ),

    // Loading states with animation
    loadingContainer: clsx(
      'calendar-loading',
      'border-border bg-background/50',
      'rounded-lg border p-4',
      'backdrop-blur-sm'
    ),
    loadingContent: clsx('flex items-center justify-center', 'min-h-[200px]', 'space-x-3'),
    loadingSpinner: clsx(
      'h-5 w-5 animate-spin rounded-full',
      'border-2 border-primary border-t-transparent'
    ),
    loadingText: clsx('text-text-muted text-sm', 'animate-pulse'),

    // High contrast mode support
    highContrast: {
      border: 'border-2 border-current',
      background: 'bg-current text-background',
      text: 'text-current contrast-more:font-bold',
    },

    // Screen reader only content
    srOnly: clsx(
      'sr-only',
      'absolute w-px h-px p-0 -m-px overflow-hidden',
      'clip-[rect(0,0,0,0)] border-0'
    ),
  };
}

/**
 * State-based styling utilities
 */
export function getCalendarStateStyles() {
  return {
    loading: 'opacity-60 pointer-events-none',
    disabled: 'opacity-40 pointer-events-none',
    error: 'border-destructive shadow-sm shadow-destructive/20',
    focus: 'ring-2 ring-ring ring-offset-2',
    valid: 'border-success',
    invalid: 'border-destructive',
  };
}

/**
 * Responsive styles for different calendar layouts
 */
export function getResponsiveCalendarStyles() {
  return {
    singleCalendar: {
      container: 'w-full max-w-sm mx-auto',
      content: 'p-3 sm:p-4',
    },
    rangeCalendar: {
      container: 'w-full max-w-md mx-auto',
      content: 'p-3 sm:p-4',
    },
    dualCalendar: {
      container: 'w-full max-w-4xl mx-auto',
      content: 'p-3 sm:p-4',
      calendarsWrapper: 'flex flex-col sm:flex-row gap-4 sm:gap-6',
      singleCalendarContainer: 'flex-1 min-w-0',
    },
  };
}

/**
 * Enhanced DayPicker styles with better theming and accessibility
 */
export function getEnhancedDayPickerStyles() {
  const base = getStandardizedDayPickerClasses();

  return {
    ...base,
    // Enhanced navigation
    nav: 'rdp-nav flex items-center justify-between mb-4',
    button_previous: clsx(
      'rdp-button_previous',
      'hover:bg-muted p-2 rounded-md transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    button_next: clsx(
      'rdp-button_next',
      'hover:bg-muted p-2 rounded-md transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),

    // Enhanced caption
    caption_label: clsx(
      'rdp-caption_label',
      'text-foreground font-semibold text-base sm:text-lg',
      'flex-1 text-center'
    ),

    // Enhanced table
    month_grid: 'rdp-month_grid w-full border-collapse',
    weekdays: 'rdp-weekdays border-b border-border/30',
    weekday: clsx(
      'rdp-weekday',
      'text-muted-foreground text-xs sm:text-sm font-medium',
      'p-2 text-center uppercase tracking-wide'
    ),

    // Enhanced day cells
    day: 'rdp-day p-0 text-center relative',
    day_button: clsx(
      'rdp-day_button',
      'h-8 w-8 sm:h-9 sm:w-9 rounded-md border-0 bg-transparent cursor-pointer',
      'text-sm font-normal transition-all duration-200',
      'hover:bg-accent hover:text-accent-foreground hover:scale-105',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      'disabled:pointer-events-none disabled:opacity-30',
      'aria-selected:bg-primary aria-selected:text-primary-foreground'
    ),

    // Enhanced selection states
    selected: clsx(
      'rdp-selected',
      'bg-primary text-primary-foreground font-medium',
      'hover:bg-primary/90 shadow-sm'
    ),
    today: clsx(
      'rdp-today',
      'font-semibold text-accent-foreground',
      'before:absolute before:inset-0 before:rounded-md before:border-2 before:border-primary/30'
    ),

    // Enhanced range styles
    range_start: clsx(
      'rdp-range_start',
      'bg-primary text-primary-foreground rounded-l-md font-medium',
      'hover:bg-primary/90'
    ),
    range_end: clsx(
      'rdp-range_end',
      'bg-primary text-primary-foreground rounded-r-md font-medium',
      'hover:bg-primary/90'
    ),
    range_middle: clsx(
      'rdp-range_middle',
      'bg-accent/40 text-accent-foreground',
      'hover:bg-accent/60'
    ),

    // Enhanced outside and disabled states
    outside: 'rdp-outside text-muted-foreground/40',
    disabled: 'rdp-disabled text-muted-foreground/20 cursor-not-allowed',
    hidden: 'rdp-hidden invisible',
  };
}

/**
 * Creates comprehensive calendar styles based on mode and variant
 */
export function createComprehensiveCalendarStyles(
  mode: CalendarMode,
  variant: 'default' | 'compact' | 'minimal' = 'default',
  state?: 'loading' | 'error' | 'disabled' | 'valid'
) {
  const base = getBaseCalendarContainerStyles();
  const responsive = getResponsiveCalendarStyles();
  const stateStyles = getCalendarStateStyles();

  // Get mode-specific responsive styles
  const modeStyles = (() => {
    switch (mode) {
      case 'range-single':
        return responsive.rangeCalendar;
      case 'range-dual':
        return responsive.dualCalendar;
      case 'single':
      default:
        return responsive.singleCalendar;
    }
  })();

  // Get variant-specific styles
  const variantStyles = (() => {
    switch (variant) {
      case 'compact':
        return {
          wrapper: 'shadow-sm',
          content: 'p-2 sm:p-3',
        };
      case 'minimal':
        return {
          wrapper: 'border-0 shadow-none',
          content: 'p-1 sm:p-2',
        };
      default:
        return {
          wrapper: 'shadow-md',
          content: 'p-3 sm:p-4',
        };
    }
  })();

  // Get state-specific styles
  const stateClasses = state ? stateStyles[state] : '';

  return {
    container: clsx(base.root, modeStyles.container, stateClasses),
    wrapper: clsx(base.wrapper, variantStyles.wrapper, stateClasses),
    content: clsx(base.content, modeStyles.content || variantStyles.content),
    // Dual calendar specific
    ...(mode === 'range-dual' && {
      calendarsWrapper: (modeStyles as { calendarsWrapper?: string }).calendarsWrapper,
      singleCalendarContainer: (modeStyles as { singleCalendarContainer?: string })
        .singleCalendarContainer,
    }),
  };
}

/**
 * Creates unified DayPicker configuration with standardized props
 */
export function createStandardDayPickerConfig(mode: CalendarMode) {
  const classes = getEnhancedDayPickerStyles();

  const baseConfig = {
    classNames: classes,
    styles: {
      root: { margin: 0 },
    },
    showOutsideDays: true,
    fixedWeeks: true,
    numberOfMonths: mode === 'range-dual' ? 2 : 1,
  };

  // Mode-specific configurations
  const modeConfig = (() => {
    switch (mode) {
      case 'range-single':
      case 'range-dual':
        return {
          mode: 'range' as const,
        };
      case 'single':
      default:
        return {
          mode: 'single' as const,
        };
    }
  })();

  return {
    ...baseConfig,
    ...modeConfig,
  };
}

/**
 * Merges user-provided styles with standard calendar styles
 */
export function mergeCalendarStyles(
  mode: CalendarMode,
  userClassNames?: Partial<Record<string, string>>,
  userStyles?: Partial<Record<string, React.CSSProperties>>,
  variant: 'default' | 'compact' | 'minimal' = 'default'
) {
  const standardConfig = createStandardDayPickerConfig(mode);
  const standardStyles = createComprehensiveCalendarStyles(mode, variant);

  return {
    classNames: {
      ...standardConfig.classNames,
      ...userClassNames,
      // Ensure root class includes both standard and user classes
      root: clsx(standardConfig.classNames?.root, userClassNames?.root),
    },
    styles: {
      ...standardConfig.styles,
      ...userStyles,
    },
    containerStyles: standardStyles,
  };
}

/**
 * Helper to create accessibility-compliant helper text data
 */
export function createAccessibilityHelpers(
  id: string,
  options: {
    hasError?: boolean;
    errorMessage?: string;
    hasWarning?: boolean;
    warningMessage?: string;
    isRequired?: boolean;
    helpText?: string;
  }
) {
  const styles = getAccessibilityHelperStyles();
  const { hasError, errorMessage, hasWarning, warningMessage, isRequired, helpText } = options;

  const describedBy: string[] = [];
  const helperConfig: Array<{
    id: string;
    type: 'error' | 'warning' | 'required' | 'help';
    message: string;
    className: string;
    role?: string;
    ariaLive?: 'polite' | 'assertive';
  }> = [];

  // Error message
  if (hasError && errorMessage) {
    const errorId = `${id}-error`;
    describedBy.push(errorId);
    helperConfig.push({
      id: errorId,
      type: 'error',
      message: errorMessage,
      className: styles.errorText,
      role: 'alert',
      ariaLive: 'polite',
    });
  }

  // Warning message
  if (hasWarning && warningMessage) {
    const warningId = `${id}-warning`;
    describedBy.push(warningId);
    helperConfig.push({
      id: warningId,
      type: 'warning',
      message: warningMessage,
      className: styles.warningText,
      role: 'alert',
      ariaLive: 'polite',
    });
  }

  // Required hint
  if (isRequired) {
    const requiredId = `${id}-required`;
    describedBy.push(requiredId);
    helperConfig.push({
      id: requiredId,
      type: 'required',
      message: 'This field is required',
      className: styles.requiredHint,
    });
  }

  // Help text
  if (helpText) {
    const helpId = `${id}-help`;
    describedBy.push(helpId);
    helperConfig.push({
      id: helpId,
      type: 'help',
      message: helpText,
      className: styles.helpText,
    });
  }

  return {
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
    helperConfig,
    styles,
  };
}

/**
 * Mobile-optimized calendar styles for touch interfaces
 */
export function getMobileOptimizedStyles() {
  return {
    // Touch-friendly button sizes
    touchButton: clsx(
      'min-h-[44px] min-w-[44px]', // Apple's minimum touch target
      'sm:min-h-[40px] sm:min-w-[40px]',
      'touch-manipulation' // Disable double-tap zoom
    ),

    // Mobile navigation
    mobileNav: clsx(
      'flex justify-between items-center',
      'px-4 py-3 bg-background border-b border-border',
      'sticky top-0 z-10'
    ),

    // Responsive month grid
    responsiveGrid: clsx('grid grid-cols-7 gap-0.5 sm:gap-1', 'min-h-[280px] sm:min-h-[320px]'),

    // Mobile-friendly day cells
    mobileDay: clsx(
      'aspect-square flex items-center justify-center',
      'text-sm sm:text-base',
      'rounded-md sm:rounded-lg',
      'transition-all duration-200'
    ),

    // Swipe gesture support
    swipeContainer: clsx('overflow-hidden relative', 'touch-pan-x select-none'),
  };
}

/**
 * Calendar variant styles for different use cases
 */
export function getCalendarVariantStyles() {
  return {
    // Compact variant for sidebars or small spaces
    compact: {
      container: 'p-2 text-xs',
      month: 'max-w-[280px]',
      day: 'h-6 w-6 text-xs',
      caption: 'text-sm mb-2',
    },

    // Standard variant for main content
    standard: {
      container: 'p-4 text-sm',
      month: 'max-w-[320px]',
      day: 'h-9 w-9 text-sm',
      caption: 'text-base mb-4',
    },

    // Large variant for prominent display
    large: {
      container: 'p-6 text-base',
      month: 'max-w-[400px]',
      day: 'h-12 w-12 text-base',
      caption: 'text-lg mb-6',
    },

    // Minimal variant with clean design
    minimal: {
      container: 'p-0 border-0 shadow-none',
      month: 'bg-transparent border-0 shadow-none',
      day: 'rounded-none border-0',
      caption: 'border-0 mb-2',
    },
  };
}

/**
 * Range selection visual enhancements
 */
export function getRangeSelectionStyles() {
  return {
    // Start date styling
    rangeStart: clsx(
      'bg-primary text-white',
      'relative z-20',
      'rounded-l-md rounded-r-none',
      'before:absolute before:inset-0',
      'before:bg-primary/20 before:rounded-l-md',
      'before:-z-10 before:w-[200%] before:left-0'
    ),

    // End date styling
    rangeEnd: clsx(
      'bg-primary text-white',
      'relative z-20',
      'rounded-r-md rounded-l-none',
      'after:absolute after:inset-0',
      'after:bg-primary/20 after:rounded-r-md',
      'after:-z-10 after:w-[200%] after:right-0'
    ),

    // Middle range dates
    rangeMiddle: clsx(
      'bg-primary/10 text-primary',
      'relative z-10',
      'rounded-none',
      'before:absolute before:inset-0',
      'before:bg-primary/5 before:-z-10',
      'before:w-full'
    ),

    // Range hover effects
    rangeHover: clsx('hover:bg-primary/20', 'transition-colors duration-150'),

    // Visual connection between range dates
    rangeConnector: clsx(
      'absolute top-1/2 left-0 right-0',
      'h-0.5 bg-primary/20',
      'transform -translate-y-1/2',
      'pointer-events-none'
    ),
  };
}

/**
 * Keyboard navigation enhancements
 */
export function getKeyboardNavigationStyles() {
  return {
    // Focus ring for keyboard users
    focusRing: clsx(
      'focus:outline-none',
      'focus:ring-2 focus:ring-primary focus:ring-offset-1',
      'focus:ring-offset-background',
      'focus:z-30'
    ),

    // Navigation hints
    navHint: clsx(
      'text-text-muted text-xs',
      'sr-only focus:not-sr-only',
      'absolute top-full left-0 right-0',
      'bg-background border border-border rounded-md p-2 mt-1',
      'z-50 shadow-lg'
    ),

    // Skip links for accessibility
    skipLink: clsx(
      'sr-only focus:not-sr-only',
      'absolute top-0 left-0 z-50',
      'bg-primary text-white px-4 py-2 rounded-br-md',
      'focus:outline-none'
    ),
  };
}

/**
 * Enhanced calendar theming with CSS custom properties support
 */
export function createAdvancedCalendarTheme(mode: CalendarMode) {
  const baseTheme = {
    // CSS custom properties for runtime theming
    '--calendar-primary': 'hsl(var(--color-primary))',
    '--calendar-secondary': 'hsl(var(--color-secondary))',
    '--calendar-accent': 'hsl(var(--color-accent))',
    '--calendar-background': 'hsl(var(--color-background))',
    '--calendar-text': 'hsl(var(--color-text))',
    '--calendar-text-muted': 'hsl(var(--color-text-muted))',
    '--calendar-border': 'hsl(var(--color-border))',

    // Calendar-specific variables
    '--calendar-radius': 'var(--border-radius-card)',
    '--calendar-shadow': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '--calendar-day-size': '2.25rem',
    '--calendar-spacing': '1rem',
  };

  const modeSpecificTheme = {
    single: {
      '--calendar-width': '320px',
      '--calendar-max-width': '100%',
    },
    'range-single': {
      '--calendar-width': '320px',
      '--calendar-max-width': '100%',
    },
    'range-dual': {
      '--calendar-width': 'auto',
      '--calendar-max-width': '800px',
      '--calendar-gap': '2rem',
    },
  };

  return {
    ...baseTheme,
    ...modeSpecificTheme[mode],
  };
}

/**
 * Utility function to merge calendar class names with user overrides
 */
export function mergeCalendarClasses(
  standardClasses: Record<string, string>,
  userClasses?: Partial<Record<string, string>>
) {
  if (!userClasses) return standardClasses;

  const merged = { ...standardClasses };

  Object.entries(userClasses).forEach(([key, userClass]) => {
    if (userClass && merged[key]) {
      merged[key] = clsx(merged[key], userClass);
    }
  });

  return merged;
}

/**
 * Generate comprehensive calendar props for react-day-picker
 */
export function createEnhancedCalendarProps(
  mode: CalendarMode,
  options: {
    variant?: 'compact' | 'standard' | 'large' | 'minimal';
    responsive?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    animations?: boolean;
    className?: string;
    classNames?: Partial<Record<string, string>>;
    styles?: React.CSSProperties;
  } = {}
) {
  const {
    variant = 'standard',
    responsive = true,
    theme = 'auto',
    animations = true,
    className,
    classNames: userClassNames,
    styles: userStyles,
  } = options;

  // Get base classes
  const standardClasses = getStandardizedDayPickerClasses();

  // Merge with user classes
  const finalClasses = mergeCalendarClasses(standardClasses, userClassNames);

  // Create container classes
  const containerClasses = clsx(
    createCalendarClasses(mode, variant === 'compact' ? 'compact' : 'default'),
    responsive && 'responsive-calendar',
    animations && 'animated-calendar',
    theme === 'dark' && 'dark-calendar',
    className
  );

  // Combine styles
  const finalStyles = {
    ...createAdvancedCalendarTheme(mode),
    ...userStyles,
  };

  return {
    classNames: finalClasses,
    styles: finalStyles,
    containerClassName: containerClasses,
    props: {
      // Enable keyboard navigation
      autoFocus: false,
      fixedWeeks: true,
      showOutsideDays: true,

      // Responsive month display
      numberOfMonths: mode === 'range-dual' ? 2 : 1,

      // Accessibility
      'aria-label': `Calendar for ${mode} date selection`,
      role: 'application',
    },
  };
}
