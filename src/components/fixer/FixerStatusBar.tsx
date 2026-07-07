import { Badge } from '@/components/ui/Badge'
import type { FixerStatus } from '@/types/fixer'

interface FixerStatusBarProps {
  status: FixerStatus
  lineCount: number
  charCount: number
}

const statusConfig: Record<FixerStatus, { label: string; variant: 'default' | 'accent' | 'muted'; className?: string }> = {
  idle: { label: 'Ready', variant: 'muted' },
  valid: { label: 'Valid', variant: 'accent', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  invalid: { label: 'Invalid', variant: 'accent', className: 'border-red-500/30 bg-red-500/10 text-red-400' },
  repairing: { label: 'Repairing…', variant: 'accent' },
  repaired: { label: 'Repaired', variant: 'accent', className: 'border-accent/30 bg-accent/10 text-accent-light' },
  failed: { label: 'Failed', variant: 'accent', className: 'border-red-500/30 bg-red-500/10 text-red-400' },
}

export function FixerStatusBar({ status, lineCount, charCount }: FixerStatusBarProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-3 text-xs">
      <Badge
        variant={config.variant}
        className={config.className ?? ''}
      >
        {config.label}
      </Badge>

      {charCount > 0 && (
        <span className="text-text-muted">
          {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {charCount.toLocaleString()} chars
        </span>
      )}
    </div>
  )
}
