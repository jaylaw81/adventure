import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireOwner } from '@/lib/requireOwner'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AnalyzeResult {
  wordCount: number
  issues: { original: string; fixed: string; explanation: string }[]
  hints: string[]
  quality: 'needs_work' | 'good' | 'great'
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  const { id } = await params
  const owned = await requireOwner(id)
  if (owned.error) return owned.error

  const session = await getServerSession(authOptions)
  if (session?.user?.tier !== 'organization') {
    return NextResponse.json({ error: 'Writing Assistant is available on the Organization tier.' }, { status: 403 })
  }

  const { title, content, nodeType } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'No content to analyze' }, { status: 400 })
  }

  const wordCount = content.trim().split(/\s+/).length

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `You are a writing assistant for an interactive fiction story editor.
Analyze the scene content and return ONLY valid JSON matching this exact shape:
{
  "issues": [{ "original": string, "fixed": string, "explanation": string }],
  "hints": [string],
  "quality": "needs_work" | "good" | "great"
}

Rules:
- "issues": grammar, spelling, punctuation errors only. Each must have a short original excerpt (max 8 words), a corrected version, and a brief explanation. Max 5 issues. Empty array if none.
- "hints": 1-3 actionable writing tips specific to interactive fiction (content depth, scene-setting, reader engagement, choice setup). Skip generic advice.
- "quality": "needs_work" if under 40 words or many issues, "great" if vivid and well-written, otherwise "good".
- Return raw JSON only, no markdown fences.`,
    messages: [
      {
        role: 'user',
        content: `Scene type: ${nodeType}\nTitle: ${title || '(untitled)'}\n\nContent:\n${content}`,
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  let parsed: Omit<AnalyzeResult, 'wordCount'>
  try {
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Analysis failed — please try again' }, { status: 500 })
  }

  return NextResponse.json({ ...parsed, wordCount } satisfies AnalyzeResult)
}
