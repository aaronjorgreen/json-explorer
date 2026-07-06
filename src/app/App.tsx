import { JsonDocumentProvider, useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { SearchProvider } from '@/hooks/useSearch'
import { MainLayout } from '@/app/MainLayout'

function AppContent() {
  const { nodes } = useJsonDocumentContext()

  return (
    <SearchProvider nodes={nodes}>
      <MainLayout />
    </SearchProvider>
  )
}

function App() {
  return (
    <JsonDocumentProvider>
      <AppContent />
    </JsonDocumentProvider>
  )
}

export default App
