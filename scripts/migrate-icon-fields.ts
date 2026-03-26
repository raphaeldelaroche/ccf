/**
 * Migration Script: Icon Fields String → IconData
 *
 * Converts legacy icon fields from string keys ("heart", "star", etc.)
 * to full IconData objects for the new IconifyPicker system.
 *
 * Usage:
 *   npx tsx scripts/migrate-icon-fields.ts --dry-run  # Preview changes
 *   npx tsx scripts/migrate-icon-fields.ts            # Apply migration
 */

import Redis from "ioredis";
import { iconOptions } from "@/lib/blob-fields";
import type { IconData } from "@/lib/blob-fields";

// Get Redis URL from environment
const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error("❌ REDIS_URL environment variable not set");
  console.error("Run: npx vercel env pull .env.local");
  process.exit(1);
}

const redis = new Redis(REDIS_URL);

// Check if dry-run mode
const isDryRun = process.argv.includes("--dry-run");

interface BlockNode {
  id: string;
  blockType: string;
  data: Record<string, unknown>;
  innerBlocks?: BlockNode[];
}

interface PageData {
  id: string;
  name: string;
  blocks: BlockNode[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Recursively migrate icon fields in a block and its innerBlocks
 */
function migrateIconFields(block: BlockNode, path: string = ""): {
  modified: boolean;
  changes: string[];
} {
  let modified = false;
  const changes: string[] = [];
  const currentPath = path ? `${path} > ${block.blockType}` : block.blockType;

  // Check markerIcon field
  if (block.data.markerIcon && typeof block.data.markerIcon === "string") {
    const oldKey = block.data.markerIcon as string;
    const iconData = iconOptions[oldKey];

    if (iconData) {
      block.data.markerIcon = iconData;
      modified = true;
      changes.push(
        `  ${currentPath}: markerIcon "${oldKey}" → IconData(${iconData.collection}/${iconData.name})`
      );
    } else {
      changes.push(
        `  ⚠️  ${currentPath}: markerIcon "${oldKey}" not found in iconOptions (skipped)`
      );
    }
  }

  // Check if markerIcon is already an IconData object (check for presence of iconObject)
  if (
    block.data.markerIcon &&
    typeof block.data.markerIcon === "object" &&
    "iconObject" in block.data.markerIcon
  ) {
    // Already migrated, skip
  }

  // Recursively process innerBlocks
  if (block.innerBlocks && Array.isArray(block.innerBlocks)) {
    for (const innerBlock of block.innerBlocks) {
      const innerResult = migrateIconFields(innerBlock, currentPath);
      if (innerResult.modified) {
        modified = true;
        changes.push(...innerResult.changes);
      }
    }
  }

  // For BlobIterator blocks, check items array
  if (block.blockType === "iterator" && block.data.items) {
    const items = block.data.items as Array<Record<string, unknown>>;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.markerIcon && typeof item.markerIcon === "string") {
        const oldKey = item.markerIcon as string;
        const iconData = iconOptions[oldKey];

        if (iconData) {
          item.markerIcon = iconData;
          modified = true;
          changes.push(
            `  ${currentPath}.items[${i}]: markerIcon "${oldKey}" → IconData(${iconData.collection}/${iconData.name})`
          );
        } else {
          changes.push(
            `  ⚠️  ${currentPath}.items[${i}]: markerIcon "${oldKey}" not found in iconOptions (skipped)`
          );
        }
      }
    }
  }

  return { modified, changes };
}

/**
 * Migrate a single page
 */
async function migratePage(
  pageId: string
): Promise<{ modified: boolean; changes: string[] }> {
  const pageJson = await redis.get(`page:${pageId}`);
  if (!pageJson) {
    return { modified: false, changes: [`Page ${pageId} not found`] };
  }

  const pageData: PageData = JSON.parse(pageJson);
  let pageModified = false;
  const allChanges: string[] = [];

  // Migrate each top-level block
  for (const block of pageData.blocks) {
    const { modified, changes } = migrateIconFields(block);
    if (modified) {
      pageModified = true;
      allChanges.push(...changes);
    }
  }

  // Save updated page if modified and not in dry-run mode
  if (pageModified && !isDryRun) {
    pageData.updatedAt = new Date().toISOString();
    await redis.set(`page:${pageId}`, JSON.stringify(pageData));
  }

  return { modified: pageModified, changes: allChanges };
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log("🚀 Icon Fields Migration Script\n");
  console.log(`Mode: ${isDryRun ? "DRY RUN (no changes will be saved)" : "LIVE MIGRATION"}\n`);

  try {
    // Get all page IDs
    const pageIds = await redis.smembers("pages");
    console.log(`📄 Found ${pageIds.length} pages\n`);

    if (pageIds.length === 0) {
      console.log("No pages to migrate");
      await redis.quit();
      return;
    }

    let totalPagesModified = 0;
    let totalChanges = 0;

    // Create backup of current state
    if (!isDryRun) {
      console.log("💾 Creating backup...");
      const timestamp = new Date().toISOString().split("T")[0];
      const backupKey = `backup:icon-migration:${timestamp}`;

      for (const pageId of pageIds) {
        const pageJson = await redis.get(`page:${pageId}`);
        if (pageJson) {
          await redis.hset(backupKey, pageId, pageJson);
        }
      }

      console.log(`✅ Backup created: ${backupKey}\n`);
    }

    // Migrate each page
    for (const pageId of pageIds) {
      const pageJson = await redis.get(`page:${pageId}`);
      if (!pageJson) continue;

      const pageData: PageData = JSON.parse(pageJson);
      const { modified, changes } = await migratePage(pageId);

      if (modified) {
        totalPagesModified++;
        totalChanges += changes.length;

        console.log(`📝 Page: ${pageData.name} (${pageId})`);
        console.log(changes.join("\n"));
        console.log("");
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary");
    console.log("=".repeat(60));
    console.log(`Total pages scanned: ${pageIds.length}`);
    console.log(`Pages modified: ${totalPagesModified}`);
    console.log(`Total field changes: ${totalChanges}`);
    console.log("");

    if (isDryRun) {
      console.log("⚠️  This was a DRY RUN - no changes were saved");
      console.log("Run without --dry-run to apply changes");
    } else {
      console.log("✅ Migration completed successfully!");
      console.log("\nBackup location: backup:icon-migration:*");
      console.log("To restore from backup if needed, use Redis HGETALL command");
    }

    await redis.quit();
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    await redis.quit();
    process.exit(1);
  }
}

// Run migration
runMigration();
