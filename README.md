# Chess Web Application

A minimalist chess web application built with modern web technologies. This app provides a fully functional chess game with standard rules enforcement that can be played locally by two players.

## Features

- Interactive chess board with drag-and-drop piece movement
- Complete chess rules enforcement (legal moves only)
- Game state tracking (current position, captured pieces)
- Turn management
- Check, checkmate, and draw detection
- Simple UI for game controls (restart, undo)
- Desktop app capability via Tauri

## Tech Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 6.2.6
- **Language**: TypeScript 5.8.3
- **Chess Logic**: chess.js 1.2.0
- **Chess Board UI**: react-chessboard 4.7.3
- **Styling**: 
  - Tailwind CSS 4.1.4
  - SCSS Modules
- **Code Quality**:
  - ESLint
  - Prettier
- **Testing**:
  - Vitest 3.1.1
  - React Testing Library 16.3.0
- **Desktop App**: Tauri
- **Package Manager**: npm
- **State Management**: React's built-in hooks with chess.js (Core Game State approach)

## State Management

- **chess.js** as the primary state manager for chess game logic, maintaining:
  - Current board position
  - Legal moves calculation
  - Game status (active, check, checkmate, draw)
  - Turn information

- **React's built-in hooks** for UI state:
  - `useState` for simple state like game instance, move history, and captured pieces
  - Context API for sharing state across components without prop drilling

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

# Build desktop app with Tauri
npm run tauri build
```

## Project Structure

The project follows a clean, modular organization with separate directories for components, hooks, utils, and tests. See PROJECT_STRUCTURE.md for a detailed breakdown.

## License

This project is licensed under the terms found in the LICENSE file.
