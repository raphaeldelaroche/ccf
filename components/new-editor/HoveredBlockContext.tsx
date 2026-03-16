"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface HoveredBlockContextValue {
  hoveredBlockId: string | null
  setHoveredBlockId: (id: string | null) => void
}

const HoveredBlockContext = createContext<HoveredBlockContextValue>({
  hoveredBlockId: null,
  setHoveredBlockId: () => {},
})

export function HoveredBlockProvider({ children }: { children: ReactNode }) {
  const [hoveredBlockId, setHoveredBlockIdRaw] = useState<string | null>(null)

  const setHoveredBlockId = useCallback((id: string | null) => {
    setHoveredBlockIdRaw(id)
  }, [])

  return (
    <HoveredBlockContext.Provider value={{ hoveredBlockId, setHoveredBlockId }}>
      {children}
    </HoveredBlockContext.Provider>
  )
}

export function useHoveredBlock() {
  return useContext(HoveredBlockContext)
}
