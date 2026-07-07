import type { RepairChange } from '@/types/fixer'

interface RuleResult {
  output: string
  changes: RepairChange[]
}

/**
 * Find positions of all string literals in the input so repair rules
 * can avoid modifying content inside strings.
 */
function getStringRanges(input: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  let i = 0
  while (i < input.length) {
    if (input[i] === '"') {
      const start = i
      i++ // skip opening quote
      while (i < input.length) {
        if (input[i] === '\\') {
          i += 2 // skip escaped character
          continue
        }
        if (input[i] === '"') {
          i++ // skip closing quote
          break
        }
        i++
      }
      ranges.push([start, i])
    } else {
      i++
    }
  }
  return ranges
}

function isInsideString(pos: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => pos > start && pos < end)
}

/** Rule 1: Trim and normalize line endings. */
export function normalizeWhitespace(input: string): RuleResult {
  const trimmed = input.trim()
  const normalized = trimmed.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const changed = normalized !== input

  return {
    output: normalized,
    changes: changed
      ? [{ rule: 'normalize_whitespace', count: 1, confidence: 'high', notes: 'Trimmed whitespace and normalized line endings' }]
      : [],
  }
}

/** Rule 2: Remove trailing commas before } and ]. */
export function removeTrailingCommas(input: string): RuleResult {
  const stringRanges = getStringRanges(input)
  let output = ''
  let count = 0
  let i = 0

  while (i < input.length) {
    if (input[i] === ',' && !isInsideString(i, stringRanges)) {
      // Look ahead past whitespace/newlines for } or ]
      let j = i + 1
      while (j < input.length && /\s/.test(input[j])) j++

      if (j < input.length && (input[j] === '}' || input[j] === ']')) {
        // Skip the trailing comma
        count++
        i++
        continue
      }
    }
    output += input[i]
    i++
  }

  return {
    output,
    changes: count > 0
      ? [{ rule: 'remove_trailing_commas', count, confidence: 'high', notes: `Removed ${count} trailing comma${count > 1 ? 's' : ''}` }]
      : [],
  }
}

/** Rule 3: Quote unquoted object keys. */
export function quoteObjectKeys(input: string): RuleResult {
  const stringRanges = getStringRanges(input)
  let count = 0

  // Match unquoted keys: word characters followed by optional whitespace and colon
  // Only replace when NOT inside a string
  const output = input.replace(
    /(?<=[\{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g,
    (match, key: string, colon: string, offset: number) => {
      if (isInsideString(offset, stringRanges)) {
        return match
      }
      count++
      return `"${key}"${colon}`
    },
  )

  return {
    output,
    changes: count > 0
      ? [{ rule: 'quote_object_keys', count, confidence: 'high', notes: `Quoted ${count} unquoted key${count > 1 ? 's' : ''}` }]
      : [],
  }
}

/** Rule 4: Insert missing commas between adjacent properties/values. */
export function insertMissingCommas(input: string): RuleResult {
  const stringRanges = getStringRanges(input)
  let count = 0

  // Pattern: value ending (string, number, true, false, null, }, ]) followed by
  // whitespace/newline then a new value starting (" for strings, { for objects,
  // [ for arrays, digits, or identifier-like tokens for true/false/null)
  const output = input.replace(
    /(["}\]\d]|true|false|null)(\s*\n\s*)(["{\[\da-zA-Z_$])/g,
    (match, before: string, whitespace: string, after: string, offset: number) => {
      // Check end of 'before' and start of 'after' aren't inside strings
      if (isInsideString(offset, stringRanges)) {
        return match
      }

      // Don't insert comma between a key and its colon (handled by quoteObjectKeys)
      const afterOffset = offset + before.length + whitespace.length
      const restAfter = input.slice(afterOffset)
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/.test(restAfter)) {
        // This could be an unquoted key — don't insert comma
        count++
        return `${before},${whitespace}${after}`
      }
      if (/^"[^"]*"\s*:/.test(restAfter)) {
        // This is a quoted key starting a new property — insert comma
        count++
        return `${before},${whitespace}${after}`
      }

      // For other value starts, insert comma
      count++
      return `${before},${whitespace}${after}`
    },
  )

  return {
    output,
    changes: count > 0
      ? [{ rule: 'insert_missing_commas', count, confidence: 'medium', notes: `Inserted ${count} missing comma${count > 1 ? 's' : ''}` }]
      : [],
  }
}
