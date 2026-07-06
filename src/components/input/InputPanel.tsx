import { FileJson } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export function InputPanel() {
  return (
    <section
      aria-label="JSON input"
      className="flex h-full min-h-[240px] flex-col rounded-card border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="text-sm font-medium text-text-primary">Input</h2>
        </div>
        <Badge variant="muted">Paste JSON</Badge>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-mono text-sm text-text-muted">
          Paste, drop, or upload JSON to get started
        </p>
        <p className="max-w-xs text-xs text-text-muted">
          Your JSON editor will appear here in Phase 2
        </p>
      </div>
    </section>
  )
}
