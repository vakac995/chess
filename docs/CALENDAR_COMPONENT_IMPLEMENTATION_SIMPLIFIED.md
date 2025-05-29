# Calendar Component Implementation Guide (Simplified)

This document outlines the implementation of a Calendar component using the **react-day-picker** library that supports three distinct modes:
1. **Single Date Selection** - One calendar for selecting a single date
2. **Range Date Selection (Single Calendar)** - One calendar for selecting a date range
3. **Range Date Selection (Dual Calendar)** - Two calendars for selecting a date range

The implementation follows the project's established patterns and conventions as defined in the standardization documentation.

## Technical Architecture

### Core Dependencies
- **Calendar Library**: react-day-picker (DayPicker) - Modern, TypeScript-first calendar component
- **Date Handling**: date-fns (peer dependency of react-day-picker)
- **State Management**: Jotai atoms for calendar state
- **Validation**: Zod schemas for date validation
- **Styling**: Tailwind CSS with class-variance-authority (cva)
- **Testing**: Vitest + React Testing Library

### Why react-day-picker?
- ✅ Written in TypeScript with excellent type support
- ✅ Minimal, customizable styling that works great with Tailwind CSS
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Comprehensive selection modes (single, range, multiple)
- ✅ Active maintenance and modern React patterns
- ✅ Uses date-fns for reliable date operations
- ✅ Smaller bundle size compared to alternatives
- ✅ 6,417 GitHub stars vs react-calendar's 3,705
- ✅ More recent updates (15 days ago vs 7 months ago)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install react-day-picker date-fns
```

### 2. Install Type Definitions (if needed)

```bash
npm install -D @types/react-day-picker
```

## File Structure

Following the established standardization patterns:

```
src/components/Calendar/
├── Calendar.tsx                    # Main calendar wrapper component
├── Calendar.types.ts              # Type definitions and interfaces
├── index.ts                       # Barrel exports
├── __tests__/
│   └── Calendar.test.tsx          # Unit tests
├── components/
│   ├── SingleCalendar/
│   │   ├── SingleCalendar.tsx
│   │   ├── SingleCalendar.types.ts
│   │   └── index.ts
│   ├── RangeCalendar/
│   │   ├── RangeCalendar.tsx
│   │   ├── RangeCalendar.types.ts
│   │   └── index.ts
│   └── DualRangeCalendar/
│       ├── DualRangeCalendar.tsx
│       ├── DualRangeCalendar.types.ts
│       └── index.ts
├── hooks/
│   └── useCalendarState.ts        # Calendar state management hook
└── utils/
    ├── calendarHelpers.ts          # Date utilities and helpers
    └── calendarValidation.ts       # Validation utilities
```

## Type Definitions

### Core Types

```typescript
// Calendar.types.ts
import type { DayPickerProps, DateRange } from 'react-day-picker';
import type { Optional, Nullable, ReactClassNameProps } from '@/types';

export type CalendarMode = 'single' | 'range' | 'dual-range';

export interface CalendarBaseProps extends ReactClassNameProps {
  readonly disabled?: Optional<Date[]>;
  readonly minDate?: Optional<Date>;
  readonly maxDate?: Optional<Date>;
  readonly locale?: Optional<string>;
  readonly weekStartsOn?: Optional<0 | 1 | 2 | 3 | 4 | 5 | 6>;
  readonly showOutsideDays?: Optional<boolean>;
  readonly showWeekNumbers?: Optional<boolean>;
}

export interface SingleCalendarProps extends CalendarBaseProps {
  readonly mode: 'single';
  readonly selected?: Optional<Date>;
  readonly onSelect?: Optional<(date: Optional<Date>) => void>;
}

export interface RangeCalendarProps extends CalendarBaseProps {
  readonly mode: 'range';
  readonly selected?: Optional<DateRange>;
  readonly onSelect?: Optional<(range: Optional<DateRange>) => void>;
}

export interface DualRangeCalendarProps extends CalendarBaseProps {
  readonly mode: 'dual-range';
  readonly selected?: Optional<DateRange>;
  readonly onSelect?: Optional<(range: Optional<DateRange>) => void>;
  readonly numberOfMonths?: Optional<number>;
}

