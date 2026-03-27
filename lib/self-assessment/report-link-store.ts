/**
 * Temporary in-memory store for report link data
 * In production, use Redis or a database
 */

interface ReportLinkData {
  sector: string;
  size: string;
  geography: string;
  email: string;
  createdAt: number;
}

// In-memory store (replace with Redis in production)
const store = new Map<string, ReportLinkData>();

// TTL: 7 days (in milliseconds)
const TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Generates a short random ID (8 characters)
 */
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Stores report link data and returns a short ID
 */
export function createReportLink(data: Omit<ReportLinkData, 'createdAt'>): string {
  // Generate unique ID
  let linkId = generateShortId();
  while (store.has(linkId)) {
    linkId = generateShortId();
  }

  // Store data with timestamp
  store.set(linkId, {
    ...data,
    createdAt: Date.now(),
  });

  console.log(`[ReportLinkStore] Created link: ${linkId}`);

  return linkId;
}

/**
 * Retrieves report link data by ID
 * Returns null if not found or expired
 */
export function getReportLink(linkId: string): Omit<ReportLinkData, 'createdAt'> | null {
  const data = store.get(linkId);

  if (!data) {
    console.warn(`[ReportLinkStore] Link not found: ${linkId}`);
    return null;
  }

  // Check expiration
  const age = Date.now() - data.createdAt;
  if (age > TTL) {
    console.warn(`[ReportLinkStore] Link expired: ${linkId}`);
    store.delete(linkId);
    return null;
  }

  console.log(`[ReportLinkStore] Retrieved link: ${linkId}`);

  return {
    sector: data.sector,
    size: data.size,
    geography: data.geography,
    email: data.email,
  };
}

/**
 * Cleanup expired links (run periodically)
 */
export function cleanupExpiredLinks(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, data] of store.entries()) {
    const age = now - data.createdAt;
    if (age > TTL) {
      store.delete(id);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[ReportLinkStore] Cleaned up ${cleaned} expired links`);
  }

  return cleaned;
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredLinks, 60 * 60 * 1000);
}
