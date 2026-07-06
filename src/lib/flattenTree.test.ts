import { describe, expect, it } from 'vitest'
import { buildTree } from './buildTree'
import { flattenVisibleNodes } from './flattenTree'

describe('flattenVisibleNodes', () => {
  it('flattens expanded nodes only', () => {
    const { nodes } = buildTree({ a: { b: 1 }, c: 2 })
    const isExpanded = (path: string) => path === 'root' || path === 'root.a'
    const flat = flattenVisibleNodes(nodes, isExpanded)

    expect(flat.map((item) => item.node.path)).toEqual(['root', 'root.a', 'root.a.b', 'root.c'])
  })

  it('collapses hidden branches', () => {
    const { nodes } = buildTree({ a: { b: 1 } })
    const flat = flattenVisibleNodes(nodes, (path) => path === 'root')

    expect(flat.map((item) => item.node.path)).toEqual(['root', 'root.a'])
  })
})
