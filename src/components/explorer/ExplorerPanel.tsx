import { TreePine } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export function ExplorerPanel() {
  return (
    <section
      aria-label="JSON explorer"
      className="flex h-full min-h-[320px] flex-col rounded-card border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <TreePine className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="text-sm font-medium text-text-primary">Explorer</h2>
        </div>
        <Badge variant="muted">No data</Badge>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-mono text-sm text-text-muted">Paste JSON to explore</p>
        <p className="max-w-xs text-xs text-text-muted">
          Tree view and stats will render here after parsing
        </p>
      </div>
    </section>
  )
}
