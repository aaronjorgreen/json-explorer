import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildTree, collectAllPaths, getNodeDepth } from './buildTree'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function readFixture(name: string): string {
  return readFileSync(path.join(fixturesDir, name), 'utf8')
}

describe('buildTree', () => {
  it('builds tree from root object', () => {
    const data = JSON.parse(readFixture('valid-simple.json'))
    const { nodes, stats } = buildTree(data)

    expect(nodes).toHaveLength(1)
    expect(nodes[0]?.type).toBe('object')
    expect(stats.objects).toBe(1)
    expect(stats.properties).toBe(3)
    expect(stats.nodeCount).toBe(4)
  })

  it('builds nested tree with accurate stats', () => {
    const data = JSON.parse(readFixture('valid-nested.json'))
    const { nodes, stats } = buildTree(data)

    expect(nodes[0]?.type).toBe('object')
    expect(stats.objects).toBeGreaterThan(1)
    expect(stats.arrays).toBe(1)
    expect(stats.maxDepth).toBeGreaterThanOrEqual(4)
    expect(stats.nodeCount).toBeGreaterThan(5)
  })

  it('handles root array', () => {
    const { nodes, stats } = buildTree([1, 2, { a: true }])

    expect(nodes[0]?.type).toBe('array')
    expect(stats.arrays).toBe(1)
    expect(stats.objects).toBe(1)
    expect(stats.nodeCount).toBe(5)
  })

  it('handles root primitive', () => {
    const { nodes, stats } = buildTree('hello')

    expect(nodes[0]?.type).toBe('primitive')
    if (nodes[0]?.type === 'primitive') {
      expect(nodes[0].value).toBe('hello')
    }
    expect(stats.objects).toBe(0)
    expect(stats.arrays).toBe(0)
    expect(stats.nodeCount).toBe(1)
  })

  it('handles empty object and array', () => {
    const emptyObject = buildTree({})
    expect(emptyObject.stats.objects).toBe(1)
    expect(emptyObject.stats.properties).toBe(0)

    const emptyArray = buildTree([])
    expect(emptyArray.stats.arrays).toBe(1)
    expect(emptyArray.stats.nodeCount).toBe(1)
  })

  it('assigns stable paths', () => {
    const data = { users: [{ email: 'a@b.com' }] }
    const { nodes } = buildTree(data)
    const paths = collectAllPaths(nodes)

    expect(paths).toContain('root')
    expect(paths).toContain('root.users')
    expect(paths).toContain('root.users[0]')
    expect(paths).toContain('root.users[0].email')
  })
})

describe('getNodeDepth', () => {
  it('returns depth from path', () => {
    expect(getNodeDepth('root')).toBe(0)
    expect(getNodeDepth('root.users')).toBe(1)
    expect(getNodeDepth('root.users[0].email')).toBe(3)
  })
})
