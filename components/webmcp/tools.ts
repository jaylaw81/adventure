/**
 * WebMCP tool definitions for StoryQuestor.
 *
 * Two tiers:
 *  - `discoveryTools` — always registered; read-only, no auth. Let an in-browser
 *    agent find and summarise published stories and point the reader at them.
 *  - `authoringTools()` — registered only when the visitor is signed in. These
 *    call the same `/api/*` endpoints the editor UI uses, as the current user.
 *
 * Every tool maps to an endpoint that already exists — see `app/api/`.
 */

import { apiFetch, toResult, type WebMcpTool } from './registry'

const SITE = 'https://www.storyquestor.com'

// ── Discovery (public, read-only) ───────────────────────────────────────────

type ExploreRow = {
  id: string
  title: string
  description: string
  audience: string
  tags: string
  storyType: string | null
  storySlug: string | null
  shareToken: string | null
  readCount: number
  avgRating: number | null
  reviewCount: number
  authorDisplayName: string | null
  authorUsername: string | null
  updatedAt: string
}

function storyUrl(row: Pick<ExploreRow, 'id' | 'storySlug' | 'shareToken'>): string {
  if (row.storySlug) return `${SITE}/story/${row.storySlug}`
  if (row.shareToken) return `${SITE}/s/${row.shareToken}`
  return `${SITE}/play/${row.id}`
}

function parseTags(raw: string): string[] {
  try {
    const t = JSON.parse(raw ?? '[]')
    return Array.isArray(t) ? t : []
  } catch {
    return []
  }
}

function shape(row: ExploreRow) {
  return {
    title: row.title,
    description: row.description,
    storyType: row.storyType ?? 'path',
    audience: row.audience,
    tags: parseTags(row.tags),
    reads: row.readCount,
    rating: row.avgRating,
    reviews: row.reviewCount,
    author: row.authorDisplayName ?? row.authorUsername ?? 'Anonymous',
    url: storyUrl(row),
  }
}

