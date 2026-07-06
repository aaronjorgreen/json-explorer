import { useCallback, useEffect, useRef, useState } from 'react'
import { GripVertical, PenLine } from 'lucide-react'
import { Header } from '@/components/header/Header'
import { HamburgerMenu } from '@/components/header/HamburgerMenu'
import { InputPanel } from '@/components/input/InputPanel'
import { MobileInputDrawer } from '@/components/input/MobileInputDrawer'
import { ExplorerPanel } from '@/components/explorer/ExplorerPanel'
import { Button } from '@/components/ui/Button'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'

const MIN_PANEL_PERCENT = 25
const MAX_PANEL_PERCENT = 60
const DEFAULT_INPUT_PERCENT = 40

interface MainLayoutProps {
  onClearAll?: () => void
}

export function MainLayout({ onClearAll }: MainLayoutProps) {
  const { loadFromFile } = useJsonDocumentContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputPercent, setInputPercent] = useState(DEFAULT_INPUT_PERCENT)
  const [isDragging, setIsDragging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [inputDrawerOpen, setInputDrawerOpen] = useState(false)

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
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.item(0)
          if (file) {
            void loadFromFile(file)
          }
          event.target.value = ''
        }}
      />

      <Header onOpenMenu={() => setMenuOpen(true)} />

      <main className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
        <div className="mb-3 flex lg:hidden">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setInputDrawerOpen(true)}
          >
            <PenLine className="h-4 w-4" aria-hidden="true" />
            Edit JSON
          </Button>
        </div>

        <div
          ref={containerRef}
          className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-0"
        >
          <div
            className="hidden min-h-[240px] min-w-0 shrink-0 lg:block lg:min-h-0"
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

      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenInput={() => setInputDrawerOpen(true)}
        onUpload={() => fileInputRef.current?.click()}
        onClearAll={() => onClearAll?.()}
      />

      <MobileInputDrawer
        open={inputDrawerOpen}
        onClose={() => setInputDrawerOpen(false)}
        onClearAll={onClearAll}
      />
    </div>
  )
}
