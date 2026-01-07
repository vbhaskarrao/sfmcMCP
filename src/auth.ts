// Copyright (c) Your Organization.
// Licensed under the MIT License.

/**
 * Authentication module for handling API authentication
 */

export interface AuthConfig {
  apiKey?: string;
  baseUrl: string;
}

/**
 * Creates headers for API requests with authentication
 */
export function createAuthHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Validates if the API key is present and properly formatted
 */
export function validateApiKey(apiKey?: string): boolean {
  if (!apiKey) {
    return false;
  }

  // Add your custom validation logic here
  // Example: Check minimum length, format, etc.
  return apiKey.length > 0;
}

/**
 * Makes an authenticated API request
 */
export async function makeAuthenticatedRequest<T>(
  url: string,
  apiKey?: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = createAuthHeaders(apiKey);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
