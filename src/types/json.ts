export type JsonPrimitive = string | number | boolean | null

export type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'

export interface TreeStats {
  objects: number
  arrays: number
  properties: number
  maxDepth: number
  nodeCount: number
}

export interface JsonObjectNode {
  type: 'object'
  key?: string
  path: string
  entries: JsonNode[]
}

export interface JsonArrayNode {
  type: 'array'
  key?: string
  path: string
  items: JsonNode[]
}

export interface JsonPrimitiveNode {
  type: 'primitive'
  key?: string
  path: string
  value: JsonPrimitive
}

export type JsonNode = JsonObjectNode | JsonArrayNode | JsonPrimitiveNode
