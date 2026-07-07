import { parseJson, formatParseErrorMessage } from '@/lib/parseJson'
import type { FixDiagnostic, ValidationResult } from '@/types/fixer'

/** Map common SyntaxError messages to plain-English hints. */
function getFriendlyHint(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('trailing comma') || lower.includes("unexpected token ']'") || lower.includes("unexpected token '}'")) {
    return 'There may be a trailing comma before a closing bracket or brace.'
  }
  if (lower.includes('expected property name') || lower.includes('unexpected token')) {
    return 'A key or value may be missing quotes, or there is an unexpected character.'
  }
  if (lower.includes('unterminated string')) {
    return 'A string is missing its closing quote.'
  }
  if (lower.includes('expected') && lower.includes('after property')) {
    return 'A comma may be missing between properties.'
  }
  if (lower.includes('empty')) {
    return 'The input is empty — paste or type JSON to validate.'
  }

  return 'Check the syntax near the indicated position.'
}

export function validateJson(input: string): ValidationResult {
  const result = parseJson(input)

  if (result.ok) {
    return { ok: true, data: result.data }
  }

  const cleanMessage = formatParseErrorMessage(result.error.message)

  const diagnostic: FixDiagnostic = {
    message: cleanMessage,
    line: result.error.line,
    column: result.error.column,
    char: result.error.character,
    hint: getFriendlyHint(result.error.message),
  }

  return { ok: false, error: diagnostic }
}
