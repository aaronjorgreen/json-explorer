import { useCallback, useEffect, useRef, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { Header } from '@/components/header/Header'
import { InputPanel } from '@/components/input/InputPanel'
import { ExplorerPanel } from '@/components/explorer/ExplorerPanel'

const MIN_PANEL_PERCENT = 25
const MAX_PANEL_PERCENT = 60
const DEFAULT_INPUT_PERCENT = 40

interface MainLayoutProps {
  onClearAll?: () => void
}

export function MainLayout({ onClearAll }: MainLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputPercent, setInputPercent] = useState(DEFAULT_INPUT_PERCENT)
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const nextPercent = ((event.clientX - rect.left) / rect.width) * 100
      setInputPercent(Math.min(MAX_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, nextPercent)))
    },
    [],
  )

  const stopDragging = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
    }
  }, [handlePointerMove, isDragging, stopDragging])

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
        <div
          ref={containerRef}
          className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-0"
        >
          <div
            className="min-h-[240px] min-w-0 shrink-0 lg:min-h-0"
            style={{ flexBasis: `${inputPercent}%` }}
          >
            <InputPanel onClearAll={onClearAll} />
          </div>

          <div
            className="hidden w-3 shrink-0 items-stretch justify-center lg:flex"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels"
          >
            <button
              type="button"
              aria-label="Drag to resize panels"
              onPointerDown={() => setIsDragging(true)}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-input text-text-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${isDragging ? 'bg-surface text-accent' : ''}`}
            >
              <GripVertical className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-[320px] min-w-0 flex-1 lg:min-h-0">
            <ExplorerPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
