import { TreePine } from 'lucide-react'
import { JsonTree } from '@/components/explorer/JsonTree'
import { StatsBar } from '@/components/explorer/StatsBar'
import { TreeToolbar } from '@/components/explorer/TreeToolbar'
import { Badge } from '@/components/ui/Badge'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { TreeExpandProvider } from '@/hooks/useTreeExpand'

export function ExplorerPanel() {
  const { parseResult, nodes, stats } = useJsonDocumentContext()
  const hasTree = parseResult?.ok === true && nodes.length > 0

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
        <Badge variant={hasTree ? 'accent' : 'muted'}>{hasTree ? 'Ready' : 'No data'}</Badge>
      </div>

      {hasTree ? (
        <TreeExpandProvider nodes={nodes}>
          <StatsBar stats={stats} />
          <TreeToolbar />
          <div className="min-h-0 flex-1 overflow-auto p-2">
            <JsonTree nodes={nodes} />
          </div>
        </TreeExpandProvider>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="font-mono text-sm text-text-muted">Paste JSON to explore</p>
          <p className="max-w-xs text-xs text-text-muted">
            Tree view and stats will render here after parsing valid JSON
          </p>
        </div>
      )}
    </section>
  )
}
