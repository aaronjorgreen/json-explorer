import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { validateJson } from '@/lib/fixer/validateJson'
import { repairJson } from '@/lib/fixer/repairJson'
import type { FixAttempt, FixerStatus, ValidationResult, RepairResult } from '@/types/fixer'

export interface UseFixerResult {
  rawInput: string
  setRawInput: (value: string) => void
  status: FixerStatus
  validationResult: ValidationResult | null
  repairResult: RepairResult | null
  previousInput: string | null
  lineCount: number
  charCount: number
  validateNow: () => void
  fixJson: () => void
  undoFix: () => void
  clearInput: () => void
  restoreFromAttempt: (attempt: FixAttempt) => void
  canUndo: boolean
}

export function useFixer(): UseFixerResult {
  const [rawInput, setRawInputState] = useState('')
  const [status, setStatus] = useState<FixerStatus>('idle')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null)
  const [previousInput, setPreviousInput] = useState<string | null>(null)
  const debouncedInput = useDebouncedValue(rawInput, 300)

  const lineCount = rawInput ? rawInput.split('\n').length : 0
  const charCount = rawInput.length

  const runValidation = useCallback((input: string) => {
    if (!input.trim()) {
      setValidationResult(null)
      setStatus('idle')
      return
    }

    const result = validateJson(input)
    setValidationResult(result)
    setStatus(result.ok ? 'valid' : 'invalid')
  }, [])

  const validateNow = useCallback(() => {
    runValidation(rawInput)
  }, [rawInput, runValidation])

  // Debounced validation on input change
  useEffect(() => {
    runValidation(debouncedInput)
  }, [debouncedInput, runValidation])

  // Keyboard shortcut: Cmd/Ctrl+Enter to validate
  // Note: fixJson is referenced in the effect below but defined later via useCallback;
  // we store a ref to avoid stale closure issues.
  const fixJsonRef = useCallback(() => {
    if (!rawInput.trim()) return
    setStatus('repairing')
    setPreviousInput(rawInput)
    window.requestAnimationFrame(() => {
      const result = repairJson(rawInput)
      setRepairResult(result)
      if (result.success && result.output) {
        setStatus('repaired')
        const vr = validateJson(result.output)
        setValidationResult(vr)
      } else {
        setStatus('failed')
        if (result.errorsAfter.length > 0) {
          setValidationResult({ ok: false, error: result.errorsAfter[0] })
        } else {
          setValidationResult(validateJson(rawInput))
        }
      }
    })
  }, [rawInput])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        validateNow()
      }
      // Cmd/Ctrl+Shift+F to fix
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'f') {
        event.preventDefault()
        fixJsonRef()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [validateNow, fixJsonRef])

  const setRawInput = useCallback((value: string) => {
    setRawInputState(value)
    setRepairResult(null)
    setPreviousInput(null)
    if (!value.trim()) {
      setValidationResult(null)
      setStatus('idle')
    }
  }, [])

  const fixJson = useCallback(() => {
    if (!rawInput.trim()) return

    setStatus('repairing')
    setPreviousInput(rawInput)

    // Use requestAnimationFrame to let the UI show the spinner
    window.requestAnimationFrame(() => {
      const result = repairJson(rawInput)
      setRepairResult(result)

      if (result.success && result.output) {
        setStatus('repaired')
        const vr = validateJson(result.output)
        setValidationResult(vr)
      } else {
        setStatus('failed')
        if (result.errorsAfter.length > 0) {
          setValidationResult({ ok: false, error: result.errorsAfter[0] })
        } else {
          setValidationResult(validateJson(rawInput))
        }
      }
    })
  }, [rawInput])

  const undoFix = useCallback(() => {
    if (previousInput !== null) {
      setRawInputState(previousInput)
      setPreviousInput(null)
      setRepairResult(null)
      // Re-validate the restored input
      const result = validateJson(previousInput)
      setValidationResult(result)
      setStatus(result.ok ? 'valid' : 'invalid')
    }
  }, [previousInput])

  const canUndo = previousInput !== null

  const clearInput = useCallback(() => {
    setRawInputState('')
    setValidationResult(null)
    setRepairResult(null)
    setPreviousInput(null)
    setStatus('idle')
  }, [])

  const restoreFromAttempt = useCallback((attempt: FixAttempt) => {
    setRawInputState(attempt.originalInput)
    setPreviousInput(null)
    setRepairResult({
      success: attempt.success,
      output: attempt.fixedOutput,
      changes: attempt.changes,
      errorsBefore: attempt.errorsBefore,
      errorsAfter: attempt.errorsAfter,
    })

    if (attempt.success && attempt.fixedOutput) {
      setStatus('repaired')
      setValidationResult(validateJson(attempt.fixedOutput))
    } else if (attempt.errorsAfter.length > 0) {
      setStatus('failed')
      setValidationResult({ ok: false, error: attempt.errorsAfter[0] })
    } else {
      const result = validateJson(attempt.originalInput)
      setValidationResult(result)
      setStatus(result.ok ? 'valid' : 'invalid')
    }
  }, [])

  return useMemo(
    () => ({
      rawInput,
      setRawInput,
      status,
      validationResult,
      repairResult,
      previousInput,
      lineCount,
      charCount,
      validateNow,
      fixJson,
      undoFix,
      clearInput,
      restoreFromAttempt,
      canUndo,
    }),
    [rawInput, setRawInput, status, validationResult, repairResult, previousInput, lineCount, charCount, validateNow, fixJson, undoFix, clearInput, restoreFromAttempt, canUndo],
  )
}
