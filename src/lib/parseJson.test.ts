import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseJson } from './parseJson'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function readFixture(name: string): string {
  return readFileSync(path.join(fixturesDir, name), 'utf8')
}

describe('parseJson', () => {
  it('parses valid JSON', () => {
    const input = readFixture('valid-simple.json')
    const result = parseJson(input)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({
        name: 'Alice',
        age: 30,
        active: true,
      })
    }
  })

  it('parses nested JSON', () => {
    const input = readFixture('valid-nested.json')
    const result = parseJson(input)

    expect(result.ok).toBe(true)
  })

  it('reports trailing comma errors with position', () => {
    const input = readFixture('invalid-trailing-comma.json')
    const result = parseJson(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain("']'")
      expect(result.error.line).toBe(2)
      expect(result.error.column).toBeGreaterThan(0)
      expect(result.error.character).toBeGreaterThan(0)
    }
  })

  it('reports unclosed bracket errors with position', () => {
    const input = readFixture('invalid-unclosed.json')
    const result = parseJson(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.line).toBeGreaterThan(0)
      expect(result.error.column).toBeGreaterThan(0)
    }
  })

  it('maps character index to line and column accurately', () => {
    const input = '{\n  "a": 1,\n  "b": ,\n}'
    const result = parseJson(input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.line).toBe(3)
      expect(result.error.column).toBeGreaterThan(0)
    }
  })

  it('rejects empty input', () => {
    const result = parseJson('   ')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('empty')
    }
  })
})
