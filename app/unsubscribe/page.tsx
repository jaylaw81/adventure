import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import GaFireOnMount from '@/components/analytics/GaFireOnMount'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <Message icon="error" title="Invalid link" body="This unsubscribe link is missing a token. If you received this link in an email, please try clicking it again." />
  }

  const [user] = await db
    .select({ email: users.email, emailSubscribed: users.emailSubscribed })
    .from(users)
    .where(eq(users.unsubscribeToken, token))

  if (!user) {
    return <Message icon="error" title="Link not recognised" body="We couldn't find an account matching this unsubscribe link. You may have already unsubscribed or the link may be invalid." />
  }

  if (!user.emailSubscribed) {
    return <Message icon="success" title="Already unsubscribed" body="You've already opted out of StoryQuestor update emails. You won't receive any more messages from us." />
  }

  await db
    .update(users)
    .set({ emailSubscribed: false })
    .where(eq(users.unsubscribeToken, token))

  return (
    <>
      <GaFireOnMount name="email_unsubscribed" params={{ method: 'email_link' }} />
      <Message icon="success" title="Unsubscribed" body="You've been successfully removed from StoryQuestor update emails. You can re-subscribe at any time from your profile settings." />
    </>
  )
}

function Message({ icon, title, body }: { icon: 'success' | 'error'; title: string; body: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${icon === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
          {icon === 'success'
            ? <CheckCircle2 size={28} className="text-green-600" />
            : <XCircle size={28} className="text-red-500" />
          }
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{body}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Go to StoryQuestor
        </Link>
        <p className="text-xs text-slate-400 mt-4">
          You can manage your email preferences at any time in{' '}
          <Link href="/profile" className="underline hover:text-slate-600">Profile Settings</Link>.
        </p>
      </div>
    </div>
  )
}
