import type { JsonPrimitive, JsonValueType } from '@/types/json'

const MAX_PREVIEW_LENGTH = 80

export function getValueType(value: unknown): JsonValueType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  return 'string'
}

export function formatValue(value: JsonPrimitive): string {
  if (value === null) return 'null'
  if (typeof value === 'string') {
    const quoted = `"${value}"`
    if (quoted.length > MAX_PREVIEW_LENGTH) {
      return `"${value.slice(0, MAX_PREVIEW_LENGTH - 4)}…"`
    }
    return quoted
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

export function stringifyPretty(data: unknown): string {
  return JSON.stringify(data, null, 2)
}