const searchStories: WebMcpTool = {
  name: 'storyquestor_search_stories',
  description:
    'Search the public StoryQuestor library of choose-your-own-adventure and interactive stories. ' +
    'Filter by keyword, story type, tag, or minimum rating. Returns titles, descriptions, tags, ' +
    'ratings, read counts, and a link to read each story.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Keyword to match against title, description, or tags' },
      storyType: {
        type: 'string',
        enum: ['path', 'world', 'storybook'],
        description: 'path = branching choices, world = stat/character-driven, storybook = illustrated linear',
      },
      tag: { type: 'string', description: 'Genre/theme tag, e.g. "fantasy", "horror", "mystery"' },
      minRating: { type: 'number', description: 'Only stories with an average rating at or above this (1–5)' },
      limit: { type: 'number', description: 'Max results to return (default 10, max 50)' },
    },
  },
  async execute({ query, storyType, tag, minRating, limit }) {
    const res = await apiFetch('/api/explore')
    if (res.isError) return res

    let rows: ExploreRow[]
    try {
      rows = JSON.parse(res.content[0].text)
    } catch {
      return toResult('Error: could not parse story library', true)
    }

    const q = typeof query === 'string' ? query.toLowerCase().trim() : ''
    const tagQ = typeof tag === 'string' ? tag.toLowerCase().trim() : ''
    const cap = Math.min(Math.max(Number(limit) || 10, 1), 50)

    const matched = rows
      .filter((r) => {
        if (storyType && (r.storyType ?? 'path') !== storyType) return false
        if (typeof minRating === 'number' && (r.avgRating ?? 0) < minRating) return false
        if (tagQ && !parseTags(r.tags).some((t) => t.toLowerCase().includes(tagQ))) return false
        if (q) {
          const hay = `${r.title} ${r.description} ${parseTags(r.tags).join(' ')}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .slice(0, cap)
      .map(shape)

    return toResult({ count: matched.length, stories: matched })
  },
}

const getStoryDetails: WebMcpTool = {
  name: 'storyquestor_get_story_details',
  description:
    'Get full details for one published story by its slug or id, including a direct link to start reading it.',
  inputSchema: {
    type: 'object',
    properties: {
      slug: { type: 'string', description: 'The story slug from its URL (/story/<slug>)' },
      id: { type: 'string', description: 'The story id (alternative to slug)' },
    },
  },
  async execute({ slug, id }) {
    const res = await apiFetch('/api/explore')
    if (res.isError) return res
    let rows: ExploreRow[]
    try {
      rows = JSON.parse(res.content[0].text)
    } catch {
      return toResult('Error: could not parse story library', true)
    }
    const row = rows.find(
      (r) => (slug && r.storySlug === slug) || (id && r.id === id),
    )
    if (!row) return toResult('No published story found for that slug or id.', true)
    return toResult({ ...shape(row), readFrom: `${SITE}/play/${row.id}` })
  },
}

const listGenres: WebMcpTool = {
  name: 'storyquestor_list_genres',
  description:
    'List the genre/theme tags that currently have published stories, with how many stories each has. ' +
    'Useful before calling storyquestor_search_stories with a tag filter.',
  inputSchema: { type: 'object', properties: {} },
  async execute() {
    const res = await apiFetch('/api/explore')
    if (res.isError) return res
    let rows: ExploreRow[]
    try {
      rows = JSON.parse(res.content[0].text)
    } catch {
      return toResult('Error: could not parse story library', true)
    }
    const counts = new Map<string, number>()
    for (const r of rows) {
      for (const t of parseTags(r.tags)) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    const genres = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
    return toResult({ genres })
  },
}

// ── Authoring (signed-in only) ──────────────────────────────────────────────

const listMyStories: WebMcpTool = {
  name: 'storyquestor_list_my_stories',
  description:
    "List the signed-in user's own stories (drafts and published), with their id, status, type, " +
    'read count, and an edit link. Use the returned id with the other authoring tools.',
  inputSchema: { type: 'object', properties: {} },
  sensitive: true,
  async execute() {
    const res = await apiFetch('/api/adventures')
    if (res.isError) return res
    try {
      const rows = JSON.parse(res.content[0].text) as Array<Record<string, unknown>>
      return toResult(
        rows.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          isPublic: r.isPublic,
          storyType: r.storyType ?? 'path',
          editorMode: r.editorMode,
          reads: r.readCount ?? 0,
          editUrl: `${SITE}/edit/${r.id}`,
        })),
      )
    } catch {
      return res
    }
  },
}

const createStory: WebMcpTool = {
  name: 'storyquestor_create_story',
  description:
    'Create a new story for the signed-in user. Starts as a private draft. Optionally seed it from a ' +
    'small/medium/large branching template. Returns the new story id and edit URL.',
  inputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Story title (required)' },
      description: { type: 'string', description: 'Short blurb shown on Explore' },
      storyType: {
        type: 'string',
        enum: ['path', 'world', 'storybook'],
        description: 'Defaults to a branching "path" story. world/storybook may require a subscription.',
      },
      editorMode: {
        type: 'string',
        enum: ['node', 'block'],
        description: 'node = visual canvas, block = linear list (default node)',
      },
      template: {
        type: 'string',
        enum: ['small', 'medium', 'large'],
        description: 'Optional starter branching structure',
      },
      chapterCount: { type: 'number', description: 'Split a templated story into N chapters (0 = none)' },
    },
    required: ['title'],
  },
  sensitive: true,
  async execute(args) {
    if (!args.title || typeof args.title !== 'string') {
      return toResult('Error: a title is required.', true)
    }
    return apiFetch('/api/adventures', {
      method: 'POST',
      body: JSON.stringify({
        title: args.title,
        description: args.description ?? '',
        storyType: args.storyType,
        editorMode: args.editorMode ?? 'node',
        template: args.template,
        chapterCount: args.chapterCount ?? 0,
      }),
    })
  },
}

const getStoryMap: WebMcpTool = {
  name: 'storyquestor_get_story_map',
  description:
    'Get the full scene graph for one of the user\'s stories: every scene (id, title, type, content) ' +
    'and every choice (source → target with its label). Use this to understand structure before editing.',
  inputSchema: {
    type: 'object',
    properties: { adventureId: { type: 'string' } },
    required: ['adventureId'],
  },
  sensitive: true,
  async execute({ adventureId }) {
    const id = String(adventureId ?? '')
    if (!id) return toResult('Error: adventureId is required.', true)
    const [nodesRes, choicesRes] = await Promise.all([
      apiFetch(`/api/adventures/${id}/nodes`),
      apiFetch(`/api/adventures/${id}/choices`),
    ])
    if (nodesRes.isError) return nodesRes
    if (choicesRes.isError) return choicesRes
    try {
      const nodes = JSON.parse(nodesRes.content[0].text) as Array<Record<string, unknown>>
      const choices = JSON.parse(choicesRes.content[0].text) as Array<Record<string, unknown>>
      return toResult({
        scenes: nodes.map((n) => ({
          id: n.id,
          title: n.title,
          type: n.nodeType,
          content: n.content,
        })),
        choices: choices
          .sort((a, b) => Number(a.orderIndex) - Number(b.orderIndex))
          .map((c) => ({
            id: c.id,
            from: c.sourceNodeId,
            to: c.targetNodeId,
            label: c.label,
          })),
      })
    } catch {
      return toResult('Error: could not parse story map', true)
    }
  },
}

const addScene: WebMcpTool = {
  name: 'storyquestor_add_scene',
  description:
    'Add a new scene (node) to one of the user\'s stories. Returns the created scene with its id, ' +
    'which you can then link with storyquestor_connect_scenes.',
  inputSchema: {
    type: 'object',
    properties: {
      adventureId: { type: 'string' },
      title: { type: 'string' },
      content: { type: 'string', description: 'The scene prose the reader sees' },
      nodeType: {
        type: 'string',
        enum: ['start', 'scene', 'ending'],
        description: 'Defaults to "scene". Only one "start" per story.',
      },
    },
    required: ['adventureId', 'title'],
  },
  sensitive: true,
  async execute({ adventureId, title, content, nodeType }) {
    const id = String(adventureId ?? '')
    if (!id || !title) return toResult('Error: adventureId and title are required.', true)
    return apiFetch(`/api/adventures/${id}/nodes`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        content: content ?? '',
        nodeType: nodeType ?? 'scene',
      }),
    })
  },
}

const updateScene: WebMcpTool = {
  name: 'storyquestor_update_scene',
  description: "Update the title, prose, or type of an existing scene in one of the user's stories.",
  inputSchema: {
    type: 'object',
    properties: {
      adventureId: { type: 'string' },
      nodeId: { type: 'string' },
      title: { type: 'string' },
      content: { type: 'string' },
      nodeType: { type: 'string', enum: ['start', 'scene', 'ending'] },
    },
    required: ['adventureId', 'nodeId'],
  },
  sensitive: true,
  async execute({ adventureId, nodeId, title, content, nodeType }) {
    const id = String(adventureId ?? '')
    const nid = String(nodeId ?? '')
    if (!id || !nid) return toResult('Error: adventureId and nodeId are required.', true)
    const body: Record<string, unknown> = {}
    if (title !== undefined) body.title = title
    if (content !== undefined) body.content = content
    if (nodeType !== undefined) body.nodeType = nodeType
    return apiFetch(`/api/adventures/${id}/nodes/${nid}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },
}

const connectScenes: WebMcpTool = {
  name: 'storyquestor_connect_scenes',
  description:
    'Create a choice linking one scene to another in the user\'s story. The label is the option text ' +
    'the reader clicks. Order controls how choices are stacked on the source scene.',
  inputSchema: {
    type: 'object',
    properties: {
      adventureId: { type: 'string' },
      sourceNodeId: { type: 'string', description: 'Scene the choice appears on' },
      targetNodeId: { type: 'string', description: 'Scene the choice leads to' },
      label: { type: 'string', description: 'The choice text, e.g. "Open the door"' },
      orderIndex: { type: 'number', description: 'Position among the source scene\'s choices (default 0)' },
    },
    required: ['adventureId', 'sourceNodeId', 'targetNodeId', 'label'],
  },
  sensitive: true,
  async execute({ adventureId, sourceNodeId, targetNodeId, label, orderIndex }) {
    const id = String(adventureId ?? '')
    if (!id || !sourceNodeId || !targetNodeId || !label) {
      return toResult('Error: adventureId, sourceNodeId, targetNodeId and label are required.', true)
    }
    return apiFetch(`/api/adventures/${id}/choices`, {
      method: 'POST',
      body: JSON.stringify({ sourceNodeId, targetNodeId, label, orderIndex: orderIndex ?? 0 }),
    })
  },
}

const checkStory: WebMcpTool = {
  name: 'storyquestor_check_story',
  description:
    'Run the pre-publish validation on one of the user\'s stories — flags missing start scene, ' +
    'dead ends, unreachable endings, and broken chapter transitions. Returns issues and whether it can publish.',
  inputSchema: {
    type: 'object',
    properties: { adventureId: { type: 'string' } },
    required: ['adventureId'],
  },
  sensitive: true,
  async execute({ adventureId }) {
    const id = String(adventureId ?? '')
    if (!id) return toResult('Error: adventureId is required.', true)
    return apiFetch(`/api/adventures/${id}/validate`)
  },
}

const publishStory: WebMcpTool = {
  name: 'storyquestor_publish_story',
  description:
    'Publish one of the user\'s stories: makes it public, activates it if it was a draft, and gives it ' +
    'a shareable link. Run storyquestor_check_story first. This changes what other people can see.',
  inputSchema: {
    type: 'object',
    properties: { adventureId: { type: 'string' } },
    required: ['adventureId'],
  },
  sensitive: true,
  async execute({ adventureId }) {
    const id = String(adventureId ?? '')
    if (!id) return toResult('Error: adventureId is required.', true)
    return apiFetch(`/api/adventures/${id}/share`, { method: 'POST' })
  },
}

const unpublishStory: WebMcpTool = {
  name: 'storyquestor_unpublish_story',
  description:
    "Move one of the user's published stories back to a private draft. It disappears from Explore " +
    'and shared links stop working.',
  inputSchema: {
    type: 'object',
    properties: { adventureId: { type: 'string' } },
    required: ['adventureId'],
  },
  sensitive: true,
  async execute({ adventureId }) {
    const id = String(adventureId ?? '')
    if (!id) return toResult('Error: adventureId is required.', true)
    return apiFetch(`/api/adventures/${id}/share`, { method: 'PATCH' })
  },
}

const getStoryAnalytics: WebMcpTool = {
  name: 'storyquestor_get_story_analytics',
  description:
    'Get read counts and referrer breakdown (by category, top domains, last 30 days daily) for one of ' +
    "the user's stories. Requires a monthly subscription.",
  inputSchema: {
    type: 'object',
    properties: { adventureId: { type: 'string' } },
    required: ['adventureId'],
  },
  sensitive: true,
  async execute({ adventureId }) {
    const id = String(adventureId ?? '')
    if (!id) return toResult('Error: adventureId is required.', true)
    return apiFetch(`/api/adventures/${id}/analytics`)
  },
}

// ── Exports ────────────────────────────────────────────────────────────────

export const discoveryTools: WebMcpTool[] = [
  searchStories,
  getStoryDetails,
  listGenres,
]

export const authoringTools: WebMcpTool[] = [
  listMyStories,
  createStory,
  getStoryMap,
  addScene,
  updateScene,
  connectScenes,
  checkStory,
  publishStory,
  unpublishStory,
  getStoryAnalytics,
]
