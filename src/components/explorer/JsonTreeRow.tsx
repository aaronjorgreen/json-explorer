import type { KeyboardEvent } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HighlightText } from '@/components/explorer/HighlightText'
import { Badge } from '@/components/ui/Badge'
import { useSearch } from '@/hooks/useSearch'
import { useTreeExpand } from '@/hooks/useTreeExpand'
import { formatValue } from '@/lib/format'
import type { JsonNode } from '@/types/json'

interface JsonTreeRowProps {
  node: JsonNode
  depth: number
}

function childCount(node: JsonNode): number {
  if (node.type === 'object') return node.entries.length
  if (node.type === 'array') return node.items.length
  return 0
}

function isExpandable(node: JsonNode): boolean {
  return node.type === 'object' || node.type === 'array'
}

export function JsonTreeRow({ node, depth }: JsonTreeRowProps) {
  const { isExpanded, toggleExpand } = useTreeExpand()
  const { debouncedQuery, matches, currentIndex, isSearchActive } = useSearch()
  const expandable = isExpandable(node)
  const expanded = expandable && isExpanded(node.path)
  const count = childCount(node)

  const isCurrentMatch = matches[currentIndex]?.path === node.path
  const rowHighlight = isSearchActive && isCurrentMatch

  const handleToggle = () => {
    if (expandable) {
      toggleExpand(node.path)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  const valueText = node.type === 'primitive' ? formatValue(node.value) : ''

  return (
    <div
      role="treeitem"
      aria-expanded={expandable ? expanded : undefined}
      data-path={node.path}
      className={`group flex min-h-8 items-center gap-1 rounded-input py-0.5 pr-2 hover:bg-base/60 ${rowHighlight ? 'bg-accent/10 ring-1 ring-accent/50' : ''}`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      {expandable ? (
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse node' : 'Expand node'}
          className="flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-input text-text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      ) : (
        <span className="inline-block min-w-8 shrink-0" aria-hidden="true" />
      )}

      {node.key !== undefined ? (
        <span className="text-accent-light">
          <HighlightText
            text={node.key}
            query={isSearchActive ? debouncedQuery : ''}
            isCurrent={isCurrentMatch && matches[currentIndex]?.field === 'key'}
          />
        </span>
      ) : null}
      {node.key !== undefined ? <span className="text-text-muted">: </span> : null}

      {node.type === 'primitive' ? (
        <span className="break-all text-text-primary">
          <HighlightText
            text={valueText}
            query={isSearchActive ? debouncedQuery : ''}
            isCurrent={isCurrentMatch && matches[currentIndex]?.field === 'value'}
          />
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Badge variant="muted">{node.type}</Badge>
          <span className="text-xs text-text-muted">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </span>
      )}
    </div>
  )
}
