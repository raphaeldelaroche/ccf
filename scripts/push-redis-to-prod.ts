#!/usr/bin/env tsx

/**
 * Redis Push Script: Local → Production
 * Pushes local Redis data to production (overwrites existing keys)
 */

import Redis from 'ioredis'

interface MigrationStats {
  total: number
  succeeded: number
  failed: number
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  console.log('🚀 Redis Push to Production')
  console.log('===========================\n')

  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n')
  }

  // Connect to local Redis
  const localRedis = new Redis('redis://localhost:6379')
  console.log('✅ Connected to local Redis')

  // Connect to production Redis
  const prodUrl = process.env.REDIS_URL
  if (!prodUrl) {
    console.error('❌ REDIS_URL not found in environment')
    console.log('   Make sure you have .env.production file')
    process.exit(1)
  }

  const prodRedis = new Redis(prodUrl)
  console.log('✅ Connected to production Redis\n')

  try {
    // Get all keys from local Redis
    const localKeys = await localRedis.keys('*')
    console.log(`📊 Found ${localKeys.length} keys in local Redis\n`)

    if (localKeys.length === 0) {
      console.log('⚠️  No data to push')
      await cleanup(localRedis, prodRedis)
      return
    }

    // Show keys to migrate
    console.log('📋 Keys to push:')
    for (const key of localKeys) {
      const exists = await prodRedis.exists(key)
      const status = exists ? '(will overwrite)' : '(new)'
      console.log(`   - ${key} ${status}`)
    }
    console.log()

    if (isDryRun) {
      console.log('✅ Dry run complete - no changes made')
      await cleanup(localRedis, prodRedis)
      return
    }

    // Confirm before proceeding
    console.log('⚠️  WARNING: This will OVERWRITE existing keys in production!')
    console.log('   Make sure you have run the backup script first.')
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    await sleep(5000)

    // Push data
    console.log('🔄 Pushing to production...\n')
    const stats: MigrationStats = {
      total: localKeys.length,
      succeeded: 0,
      failed: 0
    }

    for (const key of localKeys) {
      try {
        // Get value from local
        const value = await localRedis.get(key)

        if (!value) {
          console.log(`⚠️  Skipped ${key} (empty value)`)
          continue
        }

        // Set value in production
        await prodRedis.set(key, value)
        console.log(`✅ Pushed: ${key}`)
        stats.succeeded++

      } catch (error) {
        console.error(`❌ Failed to push ${key}:`, error)
        stats.failed++
      }
    }

    // Summary
    console.log('\n📊 Push Summary')
    console.log('===============')
    console.log(`Total keys:     ${stats.total}`)
    console.log(`✅ Succeeded:   ${stats.succeeded}`)
    console.log(`❌ Failed:      ${stats.failed}`)

    console.log('\n✅ Push complete!')
    console.log(`\n🌐 Check your production site: https://climatecontributionframework.vercel.app/`)

  } catch (error) {
    console.error('\n❌ Push failed:', error)
    process.exit(1)
  } finally {
    await cleanup(localRedis, prodRedis)
  }
}

async function cleanup(localRedis: Redis, prodRedis: Redis) {
  await localRedis.quit()
  await prodRedis.quit()
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
