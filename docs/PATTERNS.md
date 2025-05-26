# Project Patterns and Conventions

This document outlines the key design patterns, coding conventions, and architectural choices adopted in this project. Its purpose is to ensure consistency, maintainability, and a shared understanding across the development team.

## 1. Architectural Patterns

*   **Component-Based Architecture:** The frontend is built using React, adhering to a component-based architecture. UI is broken down into reusable and composable components.
*   **Feature-Driven Structure (Implicit):** While not explicitly a "feature-sliced design" from the provided files, the organization of components like `RegistrationForm` within a `src/features/Authentication` directory suggests a move towards organizing code by feature. This promotes modularity and makes it easier to locate and manage feature-specific code.
*   **Atomic Design Principles (Influenced):** The use of global state (Jotai atoms in `src/atoms/`) and utility components (e.g., `src/components/Button`) hints at an influence from atomic design, where smaller, reusable pieces are combined to build more complex UI structures.

## 2. Design Patterns

*   **Facade Pattern (for Web Storage):**
    *   Purpose: To provide a simplified, unified interface to a more complex subsystem (localStorage/sessionStorage).
    *   Implementation: `src/utils/storage.ts` offers a `storage` object with methods like `set`, `get`, `remove`, abstracting the direct use of `localStorage` or `sessionStorage` and adding features like type safety, error handling, and size checks.
    *   When to use: For all interactions with browser storage to ensure consistency and type safety.
*   **Singleton Pattern (for Development Utilities):**
    *   Purpose: To ensure a single instance of a class and provide a global point of access to it.
    *   Implementation: `src/utils/dev.ts` exports a single instance (`dev`) of the `DevelopmentUtils` class, which centralizes development-specific functionalities like logging, performance monitoring, and feature flags.
    *   When to use: Access development-specific utilities via the `dev` export.
*   **Custom Hooks (for Reusable Logic):**
    *   Purpose: To extract component logic into reusable functions.
    *   Implementation: `src/hooks/useZodForm.ts` provides a custom hook for integrating Zod schemas with React Hook Form, encapsulating the setup and configuration.
    *   When to use: When complex or reusable form logic or other stateful logic needs to be shared across components.
*   **State Management Patterns (Jotai):**
    *   **Atom-based state:** Jotai is used for managing global and local state through atoms.
        *   Purpose: Decoupled state management, easy to share state across components without prop drilling.
        *   Implementation: `src/atoms/Authentication.atoms.ts` defines atoms for registration steps, form data, and derived state like `isRegistrationCompleteAtom`. `createFormAtom` and `combineFormAtoms` are utility hooks/functions for managing form-specific state with Jotai.
        *   When to use: For managing shared application state, form state, and any piece of data that needs to be reactive and accessible by multiple components.

## 3. Coding Conventions

