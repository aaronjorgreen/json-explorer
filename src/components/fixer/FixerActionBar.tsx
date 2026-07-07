import { CheckCircle, RotateCcw, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { FixerStatus } from '@/types/fixer'

interface FixerActionBarProps {
  status: FixerStatus
  hasInput: boolean
  canUndo: boolean
  onValidate: () => void
  onFix: () => void
  onUndo: () => void
}

export function FixerActionBar({
  status,
  hasInput,
  canUndo,
  onValidate,
  onFix,
  onUndo,
}: FixerActionBarProps) {
  const isEmpty = !hasInput
  const isRepairing = status === 'repairing'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        disabled={isEmpty}
        onClick={onValidate}
        className="text-xs"
      >
        <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Validate
      </Button>

      <Button
        variant="primary"
        disabled={isEmpty || isRepairing}
        onClick={onFix}
        className="text-xs"
      >
        {isRepairing ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
        ) : (
          <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {status === 'valid' ? 'Normalize format' : 'Fix JSON'}
      </Button>

      <Button
        variant="ghost"
        disabled={!canUndo}
        onClick={onUndo}
        className="text-xs"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Undo fix
      </Button>
    </div>
  )
}
