import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Tag, Lock, UserX, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { getPublicProfile, getPublicAdventuresByUsername, isBlocked, getFollowStatus, getFollowerCount, getFollowingCount, type PublicProfileAdventure } from '@/lib/queries'
import FollowButton from '@/components/shared/FollowButton'

const SITE_URL = 'https://www.storyquestor.com'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await getPublicProfile(username.toLowerCase())
  if (!profile) return { title: 'Profile Not Found' }

  return {
    title: `@${profile.username} | StoryQuestor`,
    description: `See public stories by @${profile.username} on StoryQuestor.`,
    alternates: { canonical: `${SITE_URL}/u/${profile.username}` },
  }
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      <Icon size={48} className="mx-auto text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}

function Avatar({ username }: { username: string }) {
  return (
    <div
      className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold text-white"
      style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.35), rgba(124,58,237,0.45))',
        border: '2px solid rgba(255,255,255,0.25)',
      }}
      aria-hidden="true"
    >
      {username[0]?.toUpperCase()}
    </div>
  )
}

function storyHref(story: PublicProfileAdventure): string {
  if (story.storySlug) return `/story/${story.storySlug}`
  return `/play/${story.id}`
}

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw ?? '[]') } catch { return [] }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const normalized = username.trim().toLowerCase()

  const [profile, session] = await Promise.all([
    getPublicProfile(normalized),
    getServerSession(authOptions),
  ])

  if (!profile) notFound()

  const isOwner = session?.user?.email === profile.email
  const isAdmin = !!session?.user?.isAdmin
  const viewerEmail = session?.user?.email ?? null

  if (!isOwner && !isAdmin && viewerEmail) {
    const blocked = await isBlocked(profile.email, viewerEmail)
    if (blocked) {
      return <EmptyState icon={UserX} title="Profile not available" description="This profile isn't available right now." />
    }
  }

  const [followerCount, followingCount, viewerFollowStatus] = await Promise.all([
    getFollowerCount(profile.email),
    getFollowingCount(profile.email),
    (!isOwner && viewerEmail) ? getFollowStatus(viewerEmail, profile.email) : Promise.resolve('none' as const),
  ])

  const canViewContent = profile.profileVisible || isOwner || isAdmin || viewerFollowStatus === 'accepted'
  const stories = canViewContent ? await getPublicAdventuresByUsername(normalized) : []
  const [spotlight, ...rest] = stories

  return (
    <>
      <div className="-mt-16 pt-8 pb-10 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3d0d7e 0%, #1e1040 50%, #0f172a 100%)' }}>
        {/* Top shimmer line, matching the global nav */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #a78bfa88, #f59e0b55, #a78bfa88, transparent)' }} />

        {/* Ambient color blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -left-16 w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.28) 0%, transparent 65%)' }} />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 70%)', transform: 'translate(25%, -25%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto pt-16">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar username={profile.username!} />
              <div className="min-w-0">
                <h1 className="text-3xl font-extrabold text-white truncate">@{profile.username}</h1>
                <p className="text-xs text-violet-300/70 mt-0.5">
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            {isOwner ? (
              <Link href="/profile" className="shrink-0 mt-1 text-xs text-violet-300 hover:text-white transition-colors">
                Edit your profile →
              </Link>
            ) : viewerEmail ? (
              <FollowButton username={profile.username!} initialStatus={viewerFollowStatus} />
            ) : (
              <Link href="/sign-in" className="shrink-0 mt-1 text-xs text-violet-300 hover:text-white transition-colors">
                Sign in to follow
              </Link>
            )}
          </div>

          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/10">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-white tabular-nums">{followerCount.toLocaleString()}</span>
              <span className="text-xs font-semibold text-violet-300/70 uppercase tracking-wider">
                Follower{followerCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-white tabular-nums">{followingCount.toLocaleString()}</span>
              <span className="text-xs font-semibold text-violet-300/70 uppercase tracking-wider">Following</span>
            </div>
            {canViewContent && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-white tabular-nums">{stories.length.toLocaleString()}</span>
                <span className="text-xs font-semibold text-violet-300/70 uppercase tracking-wider">
                  {stories.length === 1 ? 'Story' : 'Stories'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!canViewContent ? (
          <div className="text-center py-16">
            <Lock size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-semibold text-gray-800 mb-1">This profile is private</p>
            <p className="text-gray-500">
              {viewerFollowStatus === 'pending'
                ? 'Your follow request is pending approval.'
                : 'Follow this user to see their public stories once approved.'}
            </p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #ede9fe, #fef3c7)' }}>
              <BookOpen size={22} className="text-violet-500" />
            </div>
            {isOwner ? (
              <>
                <p className="text-lg font-semibold text-gray-800 mb-1.5">Your stories will show up here</p>
                <p className="text-gray-500 mb-5">Publish a story to share it with the world on this page.</p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                >
                  <Sparkles size={14} />
                  Start a story
                </Link>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-800 mb-1">No public stories yet</p>
                <p className="text-gray-500">@{profile.username} hasn&apos;t published anything public yet.</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {spotlight && (
              <Link
                href={storyHref(spotlight)}
                className="group block bg-white rounded-xl border border-violet-100 hover:border-violet-300 overflow-hidden transition-colors"
                style={{ animation: 'profile-card-in 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
              >
                <div className="flex flex-col md:flex-row">
                  {spotlight.coverImageUrl ? (
                    <div className="md:w-[42%] h-48 md:h-auto overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spotlight.coverImageUrl}
                        alt={spotlight.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="eager"
                      />
                    </div>
                  ) : (
                    <div className="md:w-[42%] h-2 md:h-auto shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }} />
                  )}
                  <div className="flex-1 p-6 flex flex-col justify-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-500 w-fit">
                      Latest story
                    </span>
                    <h2 className="text-xl font-bold" style={{ color: '#1e0a3c' }}>{spotlight.title}</h2>
                    {spotlight.description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{spotlight.description}</p>
                    )}
                    {parseTags(spotlight.tags).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {parseTags(spotlight.tags).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full">
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 mt-2 w-fit group-hover:gap-1.5 transition-all">
                      Play story
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((story, i) => {
                  const tags = parseTags(story.tags)
                  return (
                    <Link
                      key={story.id}
                      href={storyHref(story)}
                      className="group flex flex-col bg-white rounded-xl border border-violet-100 hover:border-violet-300 overflow-hidden transition-colors"
                      style={{ animation: 'profile-card-in 0.5s cubic-bezier(0.16,1,0.3,1) both', animationDelay: `${Math.min(i * 60, 300)}ms` }}
                    >
                      {story.coverImageUrl ? (
                        <div className="w-full h-36 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={story.coverImageUrl}
                            alt={story.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="h-1.5 w-full"
                          style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                      )}
                      <div className="flex-1 p-5 flex flex-col gap-2">
                        <h3 className="text-base font-bold" style={{ color: '#1e0a3c' }}>{story.title}</h3>
                        {story.description && (
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{story.description}</p>
                        )}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                            {tags.slice(0, 3).map(tag => (
                              <span key={tag} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full">
                                <Tag size={10} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
