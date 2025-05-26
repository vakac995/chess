# Development Utilities API

This document describes the comprehensive development utilities system designed for template projects. The system provides a centralized, type-safe, and tree-shakable approach to handling development mode functionality.

## Overview

The development utilities system consists of three main modules:

1.  **`src/utils/dev.ts`** - Core development utilities
2.  **`src/utils/devReact.tsx`** - React-specific development utilities
3.  **`src/components/DevDashboard/`** - Example implementation and dashboard

## Core Features

### 🎯 **Type-Safe & Centralized**

*   Single import for all development utilities
*   TypeScript support throughout
*   Consistent API across the entire project

### 🌲 **Tree-Shakable**

*   Completely removed from production builds
*   No performance impact in production
*   Smart conditional execution

### ⚙️ **Configurable**

*   Runtime configuration for different dev features
*   Persistent settings via localStorage
*   Granular control over functionality

### 🔧 **Comprehensive**

*   Logging with multiple levels
*   Performance monitoring
*   Data validation
*   React component utilities
*   Debug UI components

## Quick Start

### Basic Usage

```typescript
import { dev } from '@/utils';

// Simple logging
dev.debug('User action', { userId: 123 });
dev.warn('Potential issue detected');
dev.error('Something went wrong', errorObject);

// Performance monitoring
dev.perfStart('api-call');
await fetchData();
dev.perfEnd('api-call');

// Conditional execution
dev.only(() => {
  console.log('This only runs in development');
});

// Feature-specific execution
dev.when('debugUI', () => {
  showDebugPanel();
});
```

### React Components

```tsx
import { DevOnly, DevPanel, DevDataPanel } from '@/utils';

function MyComponent({ data }) {
  return (
    <div>
      <h1>My Component</h1>
      
      {/* Only rendered in development */}
      <DevOnly>
        <DevDataPanel title="Component Data" data={data} />
      </DevOnly>
    </div>
  );
}
```

## API Reference

### Core Development Class (`dev`)

#### Configuration

```typescript
interface DevConfig {
  logging: boolean;        // Enable debug logging
  debugUI: boolean;        // Enable debug UI components
  performance: boolean;    // Enable performance monitoring
  validation: boolean;     // Enable data validation checks
  mocking: boolean;        // Enable mock data/API responses
  tools: boolean;          // Enable development shortcuts/tools
}

// Access current config
dev.configuration: Readonly<DevConfig>

// Update configuration
dev.saveConfig(newConfig: Partial<DevConfig>): void
```

#### Logging

```typescript
// Different log levels
dev.debug(message: string, ...args: unknown[]): void
dev.info(message: string, ...args: unknown[]): void
dev.warn(message: string, ...args: unknown[]): void
dev.error(message: string, ...args: unknown[]): void

// Structured data logging
dev.logData(label: string, data: unknown, collapsed?: boolean): void
```

#### Performance Monitoring

```typescript
// Start/end timing
dev.perfStart(name: string, metadata?: Record<string, unknown>): void
dev.perfEnd(name: string): PerfEntry | null

// Function timing wrapper
dev.time<T>(fn: T, label?: string): T

// Get performance data
dev.getPerfEntries(): PerfEntry[]
dev.clearPerfEntries(): void
```

#### Validation & Assertions

```typescript
// Development assertions
dev.assert(condition: boolean, message: string, ...args: unknown[]): void

// Data validation
dev.validateData<T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  errorMessage?: string
): T
```

#### Utility Functions

```typescript
// Conditional execution
dev.only<T>(fn: () => T): T | undefined
dev.when<T>(feature: keyof DevConfig, fn: () => T): T | undefined

// Development vs production values
dev.value<T, U>(devValue: T, prodValue: U): T | U

// Component props for development
dev.props<T>(devProps: T): T | {}

// Mock utilities
dev.mock<T>(factory: () => T): () => T | null
dev.delay(ms: number): Promise<void>

// Debugging helpers
dev.breakpoint(label?: string): void
dev.inspect(obj: unknown, label?: string): unknown
```

### React Utilities

#### Hooks

```typescript
// Access dev utilities in components
useDev(): DevUtilities

// Component performance tracking
useDevPerformance(componentName: string, metadata?: Record<string, unknown>)

// Props change logging
useDevPropsLogger<T>(
  componentName: string,
  props: T,
  options?: { logOnMount?: boolean; logOnChange?: boolean }
)
```

#### Higher-Order Component

```typescript
withDevTools<P>(
  Component: React.ComponentType<P>,
  options?: {
    name?: string;
    logProps?: boolean;
    trackPerformance?: boolean;
    validateProps?: (props: P) => boolean;
  }
): React.ComponentType<P>
```

#### Components

```tsx
// Conditional rendering wrapper
<DevOnly feature="debugUI">
  <DebugContent />
</DevOnly>

// Collapsible debug panel
<DevPanel title="Debug Info" collapsed={true}>
  <DebugContent />
</DevPanel>

// Data display panel
<DevDataPanel title="State" data={componentState} />

// Configuration panel
<DevConfigPanel />

// Performance monitoring panel
<DevPerformancePanel />

// Log viewer panel
<DevLoggerPanel maxEntries={50} />
```

## Real-World Examples

### 1. Form Development & Debugging

