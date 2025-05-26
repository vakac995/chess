export * from './dev';
export * from './devReact';
export * from './formatting';
export * from './seo';
export * from './storage';
export * from './validation';
export * from './error';

/**
 * Generates a random floating-point number between 0 (inclusive) and 1 (exclusive).
 * This is a wrapper around Math.random() for consistency and potential future enhancements.
 * @returns {number} A random number between 0 and 1.
 */
export const getRandomNumber = (): number => Math.random();
