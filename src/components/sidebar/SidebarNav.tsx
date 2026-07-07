import { Braces, Wrench } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { SidebarNavItem } from '@/components/sidebar/SidebarNavItem'
import { useFixerHistoryCount } from '@/hooks/useFixerHistory'
import type { AppTab } from '@/hooks/useAppTab'

interface SidebarNavProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

function HistoryBadge({ count }: { count: number }) {
  if (count === 0) return null
  const label = count > 9 ? '9+' : String(count)
  return (
    <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-light">
      {label}
    </span>
  )
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const historyCount = useFixerHistoryCount()
  return (
    <>
      {/* Desktop: persistent left rail */}
      <nav
        aria-label="App navigation"
        role="tablist"
        className="hidden shrink-0 flex-col border-r border-border bg-surface lg:flex lg:w-[200px]"
      >
        {/* Logo section */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Logo />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">Structra</p>
            <p className="truncate text-[10px] text-text-muted">See your JSON clearly</p>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 p-2">
          <SidebarNavItem
            icon={<Braces className="h-5 w-5" />}
            label="Explorer"
            tabId="explorer"
            activeTab={activeTab}
            onClick={onTabChange}
          />
          <SidebarNavItem
            icon={<Wrench className="h-5 w-5" />}
            label="Fixer"
            tabId="fixer"
            activeTab={activeTab}
            onClick={onTabChange}
            badge={<HistoryBadge count={historyCount} />}
          />
        </div>
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav
        aria-label="App navigation"
        role="tablist"
        className="fixed bottom-0 left-0 right-0 z-40 flex shrink-0 items-stretch border-t border-border bg-surface lg:hidden"
      >
        <div className="flex w-full">
          <div className="flex-1">
            <SidebarNavItem
              icon={<Braces className="h-5 w-5" />}
              label="Explorer"
              tabId="explorer"
              activeTab={activeTab}
              onClick={onTabChange}
            />
          </div>
          <div className="flex-1">
            <SidebarNavItem
              icon={<Wrench className="h-5 w-5" />}
              label="Fixer"
              tabId="fixer"
              activeTab={activeTab}
              onClick={onTabChange}
            />
          </div>
        </div>
      </nav>
    </>
  )
}
