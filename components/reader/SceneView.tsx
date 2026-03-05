import type { Node } from '@/lib/schema'

interface Props {
  node: Node
}

export default function SceneView({ node }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-2 flex items-center gap-2">
        {node.nodeType === 'start' && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Start</span>
        )}
        {node.nodeType === 'ending' && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Ending</span>
        )}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{node.title || 'Untitled Scene'}</h1>
      <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
        {node.content || <em className="text-gray-400">No content written yet.</em>}
      </div>
    </div>
  )
}
