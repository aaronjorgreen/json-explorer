import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const SAMPLE_BROKEN_JSON = `{
  name: "Structra",
  version: 1.0,
  features: [
    "explorer",
    "fixer",
  ],
  settings: {
    theme: "dark"
    fontSize: 14
  }
}`

interface FixerEmptyStateProps {
  onLoadSample: (sample: string) => void
}

export function FixerEmptyState({ onLoadSample }: FixerEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Sparkles className="h-8 w-8 text-accent" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">
          Repair broken JSON
        </h2>
        <p className="text-sm text-text-secondary">
          Paste malformed JSON to validate it, auto-fix common syntax errors, and copy clean parseable output.
        </p>
      </div>
      <Button
        variant="primary"
        onClick={() => onLoadSample(SAMPLE_BROKEN_JSON)}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Load sample broken JSON
      </Button>
    </div>
  )
}
