const STORAGE_KEY = 'structra:last-json'

export function saveJson(raw: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, raw)
  } catch (error) {
    console.warn('Failed to save JSON to localStorage:', error)
  }
}

export function loadJson(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to load JSON from localStorage:', error)
    return null
  }
}

export function clearStoredJson(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear JSON from localStorage:', error)
  }
}

export { STORAGE_KEY }
