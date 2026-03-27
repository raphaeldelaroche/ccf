#!/usr/bin/env tsx

/**
 * Verify Production Redis Data
 */

import Redis from 'ioredis'

async function main() {
  console.log('🔍 Verifying Production Redis\n')

  const prodUrl = process.env.REDIS_URL
  if (!prodUrl) {
    console.error('❌ REDIS_URL not found')
    process.exit(1)
  }

  const prodRedis = new Redis(prodUrl)

  try {
    const keys = await prodRedis.keys('*')
    console.log(`📊 Total keys: ${keys.length}\n`)

    for (const key of keys) {
      const value = await prodRedis.get(key)
      if (value) {
        const data = JSON.parse(value)
        const blockCount = data.blocks?.length || 0
        console.log(`✅ ${key} - ${blockCount} blocks`)
      }
    }

    console.log('\n✅ Verification complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prodRedis.quit()
  }
}

main()
