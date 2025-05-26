/**
 * Safely stringifies data to prevent null/undefined or circular reference issues.
 * @param data The data to stringify
 * @param indent Number of spaces to use for indentation or null for no formatting
 * @param fallback Optional fallback message if stringification fails
 * @returns Safely stringified data
 */
export function safeStringify(data: unknown, indent = 2, fallback = 'No data available'): string {
  if (data === null || data === undefined) {
    return fallback;
  }

  try {
    return JSON.stringify(data, replacer, indent);
  } catch (error) {
    console.error('Error stringifying data:', error);
    return `Error formatting data: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Format registration data for display, handling null and undefined values
 * @param data Registration data
 * @returns Formatted string for display
 */
export function formatRegistrationData(data: Readonly<Record<string, unknown>> | null): string {
  if (!data) return 'No registration data available';

  // Create a copy to avoid modifying the original
  const displayData: Record<string, unknown> = { ...data };

  const SENSITIVE_FIELD_MASKS: Record<string, string> = {
    password: '••••••••••',
    confirmPassword: '••••••••••',
    // creditCard: '**** **** **** ****'
  };

  // Apply masks to any sensitive fields found in the data
  for (const [field, mask] of Object.entries(SENSITIVE_FIELD_MASKS)) {
    if (field in displayData) {
      displayData[field] = mask;
    }
  }

  try {
    return safeStringify(displayData);
  } catch (error) {
    console.error('Error formatting registration data:', error);
    return 'Unable to format registration data';
  }
}

/**
 * Custom replacer function for JSON.stringify to handle circular references
 * and special objects like Date or Map
 */
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return `Date(${value.toISOString()})`;
  }
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }
  if (value instanceof Set) {
    return Array.from(value);
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }

  return value;
}
