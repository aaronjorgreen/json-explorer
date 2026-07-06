import { useEffect, useRef } from 'react'
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  Eraser,
  FileUp,
  Info,
  PenLine,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { useTreeActions } from '@/hooks/useTreeActions'
import { useToast } from '@/hooks/useToast'
import { stringifyPretty } from '@/lib/format'

interface HamburgerMenuProps {
  open: boolean
  onClose: () => void
  onOpenInput: () => void
  onUpload: () => void
  onClearAll: () => void
}

export function HamburgerMenu({
  open,
  onClose,
  onOpenInput,
  onUpload,
  onClearAll,
}: HamburgerMenuProps) {
  const { parseResult } = useJsonDocumentContext()
  const { actions } = useTreeActions()
  const { showToast } = useToast()
  const panelRef = useRef<HTMLDivElement>(null)
  const hasTree = parseResult?.ok === true

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleCopy = async () => {
    if (!parseResult?.ok) return
    try {
      await navigator.clipboard.writeText(stringifyPretty(parseResult.data))
      showToast('Copied to clipboard', 'success')
      onClose()
    } catch {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const menuItems = [
    { label: 'Edit JSON', icon: PenLine, onClick: () => { onOpenInput(); onClose() } },
    { label: 'Upload file', icon: FileUp, onClick: () => { onUpload(); onClose() } },
    { label: 'Copy JSON', icon: Copy, onClick: () => void handleCopy(), disabled: !hasTree },
    {
      label: 'Expand all',
      icon: ChevronsUpDown,
      onClick: () => { actions?.expandAll(); onClose() },
      disabled: !hasTree,
    },
    {
      label: 'Collapse all',
      icon: ChevronsDownUp,
      onClick: () => { actions?.collapseAll(); onClose() },
      disabled: !hasTree,
    },
    { label: 'Clear input', icon: Eraser, onClick: () => { onClearAll(); onClose() } },
    {
      label: 'About Structra',
      icon: Info,
      onClick: () => { showToast('Structra — See your JSON clearly', 'info'); onClose() },
    },
  ]

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-base/70 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <nav
        ref={panelRef}
        aria-label="Main menu"
        className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-border bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-text-primary">Menu</p>
          <Button variant="ghost" className="min-h-11 min-w-11 px-2" aria-label="Close menu" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <ul className="flex flex-col gap-1 p-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                disabled={item.disabled}
                onClick={item.onClick}
                className="flex min-h-11 w-full items-center gap-3 rounded-input px-3 text-left text-sm text-text-primary hover:bg-base disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <item.icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
