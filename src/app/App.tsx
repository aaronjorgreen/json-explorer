import { JsonDocumentProvider, useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { SearchProvider, useSearch } from '@/hooks/useSearch'
import { ToastProvider } from '@/hooks/useToast'
import { TreeActionsProvider } from '@/hooks/useTreeActions'
import { MainLayout } from '@/app/MainLayout'
import { SessionRestoreNotice } from '@/components/input/SessionRestoreNotice'
import { ToastContainer } from '@/components/ui/Toast'

function SearchableLayout() {
  const { nodes, clearInput } = useJsonDocumentContext()

  return (
    <SearchProvider nodes={nodes}>
      <LayoutWithSearch clearInput={clearInput} />
    </SearchProvider>
  )
}

function LayoutWithSearch({ clearInput }: { clearInput: () => void }) {
  const { clearSearch } = useSearch()

  const handleClearAll = () => {
    clearInput()
    clearSearch()
  }

  return (
    <>
      <MainLayout onClearAll={handleClearAll} />
      <SessionRestoreNotice />
      <ToastContainer />
    </>
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
