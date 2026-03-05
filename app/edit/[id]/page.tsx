import { notFound } from 'next/navigation'
import { getAdventureWithData } from '@/lib/queries'
import Canvas from '@/components/editor/Canvas'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const adventure = await getAdventureWithData(id)
  if (!adventure) notFound()

  return (
    <Canvas
      adventure={adventure}
      initialNodes={adventure.nodes}
      initialChoices={adventure.choices}
    />
  )
}
