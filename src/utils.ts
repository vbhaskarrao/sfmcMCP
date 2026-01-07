// Copyright (c) Your Organization.
// Licensed under the MIT License.

/**
 * Utility functions for the MCP server
 */

/**
 * Formats a date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Truncates a string to a specified length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + "...";
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
}

/**
 * Delays execution for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gets enum keys as an array
 */
export function getEnumKeys<T extends Record<string, string | number>>(
  enumObj: T
): string[] {
  return Object.keys(enumObj).filter((key) => isNaN(Number(key)));
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a retry wrapper for async functions
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt);
      }
    }
  }

  throw lastError;
}
