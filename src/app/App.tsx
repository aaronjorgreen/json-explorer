import { useCallback } from 'react'
import { JsonDocumentProvider, useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { SearchProvider, useSearch } from '@/hooks/useSearch'
import { ToastProvider } from '@/hooks/useToast'
import { TreeActionsProvider } from '@/hooks/useTreeActions'
import { useAppTab } from '@/hooks/useAppTab'
import { SidebarNav } from '@/components/sidebar/SidebarNav'
import { MainLayout } from '@/app/MainLayout'
import { FixerPanel } from '@/components/fixer/FixerPanel'
import { SessionRestoreNotice } from '@/components/input/SessionRestoreNotice'
import { ToastContainer } from '@/components/ui/Toast'

function SearchableLayout() {
  const { nodes, clearInput, setRawInput } = useJsonDocumentContext()
  const { activeTab, setActiveTab } = useAppTab()

  const handleOpenInExplorer = useCallback((json: string) => {
    setRawInput(json)
    setActiveTab('explorer')
  }, [setRawInput, setActiveTab])

  return (
    <SearchProvider nodes={nodes}>
      <LayoutWithSearch
        clearInput={clearInput}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInExplorer={handleOpenInExplorer}
      />
    </SearchProvider>
  )
}

interface LayoutWithSearchProps {
  clearInput: () => void
  activeTab: 'explorer' | 'fixer'
  setActiveTab: (tab: 'explorer' | 'fixer') => void
  onOpenInExplorer: (json: string) => void
}

function LayoutWithSearch({ clearInput, activeTab, setActiveTab, onOpenInExplorer }: LayoutWithSearchProps) {
  const { clearSearch } = useSearch()

  const handleClearAll = () => {
    clearInput()
    clearSearch()
  }

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <div className="flex min-h-0 flex-1">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex min-w-0 flex-1 flex-col pb-14 lg:pb-0">
          {/* Explorer tab — stays mounted to preserve state */}
          <div
            className={`flex min-h-0 flex-1 flex-col transition-opacity duration-150 motion-reduce:transition-none ${
              activeTab === 'explorer' ? 'opacity-100' : 'pointer-events-none absolute inset-0 -z-10 opacity-0'
            }`}
            role="tabpanel"
            id="tabpanel-explorer"
            aria-labelledby="tab-explorer"
            hidden={activeTab !== 'explorer'}
          >
            <MainLayout onClearAll={handleClearAll} />
          </div>

          {/* Fixer tab */}
          {activeTab === 'fixer' && (
            <div
              className="flex min-h-0 flex-1 flex-col p-4 transition-opacity duration-150 motion-reduce:transition-none lg:p-6"
              role="tabpanel"
              id="tabpanel-fixer"
              aria-labelledby="tab-fixer"
            >
              <FixerPanel onOpenInExplorer={onOpenInExplorer} />
            </div>
          )}
        </div>
      </div>

      <SessionRestoreNotice />
      <ToastContainer />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <JsonDocumentProvider>
        <TreeActionsProvider>
          <SearchableLayout />
        </TreeActionsProvider>
      </JsonDocumentProvider>
    </ToastProvider>
  )
}

export default App
