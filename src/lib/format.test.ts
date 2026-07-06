import { describe, expect, it } from 'vitest'
import { formatValue, getValueType, stringifyPretty } from './format'

describe('formatValue', () => {
  it('formats primitives', () => {
    expect(formatValue(null)).toBe('null')
    expect(formatValue(true)).toBe('true')
    expect(formatValue(false)).toBe('false')
    expect(formatValue(42)).toBe('42')
    expect(formatValue('hi')).toBe('"hi"')
  })

  it('truncates long strings', () => {
    const long = 'a'.repeat(100)
    const formatted = formatValue(long)
    expect(formatted.endsWith('…"')).toBe(true)
    expect(formatted.length).toBeLessThan(long.length + 2)
  })
})

describe('getValueType', () => {
  it('returns type labels', () => {
    expect(getValueType('x')).toBe('string')
    expect(getValueType(1)).toBe('number')
    expect(getValueType(true)).toBe('boolean')
    expect(getValueType(null)).toBe('null')
    expect(getValueType({})).toBe('object')
    expect(getValueType([])).toBe('array')
  })
})

describe('stringifyPretty', () => {
  it('pretty prints JSON', () => {
    const result = stringifyPretty({ a: 1 })
    expect(result).toBe('{\n  "a": 1\n}')
  })
})
