import { Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FixerOutputProps {
  output: string | null
  isSuccess: boolean
  onCopy: () => void
  onOpenInExplorer?: () => void
  lineCount: number
  charCount: number
}

export function FixerOutput({
  output,
  isSuccess,
  onCopy,
  onOpenInExplorer,
  lineCount,
  charCount,
}: FixerOutputProps) {
  const hasOutput = Boolean(output)

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col rounded-input border bg-base ${
        isSuccess ? 'border-accent/50 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]' : 'border-border'
      }`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-surface/80 px-3 py-2 backdrop-blur-sm">
        <h2 className="text-sm font-medium text-text-primary">Output</h2>
        <div className="flex items-center gap-2">
          {hasOutput && (
            <span className="hidden text-xs text-text-muted sm:inline">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {charCount.toLocaleString()} chars
            </span>
          )}
          <Button
            variant="secondary"
            disabled={!hasOutput}
            onClick={onCopy}
            className="text-xs"
            aria-label="Copy repaired JSON"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy
          </Button>
          {onOpenInExplorer && (
            <Button
              variant="primary"
              disabled={!hasOutput}
              onClick={onOpenInExplorer}
              className="text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Open in Explorer</span>
              <span className="sm:hidden">Explorer</span>
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-[160px] flex-1 overflow-auto p-4">
        {hasOutput ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-text-primary">
            {output}
          </pre>
        ) : (
          <p className="text-sm text-text-muted">
            Repaired JSON will appear here after a successful fix.
          </p>
        )}
      </div>
    </div>
  )
}
