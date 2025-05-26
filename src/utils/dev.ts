/**
 * Development utilities for debugging, logging, and development-only features
 * This module provides a centralized API for all development mode functionality
 */

/**
 * Development environment configuration
 */
export interface DevConfig {
  /** Enable debug logging */
  logging: boolean;
  /** Enable debug UI components */
  debugUI: boolean;
  /** Enable performance monitoring */
  performance: boolean;
  /** Enable data validation checks */
  validation: boolean;
  /** Enable mock data/API responses */
  mocking: boolean;
  /** Enable development shortcuts/tools */
  tools: boolean;
}

/**
 * Log levels for development logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Performance timing entry
 */
export interface PerfEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Development utilities class providing centralized dev functionality
 */
class DevelopmentUtils {
  private readonly isDev: boolean;
  private readonly config: DevConfig;
  private readonly perfEntries = new Map<string, PerfEntry>();

  constructor() {
    this.isDev = import.meta.env.DEV;

    this.config = this.loadConfig();
  }

  /**
   * Load development configuration
   */
  private loadConfig(): DevConfig {
    const defaultConfig: DevConfig = {
      logging: this.isDev,
      debugUI: this.isDev,
      performance: this.isDev,
      validation: this.isDev,
      mocking: this.isDev,
      tools: this.isDev,
    };

    if (!this.isDev) {
      return {
        logging: false,
        debugUI: false,
        performance: false,
        validation: false,
        mocking: false,
        tools: false,
      };
    }

    try {
      const stored = localStorage.getItem('dev-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultConfig, ...parsed };
      }
    } catch {
      // Ignore errors, use defaults
    }

    return defaultConfig;
  }

  /**
   * Save development configuration
   */
  public saveConfig(config: Partial<DevConfig>): void {
    if (!this.isDev) return;

    const newConfig = { ...this.config, ...config };
    Object.assign(this.config, newConfig);

    try {
      localStorage.setItem('dev-config', JSON.stringify(newConfig));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Check if development mode is enabled
   */
  public get isEnabled(): boolean {
    return this.isDev;
  }

  /**
   * Get current configuration
   */
  public get configuration(): Readonly<DevConfig> {
    return { ...this.config };
  }

  /** === LOGGING UTILITIES === */

  /**
   * Development logger with different levels
   */ public log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.config.logging) return;

    const timestamp = new Date().toISOString();
    const prefix = `[DEV ${level.toUpperCase()}] ${timestamp}:`;

    switch (level) {
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(prefix, message, ...args);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        break;
    }
  }

