import { JsonDocumentProvider } from '@/hooks/JsonDocumentContext'
import { MainLayout } from '@/app/MainLayout'

function App() {
  return (
    <JsonDocumentProvider>
      <MainLayout />
    </JsonDocumentProvider>
  )
}

export default App
