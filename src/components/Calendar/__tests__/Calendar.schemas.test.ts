import { describe, it, expect } from 'vitest';
import * as schemas from '../Calendar.schemas';

describe('Calendar Schemas', () => {
  describe('calendarModeSchema', () => {
    it('should validate correct modes', () => {
      expect(schemas.calendarModeSchema.safeParse('single').success).toBe(true);
      expect(schemas.calendarModeSchema.safeParse('range-single').success).toBe(true);
      expect(schemas.calendarModeSchema.safeParse('range-dual').success).toBe(true);
    });

    it('should invalidate incorrect modes', () => {
      expect(schemas.calendarModeSchema.safeParse('invalid-mode').success).toBe(false);
    });
  });

  describe('dateSchema', () => {
    it('should validate a valid Date object', () => {
      expect(schemas.dateSchema.safeParse(new Date()).success).toBe(true);
    });

    it('should invalidate non-Date objects', () => {
      expect(schemas.dateSchema.safeParse('2023-10-26').success).toBe(false);
      expect(schemas.dateSchema.safeParse(null).success).toBe(false);
      expect(schemas.dateSchema.safeParse(undefined).success).toBe(false);
    });

    it('should return correct error for required', () => {
      const result = schemas.dateSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Date is required');
      }
    });
  });

  describe('optionalDateSchema', () => {
    it('should validate a valid Date object', () => {
      expect(schemas.optionalDateSchema.safeParse(new Date()).success).toBe(true);
    });

    it('should validate undefined', () => {
      expect(schemas.optionalDateSchema.safeParse(undefined).success).toBe(true);
    });

    it('should invalidate non-Date objects other than undefined', () => {
      expect(schemas.optionalDateSchema.safeParse('2023-10-26').success).toBe(false);
      expect(schemas.optionalDateSchema.safeParse(null).success).toBe(false); // Zod treats null as an invalid date
    });
  });

  describe('dateStringSchema', () => {
    it('should validate and transform valid date strings', () => {
      const result = schemas.dateStringSchema.safeParse('2023-10-26T10:00:00.000Z');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
        expect(result.data.toISOString()).toBe('2023-10-26T10:00:00.000Z');
      }
    });

    it('should invalidate empty or invalid date strings', () => {
      expect(schemas.dateStringSchema.safeParse('').success).toBe(false);
      expect(schemas.dateStringSchema.safeParse('invalid-date').success).toBe(false);
    });
  });

  describe('dateRangeSchema', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    it('should validate a valid range where from <= to', () => {
      expect(schemas.dateRangeSchema.safeParse({ from: yesterday, to: today }).success).toBe(true);
      expect(schemas.dateRangeSchema.safeParse({ from: today, to: today }).success).toBe(true);
    });

    it('should validate a range with only "from" date', () => {
      expect(schemas.dateRangeSchema.safeParse({ from: today }).success).toBe(true);
    });

    it('should validate a range with only "to" date', () => {
      expect(schemas.dateRangeSchema.safeParse({ to: today }).success).toBe(true);
    });

    it('should invalidate a range where from > to', () => {
      const result = schemas.dateRangeSchema.safeParse({ from: tomorrow, to: yesterday });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Start date must be before or equal to end date'
        );
      }
    });

    it('should invalidate a range if neither from nor to is provided', () => {
      const result = schemas.dateRangeSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        // Check for the specific error message related to at least one date being required
        const hasExpectedError = result.error.issues.some(
          issue => issue.message === 'At least one date must be selected for a range'
        );
        expect(hasExpectedError).toBe(true);
      }
    });
  });

  describe('optionalDateRangeSchema', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    it('should validate a valid range', () => {
      expect(
        schemas.optionalDateRangeSchema.safeParse({ from: yesterday, to: today }).success
      ).toBe(true);
    });

    it('should validate undefined', () => {
      expect(schemas.optionalDateRangeSchema.safeParse(undefined).success).toBe(true);
    });

    it('should invalidate an invalid range', () => {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      expect(
        schemas.optionalDateRangeSchema.safeParse({ from: tomorrow, to: yesterday }).success
      ).toBe(false);
    });
  });

  describe('dateConstraintsSchema', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    it('should validate with all fields present and valid', () => {
      const data = {
        fromDate: yesterday,
        toDate: tomorrow,
        disabled: [today],
        hidden: [today],
      };
      expect(schemas.dateConstraintsSchema.safeParse(data).success).toBe(true);
    });

    it('should validate with optional fields missing', () => {
      const data = {};
      expect(schemas.dateConstraintsSchema.safeParse(data).success).toBe(true);
      const data2 = { fromDate: yesterday };
      expect(schemas.dateConstraintsSchema.safeParse(data2).success).toBe(true);
    });

    it('should invalidate with invalid date types', () => {
      const data = { fromDate: 'not-a-date' };
      expect(schemas.dateConstraintsSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('singleDateSelectionSchema', () => {
    it('should validate correct single date selection', () => {
      const data = { mode: 'single' as const, selected: new Date(), required: false };
      expect(schemas.singleDateSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should validate with optional selected date', () => {
      const data = { mode: 'single' as const };
      expect(schemas.singleDateSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should invalidate if mode is not "single"', () => {
      const data = { mode: 'range-single' as const, selected: new Date() };
      expect(schemas.singleDateSelectionSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('rangeSingleSelectionSchema', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    it('should validate correct range single selection', () => {
      const data = {
        mode: 'range-single' as const,
        selected: { from: today, to: tomorrow },
        min: 1,
        max: 5,
      };
      expect(schemas.rangeSingleSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should validate with optional selected range and min/max', () => {
      const data = { mode: 'range-single' as const };
      expect(schemas.rangeSingleSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should invalidate if mode is not "range-single"', () => {
      const data = { mode: 'single' as const, selected: { from: today, to: tomorrow } };
      expect(schemas.rangeSingleSelectionSchema.safeParse(data).success).toBe(false);
    });

    it('should invalidate if min > max', () => {
      const data = {
        mode: 'range-single' as const,
        selected: { from: today, to: tomorrow },
        min: 5,
        max: 1,
      };
      // This specific validation is done by validateRangeConstraints, not directly in the zod schema
      // So we test validateRangeConstraints separately. The schema itself would pass here.
      expect(schemas.rangeSingleSelectionSchema.safeParse(data).success).toBe(true);
      // However, the combined validation logic should catch this.
      // We will test `validateRangeConstraints` directly.
    });
  });

  describe('rangeDualSelectionSchema', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    it('should validate correct range dual selection', () => {
      const data = {
        mode: 'range-dual' as const,
        selected: { from: today, to: tomorrow },
        min: 1,
        max: 5,
        spacing: 'md' as const,
      };
      expect(schemas.rangeDualSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const data = { mode: 'range-dual' as const };
      expect(schemas.rangeDualSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should invalidate if mode is not "range-dual"', () => {
      const data = { mode: 'single' as const, selected: { from: today, to: tomorrow } };
      expect(schemas.rangeDualSelectionSchema.safeParse(data).success).toBe(false);
    });

    it('should invalidate with incorrect spacing', () => {
      const data: Omit<schemas.RangeDualSelectionData, 'spacing'> & { spacing: string } = {
        mode: 'range-dual' as const,
        selected: { from: today, to: tomorrow },
        spacing: 'xl', // invalid spacing
      };
      expect(schemas.rangeDualSelectionSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('calendarSelectionSchema (discriminated union)', () => {
    it('should validate single date selection data', () => {
      const data = { mode: 'single' as const, selected: new Date() };
      expect(schemas.calendarSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should validate range single selection data', () => {
      const data = {
        mode: 'range-single' as const,
        selected: { from: new Date(), to: new Date() },
      };
      expect(schemas.calendarSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should validate range dual selection data', () => {
      const data = { mode: 'range-dual' as const, selected: { from: new Date(), to: new Date() } };
      expect(schemas.calendarSelectionSchema.safeParse(data).success).toBe(true);
    });

    it('should invalidate data with an incorrect mode', () => {
      const data = { mode: 'invalid-mode' as 'single', selected: new Date() };
      expect(schemas.calendarSelectionSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('validateRangeConstraints', () => {
    it('should return true if min and max are not provided', () => {
      const data: Partial<schemas.RangeSingleSelectionData> = { mode: 'range-single' as const };
      expect(schemas.validateRangeConstraints(data as schemas.RangeSingleSelectionData)).toBe(true);
    });

    it('should return true if only min is provided', () => {
      const data: Partial<schemas.RangeSingleSelectionData> = {
        mode: 'range-single' as const,
        min: 2,
      };
      expect(schemas.validateRangeConstraints(data as schemas.RangeSingleSelectionData)).toBe(true);
    });

    it('should return true if only max is provided', () => {
      const data: Partial<schemas.RangeSingleSelectionData> = {
        mode: 'range-single' as const,
        max: 5,
      };
      expect(schemas.validateRangeConstraints(data as schemas.RangeSingleSelectionData)).toBe(true);
    });

    it('should return true if min <= max', () => {
      const data: schemas.RangeSingleSelectionData = {
        mode: 'range-single' as const,
        min: 2,
        max: 5,
      };
      expect(schemas.validateRangeConstraints(data)).toBe(true);
      const data2: schemas.RangeSingleSelectionData = {
        mode: 'range-single' as const,
        min: 3,
        max: 3,
      };
      expect(schemas.validateRangeConstraints(data2)).toBe(true);
    });

    it('should return false if min > max', () => {
      const data: schemas.RangeSingleSelectionData = {
        mode: 'range-single' as const,
        min: 5,
        max: 2,
      };
      expect(schemas.validateRangeConstraints(data)).toBe(false);
    });
  });

  describe('calendarStateSchema', () => {
    it('should validate a correct calendar state', () => {
      const data = {
        mode: 'single' as const,
        selectedDate: new Date(),
        isLoading: false,
        error: undefined,
      };
      expect(schemas.calendarStateSchema.safeParse(data).success).toBe(true);
    });

    it('should validate with optional fields missing', () => {
      const data = { mode: 'range-dual' as const };
      expect(schemas.calendarStateSchema.safeParse(data).success).toBe(true);
    });

    it('should invalidate with incorrect mode type', () => {
      const data = { mode: 'wrong-mode' as schemas.CalendarModeData };
      expect(schemas.calendarStateSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('calendarConfigSchema', () => {
    it('should validate a correct calendar configuration', () => {
      const data = {
        defaultMode: 'single' as const,
        allowModeSwitch: true,
        dateFormat: 'yyyy-MM-dd',
        weekStartsOn: 1 as const, // Monday
        showWeekNumbers: true,
        numberOfMonths: 2,
        fixedWeeks: false,
        showOutsideDays: true,
      };
      expect(schemas.calendarConfigSchema.safeParse(data).success).toBe(true);
    });

    it('should invalidate with empty dateFormat', () => {
      const data = {
        defaultMode: 'single' as const,
        allowModeSwitch: true,
        dateFormat: '', // Empty
        weekStartsOn: 0 as const,
        showWeekNumbers: false,
        numberOfMonths: 1,
        fixedWeeks: false,
        showOutsideDays: false,
      };
      expect(schemas.calendarConfigSchema.safeParse(data).success).toBe(false);
    });

    it('should invalidate with incorrect weekStartsOn value', () => {
      const data: Omit<schemas.CalendarConfigData, 'weekStartsOn'> & { weekStartsOn: number } = {
        defaultMode: 'single' as const,
        allowModeSwitch: true,
        dateFormat: 'dd/MM/yyyy',
        weekStartsOn: 7, // Invalid
        showWeekNumbers: false,
        numberOfMonths: 1,
        fixedWeeks: false,
        showOutsideDays: false,
      };
      expect(schemas.calendarConfigSchema.safeParse(data).success).toBe(false);
    });

    it('should invalidate with numberOfMonths out of range', () => {
      const data1 = { /* ...valid base ... */ numberOfMonths: 0 };
      const data2 = { /* ...valid base ... */ numberOfMonths: 13 };
      const base = {
        defaultMode: 'single' as const,
        allowModeSwitch: true,
        dateFormat: 'MM/dd/yyyy',
        weekStartsOn: 0 as const,
        showWeekNumbers: true,
        fixedWeeks: true,
        showOutsideDays: true,
      };
      expect(schemas.calendarConfigSchema.safeParse({ ...base, ...data1 }).success).toBe(false);
      expect(schemas.calendarConfigSchema.safeParse({ ...base, ...data2 }).success).toBe(false);
    });
  });

  // --- calendarValidationUtils ---
  describe('calendarValidationUtils', () => {
    const today = new Date(2023, 9, 26); // Oct 26, 2023
    const tomorrow = new Date(2023, 9, 27);
    const yesterday = new Date(2023, 9, 25);
    const dayBeforeYesterday = new Date(2023, 9, 24);

    describe('isDateAllowed', () => {
      const constraints: schemas.DateConstraintsData = {
        fromDate: yesterday, // Oct 25
        toDate: tomorrow, // Oct 27
        disabled: [new Date(2023, 9, 26)], // Oct 26 (today)
      };

      it('should return true for a date within range and not disabled', () => {
        // Test with a date that is not explicitly disabled but within from/to
        const allowedDate = new Date(2023, 9, 25); // Oct 25
        expect(schemas.calendarValidationUtils.isDateAllowed(allowedDate, constraints)).toBe(true);
      });

      it('should return false for a date before fromDate', () => {
        expect(schemas.calendarValidationUtils.isDateAllowed(dayBeforeYesterday, constraints)).toBe(
          false
        );
      });

      it('should return false for a date after toDate', () => {
        const dayAfterTomorrow = new Date(2023, 9, 28);
        expect(schemas.calendarValidationUtils.isDateAllowed(dayAfterTomorrow, constraints)).toBe(
          false
        );
      });

      it('should return false for a disabled date', () => {
        expect(schemas.calendarValidationUtils.isDateAllowed(today, constraints)).toBe(false);
      });

      it('should return true if no constraints are violated', () => {
        const simpleConstraints: schemas.DateConstraintsData = {};
        expect(schemas.calendarValidationUtils.isDateAllowed(today, simpleConstraints)).toBe(true);
      });

      it('should return true for a date equal to fromDate or toDate and not disabled', () => {
        const constraintsNoDisabled: schemas.DateConstraintsData = {
          fromDate: yesterday, // Oct 25
          toDate: tomorrow, // Oct 27
        };
        expect(
          schemas.calendarValidationUtils.isDateAllowed(yesterday, constraintsNoDisabled)
        ).toBe(true);
        expect(schemas.calendarValidationUtils.isDateAllowed(tomorrow, constraintsNoDisabled)).toBe(
          true
        );
      });
    });

    describe('isRangeValid', () => {
      it('should return true if from <= to', () => {
        expect(schemas.calendarValidationUtils.isRangeValid({ from: yesterday, to: today })).toBe(
          true
        );
        expect(schemas.calendarValidationUtils.isRangeValid({ from: today, to: today })).toBe(true);
      });

      it('should return false if from > to', () => {
        expect(schemas.calendarValidationUtils.isRangeValid({ from: today, to: yesterday })).toBe(
          false
        );
      });

      it('should return false if from or to is missing', () => {
        expect(schemas.calendarValidationUtils.isRangeValid({ from: today })).toBe(false);
        expect(schemas.calendarValidationUtils.isRangeValid({ to: today })).toBe(false);
        expect(schemas.calendarValidationUtils.isRangeValid({})).toBe(false);
      });
    });

    describe('isRangeLengthValid', () => {
      const range = { from: new Date(2023, 0, 1), to: new Date(2023, 0, 5) }; // 5 days (1, 2, 3, 4, 5)

      it('should return true if range length is within min/max', () => {
        expect(schemas.calendarValidationUtils.isRangeLengthValid(range, 3, 7)).toBe(true);
        expect(schemas.calendarValidationUtils.isRangeLengthValid(range, 5, 5)).toBe(true);
      });

      it('should return false if range length is less than min', () => {
        expect(schemas.calendarValidationUtils.isRangeLengthValid(range, 6, 10)).toBe(false);
      });

      it('should return false if range length is greater than max', () => {
        expect(schemas.calendarValidationUtils.isRangeLengthValid(range, 1, 4)).toBe(false);
      });

      it('should return true if min/max are not provided', () => {
        expect(schemas.calendarValidationUtils.isRangeLengthValid(range)).toBe(true);
      });

      it('should return false if from or to is missing', () => {
        expect(
          schemas.calendarValidationUtils.isRangeLengthValid({ from: new Date(2023, 0, 1) }, 1, 5)
        ).toBe(false);
        expect(
          schemas.calendarValidationUtils.isRangeLengthValid({ to: new Date(2023, 0, 5) }, 1, 5)
        ).toBe(false);
      });

      it('should correctly calculate range length for single day range', () => {
        const singleDayRange = { from: new Date(2023, 0, 1), to: new Date(2023, 0, 1) }; // 1 day
        expect(schemas.calendarValidationUtils.isRangeLengthValid(singleDayRange, 1, 1)).toBe(true);
        expect(schemas.calendarValidationUtils.isRangeLengthValid(singleDayRange, 1, 2)).toBe(true);
        expect(schemas.calendarValidationUtils.isRangeLengthValid(singleDayRange, 2, 2)).toBe(
          false
        );
      });
    });
  });
});
