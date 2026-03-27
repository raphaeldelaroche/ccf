"use client";

import Cookies from 'js-cookie';

/**
 * Cookie name for storing the self-assessment token
 */
const ASSESSMENT_TOKEN_COOKIE = 'ccf_assessment_token';

/**
 * Cookie expiration time in days
 */
const COOKIE_EXPIRY_DAYS = 7;

/**
 * Stores the self-assessment token in a cookie
 *
 * @param token - The JWT token to store
 *
 * @example
 * setAssessmentToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
export function setAssessmentToken(token: string): void {
  try {
    Cookies.set(ASSESSMENT_TOKEN_COOKIE, token, {
      expires: COOKIE_EXPIRY_DAYS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    console.error('Error setting assessment token cookie:', error);
  }
}

/**
 * Retrieves the self-assessment token from cookies
 *
 * @returns The stored token or null if not found
 *
 * @example
 * const token = getAssessmentToken();
 * if (token) {
 *   // Use token
 * }
 */
export function getAssessmentToken(): string | null {
  try {
    const token = Cookies.get(ASSESSMENT_TOKEN_COOKIE);
    return token || null;
  } catch (error) {
    console.error('Error getting assessment token cookie:', error);
    return null;
  }
}

/**
 * Removes the self-assessment token cookie
 *
 * @example
 * removeAssessmentToken();
 */
export function removeAssessmentToken(): void {
  try {
    Cookies.remove(ASSESSMENT_TOKEN_COOKIE);
  } catch (error) {
    console.error('Error removing assessment token cookie:', error);
  }
}

/**
 * Checks if an assessment token exists in cookies
 *
 * @returns true if token exists, false otherwise
 */
export function hasAssessmentToken(): boolean {
  return getAssessmentToken() !== null;
}
