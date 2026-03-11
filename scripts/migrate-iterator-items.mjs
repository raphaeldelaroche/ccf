#!/usr/bin/env node
/**
 * Migration script pour convertir les items d'iterator legacy (Record<string, FormDataValue>)
 * vers le nouveau format BlockNode complet ({ id, blockType, data, innerBlocks }).
 *
 * Usage:
 *   node scripts/migrate-iterator-items.mjs [--dry-run] [--port=3001]
 *
 * Options:
 *   --dry-run    Affiche les changements sans les appliquer
 *   --port       Port du serveur (par défaut: 3001)
 */

const DRY_RUN = process.argv.includes("--dry-run")
const PORT = process.argv.find(arg => arg.startsWith("--port="))?.split("=")[1] || "3001"
const API_BASE = `http://localhost:${PORT}`

/**
 * Vérifie si un item est au format legacy (Record plat)
 */
function isLegacyItem(item) {
  return !(typeof item === "object" && item !== null && "blockType" in item && "id" in item)
}

/**
 * Convertit un item legacy en BlockNode
 */
function migrateLegacyItem(item, parentId) {
  if (!isLegacyItem(item)) {
    // Déjà au bon format, mais vérifier récursivement les innerBlocks
    if (item.innerBlocks && Array.isArray(item.innerBlocks)) {
      return {
        ...item,
        innerBlocks: item.innerBlocks.map((child, idx) =>
          migrateLegacyItem(child, item.id, idx)
        )
      }
    }
    return item
  }

  // Générer un ID unique pour l'item
  const itemId = `${parentId}-item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  // Convertir en BlockNode
  const blockNode = {
    id: itemId,
    blockType: "blob",
    data: { ...item },
    innerBlocks: []
  }

  return blockNode
}

/**
 * Parcourt récursivement tous les blocs et migre les items d'iterator
 */
function migrateBlocks(blocks) {
  let migrationCount = 0

  const processBlock = (block) => {

    // Si c'est un blobIterator avec des items
    if (block.blockType === "blobIterator" && block.data.items) {
      const items = Array.isArray(block.data.items)
        ? block.data.items
        : JSON.parse(block.data.items || "[]")

      // Vérifier si des items sont au format legacy
      const hasLegacyItems = items.some(isLegacyItem)

      if (hasLegacyItems) {
        console.log(`  → Bloc iterator ${block.id} : ${items.length} items`)

        // Migrer tous les items
        const migratedItems = items.map((item, idx) =>
          migrateLegacyItem(item, block.id, idx)
        )

        block.data.items = migratedItems
        migrationCount += items.filter(isLegacyItem).length
      }
    }

    // Traiter récursivement les innerBlocks
    if (block.innerBlocks && Array.isArray(block.innerBlocks)) {
      block.innerBlocks = block.innerBlocks.map(processBlock)
    }

    return block
  }

  return {
    blocks: blocks.map(processBlock),
    migrationCount
  }
}

/**
 * Récupère la liste de toutes les pages via l'API
 */
async function getAllPageSlugs() {
  const response = await fetch(`${API_BASE}/api/pages`)
  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.statusText}`)
  }
  const data = await response.json()
  const pages = data.pages || []
  return pages.map(p => p.slug)
}

/**
 * Récupère les données d'une page via l'API
 */
async function getPage(slug) {
  const response = await fetch(`${API_BASE}/api/pages/${slug}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch page ${slug}: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Sauvegarde une page via l'API
 */
async function savePage(slug, pageData) {
  const response = await fetch(`${API_BASE}/api/pages/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pageData)
  })
  if (!response.ok) {
    throw new Error(`Failed to save page ${slug}: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Script principal
 */
async function main() {
  console.log("🔄 Migration des items d'iterator vers BlockNode\n")
  console.log(`🌐 Serveur API: ${API_BASE}\n`)

  if (DRY_RUN) {
    console.log("⚠️  Mode DRY-RUN activé : aucune modification ne sera appliquée\n")
  }

  try {
    // Récupérer toutes les pages
    console.log("📦 Récupération des pages...")
    const slugs = await getAllPageSlugs()
    console.log(`   Trouvé ${slugs.length} page(s)\n`)

    if (slugs.length === 0) {
      console.log("✓ Aucune page à migrer")
      return
    }

    let totalMigrations = 0
    const migratedPages = []

    // Traiter chaque page
    for (const slug of slugs) {
      console.log(`📄 Page: ${slug}`)

      const pageData = await getPage(slug)

      if (!pageData.blocks || !Array.isArray(pageData.blocks)) {
        console.log("   Aucun bloc trouvé, ignoré\n")
        continue
      }

      const { blocks, migrationCount } = migrateBlocks(pageData.blocks)

      if (migrationCount > 0) {
        console.log(`   ✓ ${migrationCount} item(s) migré(s)`)
        totalMigrations += migrationCount
        migratedPages.push({
          slug,
          data: {
            ...pageData,
            blocks,
            meta: {
              ...pageData.meta,
              updatedAt: new Date().toISOString()
            }
          }
        })
      } else {
        console.log("   Aucun item legacy trouvé")
      }
      console.log()
    }

    // Appliquer les migrations
    if (totalMigrations > 0) {
      if (DRY_RUN) {
        console.log(`\n📊 Résumé (DRY-RUN):`)
        console.log(`   ${migratedPages.length} page(s) à migrer`)
        console.log(`   ${totalMigrations} item(s) à convertir`)
        console.log(`\n💡 Relancez sans --dry-run pour appliquer les changements`)
      } else {
        console.log("💾 Application des migrations...")

        for (const page of migratedPages) {
          await savePage(page.slug, page.data)
          console.log(`   ✓ ${page.slug}`)
        }

        console.log(`\n✅ Migration terminée !`)
        console.log(`   ${migratedPages.length} page(s) migrée(s)`)
        console.log(`   ${totalMigrations} item(s) converti(s)`)
      }
    } else {
      console.log("✓ Aucune migration nécessaire, toutes les pages sont à jour !")
    }

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
