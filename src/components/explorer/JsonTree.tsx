import { JsonTreeNode } from '@/components/explorer/JsonTreeNode'
import type { JsonNode } from '@/types/json'

interface JsonTreeProps {
  nodes: JsonNode[]
}

export function JsonTree({ nodes }: JsonTreeProps) {
  return (
    <div className="font-mono text-sm" role="tree">
      {nodes.map((node) => (
        <JsonTreeNode key={node.path} node={node} depth={0} />
      ))}
    </div>
  )
}
