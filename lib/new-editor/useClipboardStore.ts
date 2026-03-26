import { useSyncExternalStore } from "react"
import type { BlockType } from "./block-types"
import type { BlockNode } from "./block-types"
import type { CopyMode } from "@/lib/copy-paste-utils"

export interface ClipboardData {
  blockType: BlockType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  innerBlocks?: BlockNode[]
  mode: CopyMode
  timestamp?: number // Pour tracking et expiration future
}

const STORAGE_KEY = "CCF_EDITOR_CLIPBOARD"

// Helpers de serialization
function serializeClipboard(data: ClipboardData | null): string {
  if (!data) return ""
  try {
    return JSON.stringify({
      ...data,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Failed to serialize clipboard data:", error)
    return ""
  }
}

function deserializeClipboard(json: string): ClipboardData | null {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch (error) {
    console.error("Failed to deserialize clipboard data:", error)
    return null
  }
}

function setClipboardToStorage(data: ClipboardData | null): void {
  if (typeof window === "undefined") return

  if (data === null) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    const serialized = serializeClipboard(data)
    if (serialized) {
      localStorage.setItem(STORAGE_KEY, serialized)
    }
  }
}

// Cache pour éviter les boucles infinies
let cachedSnapshot: ClipboardData | null | undefined = undefined
let cachedSnapshotString: string | null = null

// Subscribe to storage changes (for cross-tab sync)
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {}

  const storageHandler = () => {
    // Invalider le cache lors d'un changement
    cachedSnapshot = undefined
    cachedSnapshotString = null
    callback()
  }

  window.addEventListener("storage", storageHandler)
  return () => window.removeEventListener("storage", storageHandler)
}

// Snapshot for useSyncExternalStore
function getSnapshot(): ClipboardData | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEY)

  // Si la valeur en string n'a pas changé, retourner le cache
  if (stored === cachedSnapshotString && cachedSnapshot !== undefined) {
    return cachedSnapshot
  }

  // Sinon, parser et mettre en cache
  cachedSnapshotString = stored
  cachedSnapshot = deserializeClipboard(stored || "")
  return cachedSnapshot
}

// Server-side snapshot
function getServerSnapshot(): ClipboardData | null {
  return null
}

/**
 * Hook pour gérer le clipboard avec persistance localStorage et sync cross-tab
 *
 * Utilise useSyncExternalStore pour synchroniser automatiquement le clipboard
 * entre tous les onglets/fenêtres de l'application.
 */
export function useClipboardStore() {
  // Sync avec localStorage et événement storage
  const clipboardData = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  // Setter pour mettre à jour le clipboard
  const setClipboard = (data: ClipboardData | null) => {
    // Invalider le cache
    cachedSnapshot = undefined
    cachedSnapshotString = null

    setClipboardToStorage(data)
    // Dispatch custom event pour trigger la sync dans le même onglet
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"))
    }
  }

  return {
    clipboardData,
    setClipboard,
  }
}
