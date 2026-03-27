"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BlockNode, BlockType } from "@/lib/new-editor/block-types"
import type { FormDataValue } from "@/types/editor"
import { createNewBlock } from "@/lib/new-editor/block-registry"
import { api } from "@/lib/auth/api-client"
import { migrateResponsiveFields, migrateXsToBaseAll } from "@/lib/new-editor/migrate-responsive-fields"
import { refreshBlockRecursive, type RefreshMode } from "@/lib/new-editor/refresh-helpers"
import { extractFieldsByCategory, mergeFieldsIntoData, getFieldSectionsForBlockType, type CopyMode } from "@/lib/copy-paste-utils"
import { useClipboardStore } from "./useClipboardStore"

const MAX_HISTORY = 50

// Helper pour parser les items (peut être string JSON ou array)
function parseItems(value: unknown): BlockNode[] {
  if (Array.isArray(value)) return value as BlockNode[]
  if (typeof value === "string" && value.length > 0) {
    try { return JSON.parse(value) as BlockNode[] } catch { /* ignore */ }
  }
  return []
}

// Helper pour cloner en profondeur une valeur
function deepCloneValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepCloneValue)
  if (value !== null && typeof value === "object") {
    const cloned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      cloned[k] = deepCloneValue(v)
    }
    return cloned
  }
  return value
}

// Pure helper — no hook deps, safe to define at module level
function deepCloneBlock(block: BlockNode): BlockNode {
  // Deep clone de toutes les valeurs de data
  const clonedData: Record<string, FormDataValue> = {}

  // Vérifier que block.data existe avant de l'itérer
  if (block.data && typeof block.data === 'object') {
    for (const [key, value] of Object.entries(block.data)) {
      clonedData[key] = deepCloneValue(value) as FormDataValue
    }

    // Gestion spéciale pour blobIterator : cloner récursivement les items
    if (block.blockType === 'blobIterator' && block.data.items) {
      const items = parseItems(block.data.items)
      if (items.length > 0) {
        clonedData.items = JSON.stringify(items.map(deepCloneBlock))
      }
    }
  }

  return {
    ...block,
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    data: clonedData,
    innerBlocks: block.innerBlocks?.map(deepCloneBlock),
  }
}

