import type { FixAttempt } from '@/types/fixer'

const STORAGE_KEY = 'structra:fixer-history:v1'
const MAX_ENTRIES = 20

function notifyHistoryChanged(): void {
  window.dispatchEvent(new CustomEvent('structra:fixer-history-changed'))
}

export function saveFixAttempt(attempt: FixAttempt): void {
  try {
    const existing = loadFixHistory()
    const updated = [attempt, ...existing.filter((item) => item.id !== attempt.id)].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    notifyHistoryChanged()
  } catch (error) {
    console.warn('Failed to save fix history:', error)
  }
}

export function loadFixHistory(): FixAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FixAttempt[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Failed to load fix history:', error)
    return []
  }
}

export function deleteFixAttempt(id: string): void {
  try {
    const updated = loadFixHistory().filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    notifyHistoryChanged()
  } catch (error) {
    console.warn('Failed to delete fix attempt:', error)
  }
}

export function clearFixHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    notifyHistoryChanged()
  } catch (error) {
    console.warn('Failed to clear fix history:', error)
  }
}

export { STORAGE_KEY, MAX_ENTRIES }
