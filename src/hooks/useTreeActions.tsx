import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface TreeActions {
  expandAll: () => void
  collapseAll: () => void
}

interface TreeActionsContextValue {
  actions: TreeActions | null
  registerActions: (actions: TreeActions | null) => void
}

const TreeActionsContext = createContext<TreeActionsContextValue | null>(null)

export function TreeActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<TreeActions | null>(null)

  const registerActions = useCallback((next: TreeActions | null) => {
    setActions(next)
  }, [])

  const value = useMemo(() => ({ actions, registerActions }), [actions, registerActions])

  return <TreeActionsContext.Provider value={value}>{children}</TreeActionsContext.Provider>
}

export function useTreeActions(): TreeActionsContextValue {
  const context = useContext(TreeActionsContext)
  if (!context) {
    throw new Error('useTreeActions must be used within TreeActionsProvider')
  }
  return context
}
