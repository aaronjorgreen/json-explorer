import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearFixHistory,
  deleteFixAttempt,
  loadFixHistory,
  saveFixAttempt,
} from '@/lib/fixer/storageFixHistory'
import type { FixAttempt, RepairResult } from '@/types/fixer'

const HISTORY_CHANGED_EVENT = 'structra:fixer-history-changed'

export interface UseFixerHistoryResult {
  history: FixAttempt[]
  activeAttemptId: string | null
  recordAttempt: (input: string, result: RepairResult, wasValidInitially: boolean) => void
  reopenAttempt: (id: string) => FixAttempt | null
  deleteAttempt: (id: string) => void
  clearAll: () => void
  setActiveAttemptId: (id: string | null) => void
}

export function useFixerHistory(): UseFixerHistoryResult {
  const [history, setHistory] = useState<FixAttempt[]>(() => loadFixHistory())
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setHistory(loadFixHistory())
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(HISTORY_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(HISTORY_CHANGED_EVENT, refresh)
  }, [refresh])

  const recordAttempt = useCallback((
    input: string,
    result: RepairResult,
    wasValidInitially: boolean,
  ) => {
    const attempt: FixAttempt = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      originalInput: input,
      fixedOutput: result.output,
      wasValidInitially,
      success: result.success,
      errorsBefore: result.errorsBefore,
      errorsAfter: result.errorsAfter,
      changes: result.changes,
    }
    saveFixAttempt(attempt)
    setActiveAttemptId(attempt.id)
    refresh()
  }, [refresh])

  const reopenAttempt = useCallback((id: string) => {
    const attempt = history.find((item) => item.id === id) ?? null
    if (attempt) {
      setActiveAttemptId(id)
    }
    return attempt
  }, [history])

  const deleteAttempt = useCallback((id: string) => {
    deleteFixAttempt(id)
    setActiveAttemptId((current) => (current === id ? null : current))
    refresh()
  }, [refresh])

  const clearAll = useCallback(() => {
    clearFixHistory()
    setActiveAttemptId(null)
    refresh()
  }, [refresh])

  return useMemo(
    () => ({
      history,
      activeAttemptId,
      recordAttempt,
      reopenAttempt,
      deleteAttempt,
      clearAll,
      setActiveAttemptId,
    }),
    [history, activeAttemptId, recordAttempt, reopenAttempt, deleteAttempt, clearAll],
  )
}

/** Lightweight hook for sidebar history badge count. */
export function useFixerHistoryCount(): number {
  const [count, setCount] = useState(() => loadFixHistory().length)

  useEffect(() => {
    const refresh = () => setCount(loadFixHistory().length)
    refresh()
    window.addEventListener(HISTORY_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(HISTORY_CHANGED_EVENT, refresh)
  }, [])

  return count
}
