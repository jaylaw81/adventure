import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canCreateStories } from '@/lib/subscription'
import CreateStoryForm from './CreateStoryForm'

export default async function CreatePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/sign-in')

  const allowed = await canCreateStories(session.user.email)
  if (!allowed) redirect('/subscribe?from=/create')

  return <CreateStoryForm />
}
