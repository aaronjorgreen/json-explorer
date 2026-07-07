import type { FixDiagnostic, RepairChange, RepairConfidence, RepairResult } from '@/types/fixer'
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

interface RepairStage {
  apply: (input: string) => { output: string; changes: RepairChange[] }
  confidence: RepairConfidence
}

const REPAIR_STAGES: RepairStage[] = [
  { apply: normalizeWhitespace, confidence: 'high' },
  { apply: removeTrailingCommas, confidence: 'high' },
  { apply: quoteObjectKeys, confidence: 'high' },
  { apply: insertMissingCommas, confidence: 'medium' },
]

/**
 * Attempt to repair malformed JSON through a staged pipeline.
 *
 * Pipeline:
 * 1. Try strict parse — if valid, return pretty-formatted output.
 * 2. Run repair stages in order, re-parsing after each.
 * 3. Stop on first successful parse.
 * 4. Skip low-confidence stages (safety threshold).
 * 5. If all stages fail, return failure with remaining errors.
 *
 * Safety: Never eval input. Never modify string literal contents.
 */
export function repairJson(input: string): RepairResult {
  const initialParse = parseJson(input)
  const errorsBefore: FixDiagnostic[] = initialParse.ok
    ? []
    : [toDiagnostic(initialParse.error)]

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

  const allChanges: RepairChange[] = []
  let current = input

  for (const stage of REPAIR_STAGES) {
    // Halt before applying low-confidence transforms
    if (stage.confidence === 'low') {
      continue
    }

    const result = stage.apply(current)
    if (result.changes.length > 0) {
      allChanges.push(...result.changes)
    }
    current = result.output

    const parseAttempt = parseJson(current)
    if (parseAttempt.ok) {
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

  return {
    success: false,
    output: null,
    changes: allChanges,
    errorsBefore,
    errorsAfter: [toDiagnostic(finalParse.error)],
  }
}
