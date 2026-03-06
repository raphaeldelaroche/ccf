import { kv } from "./kv-client"
import type { BlockPreset, BlockPresetListItem } from "@/types/block-preset"
import type { BlockNode } from "@/types/editor"

export async function listBlockPresets(): Promise<BlockPresetListItem[]> {
  try {
    const keys = await kv.keys("preset:*")
    if (keys.length === 0) return []
    const presetsData = await kv.mget(...keys)
    const presets: BlockPresetListItem[] = []
    presetsData.forEach((presetStr) => {
      if (presetStr) {
        try {
          const preset = JSON.parse(presetStr as string) as BlockPreset;
          presets.push({
            slug: preset.slug,
            name: preset.name,
            description: preset.description,
            blockType: preset.blockType,
            tags: preset.tags,
            useCase: preset.useCase,
          })
        } catch(e) {}
      }
    })
    return presets
  } catch (error) { return [] }
}

export async function loadBlockPreset(slug: string): Promise<BlockPreset | null> {
  try {
    const presetStr = await kv.get(`preset:${slug}`)
    if (!presetStr) return null;
    return JSON.parse(presetStr as string) as BlockPreset
  } catch (error) { return null }
}

export async function saveBlockPreset(preset: BlockPreset): Promise<void> {
  const dataToSave: BlockPreset = { ...preset, meta: { ...preset.meta, updatedAt: new Date().toISOString() } }
  await kv.set(`preset:${preset.slug}`, JSON.stringify(dataToSave))
}

export async function createBlockPreset(block: BlockNode, name: string, slug: string, description?: string, useCase?: string, tags?: string[]): Promise<BlockPreset> {
  const { ...template } = block
  const preset: BlockPreset = { slug, name, description, useCase, tags, blockType: block.blockType, template, meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
  await saveBlockPreset(preset)
  return preset
}

export async function deleteBlockPreset(slug: string): Promise<void> {
  await kv.del(`preset:${slug}`)
}

export async function presetExists(slug: string): Promise<boolean> {
  return (await kv.exists(`preset:${slug}`)) === 1
}

export function instantiateBlockFromPreset(preset: BlockPreset): BlockNode {
  return { id: crypto.randomUUID(), ...preset.template }
}
