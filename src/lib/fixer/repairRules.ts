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
  let count = 0

  const output = input.replace(
    /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g,
    (match, key: string, colon: string, offset: number) => {
      const ranges = getStringRanges(input)
      if (isInsideString(offset, ranges)) {
        return match
      }
      if (key === 'true' || key === 'false' || key === 'null') {
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
  let count = 0

  const patterns: Array<{ regex: RegExp }> = [
    { regex: /("(?:[^"\\]|\\.)*")(\s*\n\s*)(?=["{[\d])/g },
    { regex: /(\d+(?:\.\d+)?)(\s*\n\s*)(?=["{[\d])/g },
    { regex: /\b(true|false|null)\b(\s*\n\s*)(?=["{[\d])/g },
    { regex: /([}\]])(\s*\n\s*)(?=["{[\d])/g },
  ]

  let output = input

  for (const { regex } of patterns) {
    const currentRanges = getStringRanges(output)
    output = output.replace(regex, (match, before: string, whitespace: string, offset: number) => {
      if (isInsideString(offset, currentRanges)) {
        return match
      }

      if (before.startsWith('"')) {
        const afterOffset = offset + match.length
        if (/^\s*:/.test(output.slice(afterOffset))) {
          return match
        }
      }

      count++
      return `${before},${whitespace}`
    })
  }

  return {
    output,
    changes: count > 0
      ? [{ rule: 'insert_missing_commas', count, confidence: 'medium', notes: `Inserted ${count} missing comma${count > 1 ? 's' : ''}` }]
      : [],
  }
}
