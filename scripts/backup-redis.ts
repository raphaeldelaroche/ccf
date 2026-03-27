#!/usr/bin/env tsx

/**
 * Redis Backup Script
 * Creates JSON backups of local and production Redis databases
 */

import Redis from 'ioredis'
import * as fs from 'fs'
import * as path from 'path'

interface BackupData {
  timestamp: string
  source: string
  keys: Record<string, string>
}

async function backupRedis(
  redis: Redis,
  sourceName: string,
  outputDir: string
): Promise<string> {
  console.log(`\n📦 Backing up ${sourceName} Redis...`)

  // Get all keys
  const keys = await redis.keys('*')
  console.log(`   Found ${keys.length} keys`)

  if (keys.length === 0) {
    console.log(`   ⚠️  No data to backup`)
    return ''
  }

  // Fetch all values
  const backup: BackupData = {
    timestamp: new Date().toISOString(),
    source: sourceName,
    keys: {}
  }

  for (const key of keys) {
    const value = await redis.get(key)
    if (value) {
      backup.keys[key] = value
      console.log(`   ✅ ${key}`)
    }
  }

  // Create backup directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `${sourceName}-${timestamp}.json`
  const filepath = path.join(outputDir, filename)

  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))

  console.log(`   💾 Saved to: ${filepath}`)

  return filepath
}

async function main() {
  console.log('🚀 Redis Backup Script')
  console.log('=====================\n')

  const backupDir = path.join(process.cwd(), 'backup', 'redis')

  try {
    // Backup LOCAL Redis
    const localRedis = new Redis('redis://localhost:6379')
    console.log('✅ Connected to local Redis')
    const localBackup = await backupRedis(localRedis, 'local', backupDir)
    await localRedis.quit()

    // Backup PRODUCTION Redis
    const prodUrl = process.env.REDIS_URL
    if (!prodUrl) {
      console.error('\n❌ REDIS_URL not found in .env.production')
      console.log('   Run: vercel env pull .env.production')
      process.exit(1)
    }

    const prodRedis = new Redis(prodUrl)
    console.log('\n✅ Connected to production Redis')
    const prodBackup = await backupRedis(prodRedis, 'production', backupDir)
    await prodRedis.quit()

    console.log('\n✅ Backup complete!')
    console.log(`\n📁 Backup directory: ${backupDir}`)
    if (localBackup) console.log(`   - Local: ${path.basename(localBackup)}`)
    if (prodBackup) console.log(`   - Production: ${path.basename(prodBackup)}`)

  } catch (error) {
    console.error('\n❌ Backup failed:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
