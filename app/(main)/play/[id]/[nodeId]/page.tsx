import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getNode, getNodeChoices, getAdventure } from '@/lib/queries'
import SceneView from '@/components/reader/SceneView'
import ChoiceButton from '@/components/reader/ChoiceButton'
import CopySceneButton from '@/components/reader/CopySceneButton'
import BackButton from '@/components/reader/BackButton'
import SceneTracker from '@/components/reader/SceneTracker'
import RestartButton from '@/components/reader/RestartButton'

export default async function ReaderPage({ params }: { params: Promise<{ id: string; nodeId: string }> }) {
  const { id, nodeId } = await params
  const [node, choices, adventure, session] = await Promise.all([
    getNode(nodeId),
    getNodeChoices(nodeId),
    getAdventure(id),
    getServerSession(authOptions),
  ])
  if (!node) notFound()

  const isOwner = !!session?.user?.email && session.user.email === adventure?.userEmail

  const isEnding = node.nodeType === 'ending'
  const isStart = node.nodeType === 'start'

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <SceneTracker
        adventureId={id}
        adventureTitle={adventure?.title ?? ''}
        nodeId={nodeId}
        nodeType={node.nodeType}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {!isStart && <BackButton />}
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            Home
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <CopySceneButton content={node.content} choices={choices} adventureId={id} />
          {isOwner && (
            <Link href={`/edit/${id}`} className="text-xs text-gray-400 hover:text-gray-600">
              Edit
            </Link>
          )}
        </div>
      </div>

      <SceneView node={node} />

      <div className="mt-10">
        {isEnding ? (
          <div className="text-center py-8">
            <p className="text-2xl font-bold text-gray-800 mb-2">— The End —</p>
            <p className="text-gray-500 mb-6">Thank you for playing!</p>
            <RestartButton href={`/play/${id}`} adventureId={id} />
          </div>
        ) : choices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No choices available. This story ends here.</p>
            <div className="mt-4">
              <RestartButton href={`/play/${id}`} adventureId={id} />
            </div>
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
                adventureId={id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
