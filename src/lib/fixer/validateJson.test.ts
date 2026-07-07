import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateJson } from '@/lib/fixer/validateJson'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../__fixtures__/fixer')

function readFixture(name: string): string {
  return readFileSync(path.join(fixturesDir, name), 'utf8')
}

describe('validateJson', () => {
  it('returns ok for valid JSON', () => {
    const result = validateJson(readFixture('already-valid.json'))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ name: 'Alice', age: 30 })
    }
  })

  it('returns diagnostic for trailing comma in object', () => {
    const result = validateJson(readFixture('trailing-comma-object.json'))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.line).toBeGreaterThan(0)
      expect(result.error.hint).toBeTruthy()
    }
  })

  it('returns diagnostic for unquoted keys', () => {
    const result = validateJson(readFixture('unquoted-keys.json'))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBeTruthy()
      expect(result.error.hint).toBeTruthy()
    }
  })

  it('returns diagnostic for unclosed input', () => {
    const result = validateJson(readFixture('unrecoverable.json'))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBeTruthy()
    }
  })

  it('returns idle-friendly result for empty input', () => {
    const result = validateJson('   ')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBeTruthy()
    }
  })

  it('includes line, column, and char for syntax errors', () => {
    const result = validateJson(readFixture('missing-comma-object.json'))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.line).toBeGreaterThan(0)
      expect(result.error.column).toBeGreaterThan(0)
      expect(result.error.char).toBeGreaterThan(0)
    }
  })
})
