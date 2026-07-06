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
  for (let start = 0; start < snippet.length; start += 1) {
    const candidate = snippet.slice(start)
    const index = input.indexOf(candidate)
    if (index !== -1) {
      const commaIndex = candidate.lastIndexOf(',')
      if (commaIndex !== -1) {
        return index + commaIndex
      }
      return index + candidate.length - 1
    }
  }
  return -1
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

  const snippetMatch = message.match(/\.\.\.([\s\S]+)" is not valid JSON/)
  if (snippetMatch?.[1]) {
    const index = findSnippetIndex(snippetMatch[1], input)
    if (index !== -1) {
      return index
    }
  }

  return 0
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
        message,
        line,
        column,
        character,
      },
    }
  }
}
