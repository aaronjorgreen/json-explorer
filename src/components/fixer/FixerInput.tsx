import { useRef, useEffect } from 'react'

interface FixerInputProps {
  value: string
  onChange: (value: string) => void
  errorLine?: number
  lineCount: number
}

export function FixerInput({ value, onChange, errorLine, lineCount }: FixerInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  // Sync gutter scroll with textarea scroll
  useEffect(() => {
    const textarea = textareaRef.current
    const gutter = gutterRef.current
    if (!textarea || !gutter) return

    const handleScroll = () => {
      gutter.scrollTop = textarea.scrollTop
    }

    textarea.addEventListener('scroll', handleScroll)
    return () => textarea.removeEventListener('scroll', handleScroll)
  }, [])

  const displayLineCount = Math.max(lineCount, 1)

  return (
    <div className="relative flex flex-1 overflow-hidden rounded-input border border-border bg-base focus-within:border-border-accent focus-within:ring-2 focus-within:ring-accent">
      {/* Line numbers gutter */}
      <div
        ref={gutterRef}
        className="pointer-events-none shrink-0 overflow-hidden border-r border-border bg-surface/50 py-3"
        aria-hidden="true"
      >
        <div className="flex flex-col px-3">
          {Array.from({ length: displayLineCount }, (_, i) => {
            const lineNum = i + 1
            const isError = errorLine === lineNum
            return (
              <span
                key={lineNum}
                className={`select-none text-right font-mono text-xs leading-[1.625rem] ${
                  isError ? 'font-bold text-red-400' : 'text-text-muted'
                }`}
              >
                {lineNum}
              </span>
            )
          })}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste malformed JSON here…"
        spellCheck={false}
        className="min-h-[200px] flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm leading-[1.625rem] text-text-primary placeholder:text-text-muted focus:outline-none"
        aria-label="JSON input for Fixer"
      />
    </div>
  )
}