  /**
   * Debug logging shorthand
   */
  public debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Info logging shorthand
   */
  public info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Warning logging shorthand
   */
  public warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Error logging shorthand
   */
  public error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Log data with pretty formatting
   */ public logData(label: string, data: unknown, collapsed = true): void {
    if (!this.config.logging) return;

    const timestamp = new Date().toISOString();
    if (collapsed) {
      // eslint-disable-next-line no-console
      console.groupCollapsed(`[DEV DATA] ${timestamp}: ${label}`);
    } else {
      // eslint-disable-next-line no-console
      console.group(`[DEV DATA] ${timestamp}: ${label}`);
    }
    // eslint-disable-next-line no-console
    console.log(data);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  /** === PERFORMANCE UTILITIES === */

  /**
   * Start performance measurement
   */
  public perfStart(name: string, metadata?: Record<string, unknown>): void {
    if (!this.config.performance) return;

    this.perfEntries.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End performance measurement
   */
  public perfEnd(name: string): PerfEntry | null {
    if (!this.config.performance) return null;

    const entry = this.perfEntries.get(name);
    if (!entry) {
      this.warn(`Performance entry "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - entry.startTime;

    const completedEntry: PerfEntry = {
      ...entry,
      endTime,
      duration,
    };

    this.perfEntries.delete(name);
    this.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`, completedEntry);

    return completedEntry;
  }

  /**
   * Get all performance entries
   */
  public getPerfEntries(): PerfEntry[] {
    if (!this.config.performance) return [];
    return Array.from(this.perfEntries.values());
  }

  /**
   * Clear all performance entries
   */
  public clearPerfEntries(): void {
    this.perfEntries.clear();
  }

  /** === VALIDATION UTILITIES === */

  /**
   * Assert a condition in development mode
   */
  public assert(condition: boolean, message: string, ...args: unknown[]): void {
    if (!this.config.validation) return;

    if (!condition) {
      this.error(`Assertion failed: ${message}`, ...args);
      throw new Error(`Dev assertion failed: ${message}`);
    }
  }

  /**
   * Validate data structure in development mode
   */
  public validateData<T>(
    data: unknown,
    validator: (data: unknown) => data is T,
    errorMessage = 'Data validation failed'
  ): T {
    if (!this.config.validation) return data as T;

    if (!validator(data)) {
      this.error(errorMessage, { received: data });
      throw new Error(`Dev validation failed: ${errorMessage}`);
    }

    return data;
  }

  /** === UTILITY FUNCTIONS === */

  /**
   * Execute function only in development mode
   */
  public only<T>(fn: () => T): T | undefined {
    if (!this.isDev) return undefined;
    return fn();
  }

  /**
   * Execute function only if specific feature is enabled
   */
  public when<T>(feature: keyof DevConfig, fn: () => T): T | undefined {
    if (!this.config[feature]) return undefined;
    return fn();
  }

  /**
   * Conditionally return value based on development mode
   */
  public value<T, U>(devValue: T, prodValue: U): T | U {
    return this.isDev ? devValue : prodValue;
  }

  /**
   * Get development-only props for components
   */ public props<T extends Record<string, unknown>>(devProps: T): T | Record<string, never> {
    return this.isDev ? devProps : {};
  }

  /**
   * Create development-only React component wrapper
   */
  public component<P extends Record<string, unknown>>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> | (() => null) {
    if (!this.config.debugUI) {
      return () => null;
    }
    return Component;
  }

  /** === MOCK UTILITIES === */

  /**
   * Create mock data factory
   */
  public mock<T>(factory: () => T): () => T | null {
    return () => (this.config.mocking ? factory() : null);
  }

  /**
   * Delay execution (useful for simulating API calls)
   */
  public async delay(ms: number): Promise<void> {
    if (!this.config.mocking) return;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** === DEBUGGING HELPERS === */

  /**
   * Add breakpoint in development mode
   */ public breakpoint(label?: string): void {
    if (!this.config.tools) return;

    if (label) {
      this.debug(`Breakpoint: ${label}`);
    }
    debugger;
  }

  /**
   * Inspect object properties in development mode
   */
  public inspect(obj: unknown, label = 'Object'): unknown {
    if (!this.config.tools) return obj;

    this.logData(label, obj, false);
    return obj;
  }

  /**
   * Time a function execution
   */
  public time<T extends (...args: never[]) => unknown>(fn: T, label?: string): T {
    if (!this.config.performance) return fn;

    return ((...args: Parameters<T>) => {
      const name = label ?? fn.name ?? 'Anonymous function';
      this.perfStart(name);
      try {
        const result = fn(...args);

        // Handle async functions
        if (result instanceof Promise) {
          return result.finally(() => this.perfEnd(name));
        }

        this.perfEnd(name);
        return result;
      } catch (error) {
        this.perfEnd(name);
        throw error;
      }
    }) as T;
  }
}

export const dev = new DevelopmentUtils();

export const {
  isEnabled,
  configuration,
  debug,
  info,
  warn,
  error,
  logData,
  perfStart,
  perfEnd,
  assert,
  validateData,
  only,
  when,
  value,
  props,
  component,
  mock,
  delay,
  breakpoint,
  inspect,
  time,
} = dev;
