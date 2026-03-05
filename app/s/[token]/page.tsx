import { redirect, notFound } from 'next/navigation'
import { getAdventureByToken, getStartNode } from '@/lib/queries'

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const adventure = await getAdventureByToken(token)
  if (!adventure) notFound()

  const startNode = await getStartNode(adventure.id)
  if (!startNode) notFound()

  redirect(`/play/${adventure.id}/${startNode.id}`)
}
