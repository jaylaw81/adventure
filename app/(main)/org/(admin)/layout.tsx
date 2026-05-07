import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizations } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import OrgSidebar from '@/components/org/OrgSidebar'

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || session.user.tier !== 'organization') {
    redirect('/')
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.adminEmail, session.user.email))
    .limit(1)

  if (!org) redirect('/')

  return (
    <>
      {/* Dark banner behind transparent header */}
      <div className="-mt-16 h-16 w-full"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 60%, #0f172a 100%)' }}
      />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <OrgSidebar orgName={org.name} />
        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </div>
    </>
  )
}
