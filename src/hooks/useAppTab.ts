import { useCallback, useState } from 'react'

export type AppTab = 'explorer' | 'fixer'

const STORAGE_KEY = 'structra:active-tab'

function loadTab(): AppTab {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fixer') return 'fixer'
  } catch {
    // Fail silently in private mode or quota exceeded
  }
  return 'explorer'
}

function saveTab(tab: AppTab): void {
  try {
    localStorage.setItem(STORAGE_KEY, tab)
  } catch {
    // Fail silently
  }
}

export function useAppTab() {
  const [activeTab, setActiveTabState] = useState<AppTab>(loadTab)

  const setActiveTab = useCallback((tab: AppTab) => {
    setActiveTabState(tab)
    saveTab(tab)
  }, [])

  return { activeTab, setActiveTab }
}
