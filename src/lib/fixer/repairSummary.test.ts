import { describe, expect, it } from 'vitest'
import { buildRepairSummary, totalEditCount } from '@/lib/fixer/repairSummary'
import type { RepairChange } from '@/types/fixer'

describe('repairSummary', () => {
  const changes: RepairChange[] = [
    { rule: 'remove_trailing_commas', count: 2, confidence: 'high' },
    { rule: 'insert_missing_commas', count: 1, confidence: 'medium' },
  ]

  it('builds human-readable summary lines', () => {
    const lines = buildRepairSummary(changes)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('Removed trailing commas')
    expect(lines[0]).toContain('high confidence')
    expect(lines[1]).toContain('Inserted missing commas')
    expect(lines[1]).toContain('medium confidence')
  })

  it('counts total edits', () => {
    expect(totalEditCount(changes)).toBe(3)
  })

  it('returns empty array for no changes', () => {
    expect(buildRepairSummary([])).toEqual([])
    expect(totalEditCount([])).toBe(0)
  })
})
