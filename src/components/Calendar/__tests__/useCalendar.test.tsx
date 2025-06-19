import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { useCalendar } from '../useCalendar';
import type { UseCalendarProps, CalendarMode } from '../Calendar.types';
import {
  calendarAtom, // Import the main calendarAtom
  calendarModeAtom,
} from '@/atoms';
import type { DateRange } from 'react-day-picker';
import { LoadingStatus, type FieldErrorInfo } from '@/types'; // Import LoadingStatus

// Helper to create a fresh store for each test
const createTestStore = () => {
  const store = createStore();
  // Reset the main calendarAtom to its initial state before each test
  // This ensures a clean slate and avoids interference between tests.
  const initialCalendarState = store.get(calendarAtom); // Get initial state if needed or define one
  store.set(calendarAtom, {
    ...initialCalendarState,
    mode: 'single', // Default mode for most tests unless overridden
    selectedDate: undefined,
    selectedRange: undefined,
    error: null,
    status: LoadingStatus.IDLE,
    data: undefined,
    config: {
      ...initialCalendarState.config,
      allowModeSwitch: true, // Ensure mode switching is enabled for tests
    },
  });
  return store;
};

const wrapper = ({
  children,
  store,
}: {
  children: React.ReactNode;
  store: ReturnType<typeof createTestStore>;
}) => <Provider store={store}>{children}</Provider>;

