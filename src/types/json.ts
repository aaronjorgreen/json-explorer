export type JsonPrimitive = string | number | boolean | null

export interface JsonObjectNode {
  type: 'object'
  key?: string
  entries: JsonNode[]
}

export interface JsonArrayNode {
  type: 'array'
  key?: string
  items: JsonNode[]
}

export interface JsonPrimitiveNode {
  type: 'primitive'
  key?: string
  value: JsonPrimitive
}

export type JsonNode = JsonObjectNode | JsonArrayNode | JsonPrimitiveNode