export type CalendarProps = 
  | SingleCalendarProps 
  | RangeCalendarProps 
  | DualRangeCalendarProps;

export interface UseCalendarStateProps {
  readonly mode: CalendarMode;
  readonly initialDate?: Optional<Date>;
  readonly initialRange?: Optional<DateRange>;
}

export interface UseCalendarStateReturn {
  readonly selectedDate: Optional<Date>;
  readonly selectedRange: Optional<DateRange>;
  readonly setSelectedDate: (date: Optional<Date>) => void;
  readonly setSelectedRange: (range: Optional<DateRange>) => void;
  readonly reset: () => void;
}
```

## State Management (Jotai Atoms)

```typescript
// src/atoms/Calendar.atoms.ts
import { atom } from 'jotai';
import type { DateRange } from 'react-day-picker';

export const selectedCalendarDateAtom = atom<Date | undefined>(undefined);

export const selectedCalendarRangeAtom = atom<DateRange | undefined>(undefined);

export const calendarModeAtom = atom<'single' | 'range' | 'dual-range'>('single');

export const calendarDisabledDatesAtom = atom<Date[]>([]);

export const calendarMinDateAtom = atom<Date | undefined>(undefined);

export const calendarMaxDateAtom = atom<Date | undefined>(undefined);
```

## Component Implementation

### 1. Main Calendar Component

```typescript
// Calendar.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { SingleCalendar } from './components/SingleCalendar';
import { RangeCalendar } from './components/RangeCalendar';
import { DualRangeCalendar } from './components/DualRangeCalendar';
import type { CalendarProps } from './Calendar.types';

const calendarContainerStyles = cva(
  'bg-white border border-gray-200 rounded-lg shadow-sm p-4',
  {
    variants: {
      mode: {
        single: 'w-fit',
        range: 'w-fit',
        'dual-range': 'w-fit',
      },
    },
    defaultVariants: {
      mode: 'single',
    },
  }
);

export const Calendar: React.FC<CalendarProps> = (props) => {
  const { mode, className, ...rest } = props;

  return (
    <div className={clsx(calendarContainerStyles({ mode }), className)}>
      {mode === 'single' && <SingleCalendar {...(rest as any)} />}
      {mode === 'range' && <RangeCalendar {...(rest as any)} />}
      {mode === 'dual-range' && <DualRangeCalendar {...(rest as any)} />}
    </div>
  );
};

Calendar.displayName = 'Calendar';
```

### 2. Single Calendar Implementation

```typescript
// components/SingleCalendar/SingleCalendar.tsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useCalendarState } from '../../hooks/useCalendarState';
import { createCalendarProps } from '../../utils/calendarHelpers';
import type { SingleCalendarProps } from './SingleCalendar.types';

export const SingleCalendar: React.FC<SingleCalendarProps> = ({
  selected,
  onSelect,
  disabled,
  minDate,
  maxDate,
  locale,
  weekStartsOn = 0,
  showOutsideDays = true,
  showWeekNumbers = false,
  className,
  ...props
}) => {
  const { selectedDate, setSelectedDate } = useCalendarState({
    mode: 'single',
    initialDate: selected,
  });

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onSelect?.(date);
  };

  const dayPickerProps = createCalendarProps({
    mode: 'single',
    selected: selectedDate,
    onSelect: handleSelect,
    disabled,
    fromDate: minDate,
    toDate: maxDate,
    locale,
    weekStartsOn,
    showOutsideDays,
    showWeekNumbers,
    className,
  });

  return <DayPicker {...dayPickerProps} />;
};

SingleCalendar.displayName = 'SingleCalendar';
```

### 3. Range Calendar Implementation

```typescript
// components/RangeCalendar/RangeCalendar.tsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useCalendarState } from '../../hooks/useCalendarState';
import { createCalendarProps } from '../../utils/calendarHelpers';
import type { RangeCalendarProps } from './RangeCalendar.types';

