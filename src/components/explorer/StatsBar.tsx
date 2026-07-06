import type { TreeStats } from '@/types/json'

interface StatsBarProps {
  stats: TreeStats | null
}

export function StatsBar({ stats }: StatsBarProps) {
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
    </div>
  )
}
