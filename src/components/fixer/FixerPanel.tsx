import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { FixerEmptyState } from '@/components/fixer/FixerEmptyState'
import { FixerInput } from '@/components/fixer/FixerInput'
import { FixerStatusBar } from '@/components/fixer/FixerStatusBar'
import { FixerErrorPanel } from '@/components/fixer/FixerErrorPanel'
import { FixerActionBar } from '@/components/fixer/FixerActionBar'
import { FixerOutput } from '@/components/fixer/FixerOutput'
import { FixerSummary } from '@/components/fixer/FixerSummary'
import { useFixer } from '@/hooks/useFixer'
import { useToast } from '@/hooks/useToast'

interface FixerPanelProps {
  onOpenInExplorer?: (json: string) => void
}

export function FixerPanel({ onOpenInExplorer }: FixerPanelProps) {
  const fixer = useFixer()
  const { showToast } = useToast()
  const [outputExpanded, setOutputExpanded] = useState(false)

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
  const hasRepairWarnings = fixer.repairResult?.changes.some((c) => c.confidence === 'medium') ?? false
  const outputText = fixer.repairResult?.success ? fixer.repairResult.output : null
  const outputLineCount = outputText ? outputText.split('\n').length : 0
  const outputCharCount = outputText?.length ?? 0
  const isRepaired = fixer.status === 'repaired'
  const showOutput = isRepaired || outputExpanded

  useEffect(() => {
    if (isRepaired) {
      setOutputExpanded(true)
    }
  }, [isRepaired])

  const handleCopy = async () => {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
      showToast('Copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleOpenInExplorer = () => {
    if (!outputText || !onOpenInExplorer) return
    onOpenInExplorer(outputText)
    showToast('Opened in Explorer', 'success')
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Input panel — left on desktop */}
      <div className="flex min-h-0 flex-col gap-3 lg:w-[40%] lg:shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">Input</h2>
          <button
            type="button"
            onClick={fixer.clearInput}
            className="text-xs text-text-muted transition-colors hover:text-text-primary"
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FixerStatusBar
            status={fixer.status}
            lineCount={fixer.lineCount}
            charCount={fixer.charCount}
            hasWarnings={hasRepairWarnings}
          />
          <FixerActionBar
            status={fixer.status}
            hasInput={fixer.rawInput.trim().length > 0}
            canUndo={fixer.canUndo}
            onValidate={fixer.validateNow}
            onFix={fixer.fixJson}
            onUndo={fixer.undoFix}
          />
        </div>
      </div>

      {/* Diagnostics + summary — center on desktop */}
      <div className="flex min-h-0 flex-col gap-3 lg:w-[25%] lg:shrink-0">
        {errorDiag && <FixerErrorPanel error={errorDiag} />}

        {fixer.validationResult?.ok && fixer.status !== 'repaired' && (
          <div className="rounded-input border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-400">
              ✓ Valid JSON — no syntax errors detected.
            </p>
          </div>
        )}

        {fixer.repairResult && (
          <FixerSummary
            changes={fixer.repairResult.changes}
            inputLineCount={fixer.lineCount}
            inputCharCount={fixer.charCount}
            outputLineCount={outputLineCount}
            outputCharCount={outputCharCount}
          />
        )}
      </div>

      {/* Output panel — right on desktop, collapsible on mobile */}
      <div className="flex min-h-0 flex-col gap-2 lg:w-[35%] lg:shrink-0">
        <button
          type="button"
          className="flex items-center justify-between rounded-input border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary lg:hidden"
          onClick={() => setOutputExpanded((prev) => !prev)}
          aria-expanded={showOutput}
        >
          <span>Output {isRepaired ? '(ready)' : ''}</span>
          {showOutput ? (
            <ChevronUp className="h-4 w-4 text-text-muted" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
          )}
        </button>

        <div className={`min-h-0 flex-1 ${showOutput ? 'flex' : 'hidden lg:flex'}`}>
          <FixerOutput
            output={outputText}
            isSuccess={isRepaired}
            onCopy={handleCopy}
            onOpenInExplorer={onOpenInExplorer ? handleOpenInExplorer : undefined}
            lineCount={outputLineCount}
            charCount={outputCharCount}
          />
        </div>
      </div>
    </div>
  )
}
