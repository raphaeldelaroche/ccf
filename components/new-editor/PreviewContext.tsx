"use client"

import { createContext, useContext } from 'react'

interface PreviewContextValue {
  isPreviewMode: boolean
}

const PreviewContext = createContext<PreviewContextValue>({ isPreviewMode: false })

export const PreviewProvider = PreviewContext.Provider

export function usePreview() {
  return useContext(PreviewContext)
}
