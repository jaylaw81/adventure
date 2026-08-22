import { BookImage } from 'lucide-react'
import SceneAudioPlayer from './SceneAudioPlayer'
import type { Node } from '@/lib/schema'

interface Props {
  node: Node
}

export default function StorybookPageSpread({ node }: Props) {
  const imageLeft = (node as { imagePosition?: string }).imagePosition === 'left'

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
      <div className={imageLeft ? 'md:order-1' : 'md:order-2'}>
        {node.imageUrl ? (
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={node.imageUrl}
              alt={node.title || 'Page illustration'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square rounded-2xl bg-teal-50 border-2 border-dashed border-teal-200 flex items-center justify-center">
            <BookImage className="text-teal-200" size={48} />
          </div>
        )}
      </div>

      <div className={imageLeft ? 'md:order-2' : 'md:order-1'}>
        {node.soundUrl && node.soundTitle && (
          <SceneAudioPlayer soundUrl={node.soundUrl} soundTitle={node.soundTitle} />
        )}
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {node.title || 'Untitled Page'}
        </h1>
        <div className="prose prose-lg leading-relaxed whitespace-pre-wrap text-gray-700">
          {node.content || <em className="text-gray-400">No content written yet.</em>}
        </div>
      </div>
    </div>
  )
}
