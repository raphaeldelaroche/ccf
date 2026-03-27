/**
 * Simple token encoding/decoding for entry IDs
 * Uses base64 encoding with a salt to obfuscate entry IDs
 *
 * This is a lightweight obfuscation, not encryption.
 * The goal is just to hide the entry ID from casual observation.
 */

// Salt from environment variable
const SALT = process.env.NEXT_PUBLIC_ENTRY_SALT || 'ccf-2026';

/**
 * Encode an entry ID into a token
 * @param entryId - The entry ID to encode
 * @returns Base64 encoded token
 */
export function encodeEntryToken(entryId: string | number): string {
  const value = `${SALT}:${entryId}`;

  // Check if we're in browser or Node.js
  if (typeof window !== 'undefined') {
    // Browser: use btoa
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } else {
    // Node.js: use Buffer
    return Buffer.from(value).toString('base64url');
  }
}

/**
 * Decode a token back to an entry ID
 * @param token - The token to decode
 * @returns Entry ID or null if invalid
 */
export function decodeEntryToken(token: string): string | null {
  try {
    let value: string;

    // Check if we're in browser or Node.js
    if (typeof window !== 'undefined') {
      // Browser: use atob
      const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      value = atob(base64);
    } else {
      // Node.js: use Buffer
      value = Buffer.from(token, 'base64url').toString('utf-8');
    }

    const parts = value.split(':');

    // Validate format: salt:entryId
    if (parts.length !== 2 || parts[0] !== SALT) {
      return null;
    }

    return parts[1]; // Return entry ID
  } catch (error) {
    console.error('[EntryToken] Decode error:', error);
    return null;
  }
}
