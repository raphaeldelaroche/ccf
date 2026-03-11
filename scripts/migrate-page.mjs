#!/usr/bin/env node
/**
 * Script de migration réutilisable : items d'iterator legacy → BlockNode
 *
 * Usage:
 *   node scripts/migrate-page.mjs <slug> [--port=3000]
 *
 * Exemples:
 *   node scripts/migrate-page.mjs ressources
 *   node scripts/migrate-page.mjs methodologie --port=3001
 */

import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve } from "path"

const slug = process.argv[2]
const PORT = process.argv.find(a => a.startsWith("--port="))?.split("=")[1] || "3000"
const API_BASE = `http://localhost:${PORT}`
const BACKUP_PATH = resolve(`data/backup/${slug}.json`)

if (!slug) {
  console.error("❌ Usage: node scripts/migrate-page.mjs <slug>")
  process.exit(1)
}

function isLegacyItem(item) {
  return !(typeof item === "object" && item !== null && "blockType" in item && "id" in item)
}

function migrateLegacyItem(item, parentId) {
  if (!isLegacyItem(item)) {
    if (item.innerBlocks && Array.isArray(item.innerBlocks)) {
      return { ...item, innerBlocks: item.innerBlocks.map(child => migrateLegacyItem(child, item.id)) }
    }
    return item
  }
  const itemId = `${parentId}-item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return { id: itemId, blockType: "blob", data: { ...item }, innerBlocks: [] }
}

function processBlock(block) {
  if (block.blockType === "blobIterator" && block.data.items) {
    const items = Array.isArray(block.data.items)
      ? block.data.items
      : JSON.parse(block.data.items || "[]")

    const hasLegacyItems = items.some(isLegacyItem)
    if (hasLegacyItems) {
      block.data.items = items.map(item => migrateLegacyItem(item, block.id))
      console.log(`  ✓ ${block.id} → ${items.length} item(s) migré(s)`)
    } else if (!Array.isArray(block.data.items)) {
      block.data.items = items
    }

    if (typeof block.data.itemFields === "string") {
      try {
        block.data.itemFields = JSON.parse(block.data.itemFields)
        console.log(`  ✓ ${block.id} → itemFields parsé (string → array)`)
      } catch {}
    }
  }

  if (block.innerBlocks && Array.isArray(block.innerBlocks)) {
    block.innerBlocks = block.innerBlocks.map(processBlock)
  }

  return block
}

// ── 1. Migration du fichier backup ────────────────────────────────────────────
if (existsSync(BACKUP_PATH)) {
  console.log(`\n📁 Backup : ${BACKUP_PATH}`)
  const blocks = JSON.parse(readFileSync(BACKUP_PATH, "utf-8"))
  const migrated = blocks.map(processBlock)
  writeFileSync(BACKUP_PATH, JSON.stringify(migrated, null, 2))
  console.log(`   ✅ Backup mis à jour`)
} else {
  console.log(`\n📁 Backup : aucun fichier trouvé à ${BACKUP_PATH}`)
}

// ── 2. Migration des données live (Redis via API) ─────────────────────────────
console.log(`\n🌐 Live : ${API_BASE}/api/pages/${slug}`)

const res = await fetch(`${API_BASE}/api/pages/${slug}`)
if (!res.ok) {
  console.error(`❌ Impossible de récupérer la page "${slug}": ${res.status} ${res.statusText}`)
  process.exit(1)
}

const pageData = await res.json()
if (!pageData.blocks) {
  console.log("   Aucun bloc trouvé, ignoré")
  process.exit(0)
}

pageData.blocks = pageData.blocks.map(processBlock)

const save = await fetch(`${API_BASE}/api/pages/${slug}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(pageData)
})

if (save.ok) {
  console.log(`   ✅ Page live sauvegardée avec succès\n`)
} else {
  console.log(`   ❌ Erreur: ${save.status} ${save.statusText}\n`)
}
