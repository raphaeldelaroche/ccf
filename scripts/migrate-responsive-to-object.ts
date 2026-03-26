/**
 * SCRIPT DE MIGRATION RESPONSIVE
 *
 * Convertit toutes les pages en base de données du format string responsive
 * vers le nouveau format objet responsive.
 *
 * Format ancien (string) : { layout: "stack md:row lg:bar" }
 * Format nouveau (objet) : { responsive: { xs: { layout: "stack" }, md: { layout: "row" }, lg: { layout: "bar" } } }
 *
 * Usage :
 *   pnpm tsx scripts/migrate-responsive-to-object.ts
 *   pnpm tsx scripts/migrate-responsive-to-object.ts --dry-run  # Simulation sans écriture
 */

import { kv } from "../lib/kv-client"
import type { PageData, FormDataValue } from "../types/editor"
import type { BlockNode } from "../lib/new-editor/block-types"
import type { ResponsiveBreakpointProps } from "../lib/blob-compose"

// Breakpoints supportés
const BREAKPOINTS = ["base", "sm", "md", "lg", "xl", "2xl"] as const
type Breakpoint = (typeof BREAKPOINTS)[number]

/**
 * Mutable responsive type for migration script.
 * Allows dynamic breakpoint creation during migration.
 */
type MutableResponsiveProps = {
  [K in Breakpoint]?: ResponsiveBreakpointProps
}

// Champs qui peuvent avoir des valeurs responsive
const RESPONSIVE_FIELDS = [
  "layout",
  "direction",
  "marker", // Alias de markerPosition
  "markerPosition",
  "markerSize",
  "actions",
  "align",
  "figureWidth",
  "size",
  "gapX",
  "gapY",
  "paddingX",
  "paddingY",
  "headerPaddingX",
  "headerPaddingY",
  "figureBleed",
] as const

/**
 * Parse une valeur responsive string en objet
 * Ex: "stack md:row lg:bar" → { base: "stack", md: "row", lg: "bar" }
 */
function parseResponsiveString(value: string): Partial<Record<Breakpoint, string>> {
  const parts = value.trim().split(/\s+/)
  const result: Partial<Record<Breakpoint, string>> = {}

  for (const part of parts) {
    const colonIdx = part.indexOf(":")
    if (colonIdx !== -1) {
      const bp = part.slice(0, colonIdx)
      const val = part.slice(colonIdx + 1)
      if (BREAKPOINTS.includes(bp as Breakpoint)) {
        result[bp as Breakpoint] = val
      }
    } else {
      // Valeur sans préfixe = base
      result.base = part
    }
  }

  return result
}

/**
 * Détermine si une valeur string est en format responsive (contient ":")
 */
function isResponsiveString(value: unknown): value is string {
  return typeof value === "string" && value.includes(":")
}

/**
 * Migre les données d'un bloc unique
 */
function migrateBlockData(data: Record<string, unknown>): {
  migratedData: Record<string, unknown>
  changed: boolean
} {
  let changed = false
  const migratedData = { ...data }

  // Si un objet responsive existe déjà, on ne touche à rien
  if (data.responsive && typeof data.responsive === "object") {
    return { migratedData, changed: false }
  }

  // Créer l'objet responsive (mutable pour permettre la création dynamique de breakpoints)
  const responsive: MutableResponsiveProps = {}

  // Parcourir tous les champs qui peuvent avoir des valeurs responsive
  for (const field of RESPONSIVE_FIELDS) {
    const value = data[field]

    // Si c'est une string avec des breakpoints (ex: "stack md:row")
    if (isResponsiveString(value)) {
      const parsed = parseResponsiveString(value)

      // Distribuer les valeurs dans l'objet responsive
      for (const [bp, val] of Object.entries(parsed)) {
        const breakpoint = bp as Breakpoint
        if (!responsive[breakpoint]) {
          responsive[breakpoint] = {}
        }
        // Normaliser markerPosition → marker
        const fieldName = field === "markerPosition" ? "marker" : field
        // Type assertion for migration: trust that parsed values are valid
        ;(responsive[breakpoint]! as Record<string, unknown>)[fieldName] = val
      }

      // Supprimer le champ string du data
      delete migratedData[field]
      changed = true
    } else if (value !== undefined && value !== null && value !== "") {
      // Valeur simple (non-responsive) → mettre dans base
      if (!responsive.base) {
        responsive.base = {}
      }
      const fieldName = field === "markerPosition" ? "marker" : field
      // Type assertion for migration: trust that values are valid
      ;(responsive.base as Record<string, unknown>)[fieldName] = value
      delete migratedData[field]
      changed = true
    }
  }

  // Ajouter l'objet responsive s'il contient des données
  if (Object.keys(responsive).length > 0) {
    migratedData.responsive = responsive
    changed = true
  }

  return { migratedData, changed }
}

