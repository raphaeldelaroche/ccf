"use client"

import { createContext, useContext, useRef, useState, type ReactNode } from "react"

export interface SelectedBlock {
  id: string
  type: string
  props: Record<string, string | boolean>
}

interface BlockSelectionContextValue {
  selectedBlock: SelectedBlock | null
  setSelectedBlock: (block: SelectedBlock | null) => void
  /** Always holds the latest props — updated without triggering re-renders. */
  propsRef: React.MutableRefObject<Record<string, string | boolean>>
  /** Always holds the current selected block id — closure-safe for onSelectionChange guards. */
  selectedIdRef: React.MutableRefObject<string | null>
}

const BlockSelectionContext = createContext<BlockSelectionContextValue | null>(null)

export function BlockSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null)
  const propsRef = useRef<Record<string, string | boolean>>({})
  const selectedIdRef = useRef<string | null>(null)

  const handleSetSelectedBlock = (block: SelectedBlock | null) => {
    if (block) {
      propsRef.current = { ...block.props }
      selectedIdRef.current = block.id
    } else {
      selectedIdRef.current = null
    }
    setSelectedBlock(block)
  }

  return (
    <BlockSelectionContext.Provider
      value={{ selectedBlock, setSelectedBlock: handleSetSelectedBlock, propsRef, selectedIdRef }}
    >
      {children}
    </BlockSelectionContext.Provider>
  )
}

export function useBlockSelection() {
  const ctx = useContext(BlockSelectionContext)
  if (!ctx) throw new Error("useBlockSelection must be used inside BlockSelectionProvider")
  return ctx
}
