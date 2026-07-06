export interface ParseError {
  message: string
  line: number
  column: number
  character: number
}

export type ParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: ParseError }

function getLineColumn(input: string, index: number): { line: number; column: number } {
  const safeIndex = Math.max(0, Math.min(index, input.length))
  const before = input.slice(0, safeIndex)
  const lines = before.split('\n')
  const line = lines.length
  const column = (lines.at(-1)?.length ?? 0) + 1
  return { line, column }
}

function findSnippetIndex(snippet: string, input: string): number {
  let bestMatch: { index: number; candidate: string } | null = null

  for (let start = 0; start < snippet.length; start += 1) {
    const candidate = snippet.slice(start)
    if (candidate.length < 4) continue

    const index = input.indexOf(candidate)
    if (index === -1) continue

    if (!bestMatch || candidate.length > bestMatch.candidate.length) {
      bestMatch = { index, candidate }
    }
  }

  if (!bestMatch) return -1

  const { index, candidate } = bestMatch
  const trailingComma = candidate.lastIndexOf(',')
  const closingBracket = candidate.lastIndexOf(']')

  if (trailingComma !== -1 && (closingBracket === -1 || trailingComma < closingBracket)) {
    return index + trailingComma
  }

  if (closingBracket !== -1) {
    return index + closingBracket
  }

  return index + candidate.length - 1
}

function findTrailingCommaPosition(input: string): number {
  const match = input.match(/,\s*(?=[\]\}])/)
  return match?.index ?? -1
}

function extractPosition(message: string, input: string): number {
  const positionMatch = message.match(/position\s+(\d+)/i)
  if (positionMatch?.[1]) {
    return Number.parseInt(positionMatch[1], 10)
  }

  const atMatch = message.match(/at\s+(\d+)/i)
  if (atMatch?.[1]) {
    return Number.parseInt(atMatch[1], 10)
  }

  const snippetPatterns = [
    /\.\.\.([\s\S]+?)\.\.\. is not valid JSON/,
    /\.\.\.([\s\S]+)" is not valid JSON/,
  ]

  for (const pattern of snippetPatterns) {
    const snippetMatch = message.match(pattern)
    if (snippetMatch?.[1]) {
      const index = findSnippetIndex(snippetMatch[1], input)
      if (index !== -1) {
        return index
      }

      const arrayMatch = snippetMatch[1].match(/\[[^\]]*,\s*\]/)
      if (arrayMatch) {
        const arrayIndex = input.indexOf(arrayMatch[0])
        if (arrayIndex !== -1) {
          const commaInArray = arrayMatch[0].lastIndexOf(',')
          return arrayIndex + commaInArray
        }
      }
    }
  }

  if (message.includes("Unexpected token ']'") || message.includes('Unexpected token "]"')) {
    const trailingComma = findTrailingCommaPosition(input)
    if (trailingComma !== -1) {
      return trailingComma
    }
  }

  return 0
}

/** Strip V8 snippet noise for cleaner UI display. */
export function formatParseErrorMessage(message: string): string {
  const tokenMatch = message.match(/^Unexpected token '([^']+)'/)
  if (tokenMatch) {
    return `Unexpected token '${tokenMatch[1]}'`
  }

  const expectedMatch = message.match(/^(Expected .+?) in JSON/)
  if (expectedMatch) {
    return expectedMatch[1]
  }

  const beforeSnippet = message.split('...')[0]?.trim()
  return beforeSnippet.length > 0 ? beforeSnippet : message
}

export function parseJson(input: string): ParseResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      error: {
        message: 'JSON input is empty',
        line: 1,
        column: 1,
        character: 0,
      },
    }
  }

  try {
    const data: unknown = JSON.parse(input)
    return { ok: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON'
    const character = extractPosition(message, input)
    const { line, column } = getLineColumn(input, character)

    return {
      ok: false,
      error: {
        message: formatParseErrorMessage(message),
        line,
        column,
        character,
      },
    }
  }
}