*   **Naming Conventions:**
    *   Variables: `camelCase` (e.g., `registrationStepAtom`)
    *   Functions: `camelCase` (e.g., `onSubmitBasicInfo`)
    *   Classes: `PascalCase` (e.g., `DevelopmentUtils`)
    *   Interfaces/Types: `PascalCase` (e.g., `StorageResult`, `DevConfig`)
    *   Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_STORAGE_SIZE_BYTES`)
    *   Files:
        *   React Components: `PascalCase.tsx` (e.g., `RegistrationForm.tsx`, `Button.tsx`)
        *   TypeScript files (utilities, hooks, types, atoms): `camelCase.ts` or `PascalCase.ts` (e.g., `storage.ts`, `useZodForm.ts`, `Authentication.atoms.ts`). Consistency towards `camelCase.ts` for non-component files is preferred.
        *   Test files: `ComponentName.test.tsx` or `fileName.test.ts`.
*   **Formatting:**
    *   Primarily enforced by ESLint and Prettier. Refer to `eslint.config.js` for specific linting rules.
    *   Key aspects from `eslint.config.js`:
        *   `react/react-in-jsx-scope`: 'off' (common in modern React with Vite/Next.js)
        *   `react/prop-types`: 'off' (TypeScript handles prop types)
        *   `@typescript-eslint/explicit-module-boundary-types`: 'off'
        *   `@typescript-eslint/no-explicit-any`: 'warn' (discouraged, but allowed with a warning)
        *   `no-console`: ['warn', { allow: ['warn', 'error'] }] (discourages `console.log` but allows `console.warn` and `console.error`)
*   **Commenting:**
    *   Use JSDoc for functions, classes, interfaces, and complex logic to aid understanding and auto-documentation. Examples seen in `src/utils/storage.ts` and `src/utils/dev.ts`.
    *   Inline comments for clarifying non-obvious code snippets.
*   **Error Handling:**
    *   Custom error creation: The project uses a `createError` function (likely from `@/types` or `src/types/errors.ts`) to standardize error object creation, as seen in `RegistrationForm.tsx`.
    *   Form error handling: React Hook Form combined with Zod (`useZodForm`) manages form validation errors. `ErrorInfo` component is used to display these errors.
    *   API/Async errors: Handled using `try-catch` blocks and state updates (e.g., setting error messages in Jotai atoms).
    *   Development assertions: `dev.assert()` in `src/utils/dev.ts` for development-time checks.

## 4. UI/Component Patterns

*   **Component Structure:**
    *   Feature-specific components are grouped under `src/features/FeatureName/`.
    *   Reusable, generic components are placed in `src/components/ComponentName/`.
    *   A typical component folder might include:
        *   `ComponentName.tsx`: The main component file.
        *   `ComponentName.types.ts`: TypeScript types/interfaces for the component's props and internal state.
        *   `index.ts`: Barrel file for exporting the component and related types.
        *   `__tests__/ComponentName.test.tsx`: Unit tests for the component.
        *   (Optional) `ComponentName.module.scss` or `ComponentName.styles.ts` if not using pure Tailwind or `cva`.
*   **State Management:**
    *   Primary state management: Jotai.
    *   Atoms are defined in `src/atoms/` (e.g., `Authentication.atoms.ts`).
    *   `createFormAtom` and `combineFormAtoms` are custom utilities (likely in `src/hooks/` or `src/utils/`) to streamline form state management with Jotai, handling data, status (idle, pending, fulfilled, rejected), and errors.
    *   Local component state is managed using `useState` or `useReducer` where appropriate for non-shared, component-specific data.
*   **Styling:**
    *   Primary styling approach: Tailwind CSS. Configuration is in `tailwind.config.js`.
        *   Custom theme values (colors, spacing, borderRadius) are defined using CSS variables and referenced in `tailwind.config.js`.
    *   Utility-first: Leverage Tailwind's utility classes for most styling.
    *   Dynamic/Conditional styling: `clsx` library and `class-variance-authority (cva)` (as seen in `Button.tsx`) are used for constructing conditional class names and creating style variants.
    *   Global styles: SCSS can be used for global styles and complex overrides, likely in a `src/styles/` directory (though not explicitly shown in provided files, it's a common pattern mentioned in the template).

## 5. API Interaction Patterns

*   **Request/Response Handling:**
    *   API calls are typically made within asynchronous functions (e.g., form submission handlers in `RegistrationForm.tsx`).
    *   Loading states (`LoadingStatus.PENDING`, `LoadingStatus.FULFILLED`, `LoadingStatus.REJECTED` from `@/types`) are managed, often using Jotai atoms, to provide UI feedback.
    *   Error handling involves `try-catch` blocks, updating error state atoms, and displaying user-friendly messages.
    *   A dedicated service layer or custom hooks for API calls (e.g., `useQuery`, `useMutation` from libraries like TanStack Query) might be adopted for more complex applications, but is not evident from the current files.
*   **Mocking:**
    *   MSW (Mock Service Worker) is the designated tool for API mocking during development and testing.
    *   Setup for MSW would typically reside in `src/mocks/` (handlers, server setup) and be initialized in `src/tests/setup.ts` or a development entry point. The `dev.delay()` utility in `src/utils/dev.ts` can be used to simulate network latency with mocks.

## 6. Testing Patterns

*   **Unit Tests:**
    *   Framework: Vitest with React Testing Library.
    *   Setup: `src/tests/setup.ts` imports `@testing-library/jest-dom` for extended DOM assertions.
    *   Conventions:
        *   Test files are co-located with components (e.g., `__tests__/ComponentName.test.tsx`) or utility files.
        *   Focus on testing component behavior from a user's perspective (interactions, rendering based on props/state).
        *   Test utility functions for their input/output correctness.
        *   Mock dependencies (e.g., API calls, Jotai atoms if necessary) to isolate the unit under test.
*   **Integration Tests:**
    *   [Strategy to be defined. Could involve testing interactions between multiple components or features using React Testing Library and MSW for API mocks.]
*   **End-to-End Tests:**
    *   [Strategy to be defined. Tools like Playwright or Cypress could be considered if E2E tests are required.]

## 7. Utility Function Patterns

*   General utility functions are located in `src/utils/` (e.g., `storage.ts`).
*   Development-specific utilities (e.g., loggers, feature flags, performance timers) are centralized in `src/utils/dev.ts` and `src/utils/devReact.tsx` (if React-specific dev utilities are needed).
*   Refer to `docs/DEV_UTILITIES.md` for more details on development utilities.
*   Type guard functions and helper types are often placed in `src/types/` or co-located with the modules they relate to.

## 8. Version Control

*   Git is used for version control.
*   **Branching Strategy:** A strategy like GitFlow (feature branches, develop, main/master) or GitHub Flow (main branch with feature branches) is recommended. (Specific strategy to be decided by the team).
*   **Commit Message Conventions:** Conventional Commits (e.g., `feat: add user registration`, `fix: resolve login bug`, `docs: update PATTERNS.md`) are highly recommended for maintainable history and automated changelog generation.

## 9. Directory Structure

*   A high-level overview of the project's directory layout should be maintained in a `PROJECT_STRUCTURE.md` document (to be created or updated as per the standardization plan).
*   Key directories observed:
    *   `src/`: Contains all source code.
        *   `src/atoms/`: Jotai state atoms.
        *   `src/components/`: Reusable UI components.
        *   `src/features/`: Feature-specific modules/components.
        *   `src/hooks/`: Custom React hooks.
        *   `src/schemas/`: Zod validation schemas.
        *   `src/tests/`: Test setup and potentially integration/E2E tests.
        *   `src/types/`: Global TypeScript type definitions.
        *   `src/utils/`: Utility functions.
    *   `docs/`: Project documentation.
        *   `docs/kanban.tasks/`: Task tracking files.
    *   `public/`: Static assets.
    *   (Root): Configuration files (`vite.config.ts`, `tailwind.config.js`, `eslint.config.js`, etc.).

This document is a living guide and should be updated as the project evolves and new patterns are adopted.
