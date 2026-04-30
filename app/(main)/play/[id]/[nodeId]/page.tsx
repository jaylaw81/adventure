import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import { authOptions } from '@/lib/auth'
import { getNode, getNodeChoices, getAdventure, getChapterStartNode, getChapter } from '@/lib/queries'
import { canViewMemberStory } from '@/lib/orgAccess'
import SceneView from '@/components/reader/SceneView'
import ChoiceButton from '@/components/reader/ChoiceButton'
import CopySceneButton from '@/components/reader/CopySceneButton'
import BackButton from '@/components/reader/BackButton'
import SceneTracker from '@/components/reader/SceneTracker'
import RestartButton from '@/components/reader/RestartButton'
import ReportButton from '@/components/reader/ReportButton'
import ReviewForm from '@/components/reader/ReviewForm'

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
  const isAdmin = !!session?.user?.isAdmin

  // Block private stories from non-owners
  if (!adventure?.isPublic && !isOwner && !isAdmin) {
    const orgAccess = session?.user?.email && adventure?.userEmail
      ? await canViewMemberStory(session.user.email, adventure.userEmail)
      : false
    if (!orgAccess) notFound()
  }

  const isEnding = node.nodeType === 'ending'
  const isStart = node.nodeType === 'start'
  const isChapterEnd = node.nodeType === 'chapter_end'

  // For chapter_end nodes, find the start node of the next chapter
  const [nextChapterStartNode, nextChapter] = isChapterEnd && node.nextChapterId
    ? await Promise.all([
        getChapterStartNode(id, node.nextChapterId),
        getChapter(node.nextChapterId),
      ])
    : [null, null]

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
        {isChapterEnd ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-teal-50 border border-teal-200 rounded-2xl mb-6">
              <span className="text-teal-600 text-lg">✦</span>
              <p className="text-teal-800 font-semibold text-lg">End of Chapter</p>
              <span className="text-teal-600 text-lg">✦</span>
            </div>
            {nextChapterStartNode ? (
              <div>
                <p className="text-gray-500 mb-6">
                  Continue to: <span className="font-medium text-gray-700">{nextChapter?.title ?? 'Next Chapter'}</span>
                </p>
                <Link
                  href={`/play/${id}/${nextChapterStartNode.id}`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-md"
                >
                  Continue →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-4">No next chapter has been set.</p>
                <RestartButton href={`/play/${id}`} adventureId={id} />
              </div>
            )}
          </div>
        ) : isEnding ? (
          <div>
            <div className="text-center py-8">
              <p className="text-2xl font-bold text-gray-800 mb-2">— The End —</p>
              <p className="text-gray-500 mb-6">Thank you for playing!</p>
              <RestartButton href={`/play/${id}`} adventureId={id} />
            </div>
            <ReviewForm adventureId={id} />
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

      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
        <ReportButton adventureId={id} />
      </div>
    </div>
  )
}
