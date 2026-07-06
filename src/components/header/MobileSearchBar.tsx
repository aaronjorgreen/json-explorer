import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { useSearch } from '@/hooks/useSearch'

export function MobileSearchBar() {
  const { parseResult } = useJsonDocumentContext()
  const hasTree = parseResult?.ok === true
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

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface px-3 py-2 md:hidden">
      <label className="sr-only" htmlFor="mobile-search">
        Search JSON
      </label>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            id="mobile-search"
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
    </div>
  )
}
