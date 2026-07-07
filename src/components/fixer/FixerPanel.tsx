import { useState } from 'react'
import { FixerEmptyState } from '@/components/fixer/FixerEmptyState'

interface FixerPanelProps {
  onOpenInExplorer?: (json: string) => void
}

export function FixerPanel({ onOpenInExplorer: _onOpenInExplorer }: FixerPanelProps) {
  const [rawInput, setRawInput] = useState('')

  const handleLoadSample = (sample: string) => {
    setRawInput(sample)
  }

  if (!rawInput.trim()) {
    return (
      <div className="flex h-full flex-col rounded-card border border-border bg-surface">
        <FixerEmptyState onLoadSample={handleLoadSample} />
      </div>
    )
  }

  // Placeholder for Phase B+ content
  return (
    <div className="flex h-full flex-col rounded-card border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-text-primary">Fixer</p>
        <button
          type="button"
          onClick={() => setRawInput('')}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap break-all font-mono text-sm text-text-secondary">
          {rawInput}
        </pre>
      </div>
    </div>
  )
}
