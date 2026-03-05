import { redirect } from 'next/navigation'
import { getStartNode } from '@/lib/queries'

export default async function PlayEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const startNode = await getStartNode(id)
  if (!startNode) {
    redirect('/')
  }
  redirect(`/play/${id}/${startNode.id}`)
}
