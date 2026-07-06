import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface JumpToTopFabProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>
}

export function JumpToTopFab({ scrollContainerRef }: JumpToTopFabProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      setVisible(container.scrollTop > 400)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef])

  if (!visible) return null

  return (
    <Button
      variant="primary"
      className="absolute bottom-4 right-4 z-10 min-h-11 min-w-11 rounded-full shadow-lg"
      aria-label="Jump to top"
      onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </Button>
  )
}
