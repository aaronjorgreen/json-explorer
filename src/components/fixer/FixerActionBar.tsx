import { CheckCircle, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { FixerStatus } from '@/types/fixer'

interface FixerActionBarProps {
  status: FixerStatus
  hasInput: boolean
  onValidate: () => void
  onFix: () => void
}

export function FixerActionBar({ status, hasInput, onValidate, onFix }: FixerActionBarProps) {
  const isEmpty = !hasInput
  const isRepairing = status === 'repairing'

  return (
    <div className="flex items-center gap-2">
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
    </div>
  )
}
