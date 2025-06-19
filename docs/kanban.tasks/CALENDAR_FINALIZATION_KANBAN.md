# Calendar Component Finalization Kanban

_Last updated: June 13, 2025_

## Overview

This kanban document outlines the detailed steps required to finalize the Calendar component system. It is based on the current state of the implementation and the comprehensive documentation in `CALENDAR_COMPONENT_FULL_DOCUMENTATION.md`. Each task is grouped by category and includes clear acceptance criteria and detailed subtasks for every utility, hook, and integration point.

---

## 🟢 1. Review & Refactor Core Components

### Tasks
- [x] **Prop Validation with `validateCalendarProps`**
  - [x] In every Calendar component (`Calendar.tsx`, `SingleCalendar.tsx`, `RangeCalendar.tsx`, `DualCalendar.tsx`):
    - [x] At the top of the render function, call `validateCalendarProps(props)` and store the result.
    - [x] If `!validation.isValid`, render an error state or fallback UI, displaying `validation.errors`.
    - [x] Pass `validation.warnings` to a warning display component or log them for devs.
    - [x] Ensure all prop destructuring and usage happens only after validation passes.
    - [ ] In tests, add cases for invalid props and assert that errors are surfaced.

> **Note:** All tests for invalid props, error UI, and warning display will be completed together after the main refactors and other core tasks are finished. This ensures tests are aligned with the final implementation and avoids redundant work during ongoing changes.

- [ ] **State Validation with `validateCalendarState`**
  - [ ] After any state change (selection, mode switch, etc.), call `validateCalendarState(currentState)`.
  - [ ] If `!validation.isValid`, trigger an error UI or log the error.
  - [ ] Add a useEffect in React to watch for state changes and run this validation.
  - [ ] In atoms, optionally run this validation before committing state changes.
  - [ ] Add tests for invalid state transitions and assert error handling.
- [ ] **Refactor to use the `useCalendar` hook for unified logic**
  - [ ] Replace direct atom usage with the hook’s return values and actions.
  - [ ] Use `actions.selectDate`, `actions.selectRange`, `actions.changeMode`, and `actions.clear` for all user interactions.
  - [ ] Use `validation` from the hook for UI feedback.
  - [ ] Use `currentSelection`, `hasSelection`, `isValidSelection`, etc., for UI logic.
  - [ ] In tests, use the hook directly to simulate user flows and assert state changes.
  - [ ] Document the hook API with usage examples for each method.
- [ ] **Ensure accessibility props and ARIA attributes are set correctly**
  - [ ] Use `mergeAccessibilityProps(userProps, mode)` to generate the final accessibility props.
  - [ ] Pass these props to the root calendar container.
  - [ ] Use `getDefaultAccessibilityProps` as a fallback if no user props are provided.
  - [ ] Add tests for accessibility props and ARIA attributes.

**Acceptance Criteria:**
- All components use strong types, atoms, and validation utilities
- Code is DRY and leverages the custom hook where possible
- Accessibility is fully supported

---

## 🟡 2. Validation & Schema Integration

### Tasks
- [ ] **Ensure all state and prop validation uses Zod schemas from `Calendar.schemas.ts`**
  - [ ] In all atoms, validate new state with the appropriate schema before committing.
  - [ ] In all configuration and prop flows, validate with the schema and surface errors.
  - [ ] In tests, use schemas to assert valid/invalid data.
- [ ] **Integrate `validateCalendarState` where appropriate for runtime state checks**
  - [ ] See above for details on when and how to call this utility.
- [ ] **Add missing runtime validation for custom configurations**
  - [ ] Ensure all custom config flows are validated with Zod schemas and errors are surfaced.

**Acceptance Criteria:**
- All user input and state transitions are validated at runtime
- Errors are surfaced clearly in the UI

---

## 🟠 3. Utilities & Theming

### Tasks
- [ ] **Audit and document all utilities in `Calendar.utils.ts`**
  - [ ] List every utility and its intended use in the documentation.
  - [ ] Add JSDoc comments to all exported utilities.
- [ ] **Replace all direct logic with utility functions**
  - [ ] Use `calendarUtils.formatDate` for all date display.
  - [ ] Use `calendarUtils.parseDate` for all string-to-date conversions.
  - [ ] Use `calendarUtils.isValidDate` before accepting any user-provided date.
  - [ ] Use `calendarUtils.isSameDay`, `isWeekend`, etc., for all date comparisons and logic.
  - [ ] In range selection logic, use `calendarUtils.getDaysBetween`, `addDays`, `subtractDays` for calculations.
- [ ] **Ensure all styling utilities are used for className and style generation**
  - [ ] In every Calendar component, replace hardcoded classNames with calls to `createCalendarClasses` and related utilities.
  - [ ] For DayPicker integration, use `getStandardizedDayPickerClasses` for all className props.
  - [ ] For variant and theme support, use the appropriate utility to generate classNames/styles based on props/state.
  - [ ] Document all available variants and how to use them in the main documentation.
- [ ] **Document and test theming options (light/dark/auto, variants)**
  - [ ] Use theming utilities to generate theme-aware styles in all components.
  - [ ] Document all theme and variant options in the documentation.
  - [ ] Add tests for theme switching and variant rendering.

**Acceptance Criteria:**
- Utilities are used consistently and documented
- Theming is easy to configure and works as expected

---

## 🔵 4. Testing & Coverage

### Tasks
- [ ] **Review and expand unit tests for all components, hooks, atoms, and utilities**
  - [ ] Add tests for every utility function and hook method, covering all edge cases.
  - [ ] Add tests for error and warning display.
- [ ] **Add integration tests for common user flows (single/range selection, mode switching, error handling)**
  - [ ] Simulate user interactions and assert correct state and UI updates.
- [ ] **Ensure 90%+ code coverage for the calendar system**
  - [ ] Use coverage tools to identify gaps and add tests as needed.

**Acceptance Criteria:**
- All logic is covered by tests
- Tests are reliable and easy to maintain

---

## 🟣 5. Documentation & Examples

### Tasks
- [ ] **Finalize and polish `CALENDAR_COMPONENT_FULL_DOCUMENTATION.md`**
  - [ ] Ensure all utilities, hooks, and extension points are documented with usage and rationale.
- [ ] **Add usage examples and code snippets for all main features**
  - [ ] For each utility, hook, and component, provide a real-world usage example.
- [ ] **Document extension points and advanced usage (custom hooks, theming, validation)**
  - [ ] Show how to extend or override default logic, validation, and theming.
- [ ] **Update FAQ and troubleshooting sections**
  - [ ] Add common gotchas, error explanations, and solutions.

**Acceptance Criteria:**
- Documentation is clear, complete, and up-to-date
- Examples are easy to follow and cover all use cases

---

## 🟤 6. Release Preparation

### Tasks
- [ ] **Update `README.md` with calendar usage and features**
  - [ ] Add a quickstart, feature list, and example usage.
- [ ] **Prepare a migration/upgrade guide if breaking changes were introduced**
  - [ ] List all breaking changes and migration steps.
- [ ] **Tag and release a new version**
  - [ ] Ensure all documentation and changelogs are up to date.

**Acceptance Criteria:**
- Release is well-documented
- Users can upgrade or adopt the calendar with minimal friction

---

## Notes
- Use the documentation and codebase as the source of truth for all tasks.
- Check off each task as it is completed and update this kanban as needed.

---

For questions or suggestions, contact the maintainers or open an issue in the repository.
