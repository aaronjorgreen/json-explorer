import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { validateJson } from '@/lib/fixer/validateJson'
import type { FixerStatus, ValidationResult, RepairResult } from '@/types/fixer'

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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        validateNow()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [validateNow])

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
    // Stub for Phase C — will be wired to repairJson
    void 0
  }, [])

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
      canUndo,
    }),
    [rawInput, setRawInput, status, validationResult, repairResult, previousInput, lineCount, charCount, validateNow, fixJson, undoFix, clearInput, canUndo],
  )
}
