/**
 * Thin adapter around the emerging WebMCP browser API
 * (W3C Web Machine Learning CG — `navigator.modelContext` / `document.modelContext`).
 *
 * The spec is still in flux across browsers (Edge 147 ships it on `navigator`,
 * Chrome's origin trial exposes it on `document`, and the shape of the value
 * returned by `registerTool` has changed between drafts). This module hides all
 * of that so the rest of the app can just hand over a list of tools.
 */

export type WebMcpToolResult = {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}

export type WebMcpTool = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  /** Runs in the page with the user's own session/cookies. */
  execute: (args: Record<string, unknown>) => Promise<WebMcpToolResult>
  /** Mark tools that change or expose account data so we can prompt first. */
  sensitive?: boolean
}

type ModelContextLike = {
  registerTool?: (tool: unknown, options?: unknown) => unknown
  unregisterTool?: (name: string) => void
  requestUserInteraction?: () => Promise<unknown> | unknown
}

function getModelContext(): ModelContextLike | null {
  if (typeof window === 'undefined') return null
  const nav = navigator as unknown as { modelContext?: ModelContextLike }
  const doc = document as unknown as { modelContext?: ModelContextLike }
  return nav.modelContext ?? doc.modelContext ?? null
}

export function isWebMcpAvailable(): boolean {
  return getModelContext() != null
}

/** Wrap a plain string / object into the MCP content shape. */
export function toResult(value: unknown, isError = false): WebMcpToolResult {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return { content: [{ type: 'text', text }], isError }
}

/**
 * Same-origin fetch helper — cookies ride along, so the tool acts as the
 * signed-in user with no extra auth wiring.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<WebMcpToolResult> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      credentials: 'same-origin',
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const msg =
        (body && (body.error || body.message)) || `Request failed (${res.status})`
      return toResult(`Error: ${msg}`, true)
    }
    return toResult(body)
  } catch (err) {
    return toResult(
      `Error: ${err instanceof Error ? err.message : 'network error'}`,
      true,
    )
  }
}

/**
 * Register a set of tools. Returns a cleanup function that unregisters them all,
 * regardless of which return convention the current browser uses.
 */
export function registerTools(tools: WebMcpTool[]): () => void {
  const mc = getModelContext()
  if (!mc?.registerTool) return () => {}

  const cleanups: (() => void)[] = []

  for (const tool of tools) {
    const descriptor = {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: async (args: Record<string, unknown> = {}) => {
        if (tool.sensitive && typeof mc.requestUserInteraction === 'function') {
          try {
            await mc.requestUserInteraction()
          } catch {
            /* browser declined / not needed — the consent UI still gates it */
          }
        }
        return tool.execute(args ?? {})
      },
    }

    try {
      const handle = mc.registerTool(descriptor)
      if (typeof handle === 'function') {
        cleanups.push(handle as () => void)
      } else if (
        handle &&
        typeof (handle as { unregister?: unknown }).unregister === 'function'
      ) {
        cleanups.push(() => (handle as { unregister: () => void }).unregister())
      } else if (typeof mc.unregisterTool === 'function') {
        cleanups.push(() => mc.unregisterTool?.(tool.name))
      }
    } catch {
      /* a name collision or unsupported schema — skip this one */
    }
  }

  return () => {
    for (const fn of cleanups) {
      try {
        fn()
      } catch {
        /* ignore */
      }
    }
  }
}
