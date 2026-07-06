import { ChevronDown, ChevronUp, Copy, Menu, Search } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { useSearch } from '@/hooks/useSearch'
import { useToast } from '@/hooks/useToast'
import { stringifyPretty } from '@/lib/format'

export function Header() {
  const { parseResult } = useJsonDocumentContext()
  const { showToast } = useToast()
  const hasTree = parseResult?.ok === true
  const canCopy = hasTree && parseResult?.ok === true
  const {
    query,
    setQuery,
    matches,
    currentIndex,
    nextMatch,
    prevMatch,
    isSearchActive,
  } = useSearch()

  const matchLabel =
    matches.length === 0
      ? isSearchActive
        ? 'No matches'
        : null
      : `${currentIndex + 1} of ${matches.length}`

  const handleCopy = async () => {
    if (!parseResult?.ok) return
    try {
      await navigator.clipboard.writeText(stringifyPretty(parseResult.data))
      showToast('Copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Logo />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">Structra</p>
          <p className="hidden text-xs text-text-muted sm:block">See your JSON clearly</p>
        </div>
      </div>

      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 lg:max-w-xl lg:flex-none">
        <label className="sr-only" htmlFor="header-search">
          Search JSON
        </label>
        <div className="relative hidden w-full md:flex md:items-center md:gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              id="header-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={!hasTree}
              placeholder="Search keys and values…"
              className="w-full rounded-input border border-border bg-base py-2.5 pl-10 pr-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus-visible:border-border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          {matchLabel ? (
            <Badge variant={matches.length === 0 ? 'muted' : 'accent'} className="shrink-0">
              {matchLabel}
            </Badge>
          ) : null}
          <Button
            variant="ghost"
            className="shrink-0 px-2"
            onClick={prevMatch}
            disabled={matches.length === 0}
            aria-label="Previous match"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            className="shrink-0 px-2"
            onClick={nextMatch}
            disabled={matches.length === 0}
            aria-label="Next match"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <Button
          variant="ghost"
          className="hidden px-3 lg:inline-flex"
          disabled={!canCopy}
          aria-label="Copy JSON"
          onClick={() => void handleCopy()}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          <span className="hidden xl:inline">Copy</span>
        </Button>

        <Button variant="ghost" className="px-3 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
