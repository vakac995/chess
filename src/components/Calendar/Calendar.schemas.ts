import { z } from 'zod';

/**
 * Calendar mode validator
 */
export const calendarModeSchema = z.enum(['single', 'range-single', 'range-dual'] as const);

/**
 * Date validator - ensures value is a valid Date object
 */
export const dateSchema = z.date({
  required_error: 'Date is required',
  invalid_type_error: 'Invalid date format',
});

/**
 * Optional date validator
 */
export const optionalDateSchema = dateSchema.optional();

/**
 * Date string validator - for parsing date strings
 */
export const dateStringSchema = z
  .string()
  .min(1, { message: 'Date string cannot be empty' })
  .refine(
    val => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Invalid date string format' }
  )
  .transform(val => new Date(val));

/**
 * Date range validator
 */
export const dateRangeSchema = z
  .object({
    from: optionalDateSchema,
    to: optionalDateSchema,
  })
  .refine(
    range => {
      // If both dates are provided, 'from' should be before or equal to 'to'
      if (range.from && range.to) {
        return range.from <= range.to;
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['from'],
    }
  )
  .refine(
    range => {
      // At least one date should be provided for a range
      return range.from !== undefined || range.to !== undefined;
    },
    {
      message: 'At least one date must be selected for a range',
      path: ['from'],
    }
  );

/**
 * Optional date range validator
 */
export const optionalDateRangeSchema = dateRangeSchema.optional();

/**
 * Date constraints validator
 */
export const dateConstraintsSchema = z.object({
  fromDate: optionalDateSchema,
  toDate: optionalDateSchema,
  disabled: z.array(dateSchema).optional(),
  hidden: z.array(dateSchema).optional(),
});

/**
 * Single date selection validator
 */
export const singleDateSelectionSchema = z.object({
  mode: z.literal('single'),
  selected: optionalDateSchema,
  required: z.boolean().optional(),
});

/**
 * Range date selection validator (single calendar)
 */
export const rangeSingleSelectionSchema = z.object({
  mode: z.literal('range-single'),
  selected: optionalDateRangeSchema,
  min: z.number().int().positive().optional(),
  max: z.number().int().positive().optional(),
});

/**
 * Range date selection validator (dual calendar)
 */
export const rangeDualSelectionSchema = z.object({
  mode: z.literal('range-dual'),
  selected: optionalDateRangeSchema,
  min: z.number().int().positive().optional(),
  max: z.number().int().positive().optional(),
  spacing: z.enum(['sm', 'md', 'lg']).optional(),
});

/**
 * Calendar selection validator - union of all selection types
 */
export const calendarSelectionSchema = z.discriminatedUnion('mode', [
  singleDateSelectionSchema,
  rangeSingleSelectionSchema,
  rangeDualSelectionSchema,
]);

/**
 * Additional validation for range selections with min/max constraints
 */
export const validateRangeConstraints = (
  data: z.infer<typeof rangeSingleSelectionSchema> | z.infer<typeof rangeDualSelectionSchema>
): boolean => {
  // If both min and max are provided, min should be <= max
  if (data.min !== undefined && data.max !== undefined) {
    return data.min <= data.max;
  }
  return true;
};

/**
 * Calendar state validator
 */
export const calendarStateSchema = z.object({
  mode: calendarModeSchema,
  selectedDate: optionalDateSchema,
  selectedRange: optionalDateRangeSchema,
  isLoading: z.boolean().optional(),
  error: z.string().optional(),
});

/**
 * Calendar configuration validator
 */
export const calendarConfigSchema = z.object({
  defaultMode: calendarModeSchema,
  allowModeSwitch: z.boolean(),
  dateFormat: z.string().min(1, { message: 'Date format cannot be empty' }),
  weekStartsOn: z.union([
    z.literal(0), // Sunday
    z.literal(1), // Monday
    z.literal(2), // Tuesday
    z.literal(3), // Wednesday
    z.literal(4), // Thursday
    z.literal(5), // Friday
    z.literal(6), // Saturday
  ]),
  showWeekNumbers: z.boolean(),
  numberOfMonths: z.number().int().positive().max(12),
  fixedWeeks: z.boolean(),
  showOutsideDays: z.boolean(),
});

/**
 * Calendar validation utilities
 */
export const calendarValidationUtils = {
  /**
   * Validates if a date is within allowed constraints
   */
  isDateAllowed: (date: Date, constraints: z.infer<typeof dateConstraintsSchema>): boolean => {
    const { fromDate, toDate, disabled = [] } = constraints;

    // Check if date is within the allowed range
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;

    // Check if date is not in the disabled list
    if (disabled.some(disabledDate => disabledDate.getTime() === date.getTime())) {
      return false;
    }

    return true;
  },

  /**
   * Validates if a date range is valid
   */
  isRangeValid: (range: z.infer<typeof dateRangeSchema>): boolean => {
    if (!range.from || !range.to) return false;
    return range.from <= range.to;
  },

  /**
   * Validates if a range meets minimum/maximum day requirements
   */
  isRangeLengthValid: (
    range: z.infer<typeof dateRangeSchema>,
    min?: number,
    max?: number
  ): boolean => {
    if (!range.from || !range.to) return false;

    const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days

    if (min !== undefined && diffDays < min) return false;
    if (max !== undefined && diffDays > max) return false;

    return true;
  },
};

/**
 * Type exports for use with the schemas
 */
export type CalendarModeData = z.infer<typeof calendarModeSchema>;
export type DateConstraintsData = z.infer<typeof dateConstraintsSchema>;
export type SingleDateSelectionData = z.infer<typeof singleDateSelectionSchema>;
export type RangeSingleSelectionData = z.infer<typeof rangeSingleSelectionSchema>;
export type RangeDualSelectionData = z.infer<typeof rangeDualSelectionSchema>;
export type CalendarSelectionData = z.infer<typeof calendarSelectionSchema>;
export type CalendarStateData = z.infer<typeof calendarStateSchema>;
export type CalendarConfigData = z.infer<typeof calendarConfigSchema>;
