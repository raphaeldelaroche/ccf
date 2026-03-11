"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BlockNode, BlockType } from "@/lib/new-editor/block-types"
import type { FormDataValue } from "@/types/editor"
import { createNewBlock } from "@/lib/new-editor/block-registry"

const MAX_HISTORY = 50

// Pure helper — no hook deps, safe to define at module level
function deepCloneBlock(block: BlockNode): BlockNode {
  return {
    ...block,
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // ─── Dialog état ────────────────────────────────────────────────────────
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false)
  const [newPageName, setNewPageName] = useState("")

  // ─── Clipboard ──────────────────────────────────────────────────────────
  const [clipboardData, setClipboardData] = useState<{
    blockType: BlockType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>
    innerBlocks?: BlockNode[]
  } | null>(null)

  // ─── Pages ──────────────────────────────────────────────────────────────

  const loadAvailablePages = useCallback(async () => {
    try {
      const res = await fetch("/api/pages")
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
      const res = await fetch(`/api/pages/${pageName}`)
      if (!res.ok) {
        resetHistory([])
        setSelectedBlockId(null)
        return
      }
      const data = await res.json()
      resetHistory(data.blocks || [])
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
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title }),
      })
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
      const res = await fetch(`/api/pages/${currentPage}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      })
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
          const items = block.data.items as unknown as BlockNode[]
          const itemIndex = items.findIndex((item) => item.id === itemId)

          if (itemIndex !== -1) {
            // Mettre à jour l'item
            const updatedItems = items.map((item, idx) =>
              idx === itemIndex ? updater(item) : item
            )
            return {
              ...block,
              data: { ...block.data, items: updatedItems as unknown as FormDataValue }
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
              const items = updatedBlock.data.items as unknown as BlockNode[]
              const updatedItems = items.map((item) =>
                item.innerBlocks
                  ? { ...item, innerBlocks: deleteFrom(item.innerBlocks) }
                  : item
              )
              return {
                ...updatedBlock,
                data: { ...updatedBlock.data, items: updatedItems as unknown as FormDataValue }
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
            const items = updatedBlock.data.items as unknown as BlockNode[]
            const updatedItems = items.map((item) =>
              item.innerBlocks
                ? { ...item, innerBlocks: duplicateIn(item.innerBlocks) }
                : item
            )
            return {
              ...updatedBlock,
              data: { ...updatedBlock.data, items: updatedItems as unknown as FormDataValue }
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
            const items = updatedBlock.data.items as unknown as BlockNode[]
            const updatedItems = items.map((item) =>
              item.innerBlocks
                ? { ...item, innerBlocks: moveIn(item.innerBlocks) }
                : item
            )
            return {
              ...updatedBlock,
              data: { ...updatedBlock.data, items: updatedItems as unknown as FormDataValue }
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
            const items = updatedBlock.data.items as unknown as BlockNode[]
            const updatedItems = items.map((item) =>
              item.innerBlocks
                ? { ...item, innerBlocks: updateIn(item.innerBlocks) }
                : item
            )
            return {
              ...updatedBlock,
              data: { ...updatedBlock.data, items: updatedItems as unknown as FormDataValue }
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

  const handleCopyBlock = useCallback(
    (blockId: string) => {
      const findInList = (list: BlockNode[]): BlockNode | null => {
        for (const b of list) {
          if (b.id === blockId) return b
          if (b.innerBlocks) {
            const found = findInList(b.innerBlocks)
            if (found) return found
          }
        }
        return null
      }
      const block = findInList(blocks)
      if (block)
        setClipboardData({
          blockType: block.blockType,
          data: { ...block.data },
          innerBlocks: block.innerBlocks,
        })
    },
    [blocks]
  )

  const handlePasteBlock = useCallback(
    (blockId: string) => {
      if (!clipboardData) return
      commit((prev) => {
        const updateIn = (blocks: BlockNode[]): BlockNode[] =>
          blocks.map((b) => {
            if (b.id === blockId) return { ...b, data: { ...clipboardData.data } }
            if (b.innerBlocks) return { ...b, innerBlocks: updateIn(b.innerBlocks) }
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
          const items = block.data.items as unknown as BlockNode[]
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
    handlePasteBlock,
    handleInsertFromClipboard,
    hasClipboard: clipboardData !== null,
    // Undo / Redo
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    // JSON editor
    handleSetBlocks,
  }
}
