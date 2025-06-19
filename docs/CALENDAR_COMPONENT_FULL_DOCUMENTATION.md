# Calendar Component System Documentation

_Last updated: June 13, 2025_

## Overview

The Calendar component system is a modular, type-safe, and highly customizable set of React components, hooks, utilities, schemas, and state atoms for date and range selection. It is designed for robust validation, accessibility, and seamless integration with project-wide state management (Jotai) and theming.

This documentation covers:
- Component and API structure
- State management and validation
- Utilities and schemas
- Usage patterns and best practices

---

## 1. Component Structure

### Main Components
- **Calendar.tsx**: Root calendar component, handles mode switching and prop validation.
- **SingleCalendar.tsx**: Single date selection calendar.
- **RangeCalendar.tsx**: Single-view range selection calendar.
- **DualCalendar.tsx**: Dual-view range selection calendar.

Each component uses strong TypeScript types for props and leverages Jotai atoms for state.

### Component Props
- All components accept props defined in `Calendar.types.ts`:
  - `SingleCalendarProps`, `RangeCalendarProps`, `DualCalendarProps`, and the union `CalendarProps`.
- Props include configuration for date constraints, accessibility, theming, and event handlers.

---

## 2. State Management (Atoms)

Calendar state is managed using Jotai atoms, defined in `Calendar.atoms.ts`:

- **calendarAtom**: Main state atom (mode, selection, config, status).
- **calendarModeAtom**: Current calendar mode ('single', 'range-single', 'range-dual').
- **calendarConfigAtom**: Calendar configuration (theme, week start, etc.).
- **selectedDateAtom**: Selected date (single mode).
- **selectedRangeAtom**: Selected range (range modes).
- **selectSingleDateAtom**: Action atom to select a single date.
- **selectDateRangeAtom**: Action atom to select a date range.
- **clearCalendarSelectionAtom**: Action atom to clear selection.
- **isRangeCompleteAtom**: Derived atom to check if a range is complete.
- **calendarErrorAtom**, **calendarLoadingAtom**: Error/loading state.

### Atom Usage
- Atoms are used in all main calendar components for state and actions.
- Atoms are also used in tests to simulate and verify state changes.

---

## 3. Types & Schemas

### Types (`Calendar.types.ts`)
- Strongly typed props and state interfaces for all calendar modes.
- Types for configuration, theme, validation results, and hook API.

### Schemas (`Calendar.schemas.ts`)
- Zod schemas for runtime validation of props, state, and configuration.
- `calendarSelectionSchema`: Discriminated union for all selection types.
- `calendarValidationUtils`: Utility functions for validating dates and ranges.

### Usage
- Schemas are used in atoms for runtime validation.
- Types are used throughout components, hooks, and tests for type safety.

---

## 4. Utilities (`Calendar.utils.ts`)

- **validateCalendarProps**: Validates props for all calendar modes. Used in all main components.
- **validateCalendarState**: (Available, not currently used) Validates calendar state for consistency.
- **calendarUtils**: Namespace of date utility functions (formatting, parsing, comparisons, etc.).
- **Styling utilities**: Functions for generating class names and styles based on mode, variant, and state.

---

## 5. Custom Hook (`useCalendar.ts`)

- Provides a unified API for calendar state, selection, validation, and actions.
- Not currently used in main components, but thoroughly tested.
- Recommended for advanced integrations or custom calendar UIs.

---

## 6. Validation & Testing

- **Prop validation**: All main components validate props using `validateCalendarProps` before rendering.
- **State validation**: Atoms use schemas for runtime validation of state and configuration.
- **Unit tests**: Utilities, schemas, and the custom hook are thoroughly tested in `__tests__`.

---

## 7. Usage Patterns & Best Practices

- Use the main calendar components for standard date/range pickers.
- Use atoms for global or shared calendar state.
- Use the custom hook for advanced or custom calendar logic.
- Always validate props and state using provided utilities and schemas.
- Leverage strong types for safety and maintainability.

---

## 8. Extending the System

- Add new calendar modes by extending types, schemas, and atoms.
- Add new utilities to `Calendar.utils.ts` as needed.
- Integrate with other state or form libraries via the custom hook or atoms.
- Customize styling and theming using the provided utilities and configuration.

---

## 9. File Reference

- `src/components/Calendar/Calendar.tsx` — Root component
- `src/components/Calendar/SingleCalendar.tsx` — Single date picker
- `src/components/Calendar/RangeCalendar.tsx` — Range picker (single view)
- `src/components/Calendar/DualCalendar.tsx` — Range picker (dual view)
- `src/components/Calendar/Calendar.types.ts` — Types
- `src/components/Calendar/Calendar.schemas.ts` — Zod schemas
- `src/components/Calendar/Calendar.utils.ts` — Utilities
- `src/components/Calendar/useCalendar.ts` — Custom hook
- `src/atoms/Calendar.atoms.ts` — Jotai atoms

---

## 10. FAQ

**Q: How do I add a new calendar mode?**
- Extend `CalendarMode` in types and schemas.
- Add mode handling in atoms and utilities.
- Implement a new component if needed.

**Q: How do I validate a custom calendar configuration?**
- Use the Zod schemas in `Calendar.schemas.ts`.

**Q: Can I use the calendar with a form library?**
- Yes, use the custom hook or atoms for integration.

---

## 11. Further Reading
- See `PATTERNS.md` and `DEV_UTILITIES.md` in the `docs/` folder for advanced usage and design patterns.
- See `__tests__/` for example tests and usage scenarios.

---

For questions or contributions, see the project README or contact the maintainers.