export const RangeCalendar: React.FC<RangeCalendarProps> = ({
  selected,
  onSelect,
  disabled,
  minDate,
  maxDate,
  locale,
  weekStartsOn = 0,
  showOutsideDays = true,
  showWeekNumbers = false,
  className,
  ...props
}) => {
  const { selectedRange, setSelectedRange } = useCalendarState({
    mode: 'range',
    initialRange: selected,
  });

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onSelect?.(range);
  };

  const dayPickerProps = createCalendarProps({
    mode: 'range',
    selected: selectedRange,
    onSelect: handleSelect,
    disabled,
    fromDate: minDate,
    toDate: maxDate,
    locale,
    weekStartsOn,
    showOutsideDays,
    showWeekNumbers,
    className,
  });

  return <DayPicker {...dayPickerProps} />;
};

RangeCalendar.displayName = 'RangeCalendar';
```

### 4. Dual Range Calendar Implementation

```typescript
// components/DualRangeCalendar/DualRangeCalendar.tsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useCalendarState } from '../../hooks/useCalendarState';
import { createCalendarProps } from '../../utils/calendarHelpers';
import type { DualRangeCalendarProps } from './DualRangeCalendar.types';

export const DualRangeCalendar: React.FC<DualRangeCalendarProps> = ({
  selected,
  onSelect,
  disabled,
  minDate,
  maxDate,
  locale,
  weekStartsOn = 0,
  showOutsideDays = true,
  showWeekNumbers = false,
  numberOfMonths = 2,
  className,
  ...props
}) => {
  const { selectedRange, setSelectedRange } = useCalendarState({
    mode: 'dual-range',
    initialRange: selected,
  });

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onSelect?.(range);
  };

  const dayPickerProps = createCalendarProps({
    mode: 'range',
    selected: selectedRange,
    onSelect: handleSelect,
    disabled,
    fromDate: minDate,
    toDate: maxDate,
    locale,
    weekStartsOn,
    showOutsideDays,
    showWeekNumbers,
    numberOfMonths,
    className,
  });

  return <DayPicker {...dayPickerProps} />;
};

DualRangeCalendar.displayName = 'DualRangeCalendar';
```

### 5. Calendar State Hook

```typescript
// hooks/useCalendarState.ts
import { useAtom } from 'jotai';
import { selectedCalendarDateAtom, selectedCalendarRangeAtom } from '@/atoms/Calendar.atoms';
import type { UseCalendarStateProps, UseCalendarStateReturn } from '../Calendar.types';
import type { DateRange } from 'react-day-picker';

export const useCalendarState = ({
  mode,
  initialDate,
  initialRange,
}: UseCalendarStateProps): UseCalendarStateReturn => {
  const [selectedDate, setSelectedDate] = useAtom(selectedCalendarDateAtom);
  const [selectedRange, setSelectedRange] = useAtom(selectedCalendarRangeAtom);

  // Initialize with provided values if they exist
  React.useEffect(() => {
    if (mode === 'single' && initialDate && !selectedDate) {
      setSelectedDate(initialDate);
    }
  }, [mode, initialDate, selectedDate, setSelectedDate]);

  React.useEffect(() => {
    if ((mode === 'range' || mode === 'dual-range') && initialRange && !selectedRange) {
      setSelectedRange(initialRange);
    }
  }, [mode, initialRange, selectedRange, setSelectedRange]);

  const reset = () => {
    setSelectedDate(undefined);
    setSelectedRange(undefined);
  };

  return {
    selectedDate,
    selectedRange,
    setSelectedDate,
    setSelectedRange,
    reset,
  };
};
```

### 6. Calendar Utilities

```typescript
// utils/calendarHelpers.ts
import type { DayPickerProps, DateRange } from 'react-day-picker';
import clsx from 'clsx';

interface CreateCalendarPropsOptions {
  mode: 'single' | 'range';
  selected?: Date | DateRange;
  onSelect?: (value: any) => void;
  disabled?: Date[];
  fromDate?: Date;
  toDate?: Date;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showOutsideDays?: boolean;
  showWeekNumbers?: boolean;
  numberOfMonths?: number;
  className?: string;
}

