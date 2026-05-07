import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdventureWithData } from '@/lib/queries'
import Canvas from '@/components/editor/Canvas'

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

  return (
    <Canvas
      adventure={adventure}
      initialNodes={adventure.nodes}
      initialChoices={adventure.choices}
      initialChapters={adventure.chapters}
    />
  )
}
