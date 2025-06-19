import { atom, WritableAtom, PrimitiveAtom } from 'jotai';
import type { DateRange } from 'react-day-picker';
import {
  LoadingStatus,
  type AsyncState,
  type StatusType,
  createInitialAsyncState,
  createError,
  createDetailedError,
} from '@/types';
import type {
  CalendarMode,
  CalendarSelection,
  CalendarConfig,
} from '../components/Calendar/Calendar.types';
import {
  calendarModeSchema,
  calendarConfigSchema,
  calendarSelectionSchema,
} from '../components/Calendar/Calendar.schemas';

/**
 * Extended calendar state interface for atoms
 */
interface CalendarAtomState extends AsyncState<CalendarSelection> {
  readonly mode: CalendarMode;
  readonly selectedDate?: Date;
  readonly selectedRange?: DateRange;
  readonly config: CalendarConfig;
  readonly status: StatusType;
}

/**
 * Default calendar configuration
 */
const defaultConfig: CalendarConfig = {
  defaultMode: 'single',
  allowModeSwitch: true,
  theme: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    muted: 'hsl(var(--muted))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
  },
  dateFormat: 'PPP',
  weekStartsOn: 1, // Monday
  showWeekNumbers: false,
  numberOfMonths: 1,
  fixedWeeks: true,
  showOutsideDays: true,
};

/**
 * Initial calendar state
 */
const initialState: CalendarAtomState = {
  ...createInitialAsyncState<CalendarSelection>(),
  mode: 'single',
  selectedDate: undefined,
  selectedRange: undefined,
  config: defaultConfig,
  status: LoadingStatus.IDLE,
};

// =============================================================================
// Primary Calendar Atoms
// =============================================================================

/**
 * Main calendar atom - manages overall calendar state
 */
export const calendarAtom: PrimitiveAtom<CalendarAtomState> = atom<CalendarAtomState>(initialState);

/**
 * Calendar mode atom - for switching between calendar modes
 */
export const calendarModeAtom: WritableAtom<CalendarMode, [CalendarMode], void> = atom(
  (get): CalendarMode => get(calendarAtom).mode,
  (get, set, newMode: CalendarMode): void => {
    const current = get(calendarAtom);

    // Validate mode switch is allowed
    if (!current.config.allowModeSwitch) {
      return;
    }

    // Clear selections when switching modes
    set(calendarAtom, {
      ...current,
      mode: newMode,
      selectedDate: undefined,
      selectedRange: undefined,
      data: undefined,
      status: LoadingStatus.IDLE,
      error: null,
    });
  }
);

/**
 * Calendar configuration atom
 */
export const calendarConfigAtom: WritableAtom<CalendarConfig, [Partial<CalendarConfig>], void> =
  atom(
    (get): CalendarConfig => get(calendarAtom).config,
    (get, set, configUpdates: Partial<CalendarConfig>): void => {
      const current = get(calendarAtom);
      const newConfig = { ...current.config, ...configUpdates };
      // Validate the new configuration
      try {
        calendarConfigSchema.parse(newConfig);
        set(calendarAtom, {
          ...current,
          config: newConfig,
        });
      } catch {
        set(calendarAtom, {
          ...current,
          error: createError('Invalid calendar configuration'),
          status: LoadingStatus.REJECTED,
        });
      }
    }
  );

// =============================================================================
// Derived Read-Only Atoms
// =============================================================================

/**
 * Selected date atom (for single mode)
 */
export const selectedDateAtom = atom((get): Date | undefined => {
  const state = get(calendarAtom);
  return state.mode === 'single' ? state.selectedDate : undefined;
});

/**
 * Selected range atom (for range modes)
 */
export const selectedRangeAtom = atom((get): DateRange | undefined => {
  const state = get(calendarAtom);
  return state.mode !== 'single' ? state.selectedRange : undefined;
});

/**
 * Calendar selection atom - returns current selection based on mode
 */
export const calendarSelectionAtom = atom((get): CalendarSelection => {
  const state = get(calendarAtom);
  switch (state.mode) {
    case 'single':
      return state.selectedDate;
    case 'range-single':
    case 'range-dual':
      return state.selectedRange;
    default:
      return undefined;
  }
});

/**
 * Calendar error atom
 */
export const calendarErrorAtom = atom(get => get(calendarAtom).error);

/**
 * Calendar status atom
 */
export const calendarStatusAtom = atom((get): StatusType => get(calendarAtom).status);

/**
 * Calendar loading atom
 */
export const calendarLoadingAtom = atom(
  (get): boolean => get(calendarAtom).status === LoadingStatus.PENDING
);

/**
 * Is range complete atom - checks if both start and end dates are selected
 */
export const isRangeCompleteAtom = atom((get): boolean => {
  const state = get(calendarAtom);
  if (state.mode === 'single') return !!state.selectedDate;
  if (!state.selectedRange) return false;
  return !!(state.selectedRange.from && state.selectedRange.to);
});

/**
 * Has selection atom - checks if any date/range is selected
 */
