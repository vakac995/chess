# Calendar Component Implementation

## Overview

This document outlines the implementation plan for a Calendar component that supports single date selection, range date selection (one calendar), and range date selection (two calendars). The implementation strictly follows the established project patterns and conventions outlined in `PATTERNS.md` and `STANDARDIZATION_PLAN.md`.

## Component Requirements

### Functional Requirements

1. **Single Date Selection**: Allow users to select a single date from one calendar
2. **Range Date Selection (Single Calendar)**: Allow users to select a date range using one calendar view
3. **Range Date Selection (Dual Calendar)**: Allow users to select a date range using two calendar views side by side

### Technical Requirements

- Follow established component structure patterns
- Use Jotai for state management
- Support Tailwind CSS with class-variance-authority (cva)
- Include comprehensive TypeScript typing
- Integrate with development utilities
- Support accessibility standards
- Include comprehensive testing

## Architecture Overview

### File Structure

Following the established standardization patterns:

```
src/components/Calendar/
├── Calendar.tsx                    # Main calendar component
├── Calendar.types.ts              # Type definitions
├── Calendar.module.scss           # Component-specific styles (if needed)
├── index.ts                       # Barrel exports
├── __tests__/
│   └── Calendar.test.tsx          # Unit tests
├── components/                    # Sub-components
│   ├── CalendarDay/
│   │   ├── CalendarDay.tsx
│   │   ├── CalendarDay.types.ts
│   │   └── index.ts
│   ├── CalendarHeader/
│   │   ├── CalendarHeader.tsx
│   │   ├── CalendarHeader.types.ts
│   │   └── index.ts
│   ├── CalendarGrid/
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarGrid.types.ts
│   │   └── index.ts
│   └── DualCalendarView/
│       ├── DualCalendarView.tsx
│       ├── DualCalendarView.types.ts
│       └── index.ts
├── hooks/
│   ├── useCalendar.ts             # Main calendar logic hook
│   ├── useCalendarKeyboard.ts     # Keyboard navigation
│   └── useCalendarRange.ts        # Range selection logic
└── utils/
    ├── calendarUtils.ts           # Date manipulation utilities
    └── calendarValidation.ts      # Validation utilities
```

### State Management

Following Jotai patterns, create dedicated atoms:

```
src/atoms/Calendar.atoms.ts        # Calendar-specific state atoms
```

## Type Definitions

### Core Types

