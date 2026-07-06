import type { TreeStats } from '@/types/json'
import { Badge } from '@/components/ui/Badge'

interface StatsBarProps {
  stats: TreeStats | null
  parseTimeMs: number | null
}

const LARGE_TREE_WARNING = 10_000

export function StatsBar({ stats, parseTimeMs }: StatsBarProps) {
  if (!stats) return null

  const items = [
    { label: 'Objects', value: stats.objects },
    { label: 'Arrays', value: stats.arrays },
    { label: 'Properties', value: stats.properties },
    { label: 'Depth', value: stats.maxDepth },
    { label: 'Nodes', value: stats.nodeCount },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2 font-mono text-xs text-text-secondary">
      {items.map((item) => (
        <span key={item.label}>
          <span className="text-text-muted">{item.label}: </span>
          <span className="text-text-primary">{item.value.toLocaleString()}</span>
        </span>
      ))}
      {parseTimeMs !== null ? (
        <span>
          <span className="text-text-muted">Parse: </span>
          <span className="text-text-primary">{parseTimeMs.toFixed(0)}ms</span>
        </span>
      ) : null}
      {stats.nodeCount > LARGE_TREE_WARNING ? (
        <Badge variant="accent" className="border-yellow-500/40 bg-yellow-500/10 text-yellow-100">
          Large tree
        </Badge>
      ) : null}
    </div>
  )
}
