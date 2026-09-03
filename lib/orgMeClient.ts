'use client'

/**
 * Client-side cache for `GET /api/org/me`.
 *
 * The Header and the Dashboard both need the current user's org membership, and
 * the Header's effect re-ran on every session refresh (i.e. every window focus),
 * firing a 3-table join per navigation. Org membership changes rarely, so we
 * cache the result per tab for a few minutes and de-dupe concurrent callers.
 */

export interface OrgMe {
  orgId?: string
  orgName?: string
  orgPrivacyLevel?: string
  groupId?: string | null
  groupName?: string | null
  groupPrivacyLevel?: string | null
  role?: string
  roleScope?: string | null
  status?: string
}

const TTL_MS = 5 * 60 * 1000
const STORAGE_KEY = 'org_me_v1'

let inflight: Promise<OrgMe | null> | null = null

function readCache(): OrgMe | null | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const { value, at } = JSON.parse(raw)
    if (Date.now() - at > TTL_MS) return undefined
    return value
  } catch {
    return undefined
  }
}

function writeCache(value: OrgMe | null): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: Date.now() }))
  } catch {
    /* private mode / storage disabled — just skip caching */
  }
}

export async function fetchOrgMe(): Promise<OrgMe | null> {
  const cached = readCache()
  if (cached !== undefined) return cached
  if (inflight) return inflight

  inflight = fetch('/api/org/me')
    .then(r => (r.ok ? r.json() : null))
    .then((data: OrgMe | null) => {
      writeCache(data ?? null)
      return data ?? null
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })

  return inflight
}

/** Call after any action that changes the user's org membership. */
export function clearOrgMeCache(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
