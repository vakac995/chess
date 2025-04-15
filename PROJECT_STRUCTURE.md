# Chess Web Application - Project Structure

Based on the README.md documentation, here is the proposed directory structure for the chess web application:

```
chess/                          # Root project directory
├── package.json                # NPM package definition
├── package-lock.json           # NPM dependency lock file
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .gitignore                  # Git ignore file
├── README.md                   # Project documentation
├── LICENSE                     # License file
├── sonar-project.properties    # SonarQube configuration
├── index.html                  # Main HTML entry point
│
├── public/                     # Public static assets
│   ├── favicon.ico             # Website favicon
│   └── manifest.json           # PWA manifest
│
├── src/                        # Source code
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Main App component
│   ├── vite-env.d.ts           # Vite environment types
│   │
│   ├── components/             # React components
│   │   ├── ChessBoard/         # Chess board component
│   │   │   ├── ChessBoard.tsx
│   │   │   ├── ChessBoard.module.scss
│   │   │   └── index.ts
│   │   │
│   │   ├── GameControls/       # Game controls component
│   │   │   ├── GameControls.tsx
│   │   │   ├── GameControls.module.scss
│   │   │   └── index.ts
│   │   │
│   │   ├── CapturedPieces/     # Captured pieces display component
│   │   │   ├── CapturedPieces.tsx
│   │   │   ├── CapturedPieces.module.scss
│   │   │   └── index.ts
│   │   │
│   │   └── GameStatus/         # Game status component
│   │       ├── GameStatus.tsx
│   │       ├── GameStatus.module.scss
│   │       └── index.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChessGame.ts     # Chess game state and logic hook
│   │   └── useGameHistory.ts   # Game history and undo functionality
│   │
│   ├── utils/                  # Utility functions
│   │   ├── chess-helpers.ts    # Chess-related helper functions
│   │   └── types.ts            # TypeScript type definitions
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.scss          # Main stylesheet
│   │   ├── tailwind.css        # Tailwind imports
│   │   └── variables.scss      # SCSS variables
│   │
│   ├── assets/                 # Assets (images, sounds, etc.)
│   │   ├── images/             # Image assets
│   │   └── sounds/             # Sound effects
│   │
│   ├── context/                # React Context for state management
│   │   └── GameContext.tsx     # Game state context
│   │
│   └── tests/                  # Test files
│       └── App.test.tsx        # Example test file
│
└── src-tauri/                  # Tauri-specific files for desktop app
    ├── Cargo.toml              # Rust package manifest
    ├── Cargo.lock              # Rust dependency lock file
    ├── tauri.conf.json         # Tauri configuration
    └── src/                    # Rust source code
        └── main.rs             # Tauri main entry point
```

## Key Features Implementation

1. **Chess Game Logic**
   - Uses chess.js library to handle game rules and state
   - Implemented in `useChessGame.ts` hook

2. **UI Components**
   - Board visualization with react-chessboard
   - Game controls for restart, undo
   - Status display showing current player, check/checkmate status

3. **State Management**
   - Core game state managed by chess.js
   - React Context for UI state distribution
   - Custom hooks for specific functionality

4. **Desktop App Integration**
   - Tauri configuration for packaging as a desktop application
   - Native OS features accessible through Tauri API

## Development Workflow

1. Start with core game logic implementation
2. Build essential UI components
3. Implement game state and controls
4. Add styling and responsive design
5. Configure Tauri for desktop integration
6. Add testing and prepare for deployment