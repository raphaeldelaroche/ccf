import Redis from "ioredis";

// Vercel fournit maintenant Upstash Redis (ou autre string compatible redis://)
const redisUrl = process.env.REDIS_URL || process.env.KV_URL || "";

// En local si rien n'est configuré, ça crashera de façon claire,
// vérifiez que votre .env.local a bien REDIS_URL
export const kv = new Redis(redisUrl);