```typescript
// Calendar.types.ts
import type { Optional, Nullable, ReactClassNameProps } from '@/types';

export type CalendarMode = 'single' | 'range' | 'dual-range';
export type CalendarView = 'month' | 'year' | 'decade';
export type CalendarWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, etc.

export interface CalendarDate {
  readonly year: number;
  readonly month: number; // 0-11 (JavaScript Date convention)
  readonly day: number;
}

export interface CalendarDateRange {
  readonly start: Nullable<CalendarDate>;
  readonly end: Nullable<CalendarDate>;
}

export interface CalendarProps extends ReactClassNameProps {
  readonly mode?: Optional<CalendarMode>;
  readonly view?: Optional<CalendarView>;
  readonly selectedDate?: Optional<CalendarDate>;
  readonly selectedRange?: Optional<CalendarDateRange>;
  readonly minDate?: Optional<CalendarDate>;
  readonly maxDate?: Optional<CalendarDate>;
  readonly disabledDates?: Optional<ReadonlyArray<CalendarDate>>;
  readonly weekStartsOn?: Optional<CalendarWeekStart>;
  readonly showOutsideDays?: Optional<boolean>;
  readonly showWeekNumbers?: Optional<boolean>;
  readonly locale?: Optional<string>;
  readonly onSelectDate?: Optional<(date: CalendarDate) => void>;
  readonly onSelectRange?: Optional<(range: CalendarDateRange) => void>;
  readonly onViewChange?: Optional<(view: CalendarView) => void>;
  readonly onMonthChange?: Optional<(year: number, month: number) => void>;
}

export interface CalendarDayProps extends ReactClassNameProps {
  readonly date: CalendarDate;
  readonly isSelected?: Optional<boolean>;
  readonly isInRange?: Optional<boolean>;
  readonly isRangeStart?: Optional<boolean>;
  readonly isRangeEnd?: Optional<boolean>;
  readonly isToday?: Optional<boolean>;
  readonly isOutsideMonth?: Optional<boolean>;
  readonly isDisabled?: Optional<boolean>;
  readonly isHovered?: Optional<boolean>;
  readonly onClick?: Optional<(date: CalendarDate) => void>;
  readonly onMouseEnter?: Optional<(date: CalendarDate) => void>;
  readonly onMouseLeave?: Optional<(date: CalendarDate) => void>;
}

export interface CalendarHeaderProps extends ReactClassNameProps {
  readonly currentMonth: number;
  readonly currentYear: number;
  readonly view: CalendarView;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onViewChange: (view: CalendarView) => void;
  readonly onMonthYearClick: () => void;
}

export interface CalendarGridProps extends ReactClassNameProps {
  readonly year: number;
  readonly month: number;
  readonly mode: CalendarMode;
  readonly selectedDate: Nullable<CalendarDate>;
  readonly selectedRange: Nullable<CalendarDateRange>;
  readonly minDate: Nullable<CalendarDate>;
  readonly maxDate: Nullable<CalendarDate>;
  readonly disabledDates: ReadonlyArray<CalendarDate>;
  readonly weekStartsOn: CalendarWeekStart;
  readonly showOutsideDays: boolean;
  readonly onSelectDate: (date: CalendarDate) => void;
  readonly onHoverDate: (date: Nullable<CalendarDate>) => void;
}

export interface DualCalendarViewProps extends ReactClassNameProps {
  readonly selectedRange: Nullable<CalendarDateRange>;
  readonly minDate: Nullable<CalendarDate>;
  readonly maxDate: Nullable<CalendarDate>;
  readonly disabledDates: ReadonlyArray<CalendarDate>;
  readonly weekStartsOn: CalendarWeekStart;
  readonly showOutsideDays: boolean;
  readonly onSelectRange: (range: CalendarDateRange) => void;
}
```

### Hook Types

```typescript
// hooks/useCalendar.ts
export interface UseCalendarProps {
  readonly mode?: Optional<CalendarMode>;
  readonly initialDate?: Optional<CalendarDate>;
  readonly initialRange?: Optional<CalendarDateRange>;
  readonly minDate?: Optional<CalendarDate>;
  readonly maxDate?: Optional<CalendarDate>;
  readonly disabledDates?: Optional<ReadonlyArray<CalendarDate>>;
}

export interface UseCalendarReturn {
  readonly currentDate: CalendarDate;
  readonly selectedDate: Nullable<CalendarDate>;
  readonly selectedRange: Nullable<CalendarDateRange>;
  readonly hoveredDate: Nullable<CalendarDate>;
  readonly view: CalendarView;
  readonly mode: CalendarMode;
  readonly actions: {
    readonly selectDate: (date: CalendarDate) => void;
    readonly selectRange: (range: CalendarDateRange) => void;
    readonly hoverDate: (date: Nullable<CalendarDate>) => void;
    readonly navigateMonth: (direction: 'prev' | 'next') => void;
    readonly navigateYear: (direction: 'prev' | 'next') => void;
    readonly setView: (view: CalendarView) => void;
    readonly goToToday: () => void;
    readonly reset: () => void;
  };
  readonly computed: {
    readonly isDateSelected: (date: CalendarDate) => boolean;
    readonly isDateInRange: (date: CalendarDate) => boolean;
    readonly isDateDisabled: (date: CalendarDate) => boolean;
    readonly isDateToday: (date: CalendarDate) => boolean;
  };
}
```

## State Management (Jotai Atoms)

