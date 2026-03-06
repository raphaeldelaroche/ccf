import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-heading",
        "text-eyebrow",
        "text-lead",
        "text-button",
      ],
      "mb": [
        "mb-heading-bottom",
        "mb-eyebrow-bottom",
        "mb-heading-content-bottom",
        "mb-media-bottom",
      ],
      "mt": [
        "mt-eyebrow-top",
      ],
      "gap": [
        "gap-actions",
        "gap-section",
      ],
      "px": [
        "px-section-x",
      ],
      "py": [
        "py-section-y",
      ],
      "w": [
        "w-media",
      ],
      "h": [
        "h-media",
      ],
    },
  },
})

/**
 * Custom conflict groups for blob utilities
 * Maps class prefixes to their conflict group
 */
const blobConflictGroups: Record<string, string[]> = {
  "blob-layout-": ["blob-layout-stack", "blob-layout-stack-reverse", "blob-layout-bar", "blob-layout-row", "blob-layout-row-reverse"],
  "blob-align-": ["blob-align-left", "blob-align-center", "blob-align-right"],
  "blob-marker-": ["blob-marker-side", "blob-marker-top"],
  "blob-actions-": ["blob-actions-after"],
}

/**
 * Handles blob class conflicts manually.
 * Two blob classes from the same group only conflict when they share the
 * same breakpoint prefix (e.g. two bare `blob-layout-*` conflict, but
 * `blob-layout-row` and `lg:blob-layout-bar` do NOT — different breakpoints).
 */
function mergeBlobClasses(classes: string): string {
  const classList = classes.split(" ").filter(Boolean)
  const result: string[] = []
  const seen = new Map<string, number>()

  for (const cls of classList) {
    // Separate optional breakpoint prefix from the utility name
    // e.g. "lg:blob-layout-bar" → breakpoint="lg", utility="blob-layout-bar"
    const colonIdx = cls.indexOf(":")
    const breakpoint = colonIdx !== -1 ? cls.slice(0, colonIdx) : ""
    const utility = colonIdx !== -1 ? cls.slice(colonIdx + 1) : cls

    let isBlobClass = false
    let groupKey = ""

    for (const [prefix, group] of Object.entries(blobConflictGroups)) {
      if (group.some(blobClass => utility === blobClass || utility.includes(blobClass))) {
        isBlobClass = true
        // Include the breakpoint so classes at different breakpoints never
        // evict each other (e.g. "" vs "lg" are distinct keys)
        groupKey = `${breakpoint}||${prefix}`
        break
      }
    }

    if (isBlobClass) {
      const prevIndex = seen.get(groupKey)
      if (prevIndex !== undefined) {
        result[prevIndex] = ""
      }
      seen.set(groupKey, result.length)
    }

    result.push(cls)
  }

  return result.filter(Boolean).join(" ")
}

export function cn(...inputs: ClassValue[]) {
  const merged = customTwMerge(clsx(inputs))
  return mergeBlobClasses(merged)
}
