'use client'

import Link from 'next/link'
import { BookOpen, LogOut } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3 shadow-lg">
      <Link href="/" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
        <BookOpen size={24} />
        <span className="text-xl font-bold">Adventure Maker</span>
      </Link>

      <Link href="/explore" className="ml-6 text-sm text-gray-300 hover:text-amber-400 transition-colors hidden sm:block">
        Explore
      </Link>
      <Link href="/how-to" className="text-sm text-gray-300 hover:text-amber-400 transition-colors hidden sm:block">
        Guide
      </Link>

      <div className="ml-auto flex items-center gap-3">
        {status === 'loading' ? null : session ? (
          <>
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                  {(session.user?.name ?? session.user?.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-300 hidden sm:block">
                {session.user?.name ?? session.user?.email}
              </span>
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  )
}
