import type { ParseError } from '@/lib/parseJson'

interface ParseErrorBannerProps {
  error: ParseError
}

export function ParseErrorBanner({ error }: ParseErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-input border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
    >
      <p className="font-medium">{error.message}</p>
      <p className="mt-1 font-mono text-xs text-red-100/80">
        Line {error.line}, Column {error.column} (char {error.character})
      </p>
    </div>
  )
}
