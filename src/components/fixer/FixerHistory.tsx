import { CheckCircle2, History, Trash2, XCircle } from 'lucide-react'
import type { FixAttempt } from '@/types/fixer'

interface FixerHistoryProps {
  history: FixAttempt[]
  activeAttemptId: string | null
  onReopen: (id: string) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function previewSnippet(input: string): string {
  const compact = input.replace(/\s+/g, ' ').trim()
  return compact.length > 60 ? `${compact.slice(0, 60)}…` : compact
}

export function FixerHistory({
  history,
  activeAttemptId,
  onReopen,
  onDelete,
  onClearAll,
}: FixerHistoryProps) {
  const handleDelete = (id: string) => {
    if (window.confirm('Delete this repair from history?')) {
      onDelete(id)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Clear all repair history? This cannot be undone.')) {
      onClearAll()
    }
  }

  return (
    <div className="rounded-input border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <h3 className="text-sm font-medium text-text-primary">History</h3>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-text-muted transition-colors hover:text-red-400"
          >
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="p-4 text-sm text-text-muted">No repairs yet</p>
      ) : (
        <ul className="max-h-48 overflow-y-auto">
          {history.map((attempt) => {
            const isActive = attempt.id === activeAttemptId
            return (
              <li key={attempt.id}>
                <div
                  className={`flex items-start gap-2 border-b border-border/50 px-3 py-2 last:border-b-0 ${
                    isActive ? 'bg-accent/10' : 'hover:bg-base/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onReopen(attempt.id)}
                    className="flex min-w-0 flex-1 items-start gap-2 text-left"
                  >
                    {attempt.success ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-text-secondary">
                        {previewSnippet(attempt.originalInput)}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {formatRelativeTime(attempt.createdAt)}
                        {!attempt.success && attempt.errorsAfter[0] && (
                          <> · {attempt.errorsAfter[0].message}</>
                        )}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(attempt.id)}
                    className="shrink-0 rounded p-1 text-text-muted transition-colors hover:text-red-400"
                    aria-label="Delete repair"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