export function useEditorState(initialPage = "home") {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ─── History (undo/redo) ─────────────────────────────────────────────────
  const [history, setHistory] = useState<{
    past: BlockNode[][]
    present: BlockNode[]
    future: BlockNode[][]
  }>({ past: [], present: [], future: [] })

  const blocks = history.present
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  // Commit une nouvelle version (push present → past, set new present, clear future)
  const commit = useCallback((updater: (prev: BlockNode[]) => BlockNode[]) => {
    setHistory((h) => ({
      past: [...h.past.slice(-(MAX_HISTORY - 1)), h.present],
      present: updater(h.present),
      future: [],
    }))
  }, [])

  // Reset sans historique (chargement de page)
  const resetHistory = useCallback((newBlocks: BlockNode[]) => {
    setHistory({ past: [], present: newBlocks, future: [] })
  }, [])

  // Debounce refs pour handleUpdateBlock (évite un snapshot par keystroke)
  const updateSnapshotRef = useRef<BlockNode[] | null>(null)
  const updateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(() => searchParams.get("page") || initialPage)
  const [availablePages, setAvailablePages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // ─── Preview breakpoint ─────────────────────────────────────────────────
  const [previewBreakpoint, setPreviewBreakpoint] = useState<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'>('auto')

  // ─── Dialog état ────────────────────────────────────────────────────────
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false)
  const [newPageName, setNewPageName] = useState("")

  // ─── Clipboard ──────────────────────────────────────────────────────────
  // Utilise le store externe avec localStorage pour sync cross-tab/window
  const { clipboardData, setClipboard } = useClipboardStore()

  // ─── Pages ──────────────────────────────────────────────────────────────

  const loadAvailablePages = useCallback(async () => {
    try {
      const res = await api.get("/api/pages")
      if (res.ok) {
        const data = await res.json()
        const pagesList = Array.isArray(data.pages)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.pages.map((p: any) => (typeof p === "string" ? p : p.slug))
          : []
        setAvailablePages(pagesList)
      }
    } catch (error) {
      console.error("Failed to load pages:", error)
    }
  }, [])

  useEffect(() => {
    loadAvailablePages()
  }, [loadAvailablePages])

  const loadPage = useCallback(async (pageName: string) => {
    try {
      const res = await api.get(`/api/pages/${pageName}`)
      if (!res.ok) {
        resetHistory([])
        setSelectedBlockId(null)
        return
      }
      const data = await res.json()

      // Phase 1: Extract non-responsive fields from responsive.base to data root
      let migratedBlocks = migrateResponsiveFields(data.blocks || [])

      // Phase 2: Rename xs → base in responsive object
      migratedBlocks = migrateXsToBaseAll(migratedBlocks)

      resetHistory(migratedBlocks)
      setSelectedBlockId(null)
    } catch (error) {
      console.error("Failed to load page:", error)
      resetHistory([])
    }
  }, [resetHistory])

  useEffect(() => {
    router.replace(`/new-editor?page=${currentPage}`, { scroll: false })
    loadPage(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleCreatePage = useCallback(async () => {
    if (!newPageName.trim()) return
    const slug = newPageName.trim().toLowerCase().replace(/\s+/g, "-")
    const title = newPageName.trim()
    try {
      const res = await api.post("/api/pages", { slug, title })
      if (!res.ok) {
        const error = await res.json()
        console.error("Failed to create page:", error)
        return
      }
      await loadAvailablePages()
      setCurrentPage(slug)
      setIsCreatePageOpen(false)
      setNewPageName("")
    } catch (error) {
      console.error("Failed to create page:", error)
    }
  }, [newPageName, loadAvailablePages])

  // ─── Save ────────────────────────────────────────────────────────────────

  const savePage = useCallback(async () => {
    setIsSaving(true)
    try {
      const res = await api.put(`/api/pages/${currentPage}`, { blocks })
      if (!res.ok) {
        const error = await res.json()
        console.error("Failed to save page:", error)
        return
      }
      setLastSaved(new Date())
    } catch (error) {
      console.error("Failed to save page:", error)
    } finally {
      setIsSaving(false)
    }
  }, [blocks, currentPage])

  // Auto-save avec debounce
  useEffect(() => {
    if (blocks.length === 0) return
    const timer = setTimeout(() => savePage(), 2000)
    return () => clearTimeout(timer)
  }, [blocks, savePage])

  // ─── Helpers pour les items d'iterator ──────────────────────────────────

  /**
   * Met à jour un item spécifique dans un iterator
   */
  const updateIteratorItem = useCallback((
    blocks: BlockNode[],
    itemId: string,
    updater: (item: BlockNode) => BlockNode
  ): BlockNode[] => {
    const updateInBlocks = (blockList: BlockNode[]): BlockNode[] => {
      return blockList.map((block) => {
        // Vérifier si ce bloc est un iterator contenant l'item
        if (block.blockType === 'blobIterator' && block.data.items) {
          const items = parseItems(block.data.items)
          const itemIndex = items.findIndex((item) => item.id === itemId)

          if (itemIndex !== -1) {
            // Mettre à jour l'item
            const updatedItems = items.map((item, idx) =>
              idx === itemIndex ? updater(item) : item
            )
            return {
              ...block,
              data: { ...block.data, items: JSON.stringify(updatedItems) }
            }
          }
        }

        // Recherche récursive dans les innerBlocks
        if (block.innerBlocks) {
          return {
            ...block,
            innerBlocks: updateInBlocks(block.innerBlocks)
          }
        }

        return block
      })
    }

    return updateInBlocks(blocks)
  }, [])

  // ─── CRUD Blocs ──────────────────────────────────────────────────────────

  const handleAddBlock = useCallback(
    (
      blockType: BlockType,
      afterBlockId?: string,
      parentId?: string,
      position?: number
    ) => {
      const newBlockData = createNewBlock(blockType)
      const newBlock: BlockNode = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...newBlockData,
        innerBlocks: blockType === "blob" ? [] : undefined,
      }

      if (parentId) {
        // Détecter si parentId est un ID d'item d'iterator (format: xxx-item-yyy)
        const isIteratorItem = parentId.includes('-item-')

        if (isIteratorItem) {
          // Ajouter dans les innerBlocks d'un item d'iterator
          commit((prev) => {
            return updateIteratorItem(prev, parentId, (item) => {
              const inner = [...(item.innerBlocks || [])]
              if (position !== undefined) inner.splice(position, 0, newBlock)
              else inner.push(newBlock)
              return { ...item, innerBlocks: inner }
            })
          })
        } else {
          // Logique normale : ajouter dans les innerBlocks d'un bloc
          commit((prev) => {
            const addToParent = (blocks: BlockNode[]): BlockNode[] =>
              blocks.map((block) => {
                if (block.id === parentId) {
                  const inner = [...(block.innerBlocks || [])]
                  if (position !== undefined) inner.splice(position, 0, newBlock)
                  else inner.push(newBlock)
                  return { ...block, innerBlocks: inner }
                }
                if (block.innerBlocks)
                  return { ...block, innerBlocks: addToParent(block.innerBlocks) }
                return block
              })
            return addToParent(prev)
          })
        }
      } else if (afterBlockId) {
        commit((prev) => {
          const index = prev.findIndex((b) => b.id === afterBlockId)
          if (index === -1) return [...prev, newBlock]
          const next = [...prev]
          next.splice(index + 1, 0, newBlock)
          return next
        })
      } else {
        commit((prev) => [...prev, newBlock])
      }

      setSelectedBlockId(newBlock.id)
    },
    [commit, updateIteratorItem]
  )

  const handleDeleteBlock = useCallback((blockId: string) => {
    commit((prev) => {
      const deleteFrom = (blocks: BlockNode[]): BlockNode[] =>
        blocks
          .filter((b) => b.id !== blockId)
          .map((block) => {
            // Supprimer récursivement dans les innerBlocks normaux
            const updatedBlock = block.innerBlocks
              ? { ...block, innerBlocks: deleteFrom(block.innerBlocks) }
              : block

            // Supprimer aussi dans les innerBlocks des items d'iterator
            if (updatedBlock.blockType === 'blobIterator' && updatedBlock.data.items) {
              const items = parseItems(updatedBlock.data.items)
              const updatedItems = items.map((item) =>
                item.innerBlocks
                  ? { ...item, innerBlocks: deleteFrom(item.innerBlocks) }
                  : item
              )
              return {
                ...updatedBlock,
                data: { ...updatedBlock.data, items: JSON.stringify(updatedItems) }
              }
            }

            return updatedBlock
          })
      return deleteFrom(prev)
    })
    setSelectedBlockId(null)
  }, [commit])

  const handleDuplicateBlock = useCallback((blockId: string) => {
    commit((prev) => {
      const duplicateIn = (blocks: BlockNode[]): BlockNode[] => {
        const index = blocks.findIndex((b) => b.id === blockId)
        if (index !== -1) {
          const clone = deepCloneBlock(blocks[index])
          const next = [...blocks]
          next.splice(index + 1, 0, clone)
          return next
        }
        return blocks.map((block) => {
          // Dupliquer récursivement dans les innerBlocks normaux
          const updatedBlock = block.innerBlocks
            ? { ...block, innerBlocks: duplicateIn(block.innerBlocks) }
            : block

          // Dupliquer aussi dans les innerBlocks des items d'iterator
          if (updatedBlock.blockType === 'blobIterator' && updatedBlock.data.items) {
            const items = parseItems(updatedBlock.data.items)
            const updatedItems = items.map((item) =>
              item.innerBlocks
                ? { ...item, innerBlocks: duplicateIn(item.innerBlocks) }
                : item
            )
            return {
              ...updatedBlock,
              data: { ...updatedBlock.data, items: JSON.stringify(updatedItems) }
            }
          }

          return updatedBlock
        })
      }
      return duplicateIn(prev)
    })
  }, [commit])

  const handleMoveBlock = useCallback((blockId: string, direction: "up" | "down") => {
    commit((prev) => {
      const moveIn = (blocks: BlockNode[]): BlockNode[] => {
        const index = blocks.findIndex((b) => b.id === blockId)
        if (index !== -1) {
          const next = [...blocks]
          const target = direction === "up" ? index - 1 : index + 1
          if (target >= 0 && target < next.length)
            [next[index], next[target]] = [next[target], next[index]]
          return next
        }
        return blocks.map((block) => {
          // Déplacer récursivement dans les innerBlocks normaux
          const updatedBlock = block.innerBlocks
            ? { ...block, innerBlocks: moveIn(block.innerBlocks) }
            : block

          // Déplacer aussi dans les innerBlocks des items d'iterator
          if (updatedBlock.blockType === 'blobIterator' && updatedBlock.data.items) {
            const items = parseItems(updatedBlock.data.items)
            const updatedItems = items.map((item) =>
              item.innerBlocks
                ? { ...item, innerBlocks: moveIn(item.innerBlocks) }
                : item
            )
            return {
              ...updatedBlock,
              data: { ...updatedBlock.data, items: JSON.stringify(updatedItems) }
            }
          }

          return updatedBlock
        })
      }
      return moveIn(prev)
    })
  }, [commit])

  // handleUpdateBlock : met à jour present immédiatement,
  // puis push un snapshot dans past après 800ms sans frappe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateBlock = useCallback((blockId: string, updates: Record<string, any>) => {
    setHistory((h) => {
      // Capture le snapshot avant la session d'édition (première frappe)
      if (!updateSnapshotRef.current) {
        updateSnapshotRef.current = h.present
      }
      const updateIn = (blocks: BlockNode[]): BlockNode[] =>
        blocks.map((block) => {
          if (block.id === blockId) return { ...block, data: { ...block.data, ...updates } }

          // Mettre à jour récursivement dans les innerBlocks normaux
          const updatedBlock = block.innerBlocks
            ? { ...block, innerBlocks: updateIn(block.innerBlocks) }
            : block

          // Mettre à jour aussi dans les innerBlocks des items d'iterator
          if (updatedBlock.blockType === 'blobIterator' && updatedBlock.data.items) {
            const items = parseItems(updatedBlock.data.items)
            const updatedItems = items.map((item) =>
              item.innerBlocks
                ? { ...item, innerBlocks: updateIn(item.innerBlocks) }
                : item
            )
            return {
              ...updatedBlock,
              data: { ...updatedBlock.data, items: JSON.stringify(updatedItems) }
            }
          }

          return updatedBlock
        })
      return { ...h, present: updateIn(h.present), future: [] }
    })

    // Debounced push du snapshot dans past
    if (updateDebounceRef.current) clearTimeout(updateDebounceRef.current)
    updateDebounceRef.current = setTimeout(() => {
      const snapshot = updateSnapshotRef.current
      updateSnapshotRef.current = null
      if (snapshot) {
        setHistory((h) => ({
          past: [...h.past.slice(-(MAX_HISTORY - 1)), snapshot],
          present: h.present,
          future: [],
        }))
      }
    }, 800)
  }, [])

  const findBlockInList = useCallback(
    (blockId: string): BlockNode | null => {
      const findInList = (list: BlockNode[]): BlockNode | null => {
        for (const b of list) {
          if (b.id === blockId) return b

          // Rechercher dans les innerBlocks normaux
          if (b.innerBlocks) {
            const found = findInList(b.innerBlocks)
            if (found) return found
          }

          // Rechercher dans les items des blobIterator
          if (b.blockType === 'blobIterator' && b.data.items) {
            const items = parseItems(b.data.items)
            // Rechercher dans les items eux-mêmes
            const foundItem = items.find(item => item.id === blockId)
            if (foundItem) return foundItem

            // Rechercher dans les innerBlocks de chaque item
            for (const item of items) {
              if (item.innerBlocks) {
                const found = findInList(item.innerBlocks)
                if (found) return found
              }
            }
          }
        }
        return null
      }
      return findInList(blocks)
    },
    [blocks]
  )

  const handleCopyBlock = useCallback(
    (blockId: string) => {
      const block = findBlockInList(blockId)
      if (block)
        setClipboard({
          blockType: block.blockType,
          data: { ...block.data },
          innerBlocks: block.innerBlocks,
          mode: "full",
        })
    },
    [findBlockInList, setClipboard]
  )

  const handleCopyBlockStyle = useCallback(
    (blockId: string) => {
      const block = findBlockInList(blockId)
      if (!block) return
      const sections = getFieldSectionsForBlockType(block.blockType)
      if (!sections) return
      setClipboard({
        blockType: block.blockType,
        data: extractFieldsByCategory(block.data, "style", sections),
        mode: "style",
      })
    },
    [findBlockInList, setClipboard]
  )

  const handleCopyBlockContent = useCallback(
    (blockId: string) => {
      const block = findBlockInList(blockId)
      if (!block) return
      const sections = getFieldSectionsForBlockType(block.blockType)
      if (!sections) return
      setClipboard({
        blockType: block.blockType,
        data: extractFieldsByCategory(block.data, "content", sections),
        innerBlocks: block.innerBlocks,
        mode: "content",
      })
    },
    [findBlockInList, setClipboard]
  )

  const handlePasteBlock = useCallback(
    (blockId: string) => {
      if (!clipboardData) return
      commit((prev) => {
        const updateIn = (blocks: BlockNode[]): BlockNode[] =>
          blocks.map((b) => {
            if (b.id === blockId) {
              if (clipboardData.mode === "full") {
                // Clone complet : préserver la structure des items si c'est un blobIterator
                const clonedData = { ...clipboardData.data }
                if (clipboardData.blockType === 'blobIterator' && clipboardData.data.items) {
                  const items = parseItems(clipboardData.data.items)
                  if (items.length > 0) {
                    clonedData.items = JSON.stringify(items.map(deepCloneBlock))
                  }
                }
                return { ...b, data: clonedData }
              }

              // Style or content: merge only the copied fields
              // Pour blobIterator, retirer temporairement items car il nécessite un traitement spécial
              let itemsToMerge: string | undefined
              let copiedDataForMerge = clipboardData.data

              if (clipboardData.blockType === 'blobIterator' && clipboardData.data.items) {
                itemsToMerge = clipboardData.data.items as string
                const { items: _items, ...rest } = clipboardData.data
                copiedDataForMerge = rest
              }

              const mergedData = mergeFieldsIntoData(b.data, copiedDataForMerge)

              // Gestion spéciale pour blobIterator en mode content : remplacer complètement les items
              if (itemsToMerge && clipboardData.mode === "content") {
                const items = parseItems(itemsToMerge)
                if (items.length > 0) {
                  mergedData.items = JSON.stringify(items.map(deepCloneBlock))
                }
              }

              return {
                ...b,
                data: mergedData as Record<string, FormDataValue>,
                ...(clipboardData.mode === "content" && clipboardData.innerBlocks
                  ? { innerBlocks: clipboardData.innerBlocks.map(deepCloneBlock) }
                  : {}),
              }
            }

            // Rechercher récursivement dans les innerBlocks
            if (b.innerBlocks) return { ...b, innerBlocks: updateIn(b.innerBlocks) }

            // Rechercher aussi dans les items des blobIterator
            if (b.blockType === 'blobIterator' && b.data.items) {
              const items = parseItems(b.data.items)
              const updatedItems = items.map((item) => {
                if (item.id === blockId) {
                  // Coller dans un item d'iterator
                  if (clipboardData.mode === "full") {
                    return { ...item, data: { ...clipboardData.data } }
                  }
                  const mergedData = mergeFieldsIntoData(item.data, clipboardData.data)
                  return {
                    ...item,
                    data: mergedData as Record<string, FormDataValue>,
                    ...(clipboardData.mode === "content" && clipboardData.innerBlocks
                      ? { innerBlocks: clipboardData.innerBlocks.map(deepCloneBlock) }
                      : {}),
                  }
                }
                // Rechercher dans les innerBlocks de l'item
                if (item.innerBlocks) {
                  return { ...item, innerBlocks: updateIn(item.innerBlocks) }
                }
                return item
              })
              return {
                ...b,
                data: { ...b.data, items: JSON.stringify(updatedItems) }
              }
            }

            return b
          })
        return updateIn(prev)
      })
    },
    [clipboardData, commit]
  )

  const handleInsertFromClipboard = useCallback(
    (afterBlockId?: string, parentId?: string, position?: number) => {
      if (!clipboardData) return
      const newBlock: BlockNode = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blockType: clipboardData.blockType,
        data: { ...clipboardData.data },
        innerBlocks: clipboardData.innerBlocks
          ? clipboardData.innerBlocks.map(deepCloneBlock)
          : clipboardData.blockType === "blob"
            ? []
            : undefined,
      }

      if (parentId) {
        commit((prev) => {
          const addToParent = (blocks: BlockNode[]): BlockNode[] =>
            blocks.map((block) => {
              if (block.id === parentId) {
                const inner = [...(block.innerBlocks || [])]
                if (position !== undefined) inner.splice(position, 0, newBlock)
                else inner.push(newBlock)
                return { ...block, innerBlocks: inner }
              }
              if (block.innerBlocks)
                return { ...block, innerBlocks: addToParent(block.innerBlocks) }
              return block
            })
          return addToParent(prev)
        })
      } else if (afterBlockId) {
        commit((prev) => {
          const index = prev.findIndex((b) => b.id === afterBlockId)
          if (index === -1) return [...prev, newBlock]
          const next = [...prev]
          next.splice(index + 1, 0, newBlock)
          return next
        })
      } else {
        commit((prev) => [...prev, newBlock])
      }

      setSelectedBlockId(newBlock.id)
    },
    [clipboardData, commit]
  )

  const handleRefreshBlock = useCallback((blockId: string, mode: RefreshMode = 'clean') => {
    commit((prev) => {
      const refreshIn = (blocks: BlockNode[]): BlockNode[] =>
        blocks.map((block) => {
          if (block.id === blockId) {
            // Rafraîchir ce bloc (récursivement avec innerBlocks)
            return refreshBlockRecursive(block, mode)
          }

          // Rafraîchir récursivement dans les innerBlocks normaux
          const updatedBlock = block.innerBlocks
            ? { ...block, innerBlocks: refreshIn(block.innerBlocks) }
            : block

          // Rafraîchir aussi dans les innerBlocks des items d'iterator
          if (updatedBlock.blockType === 'blobIterator' && updatedBlock.data.items) {
            const items = parseItems(updatedBlock.data.items)
            const updatedItems = items.map((item) =>
              item.innerBlocks
                ? { ...item, innerBlocks: refreshIn(item.innerBlocks) }
                : item
            )
            return {
              ...updatedBlock,
              data: { ...updatedBlock.data, items: JSON.stringify(updatedItems) }
            }
          }

          return updatedBlock
        })
      return refreshIn(prev)
    })
  }, [commit])

  // ─── Undo / Redo ─────────────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    // Annuler le debounce en cours si une session d'édition est ouverte
    if (updateDebounceRef.current) {
      clearTimeout(updateDebounceRef.current)
      updateDebounceRef.current = null
      updateSnapshotRef.current = null
    }
    setHistory((h) => {
      if (h.past.length === 0) return h
      const previous = h.past[h.past.length - 1]
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future.slice(0, MAX_HISTORY - 1)],
      }
    })
  }, [])

  const handleRedo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h
      const next = h.future[0]
      return {
        past: [...h.past.slice(-(MAX_HISTORY - 1)), h.present],
        present: next,
        future: h.future.slice(1),
      }
    })
  }, [])

  // ─── Helpers ────────────────────────────────────────────────────────────

  const findBlockById = useCallback(
    (blockId: string, blockList: BlockNode[]): BlockNode | null => {
      for (const block of blockList) {
        if (block.id === blockId) return block

        // Chercher dans les innerBlocks normaux
        if (block.innerBlocks) {
          const found = findBlockById(blockId, block.innerBlocks)
          if (found) return found
        }

        // Chercher dans les innerBlocks des items d'iterator
        if (block.blockType === 'blobIterator' && block.data.items) {
          const items = parseItems(block.data.items)
          for (const item of items) {
            // Vérifier si c'est l'item lui-même
            if (item.id === blockId) return item

            // Chercher dans les innerBlocks de l'item
            if (item.innerBlocks) {
              const found = findBlockById(blockId, item.innerBlocks)
              if (found) return found
            }
          }
        }
      }
      return null
    },
    []
  )

  const selectedBlock = selectedBlockId ? findBlockById(selectedBlockId, blocks) : null

  const handleSetBlocks = useCallback(
    (newBlocks: BlockNode[]) => {
      commit(() => newBlocks)
    },
    [commit]
  )

  return {
    // État
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    selectedBlock,
    currentPage,
    setCurrentPage,
    availablePages,
    isSaving,
    lastSaved,
    // Dialog création de page
    isCreatePageOpen,
    setIsCreatePageOpen,
    newPageName,
    setNewPageName,
    // Actions
    savePage,
    handleCreatePage,
    handleAddBlock,
    handleDeleteBlock,
    handleDuplicateBlock,
    handleMoveBlock,
    handleUpdateBlock,
    handleCopyBlock,
    handleCopyBlockStyle,
    handleCopyBlockContent,
    handlePasteBlock,
    handleInsertFromClipboard,
    handleRefreshBlock,
    hasClipboard: clipboardData !== null,
    clipboardMode: (clipboardData?.mode ?? null) as CopyMode | null,
    clipboardBlockType: (clipboardData?.blockType ?? null) as BlockType | null,
    // Undo / Redo
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    // JSON editor
    handleSetBlocks,
    // Preview
    previewBreakpoint,
    setPreviewBreakpoint,
  }
}
