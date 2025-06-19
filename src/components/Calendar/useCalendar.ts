import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { DateRange } from 'react-day-picker';
import {
  calendarModeAtom,
  calendarConfigAtom,
  selectedDateAtom,
  selectedRangeAtom,
  isRangeCompleteAtom,
  selectSingleDateAtom,
  selectDateRangeAtom,
  clearCalendarSelectionAtom,
  calendarErrorAtom,
  calendarLoadingAtom,
} from '@/atoms';
import type { CalendarMode, UseCalendarReturn, UseCalendarProps } from './Calendar.types';

/**
 * Custom hook for calendar logic with standardized return interface
 * Follows project patterns for hook return types
 */
export function useCalendar({
  mode,
  initialDate,
  initialRange,
  onDateSelect,
  onRangeSelect,
  onModeChange,
}: UseCalendarProps = {}): UseCalendarReturn {
  // Calendar state atoms
  const [calendarMode, setCalendarMode] = useAtom(calendarModeAtom);
  const config = useAtomValue(calendarConfigAtom);

  // Selection atoms
  const selectedDate = useAtomValue(selectedDateAtom);
  const selectedRange = useAtomValue(selectedRangeAtom);
  const isRangeComplete = useAtomValue(isRangeCompleteAtom);

  // Action atoms - use useSetAtom for write-only atoms
  const selectSingleDate = useSetAtom(selectSingleDateAtom);
  const selectDateRange = useSetAtom(selectDateRangeAtom);
  const clearSelection = useSetAtom(clearCalendarSelectionAtom);

  // Error and loading state
  const calendarError = useAtomValue(calendarErrorAtom);
  const calendarLoading = useAtomValue(calendarLoadingAtom);

  // Track previous mode prop to avoid conflicts with programmatic mode changes
  const prevModeRef = React.useRef(mode);
  const isFirstRender = React.useRef(true);

  // Initialize mode if provided - only sync when mode prop changes, not when calendarMode changes via actions
  React.useEffect(() => {
    if (mode && mode !== prevModeRef.current) {
      prevModeRef.current = mode;
      clearSelection(); // Clear selection when mode prop changes
      setCalendarMode(mode);
      onModeChange?.(mode);
    }
  }, [mode, setCalendarMode, onModeChange, clearSelection]);

  // Initialize with default values - run only on first render to avoid re-initializing after clear
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialDate && calendarMode === 'single' && !selectedDate) {
        selectSingleDate(initialDate);
      }
      if (initialRange && calendarMode !== 'single' && !selectedRange) {
        selectDateRange(initialRange);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle date selection
  const handleDateSelect = React.useCallback(
    (date: Date | undefined) => {
      try {
        selectSingleDate(date);
        onDateSelect?.(date);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to select date';
        console.error('Date selection error:', errorMessage);
      }
    },
    [selectSingleDate, onDateSelect]
  );

  // Handle range selection
  const handleRangeSelect = React.useCallback(
    (range: DateRange | undefined) => {
      try {
        selectDateRange(range);
        onRangeSelect?.(range);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to select range';
        console.error('Range selection error:', errorMessage);
      }
    },
    [selectDateRange, onRangeSelect]
  );

  // Handle mode change
  const handleModeChange = React.useCallback(
    (newMode: CalendarMode) => {
      try {
        clearSelection(); // Clear selection when changing modes
        setCalendarMode(newMode);
        onModeChange?.(newMode);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to change mode';
        console.error('Mode change error:', errorMessage);
      }
    },
    [clearSelection, setCalendarMode, onModeChange]
  );

  // Clear calendar selection
  const handleClearSelection = React.useCallback(() => {
    try {
      clearSelection();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear selection';
      console.error('Clear selection error:', errorMessage);
    }
  }, [clearSelection]);

  // Compute derived values
  const currentSelection = React.useMemo(() => {
    const selection = calendarMode === 'single' ? selectedDate : selectedRange;
    return selection || null;
  }, [calendarMode, selectedDate, selectedRange]);

  const hasSelection = React.useMemo(() => {
    return !!(selectedDate || selectedRange?.from);
  }, [selectedDate, selectedRange]);

  const isValidSelection = React.useMemo(() => {
    return calendarMode === 'single' ? !!selectedDate : isRangeComplete;
  }, [calendarMode, selectedDate, isRangeComplete]);

  const actions = React.useMemo(
    () => ({
      selectDate: handleDateSelect,
      selectRange: handleRangeSelect,
      changeMode: handleModeChange,
      clear: handleClearSelection,
    }),
    [handleDateSelect, handleRangeSelect, handleModeChange, handleClearSelection]
  );

  const validation = React.useMemo(
    () => ({
      isValid: true,
      errors: [],
      warnings: [],
    }),
    []
  );

  return {
    // Configuration
    mode: calendarMode,
    config,
    loading: calendarLoading,
    error: calendarError?.message ?? null,

    // Selection
    selectedDate: selectedDate || null,
    selectedRange: selectedRange || null,
    currentSelection,
    hasSelection,
    isValidSelection,
    isRangeComplete,

    // Validation (simplified - just return success for now)
    validation, // Use memoized validation object

    // Actions
    actions, // Use memoized actions object
  };
}
