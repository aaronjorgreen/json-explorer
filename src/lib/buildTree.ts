import type { JsonNode, TreeStats } from '@/types/json'

export interface BuildTreeResult {
  nodes: JsonNode[]
  stats: TreeStats
}

interface BuildContext {
  stats: TreeStats
  depth: number
}

function createEmptyStats(): TreeStats {
  return {
    objects: 0,
    arrays: 0,
    properties: 0,
    maxDepth: 0,
    nodeCount: 0,
  }
}

function childPath(parentPath: string, key: string | number): string {
  if (parentPath === 'root') {
    return typeof key === 'number' ? `root[${key}]` : `root.${key}`
  }
  return typeof key === 'number' ? `${parentPath}[${key}]` : `${parentPath}.${key}`
}

function recordNode(ctx: BuildContext): void {
  ctx.stats.nodeCount += 1
  ctx.stats.maxDepth = Math.max(ctx.stats.maxDepth, ctx.depth)
}

function buildNode(value: unknown, key: string | undefined, path: string, ctx: BuildContext): JsonNode {
  recordNode(ctx)

  if (value === null || typeof value !== 'object') {
    return {
      type: 'primitive',
      key,
      path,
      value: value as string | number | boolean | null,
    }
  }

  if (Array.isArray(value)) {
    ctx.stats.arrays += 1
    const childCtx: BuildContext = { stats: ctx.stats, depth: ctx.depth + 1 }
    const items = value.map((item, index) =>
      buildNode(item, String(index), childPath(path, index), childCtx),
    )
    return { type: 'array', key, path, items }
  }

  ctx.stats.objects += 1
  const entries = Object.entries(value)
  ctx.stats.properties += entries.length
  const childCtx: BuildContext = { stats: ctx.stats, depth: ctx.depth + 1 }
  const children = entries.map(([entryKey, entryValue]) =>
    buildNode(entryValue, entryKey, childPath(path, entryKey), childCtx),
  )
  return { type: 'object', key, path, entries: children }
}

export function buildTree(data: unknown): BuildTreeResult {
  const stats = createEmptyStats()
  const ctx: BuildContext = { stats, depth: 0 }
  const root = buildNode(data, undefined, 'root', ctx)
  return { nodes: [root], stats }
}

export function getNodeDepth(path: string): number {
  if (path === 'root') return 0
  const suffix = path.slice(4)
  if (!suffix) return 0
  return (suffix.match(/[.[]/g) ?? []).length
}

export function getChildPaths(node: JsonNode): string[] {
  if (node.type === 'object') {
    return node.entries.map((child) => child.path)
  }
  if (node.type === 'array') {
    return node.items.map((child) => child.path)
  }
  return []
}

export function collectAllPaths(nodes: JsonNode[]): string[] {
  const paths: string[] = []
  const visit = (node: JsonNode): void => {
    paths.push(node.path)
    if (node.type === 'object') {
      node.entries.forEach(visit)
    } else if (node.type === 'array') {
      node.items.forEach(visit)
    }
  }
  nodes.forEach(visit)
  return paths
}