```typescript
// src/atoms/Calendar.atoms.ts
import { atom } from 'jotai';
import type { CalendarDate, CalendarDateRange, CalendarView, CalendarMode } from '@/components/Calendar';

export const calendarModeAtom = atom<CalendarMode>('single');

export const calendarViewAtom = atom<CalendarView>('month');

export const currentCalendarDateAtom = atom<CalendarDate>(() => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
});

export const selectedCalendarDateAtom = atom<CalendarDate | null>(null);

export const selectedCalendarRangeAtom = atom<CalendarDateRange | null>(null);

export const hoveredCalendarDateAtom = atom<CalendarDate | null>(null);

export const calendarMinDateAtom = atom<CalendarDate | null>(null);

export const calendarMaxDateAtom = atom<CalendarDate | null>(null);

export const disabledCalendarDatesAtom = atom<ReadonlyArray<CalendarDate>>([]);

// Derived atoms
export const isRangeSelectionModeAtom = atom(
  (get) => {
    const mode = get(calendarModeAtom);
    return mode === 'range' || mode === 'dual-range';
  }
);

export const calendarDisplayMonthAtom = atom<{ year: number; month: number }>(
  (get) => {
    const currentDate = get(currentCalendarDateAtom);
    return { year: currentDate.year, month: currentDate.month };
  }
);
```

## Component Implementation

### Main Calendar Component

```typescript
// Calendar.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarHeader } from './components/CalendarHeader';
import { DualCalendarView } from './components/DualCalendarView';
import { useCalendar } from './hooks/useCalendar';
import { DevOnly, DevDataPanel } from '@/utils';
import type { CalendarProps } from './Calendar.types';

const calendarStyles = cva(
  'bg-background border-border inline-block rounded-card border p-4 shadow-md',
  {
    variants: {
      mode: {
        single: 'w-80',
        range: 'w-80',
        'dual-range': 'w-[640px]',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      mode: 'single',
      size: 'md',
    },
  }
);

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      mode = 'single',
      view = 'month',
      selectedDate,
      selectedRange,
      minDate,
      maxDate,
      disabledDates = [],
      weekStartsOn = 0,
      showOutsideDays = true,
      showWeekNumbers = false,
      locale = 'en-US',
      onSelectDate,
      onSelectRange,
      onViewChange,
      onMonthChange,
      className,
      ...props
    },
    ref
  ) => {
    const calendar = useCalendar({
      mode,
      initialDate: selectedDate,
      initialRange: selectedRange,
      minDate,
      maxDate,
      disabledDates,
    });

    const handleSelectDate = (date: CalendarDate) => {
      calendar.actions.selectDate(date);
      onSelectDate?.(date);
    };

    const handleSelectRange = (range: CalendarDateRange) => {
      calendar.actions.selectRange(range);
      onSelectRange?.(range);
    };

    const handleViewChange = (newView: CalendarView) => {
      calendar.actions.setView(newView);
      onViewChange?.(newView);
    };

    const handleMonthChange = (year: number, month: number) => {
      onMonthChange?.(year, month);
    };

    return (
      <div
        ref={ref}
        className={clsx(calendarStyles({ mode }), className)}
        role="grid"
        aria-label="Calendar"
        {...props}
      >
        <CalendarHeader
          currentMonth={calendar.currentDate.month}
          currentYear={calendar.currentDate.year}
          view={calendar.view}
          onPrevious={() => calendar.actions.navigateMonth('prev')}
          onNext={() => calendar.actions.navigateMonth('next')}
          onViewChange={handleViewChange}
          onMonthYearClick={() => {}}
        />
        
        {mode === 'dual-range' ? (
          <DualCalendarView
            selectedRange={calendar.selectedRange}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            weekStartsOn={weekStartsOn}
            showOutsideDays={showOutsideDays}
            onSelectRange={handleSelectRange}
          />
        ) : (
          <CalendarGrid
            year={calendar.currentDate.year}
            month={calendar.currentDate.month}
            mode={mode}
            selectedDate={calendar.selectedDate}
            selectedRange={calendar.selectedRange}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            weekStartsOn={weekStartsOn}
            showOutsideDays={showOutsideDays}
            onSelectDate={handleSelectDate}
            onHoverDate={calendar.actions.hoverDate}
          />
        )}

        <DevOnly>
          <DevDataPanel
            title="Calendar State"
            data={{
              mode: calendar.mode,
              view: calendar.view,
              currentDate: calendar.currentDate,
              selectedDate: calendar.selectedDate,
              selectedRange: calendar.selectedRange,
              hoveredDate: calendar.hoveredDate,
            }}
          />
        </DevOnly>
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';
```

