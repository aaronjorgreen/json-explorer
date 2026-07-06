import { useEffect } from 'react'
import { useSearch } from '@/hooks/useSearch'

export function SearchScrollEffect() {
  const { currentMatch } = useSearch()

  useEffect(() => {
    if (!currentMatch) return
    const element = document.querySelector(`[data-path="${CSS.escape(currentMatch.path)}"]`)
    element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentMatch])

  return null
}
