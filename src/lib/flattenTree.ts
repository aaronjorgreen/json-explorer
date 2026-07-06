import type { JsonNode } from '@/types/json'

export interface FlatTreeNode {
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

export function flattenVisibleNodes(
  nodes: JsonNode[],
  isExpanded: (path: string) => boolean,
): FlatTreeNode[] {
  const result: FlatTreeNode[] = []

  const visit = (node: JsonNode, depth: number): void => {
    result.push({ node, depth })
    if (isExpandable(node) && isExpanded(node.path)) {
      getChildren(node).forEach((child) => visit(child, depth + 1))
    }
  }

  nodes.forEach((node) => visit(node, 0))
  return result
}

export const VIRTUALIZATION_THRESHOLD = 500
