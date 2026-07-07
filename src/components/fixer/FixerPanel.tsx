import { FixerEmptyState } from '@/components/fixer/FixerEmptyState'
import { FixerInput } from '@/components/fixer/FixerInput'
import { FixerStatusBar } from '@/components/fixer/FixerStatusBar'
import { FixerErrorPanel } from '@/components/fixer/FixerErrorPanel'
import { FixerActionBar } from '@/components/fixer/FixerActionBar'
import { useFixer } from '@/hooks/useFixer'

interface FixerPanelProps {
  onOpenInExplorer?: (json: string) => void
}

export function FixerPanel({ onOpenInExplorer: _onOpenInExplorer }: FixerPanelProps) {
  const fixer = useFixer()

  const handleLoadSample = (sample: string) => {
    fixer.setRawInput(sample)
  }

  if (!fixer.rawInput.trim() && fixer.status === 'idle') {
    return (
      <div className="flex h-full flex-col rounded-card border border-border bg-surface">
        <FixerEmptyState onLoadSample={handleLoadSample} />
      </div>
    )
  }

  const vr = fixer.validationResult
  const errorDiag = vr && !vr.ok ? vr.error : null

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Input panel — left on desktop, full-width stacked on mobile */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:max-w-[45%]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">Input</h2>
          <button
            type="button"
            onClick={fixer.clearInput}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Clear
          </button>
        </div>

        <FixerInput
          value={fixer.rawInput}
          onChange={fixer.setRawInput}
          errorLine={errorDiag?.line}
          lineCount={fixer.lineCount}
        />

        <div className="flex items-center justify-between gap-3">
          <FixerStatusBar
            status={fixer.status}
            lineCount={fixer.lineCount}
            charCount={fixer.charCount}
          />
          <FixerActionBar
            status={fixer.status}
            hasInput={fixer.rawInput.trim().length > 0}
            onValidate={fixer.validateNow}
            onFix={fixer.fixJson}
          />
        </div>
      </div>

      {/* Diagnostics / center panel */}
      <div className="flex min-h-0 flex-col gap-3 lg:flex-1">
        {errorDiag && (
          <FixerErrorPanel error={errorDiag} />
        )}

        {fixer.validationResult?.ok && (
          <div className="rounded-input border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-400">
              ✓ Valid JSON — no syntax errors detected.
            </p>
          </div>
        )}

        {/* Output panel placeholder — Phase D will add FixerOutput and FixerSummary here */}
      </div>
    </div>
  )
}