### Calendar Day Component

```typescript
// components/CalendarDay/CalendarDay.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import type { CalendarDayProps } from './CalendarDay.types';

const dayStyles = cva(
  'relative flex h-9 w-9 items-center justify-center text-sm transition-colors duration-150 cursor-pointer rounded-md',
  {
    variants: {
      state: {
        default: 'text-text hover:bg-primary/10',
        selected: 'bg-primary text-white hover:bg-primary/80',
        today: 'bg-accent text-white',
        outside: 'text-text-muted hover:bg-gray-100',
        disabled: 'text-text-muted cursor-not-allowed opacity-50',
        'range-start': 'bg-primary text-white rounded-r-none',
        'range-middle': 'bg-primary/20 text-primary rounded-none',
        'range-end': 'bg-primary text-white rounded-l-none',
        hovered: 'bg-primary/10 text-primary',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isSelected = false,
  isInRange = false,
  isRangeStart = false,
  isRangeEnd = false,
  isToday = false,
  isOutsideMonth = false,
  isDisabled = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}) => {
  const getState = () => {
    if (isDisabled) return 'disabled';
    if (isRangeStart) return 'range-start';
    if (isRangeEnd) return 'range-end';
    if (isInRange) return 'range-middle';
    if (isSelected) return 'selected';
    if (isToday) return 'today';
    if (isOutsideMonth) return 'outside';
    if (isHovered) return 'hovered';
    return 'default';
  };

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(date);
    }
  };

  const handleMouseEnter = () => {
    if (!isDisabled && onMouseEnter) {
      onMouseEnter(date);
    }
  };

  const handleMouseLeave = () => {
    if (!isDisabled && onMouseLeave) {
      onMouseLeave(date);
    }
  };

  return (
    <button
      type="button"
      className={clsx(dayStyles({ state: getState() }), className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
      aria-label={`${date.day}`}
      aria-selected={isSelected}
      role="gridcell"
    >
      {date.day}
    </button>
  );
};
```

### Calendar Utilities

