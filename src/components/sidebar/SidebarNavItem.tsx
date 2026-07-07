import type { ReactNode } from 'react'
import type { AppTab } from '@/hooks/useAppTab'

interface SidebarNavItemProps {
  icon: ReactNode
  label: string
  tabId: AppTab
  activeTab: AppTab
  onClick: (tab: AppTab) => void
  badge?: ReactNode
}

export function SidebarNavItem({ icon, label, tabId, activeTab, onClick, badge }: SidebarNavItemProps) {
  const isActive = activeTab === tabId

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onClick(tabId)}
      className={`group relative flex w-full items-center gap-3 rounded-input px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isActive
          ? 'bg-accent/10 text-accent-light'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
      }`}
    >
      {/* Active indicator — left border on desktop */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 hidden h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent lg:block"
          aria-hidden="true"
        />
      )}
      {/* Active indicator — top border on mobile */}
      {isActive && (
        <span
          className="absolute left-1/2 top-0 h-[3px] w-6 -translate-x-1/2 rounded-b-full bg-accent lg:hidden"
          aria-hidden="true"
        />
      )}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="hidden lg:inline">{label}</span>
      {badge && <span className="ml-auto hidden lg:inline">{badge}</span>}
    </button>
  )
}