```tsx
import { dev, DevOnly, DevDataPanel } from '@utils';

function RegistrationForm() {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async (data) => {
    dev.perfStart('form-submission');
    dev.debug('Form submission started', data);
    
    try {
      // Simulate API call in development
      await dev.delay(1000);
      
      // Validate data in development
      dev.validateData(data, isValidFormData, 'Invalid form data');
      
      const result = await submitForm(data);
      dev.debug('Form submission successful', result);
    } catch (error) {
      dev.error('Form submission failed', error);
    } finally {
      dev.perfEnd('form-submission');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <DevOnly>
        <DevDataPanel title="Form State" data={formData} />
      </DevOnly>
    </form>
  );
}
```

### 2. API Integration Development

```typescript
import { dev } from '@/utils';

class ApiService {
  async fetchUser(id: string) {
    dev.perfStart(`fetch-user-${id}`);
    
    try {
      // Mock data in development
      const mockUser = dev.mock(() => ({ id, name: 'Dev User', email: 'dev@example.com' }));
      if (mockUser) {
        dev.debug('Using mock user data', mockUser);
        await dev.delay(500); // Simulate network delay
        return mockUser();
      }
      
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      
      dev.debug('User fetched successfully', user);
      dev.assert(user.id === id, 'User ID mismatch');
      
      return user;
    } catch (error) {
      dev.error('Failed to fetch user', { id, error });
      throw error;
    } finally {
      dev.perfEnd(`fetch-user-${id}`);
    }
  }
}
```

### 3. Component Development & Testing

```tsx
import { withDevTools, useDevPerformance } from '@/utils';

const UserCard = withDevTools(
  ({ user, onEdit }) => {
    useDevPerformance('UserCard', { userId: user.id });
    
    const handleEdit = () => {
      dev.debug('Edit button clicked', { userId: user.id });
      onEdit(user);
    };

    return (
      <div className="user-card">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <button onClick={handleEdit}>Edit</button>
      </div>
    );
  },
  {
    name: 'UserCard',
    logProps: true,
    trackPerformance: true,
    validateProps: (props) => props.user && typeof props.user.id === 'string',
  }
);
```

### 4. State Management Development

```typescript
import { dev } from '@/utils';

// Jotai atom with development logging
const userAtom = atom(
  null,
  (get, set, action) => {
    dev.debug('User atom action', action);
    
    const currentUser = get(userAtom);
    dev.logData('Current user state', currentUser);
    
    // Apply action...
    const newUser = applyAction(currentUser, action);
    
    dev.assert(newUser !== undefined, 'User state should not be undefined');
    dev.debug('User state updated', { from: currentUser, to: newUser });
    
    set(userAtom, newUser);
  }
);
```

## Configuration Examples

### Development Environment Setup

```typescript
// In development, enable all features
dev.saveConfig({
  logging: true,
  debugUI: true,
  performance: true,
  validation: true,
  mocking: true,
  tools: true,
});
```

### Testing Environment

```typescript
// In testing, minimal logging
dev.saveConfig({
  logging: false,
  debugUI: false,
  performance: false,
  validation: true,  // Keep validation for test integrity
  mocking: true,     // Enable mocks for consistent tests
  tools: false,
});
```

### Staging Environment

```typescript
// In staging, limited debugging
dev.saveConfig({
  logging: true,
  debugUI: false,    // No UI clutter
  performance: true, // Monitor performance
  validation: true,
  mocking: false,    // Use real APIs
  tools: false,
});
```

## Integration with Existing Projects

### 1. Migrate from `import.meta.env.DEV`

**Before:**

```typescript
if (import.meta.env.DEV) {
  console.log('Debug info', data);
}
```

**After:**

```typescript
dev.debug('Debug info', data);
```

### 2. Migrate from console logging

**Before:**

```typescript
console.log('User action:', action);
console.warn('Potential issue:', issue);
```

**After:**

```typescript
dev.info('User action', action);
dev.warn('Potential issue', issue);
```

### 3. Add debug UI to existing components

**Before:**

```tsx
function MyComponent({ data }) {
  return <div>Content</div>;
}
```

**After:**

```tsx
function MyComponent({ data }) {
  return (
    <div>
      Content
      <DevOnly>
        <DevDataPanel title="Component Data" data={data} />
      </DevOnly>
    </div>
  );
}
```

## Best Practices

### 1. **Use Appropriate Log Levels**

*   `debug`: Detailed debugging information
*   `info`: General information about program execution
*   `warn`: Potentially harmful situations
*   `error`: Error events that might still allow the application to continue

### 2. **Performance Monitoring**

*   Use descriptive names for performance measurements
*   Include relevant metadata for context
*   Monitor both sync and async operations

### 3. **Validation in Development**

*   Assert invariants and assumptions
*   Validate external data and API responses
*   Use type guards for runtime type checking

### 4. **Component Development**

*   Use `DevOnly` for development-specific UI
*   Include data panels for state debugging
*   Log important prop changes and user interactions

### 5. **Configuration Management**

*   Start with all features enabled in development
*   Selectively disable features that cause noise
*   Use different configs for different environments

## Production Safety

The development utilities system is designed to be completely safe for production:

1.  **Tree Shaking**: All development code is removed in production builds
2.  **Runtime Checks**: All methods check `import.meta.env.DEV` before execution
3.  **Zero Overhead**: No performance impact in production
4.  **Type Safety**: Full TypeScript support prevents misuse

## Migration Guide

To migrate your existing project to use these development utilities:

1.  **Install the utilities** by copying the files to your `src/utils/` directory
2.  **Update imports** to use the new dev utilities instead of direct console calls
3.  **Add debug components** to key areas of your application
4.  **Configure the system** based on your development workflow
5.  **Test thoroughly** to ensure production builds work correctly

This system provides a solid foundation for development tooling that can grow with your project while maintaining clean separation between development and production code.