export const hasSelectionAtom = atom((get): boolean => {
  const state = get(calendarAtom);
  return state.mode === 'single' ? !!state.selectedDate : !!state.selectedRange?.from;
});

// =============================================================================
// Action Atoms
// =============================================================================

/**
 * Select single date atom
 */
export const selectSingleDateAtom: WritableAtom<null, [Date | undefined], void> = atom(
  null,
  (get, set, date: Date | undefined): void => {
    const current = get(calendarAtom);

    if (current.mode !== 'single') {
      set(calendarAtom, {
        ...current,
        error: createError('Cannot select single date in non-single mode'),
        status: LoadingStatus.REJECTED,
      });
      return;
    }
    try {
      // Validate the date selection
      const selection = date;
      calendarSelectionSchema.parse({ mode: 'single', selection });

      set(calendarAtom, {
        ...current,
        selectedDate: date,
        selectedRange: undefined,
        data: selection,
        error: null,
        status: LoadingStatus.FULFILLED,
      });
    } catch {
      set(calendarAtom, {
        ...current,
        error: createDetailedError(
          'Invalid date selection',
          'The selected date is not valid',
          'Please select a valid date within the allowed range.',
          'calendar-error'
        ),
        status: LoadingStatus.REJECTED,
      });
    }
  }
);

/**
 * Select date range atom
 */
export const selectDateRangeAtom: WritableAtom<null, [DateRange | undefined], void> = atom(
  null,
  (get, set, range: DateRange | undefined): void => {
    const current = get(calendarAtom);

    if (current.mode === 'single') {
      set(calendarAtom, {
        ...current,
        error: createError('Cannot select date range in single mode'),
        status: LoadingStatus.REJECTED,
      });
      return;
    }
    try {
      // Validate the range selection
      const selection = range;
      calendarSelectionSchema.parse({ mode: current.mode, selection });

      set(calendarAtom, {
        ...current,
        selectedDate: undefined,
        selectedRange: range,
        data: selection,
        error: null,
        status: LoadingStatus.FULFILLED,
      });
    } catch {
      set(calendarAtom, {
        ...current,
        error: createDetailedError(
          'Invalid range selection',
          'The selected date range is not valid',
          'Please ensure the start date is before the end date and both are within the allowed range.',
          'calendar-error'
        ),
        status: LoadingStatus.REJECTED,
      });
    }
  }
);

/**
 * Clear calendar selection atom
 */
export const clearCalendarSelectionAtom: WritableAtom<null, [], void> = atom(
  null,
  (get, set): void => {
    const current = get(calendarAtom);
    set(calendarAtom, {
      ...current,
      selectedDate: undefined,
      selectedRange: undefined,
      data: undefined,
      error: null,
      status: LoadingStatus.IDLE,
    });
  }
);

/**
 * Reset calendar atom - resets to initial state
 */
export const resetCalendarAtom: WritableAtom<null, [], void> = atom(null, (_, set): void => {
  set(calendarAtom, initialState);
});

/**
 * Initialize calendar atom - sets up calendar with specific mode and config
 */
export const initializeCalendarAtom: WritableAtom<
  null,
  [{ mode?: CalendarMode; config?: Partial<CalendarConfig> }],
  void
> = atom(
  null,
  (_get, set, options: { mode?: CalendarMode; config?: Partial<CalendarConfig> }): void => {
    const { mode = 'single', config: configOverrides = {} } = options;
    const newConfig = { ...defaultConfig, ...configOverrides };

    try {
      // Validate the initialization parameters
      calendarModeSchema.parse(mode);
      calendarConfigSchema.parse(newConfig);

      set(calendarAtom, {
        ...initialState,
        mode,
        config: newConfig,
        status: LoadingStatus.FULFILLED,
      });
    } catch {
      set(calendarAtom, {
        ...initialState,
        error: createError('Failed to initialize calendar with provided configuration'),
        status: LoadingStatus.REJECTED,
      });
    }
  }
);

// =============================================================================
// Utility Atoms
// =============================================================================

/**
 * Is date selected atom - checks if a specific date is selected
 */
export const isDateSelectedAtom = atom(null, (get, _set, date: Date): boolean => {
  const state = get(calendarAtom);

  if (state.mode === 'single') {
    return state.selectedDate ? state.selectedDate.toDateString() === date.toDateString() : false;
  }

  // For range modes, check if date is within selected range
  if (!state.selectedRange) return false;

  const { from, to } = state.selectedRange;
  if (!from) return false;

  if (!to) {
    // Only start date selected
    return from.toDateString() === date.toDateString();
  }

  // Both dates selected - check if date is in range
  return date >= from && date <= to;
});

/**
 * Is date in range atom - checks if a date is within the selected range
 */
export const isDateInRangeAtom = atom(null, (get, _set, date: Date): boolean => {
  const state = get(calendarAtom);

  if (state.mode === 'single' || !state.selectedRange) return false;

  const { from, to } = state.selectedRange;
  if (!from || !to) return false;

  return date >= from && date <= to;
});
