# Chess Web Application - Project Structure

Below is the current directory structure for the chess web application:

```
chess/                          # Root project directory
├── package.json                # NPM package definition
├── package-lock.json           # NPM dependency lock file
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # Node-specific TypeScript configuration
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration (flat config format)
├── .gitignore                  # Git ignore file
├── README.md                   # Project documentation
├── PROJECT_STRUCTURE.md        # Directory structure documentation
├── LICENSE                     # License file
├── sonar-project.properties    # SonarQube configuration
├── index.html                  # Main HTML entry point
│
├── public/                     # Public static assets
│   └── favicon.ico             # Website favicon
│
├── html/                       # Build output directory
│   ├── assets/                 # Compiled assets
│   │   ├── index-B0KEk_KY.css  # Bundled CSS
│   │   └── index-BLZJq7cG.js   # Bundled JS
│   ├── bg.png                  # Background image
│   ├── favicon.ico             # Website favicon
│   ├── favicon.svg             # SVG favicon
│   └── index.html              # Generated HTML
│
├── coverage/                   # Test coverage reports
│   └── ...                     # Coverage report files
│
├── src/                        # Source code
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Main App component
│   │
│   ├── components/             # React components
│   │   ├── ChessBoard/         # Chess board component
│   │   │   ├── ChessBoard.tsx  # Component implementation
│   │   │   ├── ChessBoard.module.scss # Component styles
│   │   │   ├── index.ts        # Export file
│   │   │   └── __tests__/      # Component tests
│   │   │       └── ChessBoard.test.tsx
│   │   │
│   │   └── ... other components
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── ...                 # Hook implementations
│   │
│   ├── context/                # React Context for state management
│   │   └── ...                 # Context implementations
│   │
│   ├── utils/                  # Utility functions
│   │   └── ...                 # Utility implementations
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.scss          # Main stylesheet
│   │   └── tailwind.css        # Tailwind imports
│   │
│   ├── assets/                 # Assets (images, sounds, etc.)
│   │   ├── images/             # Image assets
│   │   └── sounds/             # Sound effects
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── scss.d.ts           # SCSS module type definitions
│   │
│   ├── __tests__/              # App-level tests
│   │   └── App.test.tsx        # App component test
│   │
│   └── tests/                  # Test setup and utilities
│       └── setup.ts            # Vitest setup file
```

## Key Features Implementation

1. **Chess Game Logic**
   - Uses chess.js library to handle game rules and state
   - Implemented in custom hooks for game state management

2. **UI Components**
   - Board visualization with react-chessboard
   - Game controls for restart, undo
   - Status display showing current player, check/checkmate status

3. **State Management**
   - Core game state managed by chess.js
   - React Context for UI state distribution
   - Custom hooks for specific functionality

4. **Testing Strategy**
   - Component tests using Vitest and React Testing Library
   - Unit tests for utility functions and hooks
   - Test coverage reporting with @vitest/coverage-v8

## Development Workflow

1. Start with core game logic implementation
2. Build essential UI components
3. Implement game state and controls
4. Add styling and responsive design
5. Write tests for components and utility functions
6. Configure Tauri for desktop integration (when applicable)
7. Run linting and formatting before committing changes:
   ```bash
   npm run lint
   npm run format
   ```
8. Ensure tests pass before submitting changes:
   ```bash
   npm test
   ```