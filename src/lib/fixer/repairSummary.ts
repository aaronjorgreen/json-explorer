import type { RepairChange } from '@/types/fixer'

const ruleLabels: Record<string, string> = {
  normalize_whitespace: 'Normalized whitespace',
  remove_trailing_commas: 'Removed trailing commas',
  quote_object_keys: 'Quoted unquoted keys',
  insert_missing_commas: 'Inserted missing commas',
  pretty_format: 'Formatted output',
}

const confidenceEmoji: Record<string, string> = {
  high: '✓',
  medium: '~',
  low: '?',
}

/**
 * Build human-readable summary lines from repair changes.
 */
export function buildRepairSummary(changes: RepairChange[]): string[] {
  return changes.map((change) => {
    const label = ruleLabels[change.rule] ?? change.rule
    const emoji = confidenceEmoji[change.confidence] ?? ''
    const countLabel = change.count > 1 ? ` (${change.count} edits)` : ''
    return `${emoji} ${label}${countLabel} — ${change.confidence} confidence`
  })
}

/**
 * Count total edits across all changes.
 */
export function totalEditCount(changes: RepairChange[]): number {
  return changes.reduce((sum, change) => sum + change.count, 0)
}
