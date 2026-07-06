import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { InputPanel } from '@/components/input/InputPanel'
import { Button } from '@/components/ui/Button'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'

interface MobileInputDrawerProps {
  open: boolean
  onClose: () => void
  onClearAll?: () => void
}

export function MobileInputDrawer({ open, onClose, onClearAll }: MobileInputDrawerProps) {
  const { parseResult } = useJsonDocumentContext()
  const wasInvalidRef = useRef(true)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      wasInvalidRef.current = true
      return
    }

    if (wasInvalidRef.current && parseResult?.ok) {
      onClose()
    }

    wasInvalidRef.current = !parseResult?.ok
  }, [open, parseResult, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-base/70 backdrop-blur-sm"
        aria-label="Close input panel"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-card border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-text-primary">JSON Input</p>
          <Button variant="ghost" className="min-h-11 min-w-11 px-2" aria-label="Close input panel" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <InputPanel onClearAll={onClearAll} />
        </div>
      </div>
    </div>
  )
}
