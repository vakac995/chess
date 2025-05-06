# React TypeScript Template (with Chess Example)

This project serves as a template for modern web applications, providing a solid foundation with essential features out-of-the-box. It includes a functional **Chess game** implementation as an interactive example to demonstrate and test the template's capabilities.

## Features (Template Focus)

- **Modern Stack:** React, TypeScript, Vite, Tailwind CSS.
- **Structure:** Well-organized directories (components, features, hooks, store, styles, types, utils).
- **State Management:** Examples using Jotai and Zustand.
- **Form Handling:** Robust setup using custom hooks (`useJotaiForm`, `useZodForm`), Zod for validation, and reusable form components.
- **Testing:** Integrated unit and integration testing with Vitest and React Testing Library.
- **Linting & Formatting:** ESLint configured for code quality.
- **Styling:** Tailwind CSS with PostCSS and SCSS module support.
- **Interactive Example:** A functional Chess game (`chess.js`, `react-chessboard`) demonstrates component usage, state management, and interaction within the template structure.
- **Desktop Capability (Planned):** Intended to be compatible with Tauri for building desktop applications.

## Tech Stack

- **Framework/Library**: React (^19.1.0)
- **Build Tool**: Vite (^6.2.6)
- **Language**: TypeScript (^5.8.3)
- **Styling**: Tailwind CSS (^4.1.4), PostCSS (^8.5.3), SCSS Modules (sass ^1.86.3)
- **State Management**: Jotai (^2.12.3), Zustand (if added)
- **Form Handling**: Zod (^3.24.4), react-hook-form (^7.56.2)
- **Code Quality**: ESLint (^9.24.0)
- **Testing**: Vitest (^3.1.1), React Testing Library (^16.3.0)
- **Chess Example**: chess.js (^1.2.0), react-chessboard (^4.7.3)
- **Desktop App (Planned)**: Tauri
- **Package Manager**: npm

## State Management

This template demonstrates multiple state management approaches, utilized partly by the Chess example:

- **Jotai:** Atomic state management (see `features/Authentication/atoms.ts`, `hooks/useJotaiForm.ts`).
- **Zustand:** Store-based state management (see `store/authStore.ts`).
- **React Context:** For simpler state sharing (see `context/` directory - if used).
- **Local Component State:** Using React's built-in hooks (`useState`, `useReducer`), potentially combined with libraries like `chess.js` for specific domain logic.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Open tests in UI
npm run test:ui

# Generate test coverage
npm run coverage

# Build desktop app with Tauri (Planned)
# npm run tauri build
```

## Project Structure

The project follows a feature-oriented structure where applicable, using the Chess game as a practical example. See PROJECT_STRUCTURE.md for a detailed breakdown.

## License

This project is licensed under the terms found in the LICENSE file.