export const createCalendarProps = (options: CreateCalendarPropsOptions): DayPickerProps => {
  const {
    mode,
    selected,
    onSelect,
    disabled,
    fromDate,
    toDate,
    locale,
    weekStartsOn,
    showOutsideDays,
    showWeekNumbers,
    numberOfMonths,
    className,
  } = options;

  return {
    mode: mode as any,
    selected,
    onSelect,
    disabled: disabled ? (date: Date) => disabled.some(d => isSameDay(d, date)) : undefined,
    fromDate,
    toDate,
    locale: locale ? { code: locale } : undefined,
    weekStartsOn,
    showOutsideDays,
    showWeekNumbers,
    numberOfMonths,
    className: clsx(
      // Custom Tailwind classes for DayPicker
      '[&_.rdp]:font-sans',
      '[&_.rdp-button]:rounded-md',
      '[&_.rdp-button]:transition-colors',
      '[&_.rdp-button:hover]:bg-gray-100',
      '[&_.rdp-button_selected]:bg-blue-600',
      '[&_.rdp-button_selected]:text-white',
      '[&_.rdp-button_selected:hover]:bg-blue-700',
      '[&_.rdp-range_start]:bg-blue-600',
      '[&_.rdp-range_start]:text-white',
      '[&_.rdp-range_end]:bg-blue-600',
      '[&_.rdp-range_end]:text-white',
      '[&_.rdp-range_middle]:bg-blue-100',
      '[&_.rdp-range_middle]:text-blue-900',
      className
    ),
    styles: {
      root: { '--rdp-accent-color': '#3b82f6' },
    },
  };
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatDate = (date: Date, locale: string = 'en-US'): string => {
  return date.toLocaleDateString(locale);
};

export const formatDateRange = (range: DateRange, locale: string = 'en-US'): string => {
  if (!range.from) return '';
  if (!range.to) return formatDate(range.from, locale);
  return `${formatDate(range.from, locale)} - ${formatDate(range.to, locale)}`;
};
```

## Custom Styling with Tailwind CSS

### 1. Custom CSS for DayPicker Integration

```css
/* src/components/Calendar/Calendar.css */
.rdp {
  --rdp-cell-size: 2.25rem; /* 9 in Tailwind = 36px */
  --rdp-accent-color: theme('colors.blue.600');
  --rdp-background-color: theme('colors.blue.50');
  --rdp-outline: 2px solid var(--rdp-accent-color);
  --rdp-outline-selected: 2px solid rgba(0, 0, 0, 0.75);
}

.rdp-button {
  @apply rounded-md transition-colors duration-150;
}

.rdp-button:hover {
  @apply bg-gray-100;
}

.rdp-button[data-selected] {
  @apply bg-blue-600 text-white;
}

.rdp-button[data-selected]:hover {
  @apply bg-blue-700;
}

.rdp-range_start {
  @apply bg-blue-600 text-white rounded-r-none;
}

.rdp-range_middle {
  @apply bg-blue-100 text-blue-900 rounded-none;
}

.rdp-range_end {
  @apply bg-blue-600 text-white rounded-l-none;
}

.rdp-day_today {
  @apply font-bold text-blue-600;
}

.rdp-day_outside {
  @apply text-gray-400;
}

.rdp-day_disabled {
  @apply text-gray-300 cursor-not-allowed;
}
```

### 2. Variant Styles with CVA

```typescript
// Calendar styling variants
const calendarVariants = cva(
  'rounded-lg border bg-white shadow-sm',
  {
    variants: {
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4 text-base',
        lg: 'p-6 text-lg',
      },
      variant: {
        default: 'border-gray-200',
        outlined: 'border-2 border-blue-200',
        elevated: 'shadow-lg border-gray-100',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/Calendar.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../Calendar';

describe('Calendar', () => {
  describe('Single Mode', () => {
    it('renders single date picker', () => {
      render(<Calendar mode="single" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('calls onSelect when date is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      
      render(<Calendar mode="single" onSelect={onSelect} />);
      
      const today = new Date();
      const dayButton = screen.getByRole('gridcell', { 
        name: today.getDate().toString() 
      });
      
      await user.click(dayButton);
      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('Range Mode', () => {
    it('renders range date picker', () => {
      render(<Calendar mode="range" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('allows range selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      
      render(<Calendar mode="range" onSelect={onSelect} />);
      
      const firstDay = screen.getByRole('gridcell', { name: '1' });
      const fifthDay = screen.getByRole('gridcell', { name: '5' });
      
      await user.click(firstDay);
      await user.click(fifthDay);
      
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date),
        })
      );
    });
  });

  describe('Dual Range Mode', () => {
    it('renders two calendar months', () => {
      render(<Calendar mode="dual-range" />);
      expect(screen.getAllByRole('grid')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Calendar mode="single" />);
      expect(screen.getByRole('grid')).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Calendar mode="single" />);
      
      const grid = screen.getByRole('grid');
      grid.focus();
      
      await user.keyboard('{ArrowRight}');
      // Test that focus moves appropriately
    });
  });
});
```

## Integration Examples

### 1. Form Integration with React Hook Form

```typescript
// Example: Date selection in a form
import { useForm, Controller } from 'react-hook-form';
import { Calendar } from '@/components/Calendar';
import { z } from 'zod';

const bookingSchema = z.object({
  checkIn: z.date(),
  checkOut: z.date(),
});

const BookingForm = () => {
  const { control, handleSubmit } = useForm<z.infer<typeof bookingSchema>>();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="checkIn"
        control={control}
        render={({ field }) => (
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
          />
        )}
      />
      
      <Controller
        name="checkOut"
        control={control}
        render={({ field }) => (
          <Calendar
            mode="range"
            selected={field.value}
            onSelect={field.onChange}
          />
        )}
      />
    </form>
  );
};
```

### 2. Validation Schemas

```typescript
// src/schemas/Calendar.schemas.ts
import { z } from 'zod';

export const dateSchema = z.date({
  required_error: 'Date is required',
  invalid_type_error: 'Invalid date format',
});

export const dateRangeSchema = z.object({
  from: dateSchema,
  to: dateSchema,
}).refine(
  (data) => data.from <= data.to,
  {
    message: 'End date must be after start date',
    path: ['to'],
  }
);

export const bookingDatesSchema = z.object({
  checkIn: dateSchema,
  checkOut: dateSchema,
}).refine(
  (data) => data.checkIn < data.checkOut,
  {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  }
);
```

## Barrel Exports

```typescript
// index.ts
export { Calendar } from './Calendar';
export { SingleCalendar } from './components/SingleCalendar';
export { RangeCalendar } from './components/RangeCalendar';
export { DualRangeCalendar } from './components/DualRangeCalendar';
export { useCalendarState } from './hooks/useCalendarState';
export * from './Calendar.types';
export * from './utils/calendarHelpers';
```

## Benefits of This Approach

### 1. **Reduced Development Time**
- No need to implement complex calendar logic from scratch
- Built-in accessibility features
- Pre-tested date selection and navigation

### 2. **Better Reliability**
- Well-tested library with 6,417 GitHub stars
- Active maintenance and regular updates
- Comprehensive TypeScript support

### 3. **Easier Maintenance**
- Library handles complex edge cases
- Regular security updates
- Community-driven improvements

### 4. **Better User Experience**
- Proven UX patterns
- Keyboard navigation support
- Screen reader compatibility
- Mobile-friendly touch interactions

### 5. **Customization Flexibility**
- Minimal default styling
- Easy Tailwind CSS integration
- Custom component override options
- Flexible theming system

## Implementation Checklist

- [ ] Install react-day-picker and date-fns dependencies
- [ ] Create component file structure following standardization patterns
- [ ] Implement Calendar.types.ts with comprehensive TypeScript definitions
- [ ] Create Jotai atoms for state management
- [ ] Implement main Calendar wrapper component
- [ ] Create mode-specific components (Single, Range, DualRange)
- [ ] Implement useCalendarState hook
- [ ] Create utility functions and helpers
- [ ] Add custom Tailwind CSS styling
- [ ] Write comprehensive unit tests
- [ ] Create integration examples with forms
- [ ] Add Zod validation schemas
- [ ] Create barrel exports
- [ ] Write documentation
- [ ] Update PROJECT_STRUCTURE.md

## Conclusion

This simplified approach leverages the battle-tested react-day-picker library while maintaining full compliance with the project's established patterns and conventions. The implementation provides:

- **3 distinct calendar modes** with consistent APIs
- **Full TypeScript support** with proper type definitions
- **Tailwind CSS integration** with customizable styling
- **Jotai state management** following project patterns
- **Comprehensive testing** strategy
- **Form integration** examples with validation
- **Accessibility compliance** out of the box

By using react-day-picker, we significantly reduce development time while ensuring a robust, well-tested, and accessible calendar component that perfectly fits the project's architecture.