```typescript
// utils/calendarUtils.ts
import type { CalendarDate, CalendarWeekStart } from '../Calendar.types';

export const createCalendarDate = (year: number, month: number, day: number): CalendarDate => ({
  year,
  month,
  day,
});

export const dateToCalendarDate = (date: Date): CalendarDate => ({
  year: date.getFullYear(),
  month: date.getMonth(),
  day: date.getDate(),
});

export const calendarDateToDate = (calendarDate: CalendarDate): Date => {
  return new Date(calendarDate.year, calendarDate.month, calendarDate.day);
};

export const isSameDay = (date1: CalendarDate, date2: CalendarDate): boolean => {
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day
  );
};

export const isDateInRange = (
  date: CalendarDate,
  start: CalendarDate,
  end: CalendarDate
): boolean => {
  const dateMs = calendarDateToDate(date).getTime();
  const startMs = calendarDateToDate(start).getTime();
  const endMs = calendarDateToDate(end).getTime();
  
  return dateMs >= startMs && dateMs <= endMs;
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getCalendarDays = (
  year: number,
  month: number,
  weekStartsOn: CalendarWeekStart = 0
): CalendarDate[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const adjustedFirstDay = (firstDayOfMonth - weekStartsOn + 7) % 7;
  
  const days: CalendarDate[] = [];
  
  // Previous month days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    days.push({
      year: prevYear,
      month: prevMonth,
      day: daysInPrevMonth - i,
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ year, month, day });
  }
  
  // Next month days
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      year: nextYear,
      month: nextMonth,
      day,
    });
  }
  
  return days;
};

export const isToday = (date: CalendarDate): boolean => {
  const today = new Date();
  return isSameDay(date, dateToCalendarDate(today));
};

export const formatDate = (date: CalendarDate, locale: string = 'en-US'): string => {
  return calendarDateToDate(date).toLocaleDateString(locale);
};

export const getMonthName = (month: number, locale: string = 'en-US'): string => {
  return new Date(2000, month, 1).toLocaleDateString(locale, { month: 'long' });
};

export const getWeekdayNames = (
  weekStartsOn: CalendarWeekStart = 0,
  locale: string = 'en-US'
): string[] => {
  const names: string[] = [];
  const baseDate = new Date(2000, 0, 2); // A Sunday
  
  for (let i = 0; i < 7; i++) {
    const dayIndex = (weekStartsOn + i) % 7;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayIndex);
    names.push(date.toLocaleDateString(locale, { weekday: 'short' }));
  }
  
  return names;
};
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/Calendar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../Calendar';
import type { CalendarDate } from '../Calendar.types';

describe('Calendar', () => {
  const mockDate: CalendarDate = {
    year: 2024,
    month: 0, // January
    day: 15,
  };

  describe('Single Date Selection', () => {
    it('renders calendar in single mode', () => {
      render(<Calendar mode="single" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('calls onSelectDate when a date is clicked', async () => {
      const user = userEvent.setup();
      const onSelectDate = vi.fn();
      
      render(<Calendar mode="single" onSelectDate={onSelectDate} />);
      
      const dateButton = screen.getByRole('gridcell', { name: '15' });
      await user.click(dateButton);
      
      expect(onSelectDate).toHaveBeenCalledWith(expect.objectContaining({
        day: 15,
      }));
    });

    it('highlights selected date', () => {
      render(<Calendar mode="single" selectedDate={mockDate} />);
      
      const selectedDate = screen.getByRole('gridcell', { name: '15' });
      expect(selectedDate).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Range Date Selection', () => {
    it('renders calendar in range mode', () => {
      render(<Calendar mode="range" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('allows range selection', async () => {
      const user = userEvent.setup();
      const onSelectRange = vi.fn();
      
      render(<Calendar mode="range" onSelectRange={onSelectRange} />);
      
      await user.click(screen.getByRole('gridcell', { name: '10' }));
      await user.click(screen.getByRole('gridcell', { name: '15' }));
      
      expect(onSelectRange).toHaveBeenCalled();
    });
  });

  describe('Dual Calendar Range Selection', () => {
    it('renders dual calendars in dual-range mode', () => {
      render(<Calendar mode="dual-range" />);
      expect(screen.getAllByRole('grid')).toHaveLength(2);
    });
  });

  describe('Navigation', () => {
    it('navigates to next month', async () => {
      const user = userEvent.setup();
      const onMonthChange = vi.fn();
      
      render(<Calendar onMonthChange={onMonthChange} />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      expect(onMonthChange).toHaveBeenCalled();
    });

    it('navigates to previous month', async () => {
      const user = userEvent.setup();
      const onMonthChange = vi.fn();
      
      render(<Calendar onMonthChange={onMonthChange} />);
      
      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);
      
      expect(onMonthChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Calendar />);
      
      expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'Calendar');
      expect(screen.getAllByRole('gridcell')).not.toHaveLength(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Calendar />);
      
      const firstDay = screen.getAllByRole('gridcell')[0];
      firstDay.focus();
      
      await user.keyboard('{ArrowRight}');
      // Test keyboard navigation implementation
    });
  });

  describe('Date Restrictions', () => {
    it('disables dates outside min/max range', () => {
      const minDate: CalendarDate = { year: 2024, month: 0, day: 10 };
      const maxDate: CalendarDate = { year: 2024, month: 0, day: 20 };
      
      render(<Calendar minDate={minDate} maxDate={maxDate} />);
      
      const disabledDate = screen.getByRole('gridcell', { name: '5' });
      expect(disabledDate).toBeDisabled();
    });

    it('disables specifically disabled dates', () => {
      const disabledDates: CalendarDate[] = [
        { year: 2024, month: 0, day: 15 },
      ];
      
      render(<Calendar disabledDates={disabledDates} />);
      
      const disabledDate = screen.getByRole('gridcell', { name: '15' });
      expect(disabledDate).toBeDisabled();
    });
  });
});
```

