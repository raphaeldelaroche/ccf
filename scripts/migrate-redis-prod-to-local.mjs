#!/usr/bin/env node
/**
 * Migration des données Redis de production vers Redis local.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-redis-prod-to-local.mjs
 *
 * Prérequis:
 *   - Redis local démarré (brew services start redis)
 *   - .env.local contenant REDIS_URL (prod)
 */

import Redis from "ioredis"

const prodUrl = process.env.REDIS_URL
if (!prodUrl) {
  console.error("❌  REDIS_URL manquant. Lance le script avec --env-file=.env.local")
  process.exit(1)
}

const prodRedis = new Redis(prodUrl, { lazyConnect: true })
const localRedis = new Redis("redis://localhost:6379", { lazyConnect: true })

await prodRedis.connect()
await localRedis.connect()

console.log("✅  Connecté à Redis prod et Redis local")
console.log("🔍  Scan des clés en prod...\n")

let cursor = "0"
let totalKeys = 0

do {
  const [nextCursor, keys] = await prodRedis.scan(cursor, "COUNT", 100)
  cursor = nextCursor

  for (const key of keys) {
    const [type, pttl] = await Promise.all([
      prodRedis.type(key),
      prodRedis.pttl(key),
    ])

    if (type === "string") {
      const val = await prodRedis.get(key)
      await localRedis.set(key, val)
    } else if (type === "hash") {
      const val = await prodRedis.hgetall(key)
      if (Object.keys(val).length > 0) await localRedis.hset(key, val)
    } else if (type === "list") {
      const val = await prodRedis.lrange(key, 0, -1)
      if (val.length > 0) {
        await localRedis.del(key)
        await localRedis.rpush(key, ...val)
      }
    } else if (type === "set") {
      const val = await prodRedis.smembers(key)
      if (val.length > 0) {
        await localRedis.del(key)
        await localRedis.sadd(key, ...val)
      }
    } else if (type === "zset") {
      const val = await prodRedis.zrangebyscore(key, "-inf", "+inf", "WITHSCORES")
      if (val.length > 0) {
        await localRedis.del(key)
        // val = [member, score, member, score, ...]
        const args = []
        for (let i = 0; i < val.length; i += 2) {
          args.push(val[i + 1], val[i]) // zadd attend [score, member, ...]
        }
        await localRedis.zadd(key, ...args)
      }
    }

    // Restaurer le TTL si la clé en a un
    if (pttl > 0) await localRedis.pexpire(key, pttl)

    totalKeys++
    process.stdout.write(`\rClés migrées : ${totalKeys}`)
  }
} while (cursor !== "0")

console.log(`\n\n✅  Migration terminée — ${totalKeys} clé(s) copiée(s) vers Redis local`)

await prodRedis.quit()
await localRedis.quit()
