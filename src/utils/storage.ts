// Supported storage types
export type StorageType = 'localStorage' | 'sessionStorage';

// Storage operation result type
export interface StorageResult<T> {
  success: boolean;
  value?: T;
  error?: Error;
}

// Storage validation options
export interface StorageValidationOptions {
  validateSchema?: boolean;
  allowNull?: boolean;
  maxSize?: number; // in bytes
}

const MAX_STORAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * A wrapper around web storage (localStorage/sessionStorage) with type safety and error handling
 */
export const storage = {
  /**
   * Set a value in storage
   */
  set<T>(key: string, value: T, type: StorageType = 'localStorage'): StorageResult<T> {
    try {
      if (!key) {
        throw new Error('Storage key cannot be empty');
      }

      // Get storage mechanism
      const storageMethod = this.getStorageMethod(type);

      // Handle special case of null/undefined
      if (value === null || value === undefined) {
        storageMethod.removeItem(key);
        return { success: true };
      }

      const serializedValue = JSON.stringify(value);

      // Check storage quota
      if (serializedValue.length > MAX_STORAGE_SIZE_BYTES) {
        throw new Error(`Storage value exceeds maximum size (2MB) for key: ${key}`);
      }

      storageMethod.setItem(key, serializedValue);
      return { success: true, value };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Get a value from storage with type assertion
   */
  get<T>(key: string, defaultValue: T, type: StorageType = 'localStorage'): StorageResult<T> {
    try {
      if (!key) {
        throw new Error('Storage key cannot be empty');
      }

      // Get storage mechanism
      const storageMethod = this.getStorageMethod(type);

      const serializedValue = storageMethod.getItem(key);

      if (serializedValue === null) {
        return { success: true, value: defaultValue };
      }

      // Parse the value with type assertion
      const value = JSON.parse(serializedValue) as T;
      return { success: true, value };
    } catch (error) {
      return {
        success: false,
        value: defaultValue,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Remove a value from storage
   */
  remove(key: string, type: StorageType = 'localStorage'): StorageResult<void> {
    try {
      if (!key) {
        throw new Error('Storage key cannot be empty');
      }

      // Get storage mechanism
      const storageMethod = this.getStorageMethod(type);

      storageMethod.removeItem(key);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Clear all values from storage
   */
  clear(type: StorageType = 'localStorage'): StorageResult<void> {
    try {
      // Get storage mechanism
      const storageMethod = this.getStorageMethod(type);

      storageMethod.clear();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Check if a key exists in storage
   */
  has(key: string, type: StorageType = 'localStorage'): boolean {
    try {
      if (!key) return false;

      // Get storage mechanism
      const storageMethod = this.getStorageMethod(type);

      return storageMethod.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  /**
   * Get all keys in storage
   */
  keys(type: StorageType = 'localStorage'): string[] {
    try {
      // Get storage mechanism
      const storageMethod = this.getStorageMethod(type);

      const keys: string[] = [];
      for (let i = 0; i < storageMethod.length; i++) {
        const key = storageMethod.key(i);
        if (key !== null) {
          keys.push(key);
        }
      }
      return keys;
    } catch {
      return [];
    }
  },

  /**
   * Get storage size in bytes
   */
  getSize(type: StorageType = 'localStorage'): number {
    try {
      // Get storage mechanism
      const storageMethod = this.getStorageMethod(type);

      let totalSize = 0;
      for (let i = 0; i < storageMethod.length; i++) {
        const key = storageMethod.key(i);
        if (key !== null) {
          const value = storageMethod.getItem(key);
          if (value !== null) {
            totalSize += key.length + value.length;
          }
        }
      }
      return totalSize;
    } catch {
      return 0;
    }
  },

  /**
   * Helper method to get the appropriate storage object
   */
  getStorageMethod(type: StorageType): Storage {
    if (type === 'sessionStorage') {
      return sessionStorage;
    }
    return localStorage;
  },
};
