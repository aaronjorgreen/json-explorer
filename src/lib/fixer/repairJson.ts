import type { FixDiagnostic, RepairChange, RepairResult } from '@/types/fixer'
import { parseJson } from '@/lib/parseJson'
import { normalizeWhitespace, removeTrailingCommas, quoteObjectKeys, insertMissingCommas } from '@/lib/fixer/repairRules'

function toDiagnostic(error: { message: string; line: number; column: number; character: number }): FixDiagnostic {
  return {
    message: error.message,
    line: error.line,
    column: error.column,
    char: error.character,
  }
}

/**
 * Attempt to repair malformed JSON through a staged pipeline.
 *
 * Pipeline:
 * 1. Try strict parse — if valid, return pretty-formatted output.
 * 2. Run repair stages in order, re-parsing after each.
 * 3. Stop on first successful parse.
 * 4. If all stages fail, return failure with remaining errors.
 *
 * Safety: Never eval input. Never modify string literal contents.
 */
export function repairJson(input: string): RepairResult {
  // Capture initial parse errors
  const initialParse = parseJson(input)
  const errorsBefore: FixDiagnostic[] = initialParse.ok
    ? []
    : [toDiagnostic(initialParse.error)]

  // If already valid, just pretty-format
  if (initialParse.ok) {
    const prettyOutput = JSON.stringify(initialParse.data, null, 2)
    const changes: RepairChange[] = prettyOutput !== input.trim()
      ? [{ rule: 'pretty_format', count: 1, confidence: 'high', notes: 'Formatted as pretty JSON' }]
      : []

    return {
      success: true,
      output: prettyOutput,
      changes,
      errorsBefore: [],
      errorsAfter: [],
    }
  }

  // Run repair stages in order
  const stages = [
    normalizeWhitespace,
    removeTrailingCommas,
    quoteObjectKeys,
    insertMissingCommas,
  ] as const

  const allChanges: RepairChange[] = []
  let current = input

  for (const stage of stages) {
    const result = stage(current)

    if (result.changes.length > 0) {
      allChanges.push(...result.changes)
      current = result.output

      // Try parsing after this stage
      const parseAttempt = parseJson(current)
      if (parseAttempt.ok) {
        // Success! Pretty-format the result
        const prettyOutput = JSON.stringify(parseAttempt.data, null, 2)
        allChanges.push({
          rule: 'pretty_format',
          count: 1,
          confidence: 'high',
          notes: 'Formatted as pretty JSON',
        })

        return {
          success: true,
          output: prettyOutput,
          changes: allChanges,
          errorsBefore,
          errorsAfter: [],
        }
      }
    }
  }

  // All stages applied but still invalid — try a final parse
  const finalParse = parseJson(current)
  if (finalParse.ok) {
    const prettyOutput = JSON.stringify(finalParse.data, null, 2)
    allChanges.push({
      rule: 'pretty_format',
      count: 1,
      confidence: 'high',
      notes: 'Formatted as pretty JSON',
    })

    return {
      success: true,
      output: prettyOutput,
      changes: allChanges,
      errorsBefore,
      errorsAfter: [],
    }
  }

  // Failed to repair
  return {
    success: false,
    output: null,
    changes: allChanges,
    errorsBefore,
    errorsAfter: [toDiagnostic(finalParse.error)],
  }
}
