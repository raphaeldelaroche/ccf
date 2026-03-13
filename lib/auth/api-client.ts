/**
 * API client with automatic role header injection
 * Centralized fetch wrapper for authenticated API calls
 */

import { USER_ROLE_STORAGE_KEY } from './types'

/**
 * Get the current user role from localStorage
 */
function getCurrentRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_ROLE_STORAGE_KEY)
}

/**
 * Fetch wrapper that automatically adds the user role header
 * Use this instead of fetch() for all API calls that require authentication
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const role = getCurrentRole()

  const headers = new Headers(options.headers)
  if (role) {
    headers.set('x-user-role', role)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Convenience methods for common HTTP verbs
 */

export const api = {
  get: (url: string, options?: RequestInit) =>
    apiFetch(url, { ...options, method: 'GET' }),

  post: (url: string, body: unknown, options?: RequestInit) =>
    apiFetch(url, {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body),
    }),

  put: (url: string, body: unknown, options?: RequestInit) =>
    apiFetch(url, {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body),
    }),

  patch: (url: string, body: unknown, options?: RequestInit) =>
    apiFetch(url, {
      ...options,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body),
    }),

  delete: (url: string, options?: RequestInit) =>
    apiFetch(url, { ...options, method: 'DELETE' }),
}
