import { formatValue } from '@/lib/format'
import type { JsonNode } from '@/types/json'

export interface SearchMatch {
  path: string
  field: 'key' | 'value'
  keyText?: string
  valueText?: string
}

function visitNode(node: JsonNode, query: string, matches: SearchMatch[]): void {
  const lowerQuery = query.toLowerCase()

  if (node.key !== undefined && node.key.toLowerCase().includes(lowerQuery)) {
    matches.push({ path: node.path, field: 'key', keyText: node.key })
  }

  if (node.type === 'primitive') {
    const valueText = formatValue(node.value)
    if (valueText.toLowerCase().includes(lowerQuery)) {
      matches.push({ path: node.path, field: 'value', valueText })
    }
  }

  if (node.type === 'object') {
    node.entries.forEach((child) => visitNode(child, query, matches))
  } else if (node.type === 'array') {
    node.items.forEach((child) => visitNode(child, query, matches))
  }
}

export function searchTree(nodes: JsonNode[], query: string): SearchMatch[] {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []

  const matches: SearchMatch[] = []
  nodes.forEach((node) => visitNode(node, trimmed, matches))
  return matches
}

export function getAncestorPaths(path: string): string[] {
  if (path === 'root') return ['root']

  const ancestors: string[] = ['root']
  const dotParts = path.replace(/^root\.?/, '').split('.')

  let current = 'root'
  for (let i = 0; i < dotParts.length; i += 1) {
    const part = dotParts[i]
    if (!part) continue

    const bracketIndex = part.indexOf('[')
    if (bracketIndex === -1) {
      current = current === 'root' ? `root.${part}` : `${current}.${part}`
      ancestors.push(current)
    } else {
      const key = part.slice(0, bracketIndex)
      const arraySegment = part.slice(bracketIndex)
      if (key) {
        current = current === 'root' ? `root.${key}` : `${current}.${key}`
        ancestors.push(current)
      }
      const indices = arraySegment.match(/\[\d+\]/g) ?? []
      for (const index of indices) {
        current = `${current}${index}`
        ancestors.push(current)
      }
    }
  }

  return ancestors.slice(0, -1)
}

export function getPathsToExpand(matches: SearchMatch[]): Set<string> {
  const paths = new Set<string>()
  for (const match of matches) {
    getAncestorPaths(match.path).forEach((ancestor) => paths.add(ancestor))
  }
  return paths
}
