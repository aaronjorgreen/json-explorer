import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseJson } from '@/lib/parseJson'
import {
  insertMissingCommas,
  normalizeWhitespace,
  quoteObjectKeys,
  removeTrailingCommas,
} from '@/lib/fixer/repairRules'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../__fixtures__/fixer')

function readFixture(name: string): string {
  return readFileSync(path.join(fixturesDir, name), 'utf8')
}

describe('normalizeWhitespace', () => {
  it('trims and normalizes line endings', () => {
    const result = normalizeWhitespace('  {\n"a": 1\r\n}  ')
    expect(result.output).toBe('{\n"a": 1\n}')
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0].confidence).toBe('high')
  })

  it('returns no changes for already normalized input', () => {
    const input = '{\n"a": 1\n}'
    const result = normalizeWhitespace(input)
    expect(result.output).toBe(input)
    expect(result.changes).toHaveLength(0)
  })
})

describe('removeTrailingCommas', () => {
  it('removes trailing commas in objects', () => {
    const input = readFixture('trailing-comma-object.json')
    const result = removeTrailingCommas(input)
    expect(parseJson(result.output).ok).toBe(true)
    expect(result.changes[0].rule).toBe('remove_trailing_commas')
  })

  it('removes trailing commas in arrays', () => {
    const input = readFixture('trailing-comma-array.json')
    const result = removeTrailingCommas(input)
    expect(parseJson(result.output).ok).toBe(true)
    expect(result.changes[0].count).toBeGreaterThan(0)
  })

  it('does not modify commas inside strings', () => {
    const input = '{"text": "a, b,"}'
    const result = removeTrailingCommas(input)
    expect(result.output).toBe(input)
    expect(result.changes).toHaveLength(0)
  })
})

describe('quoteObjectKeys', () => {
  it('quotes unquoted keys', () => {
    const input = readFixture('unquoted-keys.json')
    const result = quoteObjectKeys(input)
    expect(result.output).toContain('"name"')
    expect(result.changes[0].rule).toBe('quote_object_keys')
  })

  it('quotes nested unquoted keys', () => {
    const input = readFixture('unquoted-keys-nested.json')
    const result = quoteObjectKeys(input)
    expect(result.output).toContain('"user"')
    expect(result.output).toContain('"name"')
  })

  it('does not quote content inside strings', () => {
    const input = '{"note": "key: value"}'
    const result = quoteObjectKeys(input)
    expect(result.output).toBe(input)
  })
})

describe('insertMissingCommas', () => {
  it('inserts missing commas between object properties', () => {
    const input = readFixture('missing-comma-object.json')
    const result = insertMissingCommas(input)
    expect(result.changes[0].rule).toBe('insert_missing_commas')
    expect(result.changes[0].confidence).toBe('medium')
  })

  it('inserts missing commas between array elements', () => {
    const input = readFixture('missing-comma-array.json')
    const result = insertMissingCommas(input)
    expect(result.changes[0].count).toBeGreaterThan(0)
  })
})
