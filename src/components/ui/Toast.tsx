import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

const variantClasses = {
  success: 'border-accent/40 bg-accent/10 text-accent-light',
  error: 'border-red-500/40 bg-red-500/10 text-red-200',
  info: 'border-border bg-surface text-text-secondary',
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 rounded-card border px-4 py-3 text-sm shadow-lg ${variantClasses[toast.variant]}`}
        >
          <span>{toast.message}</span>
          <Button
            variant="ghost"
            className="min-h-8 min-w-8 px-2"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  )
}
