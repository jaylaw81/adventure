import type { Node } from '@/lib/schema'
import SceneAudioPlayer from './SceneAudioPlayer'

interface Props {
  node: Node
  dark?: boolean
}

export default function SceneView({ node, dark }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      {node.soundUrl && node.soundTitle && (
        <SceneAudioPlayer soundUrl={node.soundUrl} soundTitle={node.soundTitle} />
      )}
      {node.imageUrl && (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.imageUrl}
            alt={node.title || 'Scene illustration'}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${
            node.nodeType === 'ending'
              ? 'from-purple-900/60 to-transparent'
              : 'from-black/40 to-transparent'
          }`} />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            {node.nodeType === 'start' && (
              <span className="px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full font-medium">Start</span>
            )}
            {node.nodeType === 'ending' && (
              <span className="px-2 py-0.5 bg-purple-500/90 text-white text-xs rounded-full font-medium">Ending</span>
            )}
          </div>
        </div>
      )}

      {!node.imageUrl && (node.nodeType === 'start' || node.nodeType === 'ending') && (
        <div className="mb-4 flex items-center gap-2">
          {node.nodeType === 'start' && (
            <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${dark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>Start</span>
          )}
          {node.nodeType === 'ending' && (
            <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>Ending</span>
          )}
        </div>
      )}

      <h1 className={`text-3xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>{node.title || 'Untitled Scene'}</h1>
      <div className={`prose prose-lg leading-relaxed whitespace-pre-wrap ${dark ? 'text-white/85 prose-invert' : 'text-gray-700'}`}>
        {node.content || <em className={dark ? 'text-white/40' : 'text-gray-400'}>No content written yet.</em>}
      </div>
    </div>
  )
}
