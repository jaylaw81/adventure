import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { Compass } from 'lucide-react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import { eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { adventures, storyReferrers } from '@/lib/schema'
import { parseReferrer } from '@/lib/referrerUtils'
import { getNode, getNodeChoices, getAdventure, getChapterStartNode, getChapter, getAdventureCharacters, getAdventureItems, getStartNode, getStorybookNextNode, getRelatedStories } from '@/lib/queries'
import { canViewMemberStory, getAuthorOrgPrivacy } from '@/lib/orgAccess'
import SceneTranslationWrapper from '@/components/reader/SceneTranslationWrapper'
import CopySceneButton from '@/components/reader/CopySceneButton'
import BackButton from '@/components/reader/BackButton'
import SceneTracker from '@/components/reader/SceneTracker'
import RestartButton from '@/components/reader/RestartButton'
import ReportButton from '@/components/reader/ReportButton'
import EndingView from '@/components/reader/EndingView'
import RelatedStories from '@/components/reader/RelatedStories'
import SceneEntrance from '@/components/reader/SceneEntrance'
import WorldBuilderSceneWrapper from '@/components/reader/WorldBuilderSceneWrapper'
import StorybookPageSpread from '@/components/reader/StorybookPageSpread'
import type { WBCharacter, WorldItem, SceneItemPickup } from '@/lib/worldBuilder'

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
  const isOrgAdmin = session?.user?.tier === 'organization'

  // Block private stories from non-owners
  if (!adventure?.isPublic && !isOwner && !isAdmin) {
    const orgAccess = session?.user?.email && adventure?.userEmail
      ? await canViewMemberStory(session.user.email, adventure.userEmail)
      : false
    if (!orgAccess) notFound()
  }

  // Block draft stories — only the owner and admins can preview
  if (adventure?.status === 'draft' && !isOwner && !isAdmin) notFound()

  // Block suspended stories — org admins can still view
  if (adventure?.status === 'suspended' && !isOrgAdmin && !isAdmin) notFound()

  // Count a read and capture referrer whenever a non-owner lands on the start node
  if (node.nodeType === 'start' && !isOwner && !isAdmin && adventure) {
    const reqHeaders = await headers()
    const { domain, category } = parseReferrer(reqHeaders.get('referer'))

    db.update(adventures)
      .set({ readCount: sql`${adventures.readCount} + 1` })
      .where(eq(adventures.id, adventure.id))
      .execute()
      .catch(() => {})

    db.insert(storyReferrers)
      .values({ adventureId: adventure.id, referrerDomain: domain, referrerCategory: category })
      .execute()
      .catch(() => {})
  }

  // Hide sharing controls when the story's org restricts public distribution
  const authorOrgPrivacy = adventure?.userEmail ? await getAuthorOrgPrivacy(adventure.userEmail) : null
  const canShare = !authorOrgPrivacy || authorOrgPrivacy === 'public'

  const isEnding = node.nodeType === 'ending'
  const isStart = node.nodeType === 'start'
  const isChapterEnd = node.nodeType === 'chapter_end'
  const isStorybook = adventure?.storyType === 'storybook'

  // Storybook pages have no choices — the next page is just the next block in
  // author-defined order (positionY), regardless of any choices that may exist.
  const nextStorybookNode = isStorybook ? await getStorybookNextNode(id, nodeId) : null

  // For chapter_end nodes: resolve the next chapter and the specific entry node.
  const nextChapter = isChapterEnd && node.nextChapterId ? await getChapter(node.nextChapterId) : null

  let nextEntryNodeId: string | null = null
  let nextEntryNodeTitle: string | null = null
  if (isChapterEnd) {
    if (node.chapterEntryNodeId) {
      nextEntryNodeId = node.chapterEntryNodeId
    } else if (choices.length === 1) {
      nextEntryNodeId = choices[0].targetNodeId
    } else if (choices.length === 0 && node.nextChapterId) {
      const fallback = await getChapterStartNode(id, node.nextChapterId)
      nextEntryNodeId = fallback?.id ?? null
      nextEntryNodeTitle = fallback?.title ?? null
    }
  }

  const isWorldBuilder = adventure?.storyType === 'world'
  const [characters, worldItems, startNode] = isWorldBuilder
    ? await Promise.all([
        getAdventureCharacters(id) as Promise<WBCharacter[]>,
        getAdventureItems(id) as Promise<WorldItem[]>,
        getStartNode(id),
      ])
    : [[], [], null] as [WBCharacter[], WorldItem[], null]

  const relatedStories = isEnding
    ? await getRelatedStories(id, (() => {
        try { return JSON.parse(adventure?.tags ?? '[]') } catch { return [] }
      })(), !!session?.user?.isAdult)
    : []

  const sceneItemPickups = (node.sceneItems as SceneItemPickup[] | null) ?? []

  // World Builder foe for this scene
  const sceneFoeId = (node as Record<string, unknown>).sceneFoeId as string | null ?? null
  const foeRunAwayNodeId = (node as Record<string, unknown>).foeRunAwayNodeId as string | null ?? null
  const sceneFoe = sceneFoeId
    ? ((characters as WBCharacter[]).find(c => c.id === sceneFoeId) ?? null)
    : null

  // ── World Builder path ─────────────────────────────────────────────────────
  if (isWorldBuilder) {
    const sceneHeader = (
      <>
        <SceneTracker
          adventureId={id}
          adventureTitle={adventure?.title ?? ''}
          nodeId={nodeId}
          nodeType={node.nodeType}
        />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {!isStart && <BackButton />}
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all"
            >
              <Compass size={13} />
              Back to Explore
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {canShare && <CopySceneButton content={node.content} choices={choices} adventureId={id} />}
            {isOwner && (
              <Link href={`/edit/${id}`} className="text-xs text-white/40 hover:text-white/70">Edit</Link>
            )}
          </div>
        </div>
      </>
    )

    const sceneFooter = (
      <div className="mt-10 pt-6 border-t border-white/10">
        {!isOwner && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white/80">Write your own adventure</p>
              <p className="text-xs text-violet-300/70 mt-0.5">From $2/week · cancel anytime</p>
            </div>
            <Link
              href="/sign-up"
              className="shrink-0 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Start writing →
            </Link>
          </div>
        )}
        <div className="flex justify-end">
          <ReportButton adventureId={id} />
        </div>
      </div>
    )

    // Chapter end and ending are rendered as children (no character effects on chapter transitions)
    const chapterEndContent = isChapterEnd ? (
      <div className="mt-10">
        <div className="text-center py-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-teal-900/40 border border-teal-500/30 rounded-2xl mb-6">
            <span className="text-teal-400 text-lg">✦</span>
            <p className="text-teal-200 font-semibold text-lg">End of Chapter</p>
            <span className="text-teal-400 text-lg">✦</span>
          </div>
          {choices.length > 1 && !node.chapterEntryNodeId ? (
            <div>
              <p className="text-white/50 mb-6">
                Continue to: <span className="font-medium text-white/70">{nextChapter?.title ?? 'Next Chapter'}</span>
              </p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                {choices.map((choice, index) => (
                  <Link
                    key={choice.id}
                    href={`/play/${id}/${choice.targetNodeId}`}
                    className="flex items-center gap-3 px-6 py-3 bg-teal-900/30 border-2 border-teal-500/30 hover:border-teal-400 hover:bg-teal-500/20 text-teal-200 font-semibold rounded-xl transition-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    {choice.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : nextEntryNodeId ? (
            <div>
              <p className="text-white/50 mb-6">
                Continue to: <span className="font-medium text-white/70">{nextChapter?.title ?? 'Next Chapter'}</span>
                {nextEntryNodeTitle && <span className="text-white/30"> — {nextEntryNodeTitle}</span>}
              </p>
              <Link
                href={`/play/${id}/${nextEntryNodeId}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-md"
              >
                Continue →
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-white/40 mb-4">No next chapter has been set.</p>
              <RestartButton href={`/play/${id}`} adventureId={id} />
            </div>
          )}
        </div>
      </div>
    ) : null

    const endingContent = isEnding ? (
      <div className="mt-10">
        <EndingView adventureId={id} restartHref={`/play/${id}`} />
        <RelatedStories stories={relatedStories} dark />
      </div>
    ) : null

    return (
      <>
        <div className="-mt-16 h-16 w-full"
          style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 60%, #0f172a 100%)' }}
        />
        <SceneEntrance>
          <WorldBuilderSceneWrapper
            adventureId={id}
            nodeId={nodeId}
            characters={characters}
            worldItems={worldItems}
            sceneItemPickups={sceneItemPickups}
            choices={isChapterEnd || isEnding ? [] : choices}
            isChapterEnd={isChapterEnd}
            isEnding={isEnding}
            sceneFoe={sceneFoe}
            foeRunAwayNodeId={foeRunAwayNodeId}
            startNodeId={startNode?.id ?? null}
            footer={sceneFooter}
          >
            <div className="py-10 px-6 max-w-2xl">
              {sceneHeader}
              <SceneTranslationWrapper
                node={node}
                choices={[]}
                adventureId={id}
                storyLanguage={adventure?.language ?? 'en'}
                userLanguage={session?.user?.languagePreference ?? null}
                dark
              />
              {chapterEndContent}
              {endingContent}
            </div>
          </WorldBuilderSceneWrapper>
        </SceneEntrance>
      </>
    )
  }

  // ── Storybook ───────────────────────────────────────────────────────────
  if (isStorybook) {
    return (
      <>
      <div className="-mt-16 h-16 w-full"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 60%, #0f172a 100%)' }}
      />
      <SceneEntrance>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <SceneTracker
          adventureId={id}
          adventureTitle={adventure?.title ?? ''}
          nodeId={nodeId}
          nodeType={node.nodeType}
        />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {!isStart && <BackButton />}
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all"
            >
              <Compass size={13} />
              Back to Explore
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {canShare && <CopySceneButton content={node.content} choices={choices} adventureId={id} />}
            {isOwner && (
              <Link href={`/edit/${id}`} className="text-xs text-gray-400 hover:text-gray-600">
                Edit
              </Link>
            )}
          </div>
        </div>

        <StorybookPageSpread node={node} />

        <div className="mt-10">
          {isEnding ? (
            <>
              <EndingView adventureId={id} restartHref={`/play/${id}`} />
              <RelatedStories stories={relatedStories} />
            </>
          ) : nextStorybookNode ? (
            <div className="flex justify-center pt-4">
              <Link
                href={`/play/${id}/${nextStorybookNode.id}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Turn the page →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">The story ends here.</p>
              <div className="mt-4">
                <RestartButton href={`/play/${id}`} adventureId={id} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          {!isOwner && (
            <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-teal-900">Write your own storybook</p>
                <p className="text-xs text-teal-600 mt-0.5">From $2/week · cancel anytime</p>
              </div>
              <Link
                href="/sign-up"
                className="shrink-0 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Start writing →
              </Link>
            </div>
          )}
          <div className="flex justify-end">
            <ReportButton adventureId={id} />
          </div>
        </div>
      </div>
      </SceneEntrance>
      </>
    )
  }

  // ── Standard story path ────────────────────────────────────────────────────
  return (
    <>
    <div className="-mt-16 h-16 w-full"
      style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 60%, #0f172a 100%)' }}
    />
    <SceneEntrance>
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
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 px-3 py-1.5 rounded-lg border border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all"
          >
            <Compass size={13} />
            Back to Explore
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {canShare && <CopySceneButton content={node.content} choices={choices} adventureId={id} />}
          {isOwner && (
            <Link href={`/edit/${id}`} className="text-xs text-gray-400 hover:text-gray-600">
              Edit
            </Link>
          )}
        </div>
      </div>

      <SceneTranslationWrapper
        node={node}
        choices={!isEnding && !isChapterEnd ? choices : []}
        adventureId={id}
        storyLanguage={adventure?.language ?? 'en'}
        userLanguage={session?.user?.languagePreference ?? null}
      />

      <div className="mt-10">
        {isChapterEnd ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-teal-50 border border-teal-200 rounded-2xl mb-6">
              <span className="text-teal-600 text-lg">✦</span>
              <p className="text-teal-800 font-semibold text-lg">End of Chapter</p>
              <span className="text-teal-600 text-lg">✦</span>
            </div>

            {choices.length > 1 && !node.chapterEntryNodeId ? (
              <div>
                <p className="text-gray-500 mb-6">
                  Continue to: <span className="font-medium text-gray-700">{nextChapter?.title ?? 'Next Chapter'}</span>
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  {choices.map((choice, index) => (
                    <Link
                      key={choice.id}
                      href={`/play/${id}/${choice.targetNodeId}`}
                      className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-teal-200 hover:border-teal-500 hover:bg-teal-50 text-teal-800 font-semibold rounded-xl transition-all shadow-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      {choice.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : nextEntryNodeId ? (
              <div>
                <p className="text-gray-500 mb-6">
                  Continue to: <span className="font-medium text-gray-700">{nextChapter?.title ?? 'Next Chapter'}</span>
                  {nextEntryNodeTitle && (
                    <span className="text-gray-400"> — {nextEntryNodeTitle}</span>
                  )}
                </p>
                <Link
                  href={`/play/${id}/${nextEntryNodeId}`}
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
          <>
            <EndingView adventureId={id} restartHref={`/play/${id}`} />
            <RelatedStories stories={relatedStories} />
          </>
        ) : choices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No choices available. This story ends here.</p>
            <div className="mt-4">
              <RestartButton href={`/play/${id}`} adventureId={id} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100">
        {!isOwner && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-violet-900">Write your own adventure</p>
              <p className="text-xs text-violet-500 mt-0.5">From $2/week · cancel anytime</p>
            </div>
            <Link
              href="/sign-up"
              className="shrink-0 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Start writing →
            </Link>
          </div>
        )}
        <div className="flex justify-end">
          <ReportButton adventureId={id} />
        </div>
      </div>
    </div>
    </SceneEntrance>
    </>
  )
}
