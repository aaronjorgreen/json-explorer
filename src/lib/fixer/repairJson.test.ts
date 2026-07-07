import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseJson } from '@/lib/parseJson'
import { repairJson } from '@/lib/fixer/repairJson'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../__fixtures__/fixer')

function readFixture(name: string): string {
  return readFileSync(path.join(fixturesDir, name), 'utf8')
}

describe('repairJson', () => {
  it('repairs trailing comma in objects', () => {
    const result = repairJson(readFixture('trailing-comma-object.json'))
    expect(result.success).toBe(true)
    expect(result.output).toBeTruthy()
    expect(parseJson(result.output!).ok).toBe(true)
    expect(result.changes.some((c) => c.rule === 'remove_trailing_commas')).toBe(true)
  })

  it('repairs trailing comma in arrays', () => {
    const result = repairJson(readFixture('trailing-comma-array.json'))
    expect(result.success).toBe(true)
    expect(parseJson(result.output!).ok).toBe(true)
  })

  it('repairs unquoted keys', () => {
    const result = repairJson(readFixture('unquoted-keys.json'))
    expect(result.success).toBe(true)
    expect(parseJson(result.output!).ok).toBe(true)
    expect(result.changes.some((c) => c.rule === 'quote_object_keys')).toBe(true)
  })

  it('repairs missing commas in safe cases', () => {
    const result = repairJson(readFixture('missing-comma-object.json'))
    expect(result.success).toBe(true)
    expect(parseJson(result.output!).ok).toBe(true)
  })

  it('repairs mixed errors end-to-end', () => {
    const result = repairJson(readFixture('mixed-errors.json'))
    expect(result.success).toBe(true)
    expect(parseJson(result.output!).ok).toBe(true)
    expect(result.errorsAfter).toHaveLength(0)
  })

  it('normalizes already-valid JSON without corruption', () => {
    const input = readFixture('already-valid.json')
    const result = repairJson(input)
    expect(result.success).toBe(true)
    expect(parseJson(result.output!).ok).toBe(true)
    const parsed = parseJson(result.output!)
    if (parsed.ok) {
      expect(parsed.data).toEqual({ name: 'Alice', age: 30 })
    }
  })

  it('fails gracefully on unrecoverable input', () => {
    const input = readFixture('unrecoverable.json')
    const result = repairJson(input)
    expect(result.success).toBe(false)
    expect(result.output).toBeNull()
    expect(result.errorsAfter.length).toBeGreaterThan(0)
    expect(result.errorsBefore.length).toBeGreaterThan(0)
  })

  it('never corrupts string literal contents', () => {
    const input = '{"message": "hello, world"}'
    const result = repairJson(input)
    expect(result.success).toBe(true)
    expect(result.output).toContain('hello, world')
  })
})
