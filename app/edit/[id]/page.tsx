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
  if (!session?.user?.email || session.user.email !== adventure.userEmail) redirect('/')

  return (
    <Canvas
      adventure={adventure}
      initialNodes={adventure.nodes}
      initialChoices={adventure.choices}
    />
  )
}
