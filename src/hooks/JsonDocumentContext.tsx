import { createContext, useContext, type ReactNode } from 'react'
import type { UseJsonDocumentResult } from '@/hooks/useJsonDocument'
import { useJsonDocument } from '@/hooks/useJsonDocument'

const JsonDocumentContext = createContext<UseJsonDocumentResult | null>(null)

export function JsonDocumentProvider({ children }: { children: ReactNode }) {
  const value = useJsonDocument()
  return <JsonDocumentContext.Provider value={value}>{children}</JsonDocumentContext.Provider>
}

export function useJsonDocumentContext(): UseJsonDocumentResult {
  const context = useContext(JsonDocumentContext)
  if (!context) {
    throw new Error('useJsonDocumentContext must be used within JsonDocumentProvider')
  }
  return context
}
