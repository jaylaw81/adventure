'use client'

import { useEffect, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, UnderlineIcon, Link2, AlignLeft, AlignCenter,
  List, ListOrdered, Send, History, Users, ChevronRight, Loader2,
  CheckCircle2, AlertCircle,
} from 'lucide-react'
import { CHANGELOG } from '@/lib/changelog'

interface Blast {
  id: string
  subject: string
  sentByEmail: string
  recipientCount: number
  sentAt: string
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

export default function MessagesPage() {
  const [subject, setSubject] = useState('')
  const [blasts, setBlasts] = useState<Blast[]>([])
  const [loadingBlasts, setLoadingBlasts] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose')
  const [changelogOpen, setChangelogOpen] = useState(true)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write your update email here…' }),
    ],
    editorProps: {
      attributes: {
        class: 'min-h-[220px] px-4 py-3 focus:outline-none text-sm text-slate-800 leading-relaxed',
      },
    },
  })

  useEffect(() => {
    fetch('/api/admin/messages')
      .then(r => r.json())
      .then(data => { setBlasts(data); setLoadingBlasts(false) })
  }, [])

  const insertChangelog = useCallback((text: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(`<p>${text}</p>`).run()
  }, [editor])

  const handleSend = useCallback(async () => {
    const bodyHtml = editor?.getHTML() ?? ''
    if (!subject.trim() || !bodyHtml || bodyHtml === '<p></p>') {
      setSendResult({ type: 'error', msg: 'Subject and message body are required.' })
      return
    }
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyHtml }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSendResult({ type: 'error', msg: data.error ?? 'Send failed.' })
        return
      }
      const { recipientCount, total } = await res.json()
      setSendResult({ type: 'success', msg: `Sent to ${recipientCount} of ${total} subscribed users.` })
      setSubject('')
      editor?.commands.clearContent()
      const updated = await fetch('/api/admin/messages').then(r => r.json())
      setBlasts(updated)
      setActiveTab('history')
    } finally {
      setSending(false)
    }
  }, [editor, subject])

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Email Blast</h1>
        <p className="text-slate-500 text-sm mt-1">Send product updates to all subscribed users</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">

        {/* Changelog sidebar */}
        <div className="xl:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setChangelogOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-700">Feature Changelog</span>
              <ChevronRight size={14} className={`text-slate-400 transition-transform ${changelogOpen ? 'rotate-90' : ''}`} />
            </button>
            {changelogOpen && (
              <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                {CHANGELOG.map(entry => {
                  const label = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })
                  return (
                    <div key={entry.date} className="px-4 py-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
                      <ul className="space-y-2">
                        {entry.items.map((item, i) => (
                          <li key={i} className="text-xs text-slate-600 leading-relaxed">
                            <button
                              type="button"
                              onClick={() => insertChangelog(item)}
                              className="text-left hover:text-violet-700 transition-colors"
                              title="Click to insert into editor"
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 px-1">Click any changelog item to insert it into the editor.</p>
        </div>

        {/* Main compose area */}
        <div className="flex-1 min-w-0">

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
            {(['compose', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'compose' ? <Send size={13} /> : <History size={13} />}
                {tab === 'compose' ? 'Compose' : 'Sent History'}
              </button>
            ))}
          </div>

          {activeTab === 'compose' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Subject */}
              <div className="px-4 py-3 border-b border-slate-200">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What's new in StoryQuestor…"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Toolbar */}
              {editor && (
                <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-slate-50">
                  <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <Bold size={14} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <Italic size={14} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                    <UnderlineIcon size={14} />
                  </ToolbarButton>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
                    <AlignLeft size={14} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
                    <AlignCenter size={14} />
                  </ToolbarButton>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                    <List size={14} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
                    <ListOrdered size={14} />
                  </ToolbarButton>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <ToolbarButton
                    onClick={() => {
                      const url = window.prompt('Enter URL')
                      if (!url) return
                      editor.chain().focus().setLink({ href: url }).run()
                    }}
                    active={editor.isActive('link')}
                    title="Insert link"
                  >
                    <Link2 size={14} />
                  </ToolbarButton>
                </div>
              )}

              {/* Editor */}
              <EditorContent editor={editor} />

              {/* Footer / send */}
              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users size={14} />
                  Sends to all subscribed users
                </div>
                <div className="flex items-center gap-3">
                  {sendResult && (
                    <span className={`flex items-center gap-1.5 text-sm ${sendResult.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {sendResult.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {sendResult.msg}
                    </span>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? 'Sending…' : 'Send Blast'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {loadingBlasts ? (
                <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
              ) : blasts.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No email blasts sent yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {blasts.map(blast => (
                    <div key={blast.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{blast.subject}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Sent {new Date(blast.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {' '}by {blast.sentByEmail}
                          </p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Users size={10} />
                          {blast.recipientCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