describe('useCalendar Hook', () => {
  it('initializes with default values', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCalendar({}), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.mode).toBe('single');
    expect(result.current.selectedDate).toBeNull();
    expect(result.current.selectedRange).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.currentSelection).toBeNull();
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.isValidSelection).toBe(false);
  });

  it('initializes with mode prop', () => {
    const store = createTestStore();
    const props: UseCalendarProps = {
      mode: 'range-single',
    };
    // Initialize the store with the mode from props for this specific test
    act(() => {
      store.set(calendarModeAtom, 'range-single');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });
    expect(result.current.mode).toBe('range-single');
  });

  it('initializes with initialDate in single mode', () => {
    const store = createTestStore();
    const initialDate = new Date(2024, 0, 15);
    const props: UseCalendarProps = {
      mode: 'single',
      initialDate,
    };
    // No need to set store separately if hook initializes it
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.mode).toBe('single');
    expect(result.current.selectedDate).toEqual(initialDate);
    expect(result.current.currentSelection).toEqual(initialDate);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.isValidSelection).toBe(true);
  });

  it('initializes with initialRange in range-single mode', () => {
    const store = createTestStore();
    const initialRange: DateRange = {
      from: new Date(2024, 0, 10),
      to: new Date(2024, 0, 20),
    };
    const props: UseCalendarProps = {
      mode: 'range-single',
      initialRange,
    };
    act(() => {
      // Ensure mode is set correctly if hook relies on it for initialRange
      store.set(calendarModeAtom, 'range-single');
    });

    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.mode).toBe('range-single');
    expect(result.current.selectedRange).toEqual(initialRange);
    expect(result.current.currentSelection).toEqual(initialRange);
    expect(result.current.hasSelection).toBe(true);
    // isRangeComplete depends on the atom's logic, assuming it's true for a valid range
  });

  it('initializes with initialRange in range-dual mode', () => {
    const store = createTestStore();
    const initialRange: DateRange = {
      from: new Date(2024, 0, 10),
      to: new Date(2024, 1, 20),
    };
    const props: UseCalendarProps = {
      mode: 'range-dual',
      initialRange,
    };
    act(() => {
      // Ensure mode is set correctly
      store.set(calendarModeAtom, 'range-dual');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.mode).toBe('range-dual');
    expect(result.current.selectedRange).toEqual(initialRange);
  });

  it('handles date selection in single mode', () => {
    const store = createTestStore();
    const onDateSelect = vi.fn();
    const props: UseCalendarProps = {
      mode: 'single',
      onDateSelect,
    };
    act(() => {
      // Ensure mode is set correctly
      store.set(calendarModeAtom, 'single');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    const newDate = new Date(2024, 0, 25);

    act(() => {
      result.current.actions.selectDate(newDate);
    });

    expect(result.current.selectedDate).toEqual(newDate);
    expect(result.current.currentSelection).toEqual(newDate);
    expect(onDateSelect).toHaveBeenCalledWith(newDate);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.isValidSelection).toBe(true);
  });

  it('handles range selection in range-single mode', () => {
    const store = createTestStore();
    const onRangeSelect = vi.fn();
    const props: UseCalendarProps = {
      mode: 'range-single',
      onRangeSelect,
    };
    act(() => {
      // Ensure mode is set correctly
      store.set(calendarModeAtom, 'range-single');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    const newRange: DateRange = {
      from: new Date(2024, 0, 10),
      to: new Date(2024, 0, 20),
    };

    act(() => {
      result.current.actions.selectRange(newRange);
    });

    expect(result.current.selectedRange).toEqual(newRange);
    expect(result.current.currentSelection).toEqual(newRange);
    expect(onRangeSelect).toHaveBeenCalledWith(newRange);
    expect(result.current.hasSelection).toBe(true);
  });

  it('handles mode changes correctly and clears selection via actions.changeMode', () => {
    const store = createTestStore();
    const onModeChange = vi.fn();
    const initialDate = new Date(2024, 0, 15);

    // Set initial state for the test
    act(() => {
      store.set(calendarAtom, {
        ...store.get(calendarAtom),
        mode: 'single',
        selectedDate: initialDate,
      });
    });

    const { result } = renderHook(
      () => useCalendar({ mode: 'single', initialDate, onModeChange }),
      {
        wrapper: ({ children }) => wrapper({ children, store }),
      }
    );

    expect(result.current.mode).toBe('single');
    expect(result.current.selectedDate).toEqual(initialDate);

    act(() => {
      result.current.actions.changeMode('range-single');
    });

    expect(result.current.mode).toBe('range-single');
    expect(result.current.selectedDate).toBeNull();
    expect(result.current.selectedRange).toBeNull();
    expect(result.current.currentSelection).toBeNull();
    expect(result.current.hasSelection).toBe(false);
    expect(onModeChange).toHaveBeenCalledWith('range-single');
  });

  it('handles mode changes correctly and clears selection via prop update', () => {
    const store = createTestStore();
    const onModeChange = vi.fn();
    const initialDate = new Date(2024, 0, 15);

    act(() => {
      store.set(calendarAtom, {
        ...store.get(calendarAtom),
        mode: 'single',
        selectedDate: initialDate,
      });
    });

    const { result, rerender } = renderHook((props: UseCalendarProps) => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
      initialProps: { mode: 'single' as CalendarMode, initialDate, onModeChange },
    });

    expect(result.current.mode).toBe('single');
    expect(result.current.selectedDate).toEqual(initialDate);

    rerender({ mode: 'range-single', initialDate, onModeChange }); // Pass all required props

    expect(result.current.mode).toBe('range-single');
    expect(result.current.selectedDate).toBeNull();
    expect(result.current.selectedRange).toBeNull();
    expect(onModeChange).toHaveBeenCalledWith('range-single');
  });

  it('clears selection correctly', () => {
    const store = createTestStore();
    const initialDate = new Date(2024, 0, 15);

    act(() => {
      store.set(calendarAtom, {
        ...store.get(calendarAtom),
        mode: 'single',
        selectedDate: initialDate,
      });
    });

    const { result } = renderHook(() => useCalendar({ mode: 'single', initialDate }), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.selectedDate).toEqual(initialDate);
    expect(result.current.hasSelection).toBe(true);

    act(() => {
      result.current.actions.clear();
    });

    expect(result.current.selectedDate).toBeNull();
    expect(result.current.selectedRange).toBeNull();
    expect(result.current.currentSelection).toBeNull();
    expect(result.current.hasSelection).toBe(false);
  });

  it('handles loading state via atom', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCalendar({}), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.loading).toBe(false);

    act(() => {
      const currentCalendarState = store.get(calendarAtom);
      store.set(calendarAtom, { ...currentCalendarState, status: LoadingStatus.PENDING });
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      const currentCalendarState = store.get(calendarAtom);
      store.set(calendarAtom, { ...currentCalendarState, status: LoadingStatus.IDLE });
    });
    expect(result.current.loading).toBe(false);
  });

  it('handles error state via atom', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCalendar({}), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    expect(result.current.error).toBeNull();

    const testError: FieldErrorInfo = { message: 'Test error' }; // Match FieldErrorInfo type
    act(() => {
      const currentCalendarState = store.get(calendarAtom);
      store.set(calendarAtom, {
        ...currentCalendarState,
        error: testError,
        status: LoadingStatus.REJECTED,
      });
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      const currentCalendarState = store.get(calendarAtom);
      store.set(calendarAtom, { ...currentCalendarState, error: null, status: LoadingStatus.IDLE });
    });
    expect(result.current.error).toBeNull();
  });

  it('memoizes actions and validation objects', () => {
    const store = createTestStore();
    const { result, rerender } = renderHook(() => useCalendar({}), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    const firstActions = result.current.actions;
    const firstValidation = result.current.validation;

    rerender(); // Rerender with same props

    expect(result.current.actions).toBe(firstActions);
    expect(result.current.validation).toBe(firstValidation);
  });

  it('does not select date if initialDate is provided but mode is not single', () => {
    const store = createTestStore();
    const initialDate = new Date(2024, 0, 15);
    const props: UseCalendarProps = {
      mode: 'range-single', // Not 'single'
      initialDate,
    };
    act(() => {
      // Ensure mode is set correctly
      store.set(calendarModeAtom, 'range-single');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });
    expect(result.current.selectedDate).toBeNull();
  });

  it('does not select range if initialRange is provided but mode is single', () => {
    const store = createTestStore();
    const initialRange: DateRange = { from: new Date(2024, 0, 10), to: new Date(2024, 0, 20) };
    const props: UseCalendarProps = {
      mode: 'single', // Not a range mode
      initialRange,
    };
    act(() => {
      // Ensure mode is set correctly
      store.set(calendarModeAtom, 'single');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });
    expect(result.current.selectedRange).toBeNull();
  });

  it('calls onDateSelect with undefined when date is undefined', () => {
    const store = createTestStore();
    const onDateSelect = vi.fn();
    const props: UseCalendarProps = {
      mode: 'single',
      onDateSelect,
    };
    act(() => {
      // Ensure mode is set correctly
      store.set(calendarModeAtom, 'single');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    act(() => {
      result.current.actions.selectDate(undefined);
    });

    expect(result.current.selectedDate).toBeNull();
    expect(onDateSelect).toHaveBeenCalledWith(undefined);
  });

  it('calls onRangeSelect with undefined when range is undefined', () => {
    const store = createTestStore();
    const onRangeSelect = vi.fn();
    const props: UseCalendarProps = {
      mode: 'range-single',
      onRangeSelect,
    };
    act(() => {
      // Ensure mode is set correctly
      store.set(calendarModeAtom, 'range-single');
    });
    const { result } = renderHook(() => useCalendar(props), {
      wrapper: ({ children }) => wrapper({ children, store }),
    });

    act(() => {
      result.current.actions.selectRange(undefined);
    });

    expect(result.current.selectedRange).toBeNull();
    expect(onRangeSelect).toHaveBeenCalledWith(undefined);
  });
});
