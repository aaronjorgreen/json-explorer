import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getPathsToExpand, searchTree, type SearchMatch } from '@/lib/searchTree'
import type { JsonNode } from '@/types/json'

interface SearchContextValue {
  query: string
  setQuery: (value: string) => void
  debouncedQuery: string
  matches: SearchMatch[]
  currentIndex: number
  currentMatch: SearchMatch | null
  nextMatch: () => void
  prevMatch: () => void
  expandPaths: Set<string>
  clearSearch: () => void
  isSearchActive: boolean
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({
  nodes,
  children,
}: {
  nodes: JsonNode[]
  children: ReactNode
}) {
  const [query, setQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const debouncedQuery = useDebouncedValue(query, 150)

  const matches = useMemo(() => searchTree(nodes, debouncedQuery), [nodes, debouncedQuery])
  const expandPaths = useMemo(() => getPathsToExpand(matches), [matches])
  const isSearchActive = debouncedQuery.trim().length > 0

  useEffect(() => {
    setCurrentIndex(0)
  }, [debouncedQuery, matches.length])

  const currentMatch = matches[currentIndex] ?? null

  const nextMatch = useCallback(() => {
    if (matches.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % matches.length)
  }, [matches.length])

  const prevMatch = useCallback(() => {
    if (matches.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length)
  }, [matches.length])

  const clearSearch = useCallback(() => {
    setQuery('')
    setCurrentIndex(0)
  }, [])

  const value = useMemo(
    () => ({
      query,
      setQuery,
      debouncedQuery,
      matches,
      currentIndex,
      currentMatch,
      nextMatch,
      prevMatch,
      clearSearch,
      expandPaths,
      isSearchActive,
    }),
    [
      query,
      debouncedQuery,
      matches,
      currentIndex,
      currentMatch,
      nextMatch,
      prevMatch,
      clearSearch,
      expandPaths,
      isSearchActive,
    ],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}
