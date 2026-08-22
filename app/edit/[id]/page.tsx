import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdventureWithData } from '@/lib/queries'
import { canCreateStories } from '@/lib/subscription'
import Canvas from '@/components/editor/Canvas'
import BlockCanvas from '@/components/editor/block/BlockCanvas'
import type { WorldItem, WBCharacter } from '@/lib/worldBuilder'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [adventure, session] = await Promise.all([
    getAdventureWithData(id),
    getServerSession(authOptions),
  ])
  if (!adventure) notFound()
  const isOwner = session?.user?.email === adventure.userEmail
  const isAdmin = !!session?.user?.isAdmin
  if (!session?.user?.email || (!isOwner && !isAdmin)) redirect('/')

  if (!isAdmin) {
    const allowed = await canCreateStories(session.user.email)
    if (!allowed) redirect(`/subscribe?from=/edit/${id}`)
  }

  // Storybook is always Block Builder — its linear page flow has no use for a
  // freeform canvas, so this overrides any stale editorMode on older stories.
  if (adventure.editorMode === 'block' || adventure.storyType === 'storybook') {
    return (
      <BlockCanvas
        adventure={adventure}
        initialNodes={adventure.nodes}
        initialChoices={adventure.choices}
      />
    )
  }

  return (
    <Canvas
      adventure={adventure}
      initialNodes={adventure.nodes}
      initialChoices={adventure.choices}
      initialChapters={adventure.chapters}
      initialCharacters={adventure.characters as WBCharacter[]}
      initialItems={adventure.items as WorldItem[]}
    />
  )
}
