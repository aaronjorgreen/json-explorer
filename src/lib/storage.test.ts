import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearStoredJson, loadJson, saveJson, STORAGE_KEY } from './storage'

describe('storage', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves and loads JSON', () => {
    saveJson('{"a":1}')
    expect(loadJson()).toBe('{"a":1}')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{"a":1}')
  })

  it('returns null when empty', () => {
    expect(loadJson()).toBeNull()
  })

  it('clears stored JSON', () => {
    saveJson('{"a":1}')
    clearStoredJson()
    expect(loadJson()).toBeNull()
  })

  it('fails silently when localStorage throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(() => saveJson('{"a":1}')).not.toThrow()
    expect(warnSpy).toHaveBeenCalled()
  })

  it('returns null when load throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('private mode')
    })

    expect(loadJson()).toBeNull()
    expect(warnSpy).toHaveBeenCalled()
  })
})
