import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { getNode, getNodeChoices } from '@/lib/queries'
import SceneView from '@/components/reader/SceneView'
import ChoiceButton from '@/components/reader/ChoiceButton'
import CopySceneButton from '@/components/reader/CopySceneButton'
import BackButton from '@/components/reader/BackButton'

export default async function ReaderPage({ params }: { params: Promise<{ id: string; nodeId: string }> }) {
  const { id, nodeId } = await params
  const [node, choices] = await Promise.all([
    getNode(nodeId),
    getNodeChoices(nodeId),
  ])
  if (!node) notFound()

  const isEnding = node.nodeType === 'ending'
  const isStart = node.nodeType === 'start'

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {!isStart && <BackButton />}
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            Home
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <CopySceneButton content={node.content} choices={choices} />
          <Link href={`/edit/${id}`} className="text-xs text-gray-400 hover:text-gray-600">
            Edit
          </Link>
        </div>
      </div>

      <SceneView node={node} />

      <div className="mt-10">
        {isEnding ? (
          <div className="text-center py-8">
            <p className="text-2xl font-bold text-gray-800 mb-2">— The End —</p>
            <p className="text-gray-500 mb-6">Thank you for playing!</p>
            <Link
              href={`/play/${id}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              <RotateCcw size={16} />
              Play Again
            </Link>
          </div>
        ) : choices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No choices available. This story ends here.</p>
            <Link
              href={`/play/${id}`}
              className="inline-flex items-center gap-2 mt-4 px-5 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              <RotateCcw size={16} />
              Start Over
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-500 mb-1">What do you do?</p>
            {choices.map((choice, index) => (
              <ChoiceButton
                key={choice.id}
                href={`/play/${id}/${choice.targetNodeId}`}
                label={choice.label}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
