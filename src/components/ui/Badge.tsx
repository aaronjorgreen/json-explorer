import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'muted'
  className?: string
}

const variantClasses = {
  default: 'border-border bg-surface text-text-secondary',
  accent: 'border-accent/40 bg-accent/10 text-accent-light',
  muted: 'border-border bg-base text-text-muted',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-input border px-2 py-0.5 font-mono text-xs ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
