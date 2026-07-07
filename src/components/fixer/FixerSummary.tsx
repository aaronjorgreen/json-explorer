import { Badge } from '@/components/ui/Badge'
import { buildRepairSummary, totalEditCount } from '@/lib/fixer/repairSummary'
import type { RepairChange } from '@/types/fixer'

interface FixerSummaryProps {
  changes: RepairChange[]
  inputLineCount: number
  inputCharCount: number
  outputLineCount: number
  outputCharCount: number
}

const confidenceStyles: Record<string, string> = {
  high: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  low: 'border-red-500/30 bg-red-500/10 text-red-400',
}

export function FixerSummary({
  changes,
  inputLineCount,
  inputCharCount,
  outputLineCount,
  outputCharCount,
}: FixerSummaryProps) {
  const summaryLines = buildRepairSummary(changes)
  const editCount = totalEditCount(changes)
  const lineDelta = outputLineCount - inputLineCount
  const charDelta = outputCharCount - inputCharCount

  const formatDelta = (delta: number, unit: string) => {
    if (delta === 0) return `±0 ${unit}`
    const sign = delta > 0 ? '+' : ''
    return `${sign}${delta} ${unit}`
  }

  return (
    <div className="rounded-input border border-border bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-text-primary">Repair summary</h3>
        {outputCharCount > 0 && (
          <span className="text-xs text-text-muted">
            {formatDelta(lineDelta, 'lines')} · {formatDelta(charDelta, 'chars')}
          </span>
        )}
      </div>

      {summaryLines.length === 0 ? (
        <p className="text-sm text-text-muted">No repairs applied</p>
      ) : (
        <ul className="space-y-2">
          {changes.map((change, index) => (
            <li key={`${change.rule}-${index}`} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-text-secondary">{summaryLines[index]}</span>
              <Badge className={confidenceStyles[change.confidence] ?? ''}>
                {change.confidence}
              </Badge>
            </li>
          ))}
          <li className="pt-1 text-xs text-text-muted">
            {editCount} total edit{editCount === 1 ? '' : 's'}
          </li>
        </ul>
      )}
    </div>
  )
}
