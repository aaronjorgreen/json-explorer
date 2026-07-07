import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearFixHistory,
  deleteFixAttempt,
  loadFixHistory,
  MAX_ENTRIES,
  saveFixAttempt,
  STORAGE_KEY,
} from '@/lib/fixer/storageFixHistory'
import type { FixAttempt } from '@/types/fixer'

function makeAttempt(id: string): FixAttempt {
  return {
    id,
    createdAt: new Date().toISOString(),
    originalInput: `{"broken": ${id}}`,
    fixedOutput: `{"broken": "${id}"}`,
    wasValidInitially: false,
    success: true,
    errorsBefore: [],
    errorsAfter: [],
    changes: [],
  }
}

describe('storageFixHistory', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves and loads fix attempts', () => {
    const attempt = makeAttempt('1')
    saveFixAttempt(attempt)
    expect(loadFixHistory()).toEqual([attempt])
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
  })

  it('prepends newest attempts and prunes to max entries', () => {
    for (let i = 0; i < MAX_ENTRIES + 5; i++) {
      saveFixAttempt(makeAttempt(String(i)))
    }
    const history = loadFixHistory()
    expect(history).toHaveLength(MAX_ENTRIES)
    expect(history[0].id).toBe(String(MAX_ENTRIES + 4))
  })

  it('deletes a single attempt', () => {
    saveFixAttempt(makeAttempt('1'))
    saveFixAttempt(makeAttempt('2'))
    deleteFixAttempt('1')
    expect(loadFixHistory().map((item) => item.id)).toEqual(['2'])
  })

  it('clears all history', () => {
    saveFixAttempt(makeAttempt('1'))
    clearFixHistory()
    expect(loadFixHistory()).toEqual([])
  })

  it('fails silently when localStorage throws on save', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(() => saveFixAttempt(makeAttempt('1'))).not.toThrow()
    expect(warnSpy).toHaveBeenCalled()
  })

  it('returns empty array when load throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('private mode')
    })

    expect(loadFixHistory()).toEqual([])
    expect(warnSpy).toHaveBeenCalled()
  })
})
