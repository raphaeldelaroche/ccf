import jwt from 'jsonwebtoken';

/**
 * Payload structure for self-assessment JWT tokens
 */
export interface SelfAssessmentTokenPayload {
  sector: string;
  size: string;
  geography: string;
  email: string;
  entryId?: number;
}

/**
 * JWT Secret key - must be defined in environment variables
 */
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not defined in environment variables. Using fallback (not secure for production)');
}

const SECRET_KEY = JWT_SECRET || 'fallback-secret-key-change-in-production';

/**
 * Generates a signed JWT token containing self-assessment data
 *
 * @param payload - The self-assessment data to encode
 * @returns The signed JWT token as a string
 *
 * @example
 * const token = generateToken({
 *   sector: 'technology',
 *   size: 'pme',
 *   geography: 'europe',
 *   email: 'user@example.com'
 * });
 */
export function generateToken(payload: SelfAssessmentTokenPayload): string {
  try {
    // Sign the token with 30 days expiration
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '30d',
      issuer: 'ccf-self-assessment',
      audience: 'ccf-report',
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate assessment token');
  }
}

/**
 * Decodes and verifies a JWT token, returning the payload
 *
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid/expired
 *
 * @example
 * const data = decodeToken(token);
 * if (data) {
 *   console.log('Sector:', data.sector);
 * }
 */
export function decodeToken(token: string): SelfAssessmentTokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY, {
      issuer: 'ccf-self-assessment',
      audience: 'ccf-report',
    }) as SelfAssessmentTokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token:', error.message);
    } else {
      console.error('Error decoding token:', error);
    }
    return null;
  }
}

/**
 * Validates a token without throwing errors
 *
 * @param token - The JWT token to validate
 * @returns true if valid, false otherwise
 */
export function isValidToken(token: string): boolean {
  return decodeToken(token) !== null;
}