/**
 * Migre récursivement un bloc et ses innerBlocks
 */
function migrateBlock(block: BlockNode): { migratedBlock: BlockNode; changed: boolean } {
  let totalChanged = false

  // Migrer les données du bloc
  const { migratedData, changed: dataChanged } = migrateBlockData(block.data)
  if (dataChanged) totalChanged = true

  // Migrer récursivement les innerBlocks
  let migratedInnerBlocks = block.innerBlocks
  if (block.innerBlocks && block.innerBlocks.length > 0) {
    migratedInnerBlocks = block.innerBlocks.map((innerBlock) => {
      const { migratedBlock, changed } = migrateBlock(innerBlock)
      if (changed) totalChanged = true
      return migratedBlock
    })
  }

  return {
    migratedBlock: {
      ...block,
      data: migratedData as Record<string, FormDataValue>,
      innerBlocks: migratedInnerBlocks,
    },
    changed: totalChanged,
  }
}

/**
 * Migre une page complète
 */
function migratePage(pageData: PageData): { migratedPage: PageData; changed: boolean } {
  let totalChanged = false

  // Migrer tous les blocs de la page
  const migratedBlocks = pageData.blocks.map((block) => {
    const { migratedBlock, changed } = migrateBlock(block as BlockNode)
    if (changed) totalChanged = true
    return migratedBlock
  })

  return {
    migratedPage: {
      ...pageData,
      blocks: migratedBlocks,
      meta: {
        ...pageData.meta,
        updatedAt: new Date().toISOString(),
      },
    },
    changed: totalChanged,
  }
}

/**
 * Migration principale
 */
async function main() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("🚀 Démarrage de la migration responsive...")
  console.log(`Mode: ${isDryRun ? "DRY RUN (simulation)" : "PRODUCTION"}`)
  console.log("")

  try {
    // Récupérer toutes les pages
    const keys = await kv.keys("page:*")
    console.log(`📄 ${keys.length} page(s) trouvée(s)`)
    console.log("")

    if (keys.length === 0) {
      console.log("✅ Aucune page à migrer")
      return
    }

    let migratedCount = 0
    let unchangedCount = 0
    let errorCount = 0

    // Migrer chaque page
    for (const key of keys) {
      const slug = key.replace("page:", "")

      try {
        const pageStr = await kv.get(key)
        if (!pageStr) {
          console.log(`⚠️  ${slug}: Page vide, ignorée`)
          unchangedCount++
          continue
        }

        const pageData = JSON.parse(pageStr) as PageData
        const { migratedPage, changed } = migratePage(pageData)

        if (changed) {
          console.log(`✨ ${slug}: Migration nécessaire`)
          console.log(`   - ${pageData.blocks.length} bloc(s) analysé(s)`)

          if (!isDryRun) {
            await kv.set(key, JSON.stringify(migratedPage))
            console.log(`   ✓ Sauvegardé`)
          } else {
            console.log(`   ✓ (simulation - non sauvegardé)`)
          }

          migratedCount++
        } else {
          console.log(`✓  ${slug}: Déjà au bon format`)
          unchangedCount++
        }
      } catch (error) {
        console.error(`❌ ${slug}: Erreur lors de la migration`)
        console.error(error)
        errorCount++
      }

      console.log("")
    }

    // Résumé
    console.log("=" .repeat(60))
    console.log("📊 RÉSUMÉ DE LA MIGRATION")
    console.log("=" .repeat(60))
    console.log(`Pages migrées:     ${migratedCount}`)
    console.log(`Pages inchangées:  ${unchangedCount}`)
    console.log(`Erreurs:           ${errorCount}`)
    console.log(`Total:             ${keys.length}`)
    console.log("")

    if (isDryRun && migratedCount > 0) {
      console.log("⚠️  Mode DRY RUN actif - aucune modification n'a été sauvegardée")
      console.log("   Pour appliquer les changements, exécutez sans --dry-run")
    } else if (migratedCount > 0) {
      console.log("✅ Migration terminée avec succès!")
    } else {
      console.log("✅ Aucune migration nécessaire - toutes les pages sont déjà au bon format")
    }
  } catch (error) {
    console.error("❌ Erreur fatale lors de la migration:")
    console.error(error)
    process.exit(1)
  }
}

// Exécution
main()
