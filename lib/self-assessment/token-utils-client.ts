"use client";

import type { SelfAssessmentTokenPayload } from './token-utils';

/**
 * Client-safe token decoder
 * Uses base64 decoding to read the JWT payload without verification
 *
 * NOTE: This does NOT verify the signature - only use for reading data
 * Server-side verification is still required for security
 */
export function decodeTokenClient(token: string): SelfAssessmentTokenPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.warn('Invalid token format');
      return null;
    }

    // Decode the payload (base64url)
    const payload = parts[1];

    // Base64url to base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64
    const jsonString = atob(base64);

    // Parse JSON
    const decoded = JSON.parse(jsonString) as SelfAssessmentTokenPayload & {
      iat?: number;
      exp?: number;
      iss?: string;
      aud?: string;
    };

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn('Token has expired');
      return null;
    }

    // Return only the payload data (without JWT metadata)
    return {
      sector: decoded.sector,
      size: decoded.size,
      geography: decoded.geography,
      email: decoded.email,
      entryId: decoded.entryId,
    };

  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Validates a token format without verification
 * @param token - The JWT token to validate
 * @returns true if format is valid, false otherwise
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3;
}
