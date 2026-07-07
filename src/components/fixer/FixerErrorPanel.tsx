import { AlertTriangle } from 'lucide-react'
import type { FixDiagnostic } from '@/types/fixer'

interface FixerErrorPanelProps {
  error: FixDiagnostic
  onJumpToError?: () => void
}

export function FixerErrorPanel({ error, onJumpToError }: FixerErrorPanelProps) {
  return (
    <div
      role="alert"
      className="rounded-input border border-red-500/30 bg-red-500/5 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-red-300">
            {error.message}
          </p>

          {(error.line != null || error.column != null || error.char != null) && (
            <p className="font-mono text-xs text-red-400/80">
              {error.line != null && `Line ${error.line}`}
              {error.column != null && `, Column ${error.column}`}
              {error.char != null && ` (char ${error.char})`}
            </p>
          )}

          {error.hint && (
            <p className="text-xs text-text-secondary">
              💡 {error.hint}
            </p>
          )}

          {onJumpToError && error.line != null && (
            <button
              type="button"
              onClick={onJumpToError}
              className="text-xs text-accent-light underline underline-offset-2 hover:text-accent transition-colors"
            >
              Jump to error line
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
