import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTreeExpand } from '@/hooks/useTreeExpand'

export function TreeToolbar() {
  const { expandAll, collapseAll } = useTreeExpand()

  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-2">
      <Button variant="ghost" className="px-3 text-xs" onClick={expandAll}>
        <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
        Expand All
      </Button>
      <Button variant="ghost" className="px-3 text-xs" onClick={collapseAll}>
        <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden="true" />
        Collapse All
      </Button>
    </div>
  )
}