## Integration Points

### Form Integration

```typescript
// Example form integration
import { Calendar } from '@/components/Calendar';
import { FormField } from '@/components/Form';

const BookingForm = () => {
  return (
    <FormField
      name="bookingDate"
      label="Select Booking Date"
      render={({ field, error }) => (
        <Calendar
          mode="single"
          selectedDate={field.value}
          onSelectDate={field.onChange}
          minDate={{ year: 2024, month: 0, day: 1 }}
        />
      )}
    />
  );
};
```

### Schema Validation

```typescript
// src/schemas/Calendar.schemas.ts
import { z } from 'zod';

const calendarDateSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(0).max(11),
  day: z.number().int().min(1).max(31),
});

const calendarDateRangeSchema = z.object({
  start: calendarDateSchema.nullable(),
  end: calendarDateSchema.nullable(),
});

export { calendarDateSchema, calendarDateRangeSchema };
```

## Styling Implementation

### Tailwind Configuration

Ensure the following utilities are available in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        calendar: {
          selected: 'var(--color-primary)',
          hover: 'var(--color-primary-10)',
          range: 'var(--color-primary-20)',
        }
      }
    }
  }
};
```

### SCSS Module (if needed)

```scss
// Calendar.module.scss
.calendar {
  &:focus-within {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.calendarDay {
  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
}

.rangeSelection {
  .calendarDay {
    &.rangeStart {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    
    &.rangeMiddle {
      border-radius: 0;
    }
    
    &.rangeEnd {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
```

## Development Utilities Integration

### Debug Information

```typescript
// Development debugging support
<DevOnly>
  <DevDataPanel
    title="Calendar Debug Info"
    data={{
      mode: calendar.mode,
      selectedDate: calendar.selectedDate,
      selectedRange: calendar.selectedRange,
      hoveredDate: calendar.hoveredDate,
      currentView: calendar.view,
    }}
  />
</DevOnly>
```

### Performance Monitoring

```typescript
// Hook for performance monitoring
import { useDevPerformance } from '@/utils';

export const useCalendar = (props: UseCalendarProps): UseCalendarReturn => {
  useDevPerformance('Calendar', { mode: props.mode });
  
  // Implementation...
};
```

## Documentation Requirements

### README Section

Add to main README.md:

```markdown
### Calendar Component

The Calendar component supports three modes:
- **Single**: Select one date
- **Range**: Select a date range using one calendar
- **Dual Range**: Select a date range using two calendars

Usage:
```tsx
import { Calendar } from '@/components/Calendar';

// Single date selection
<Calendar 
  mode="single" 
  onSelectDate={(date) => console.log(date)} 
/>

// Range selection
<Calendar 
  mode="range" 
  onSelectRange={(range) => console.log(range)} 
/>

// Dual calendar range selection
<Calendar 
  mode="dual-range" 
  onSelectRange={(range) => console.log(range)} 
/>
```
```

### API Documentation

Create comprehensive API documentation following the established patterns for component props, types, and usage examples.

## Implementation Checklist

- [ ] Create component file structure following standardization patterns
- [ ] Implement Calendar.types.ts with comprehensive TypeScript definitions
- [ ] Create Jotai atoms for state management
- [ ] Implement main Calendar component with cva styling
- [ ] Create sub-components (CalendarDay, CalendarHeader, CalendarGrid, DualCalendarView)
- [ ] Implement custom hooks (useCalendar, useCalendarKeyboard, useCalendarRange)
- [ ] Create utility functions for date manipulation and validation
- [ ] Write comprehensive unit tests
- [ ] Implement accessibility features
- [ ] Create integration examples
- [ ] Add development utilities integration
- [ ] Write documentation
- [ ] Update PROJECT_STRUCTURE.md
- [ ] Add to component index exports

## Conclusion

This implementation plan provides a comprehensive roadmap for creating a Calendar component that strictly adheres to the established project patterns and conventions. The component will be fully typed, tested, accessible, and integrate seamlessly with the existing codebase architecture.
