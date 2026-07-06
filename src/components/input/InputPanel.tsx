import { useRef } from 'react'
import { FileJson, Loader2, Trash2, Upload } from 'lucide-react'
import { DropZone } from '@/components/input/DropZone'
import { JsonTextarea } from '@/components/input/JsonTextarea'
import { ParseErrorBanner } from '@/components/input/ParseErrorBanner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function InputPanel({ onClearAll }: { onClearAll?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    rawInput,
    setRawInput,
    parseResult,
    isParsing,
    fileMeta,
    fileWarning,
    parseNow,
    loadFromFile,
  } = useJsonDocumentContext()

  return (
    <section
      aria-label="JSON input"
      className="flex h-full min-h-[240px] flex-col rounded-card border border-border bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="text-sm font-medium text-text-primary">Input</h2>
          {fileMeta ? (
            <Badge variant="accent">
              {fileMeta.name} · {formatBytes(fileMeta.size)}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            variant="ghost"
            className="px-3"
            aria-label="Upload JSON file"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button variant="primary" className="px-3" onClick={parseNow}>
            Parse
          </Button>
          {onClearAll ? (
            <Button
              variant="ghost"
              className="px-3"
              aria-label="Clear input"
              onClick={onClearAll}
              disabled={rawInput.length === 0}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          ) : null}
        </div>
      </div>

      <DropZone onFileDrop={(file) => void loadFromFile(file)}>
        <div className="relative flex min-h-0 flex-1 flex-col gap-3 p-4">
          {fileWarning ? (
            <p className="rounded-input border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-100">
              {fileWarning}
            </p>
          ) : null}

          {parseResult && !parseResult.ok ? <ParseErrorBanner error={parseResult.error} /> : null}

          <JsonTextarea value={rawInput} onValueChange={setRawInput} />

          {isParsing ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-card bg-base/70 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
                Parsing…
              </div>
            </div>
          ) : null}
        </div>
      </DropZone>
    </section>
  )
}
