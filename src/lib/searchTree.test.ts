import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildTree } from './buildTree'
import { getAncestorPaths, getPathsToExpand, searchTree } from './searchTree'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function readFixture(name: string): string {
  return readFileSync(path.join(fixturesDir, name), 'utf8')
}

describe('searchTree', () => {
  const { nodes } = buildTree(JSON.parse(readFixture('valid-nested.json')))

  it('matches keys case-insensitively', () => {
    const matches = searchTree(nodes, 'EMAIL')
    expect(matches.some((m) => m.field === 'key' && m.keyText === 'email')).toBe(true)
  })

  it('matches string values', () => {
    const matches = searchTree(nodes, 'alice@example.com')
    expect(matches.some((m) => m.field === 'value')).toBe(true)
  })

  it('matches partial strings', () => {
    const matches = searchTree(nodes, 'them')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('returns empty for no matches', () => {
    expect(searchTree(nodes, 'zzznomatch')).toEqual([])
  })

  it('returns empty for empty query', () => {
    expect(searchTree(nodes, '   ')).toEqual([])
  })

  it('returns stable path IDs', () => {
    const matches = searchTree(nodes, 'email')
    expect(matches[0]?.path).toContain('email')
  })
})

describe('getAncestorPaths', () => {
  it('returns ancestors for nested path', () => {
    const ancestors = getAncestorPaths('root.users[0].email')
    expect(ancestors).toContain('root')
    expect(ancestors).toContain('root.users')
    expect(ancestors).toContain('root.users[0]')
    expect(ancestors).not.toContain('root.users[0].email')
  })
})

describe('getPathsToExpand', () => {
  it('collects ancestor paths from matches', () => {
    const matches = [{ path: 'root.users[0].email', field: 'key' as const, keyText: 'email' }]
    const paths = getPathsToExpand(matches)
    expect(paths.has('root.users')).toBe(true)
    expect(paths.has('root.users[0]')).toBe(true)
  })
})
