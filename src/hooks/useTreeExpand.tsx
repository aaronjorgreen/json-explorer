import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { collectAllPaths, getNodeDepth } from '@/lib/buildTree'
import type { JsonNode } from '@/types/json'

interface TreeExpandContextValue {
  expandedPaths: Set<string>
  isExpanded: (path: string) => boolean
  toggleExpand: (path: string) => void
  expandAll: () => void
  collapseAll: () => void
}

const TreeExpandContext = createContext<TreeExpandContextValue | null>(null)

function getDefaultExpanded(nodes: JsonNode[]): Set<string> {
  const paths = collectAllPaths(nodes)
  return new Set(paths.filter((nodePath) => getNodeDepth(nodePath) <= 1))
}

export function TreeExpandProvider({
  nodes,
  children,
}: {
  nodes: JsonNode[]
  children: ReactNode
}) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => getDefaultExpanded(nodes))

  useEffect(() => {
    setExpandedPaths(getDefaultExpanded(nodes))
  }, [nodes])

  const isExpanded = useCallback((path: string) => expandedPaths.has(path), [expandedPaths])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedPaths(new Set(collectAllPaths(nodes)))
  }, [nodes])

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(['root']))
  }, [])

  const value = useMemo(
    () => ({
      expandedPaths,
      isExpanded,
      toggleExpand,
      expandAll,
      collapseAll,
    }),
    [expandedPaths, isExpanded, toggleExpand, expandAll, collapseAll],
  )

  return <TreeExpandContext.Provider value={value}>{children}</TreeExpandContext.Provider>
}

export function useTreeExpand(): TreeExpandContextValue {
  const context = useContext(TreeExpandContext)
  if (!context) {
    throw new Error('useTreeExpand must be used within TreeExpandProvider')
  }
  return context
}

export function useTreeExpandOptional(): TreeExpandContextValue | null {
  return useContext(TreeExpandContext)
}
