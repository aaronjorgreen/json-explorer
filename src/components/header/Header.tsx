import { Copy, Menu, Search } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Logo />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">Structra</p>
          <p className="hidden text-xs text-text-muted sm:block">See your JSON clearly</p>
        </div>
      </div>

      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 lg:max-w-md lg:flex-none">
        <label className="sr-only" htmlFor="header-search">
          Search JSON
        </label>
        <div className="relative hidden w-full md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            id="header-search"
            type="search"
            disabled
            placeholder="Search keys and values…"
            className="w-full rounded-input border border-border bg-base py-2.5 pl-10 pr-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus-visible:border-border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <Button variant="ghost" className="hidden px-3 lg:inline-flex" disabled aria-label="Copy JSON">
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
