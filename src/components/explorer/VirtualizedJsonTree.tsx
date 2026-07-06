import { useMemo, type RefObject } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { JsonTreeRow } from '@/components/explorer/JsonTreeRow'
import { flattenVisibleNodes } from '@/lib/flattenTree'
import { useTreeExpand } from '@/hooks/useTreeExpand'
import type { JsonNode } from '@/types/json'

interface VirtualizedJsonTreeProps {
  nodes: JsonNode[]
  scrollRef: RefObject<HTMLDivElement | null>
}

const ROW_HEIGHT = 32

export function VirtualizedJsonTree({ nodes, scrollRef }: VirtualizedJsonTreeProps) {
  const { isExpanded } = useTreeExpand()

  const flatNodes = useMemo(
    () => flattenVisibleNodes(nodes, isExpanded),
    [nodes, isExpanded],
  )

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  })

  return (
    <div className="font-mono text-sm" role="tree">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = flatNodes[virtualRow.index]
          if (!item) return null
          return (
            <div
              key={item.node.path}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <JsonTreeRow node={item.node} depth={item.depth} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
