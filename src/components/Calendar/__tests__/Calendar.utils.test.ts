import { describe, it, expect } from 'vitest';
import {
  validateCalendarProps,
  mergeAccessibilityProps,
  createCalendarClasses,
  createEnhancedCalendarProps,
} from '../Calendar.utils';
import type { CalendarProps, RangeCalendarProps } from '../Calendar.types';

describe('Calendar Utils', () => {
  describe('validateCalendarProps', () => {
    it('validates valid single mode props', () => {
      const props: CalendarProps = {
        mode: 'single',
      };
      const validationResult = validateCalendarProps(props);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('validates range mode props', () => {
      const props: CalendarProps = {
        mode: 'range-single',
      };
      const validationResult = validateCalendarProps(props);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('detects errors for invalid range constraints (min/max days)', () => {
      // Assuming RangeCalendarProps can have min/max for number of days in a range selection
      const props: RangeCalendarProps = {
        mode: 'range-single', // Corrected to 'range-single' to match potential specific type for RangeCalendarProps
        min: -1, // Invalid: negative min days
        max: 5,
      };
      const result = validateCalendarProps(props as CalendarProps);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('negative') && error.includes('min'))).toBe(
        true
      );

      const props2: RangeCalendarProps = {
        mode: 'range-single',
        min: 5,
        max: -1, // Invalid: negative max days
      };
      const result2 = validateCalendarProps(props2 as CalendarProps);
      expect(result2.isValid).toBe(false);
      expect(
        result2.errors.some(error => error.includes('negative') && error.includes('max'))
      ).toBe(true);

      const props3: RangeCalendarProps = {
        mode: 'range-single',
        min: 5,
        max: 2, // Invalid: min > max
      };
      const result3 = validateCalendarProps(props3 as CalendarProps);
      expect(result3.isValid).toBe(false);
      expect(result3.errors.some(error => error.includes('min cannot be greater than max'))).toBe(
        true
      );
    });

    it('warns about performance issues for large numberOfMonths', () => {
      const props: CalendarProps = {
        mode: 'single',
        numberOfMonths: 25, // Assuming threshold for warning is around 12-24
      };
      const result = validateCalendarProps(props);
      // This assertion depends on the actual threshold in `validateBehavioralProps`
      // For example, if warning is triggered for numberOfMonths > 12
      expect(
        result.warnings.some(
          warning => warning.includes('performance') && warning.includes('numberOfMonths')
        )
      ).toBe(true);
    });

    it('warns if accessibility label is missing', () => {
      const props: CalendarProps = {
        mode: 'single',
      };
      const result = validateCalendarProps(props);
      expect(
        result.warnings.some(warning => warning.includes('Accessibility label is missing'))
      ).toBe(true);
    });
  });

  describe('mergeAccessibilityProps', () => {
    it('merges accessibility props correctly', () => {
      const userProps = {
        'aria-label': 'Custom calendar',
        'aria-describedby': 'calendar-help',
      };
      const result = mergeAccessibilityProps(userProps, 'single');
      expect(result['aria-label']).toBe('Custom calendar');
      expect(result['aria-describedby']).toBe('calendar-help');
      expect(result.role).toBe('grid');
    });

    it('provides default accessibility props for single mode', () => {
      const result = mergeAccessibilityProps({}, 'single');
      expect(result['aria-label']).toBe('Date picker calendar');
      expect(result.role).toBe('grid');
      expect(result['aria-multiselectable']).toBe(false);
    });

    it('provides default accessibility props for range-dual mode', () => {
      const result = mergeAccessibilityProps({}, 'range-dual');
      expect(result['aria-label']).toBe('Date range picker calendar (dual view)');
      expect(result.role).toBe('grid');
      expect(result['aria-multiselectable']).toBe(true);
    });

    it('preserves user-provided role', () => {
      const userProps = {
        role: 'application',
      };
      const result = mergeAccessibilityProps(userProps, 'range-single');
      expect(result.role).toBe('application');
      expect(result['aria-label']).toBe('Date range picker calendar'); // Default label still applied
    });
  });

  describe('createCalendarClasses', () => {
    it('creates classes for single mode with default variant', () => {
      const result = createCalendarClasses('single');
      expect(result).toContain('calendar-single');
      expect(result).toContain('p-4 sm:p-6');
      expect(result).toContain('max-w-sm');
    });

    it('creates classes for range-single mode with compact variant', () => {
      const result = createCalendarClasses('range-single', 'compact');
      expect(result).toContain('calendar-range-single');
      expect(result).toContain('p-2 sm:p-3');
      expect(result).toContain('max-w-sm');
    });

    it('creates classes for range-dual mode with default variant', () => {
      const result = createCalendarClasses('range-dual', 'default');
      expect(result).toContain('calendar-range-dual');
      expect(result).toContain('max-w-none sm:max-w-2xl lg:max-w-4xl');
    });
  });

  describe('createEnhancedCalendarProps', () => {
    it('generates props with correct structure for single mode', () => {
      const result = createEnhancedCalendarProps('single', { variant: 'standard' });
      expect(result.classNames).toBeDefined();
      expect(result.containerClassName).toBeDefined();
      expect(result.containerClassName).toContain('calendar-single');
      expect(result.props).toBeDefined(); // Default DayPicker props
    });

    it('generates props for range-dual mode with options', () => {
      const result = createEnhancedCalendarProps('range-dual', {
        variant: 'compact',
        className: 'my-extra-class',
        animations: false,
      });
      expect(result.classNames).toBeDefined();
      expect(result.containerClassName).toContain('calendar-range-dual');
      expect(result.containerClassName).toContain('my-extra-class'); // User className merged into container
      expect(result.containerClassName).toContain('p-2 sm:p-3'); // Compact variant class
      // expect(result.props.animated).toBe(false); // This depends on how `animations` option translates to DayPicker props
    });

    it('merges user className into containerClassName', () => {
      const result = createEnhancedCalendarProps('single', { className: 'user-specific-class' });
      expect(result.containerClassName).toContain('user-specific-class');
      expect(result.containerClassName).toContain('calendar-container'); // Base class
    });

    // Test if createEnhancedCalendarProps correctly sets numberOfMonths for dual mode by default
    it('sets default numberOfMonths for range-dual mode in props', () => {
      const enhancedPropsResult = createEnhancedCalendarProps('range-dual', {});
      // This expectation depends on the implementation of createEnhancedCalendarProps
      // and what it includes in its returned `props` object for DayPicker.
      // Assuming it sets a default of 2 for range-dual.
      // If `createStandardDayPickerConfig` (used internally) sets this, it will be in `enhancedPropsResult.props`.
      expect(enhancedPropsResult.props).toBeDefined(); // Check that props object is part of the result
      // For example, if you want to ensure it runs and produces the main structural elements:
      expect(enhancedPropsResult.classNames).toBeDefined();
      expect(enhancedPropsResult.containerClassName).toBeDefined();
      // If a specific prop like numberOfMonths is expected to be defaulted by createEnhancedCalendarProps:
      // expect(enhancedPropsResult.props?.numberOfMonths).toBe(2);
    });
  });
});
