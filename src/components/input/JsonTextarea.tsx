import type { TextareaHTMLAttributes } from 'react'

interface JsonTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  onValueChange: (value: string) => void
}

export function JsonTextarea({ value, onValueChange, className = '', ...props }: JsonTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      spellCheck={false}
      placeholder='Paste JSON here… e.g. { "hello": "world" }'
      className={`min-h-[200px] w-full flex-1 resize-none rounded-input border border-border bg-base px-4 py-3 font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus-visible:border-border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      {...props}
    />
  )
}
