import { JsonTreeRow } from '@/components/explorer/JsonTreeRow'
import { useTreeExpand } from '@/hooks/useTreeExpand'
import type { JsonNode } from '@/types/json'

interface JsonTreeNodeProps {
  node: JsonNode
  depth: number
}

function getChildren(node: JsonNode): JsonNode[] {
  if (node.type === 'object') return node.entries
  if (node.type === 'array') return node.items
  return []
}

function isExpandable(node: JsonNode): boolean {
  return node.type === 'object' || node.type === 'array'
}

export function JsonTreeNode({ node, depth }: JsonTreeNodeProps) {
  const { isExpanded } = useTreeExpand()
  const expandable = isExpandable(node)
  const expanded = expandable && isExpanded(node.path)
  const children = getChildren(node)

  return (
    <>
      <JsonTreeRow node={node} depth={depth} />
      {expandable && expanded
        ? children.map((child) => (
            <JsonTreeNode key={child.path} node={child} depth={depth + 1} />
          ))
        : null}
    </>
  )
}
