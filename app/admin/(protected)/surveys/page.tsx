'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Settings2, ChevronDown, ChevronUp, Plus, Trash2, Save,
  RotateCcw, GripVertical, CheckCircle, Loader2, AlertCircle, X,
  ClipboardList,
} from 'lucide-react'

type QuestionType = 'stars' | 'nps' | 'multiple_choice' | 'yes_no_maybe' | 'text'

interface SurveyQuestion {
  key: string
  text: string
  type: QuestionType
  options?: string[]
  required: boolean
  helper?: string
}

interface SurveyDef {
  slug: string
  title: string
  intro: string
  surveyKind: 'quantitative' | 'qualitative'
  minDaysBetweenShows: number
  dismissCooldownDays: number
  questions: SurveyQuestion[]
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'stars', label: 'Star rating (1–5)' },
  { value: 'nps', label: 'NPS score (0–10)' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'yes_no_maybe', label: 'Yes / No / Maybe' },
  { value: 'text', label: 'Open text' },
]

const EMPTY_SURVEY: Omit<SurveyDef, 'slug'> = {
  title: '',
  intro: '',
  surveyKind: 'quantitative',
  minDaysBetweenShows: 30,
  dismissCooldownDays: 7,
  questions: [],
}

const NEW_TAB_KEY = '__new__'

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60)
}

/* ─── Question editor ─────────────────────────────────────────── */

function QuestionEditor({
  question, index, total, onChange, onRemove, onMove,
}: {
  question: SurveyQuestion
  index: number
  total: number
  onChange: (q: SurveyQuestion) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const [open, setOpen] = useState(true)
  const update = (patch: Partial<SurveyQuestion>) => onChange({ ...question, ...patch })
  const addOption = () => update({ options: [...(question.options ?? []), ''] })
  const updateOption = (i: number, val: string) => {
    const opts = [...(question.options ?? [])]
    opts[i] = val
    update({ options: opts })
  }
  const removeOption = (i: number) => update({ options: (question.options ?? []).filter((_, idx) => idx !== i) })

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50">
        <GripVertical size={14} className="text-slate-300 shrink-0" />
        <button onClick={() => setOpen(o => !o)} className="flex-1 flex items-center gap-2 text-left min-w-0">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-slate-700 truncate">
            {question.text || <span className="text-slate-400 italic">Untitled question</span>}
          </span>
          <span className="ml-1 text-xs text-slate-400 shrink-0">
            ({QUESTION_TYPES.find(t => t.value === question.type)?.label})
          </span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors" title="Move up">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors" title="Move down">
            <ChevronDown size={14} />
          </button>
          <button onClick={onRemove}
            className="p-1.5 rounded text-slate-400 hover:text-red-500 transition-colors" title="Remove">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded text-slate-400 hover:text-slate-600 transition-colors">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 py-4 flex flex-col gap-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <label className="w-24 text-xs font-medium text-slate-500 shrink-0">Key</label>
            <input
              value={question.key}
              onChange={e => update({ key: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="question_key"
            />
          </div>
          <div className="flex gap-3">
            <label className="w-24 text-xs font-medium text-slate-500 shrink-0 pt-2">Question</label>
            <textarea
              value={question.text}
              onChange={e => update({ text: e.target.value })}
              rows={2}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              placeholder="What question should we ask the user?"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-xs font-medium text-slate-500 shrink-0">Type</label>
            <select
              value={question.type}
              onChange={e => {
                const t = e.target.value as QuestionType
                update({ type: t, options: t === 'multiple_choice' ? (question.options ?? ['']) : undefined })
              }}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
            >
              {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {question.type === 'multiple_choice' && (
            <div className="flex gap-3">
              <label className="w-24 text-xs font-medium text-slate-500 shrink-0 pt-2">Options</label>
              <div className="flex-1 flex flex-col gap-2">
                {(question.options ?? []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
                      placeholder={`Option ${i + 1}`}
                    />
                    <button onClick={() => removeOption(i)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button onClick={addOption}
                  className="self-start text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 mt-1">
                  <Plus size={12} /> Add option
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="w-24 text-xs font-medium text-slate-500 shrink-0">Helper</label>
            <input
              value={question.helper ?? ''}
              onChange={e => update({ helper: e.target.value || undefined })}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="Optional hint shown under the question…"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-xs font-medium text-slate-500 shrink-0">Required</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={question.required}
                onChange={e => update({ required: e.target.checked })}
                className="rounded accent-violet-600"
              />
              <span className="text-sm text-slate-700">User must answer before submitting</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Survey editor ───────────────────────────────────────────── */

function SurveyEditor({
  survey, isNew, existingSlugs, onSaved, onDelete,
}: {
  survey: SurveyDef
  isNew: boolean
  existingSlugs: string[]
  onSaved: (s: SurveyDef, prevSlug: string) => void
  onDelete: (slug: string) => void
}) {
  const [draft, setDraft] = useState<SurveyDef>(survey)
  const [slugEdited, setSlugEdited] = useState(!isNew)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [hasChanges, setHasChanges] = useState(isNew)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const update = (patch: Partial<SurveyDef>) => {
    setDraft(d => {
      const next = { ...d, ...patch }
      if ('title' in patch && isNew && !slugEdited) {
        next.slug = slugify(patch.title as string)
      }
      return next
    })
    setHasChanges(true)
    setStatus('idle')
  }

  const updateQuestion = (i: number, q: SurveyQuestion) => {
    const questions = [...draft.questions]
    questions[i] = q
    update({ questions })
  }

  const removeQuestion = (i: number) => update({ questions: draft.questions.filter((_, idx) => idx !== i) })

  const moveQuestion = (i: number, dir: -1 | 1) => {
    const questions = [...draft.questions]
    const target = i + dir
    if (target < 0 || target >= questions.length) return
    ;[questions[i], questions[target]] = [questions[target], questions[i]]
    update({ questions })
  }

  const addQuestion = () => {
    update({
      questions: [...draft.questions, {
        key: `question_${draft.questions.length + 1}`,
        text: '',
        type: 'text',
        required: false,
      }],
    })
  }

  const reset = () => {
    setDraft(survey)
    setHasChanges(isNew)
    setStatus('idle')
  }

  const slugConflict = isNew && existingSlugs.filter(s => s !== survey.slug).includes(draft.slug)

  const save = useCallback(async () => {
    if (!draft.slug) return
    setStatus('saving')
    try {
      const prevSlug = survey.slug
      const res = await fetch(`/api/admin/surveys/${draft.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error()
      setStatus('saved')
      setHasChanges(false)
      onSaved(draft, prevSlug)
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
    }
  }, [draft, survey.slug, onSaved])

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    try {
      await fetch(`/api/admin/surveys/${draft.slug}`, { method: 'DELETE' })
      onDelete(draft.slug)
    } catch { /* ignore */ }
  }, [deleteConfirm, draft.slug, onDelete])

  return (
    <div className="p-8 flex flex-col gap-6 max-w-2xl">
      {/* Per-survey heading */}
      <div className="flex items-end justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isNew ? 'New survey' : (draft.title || draft.slug)}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5 font-mono">
            {isNew ? 'Not yet saved' : `/${draft.slug}`}
          </p>
        </div>
        {!isNew && (
          <button
            onClick={handleDelete}
            onBlur={() => setDeleteConfirm(false)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              deleteConfirm
                ? 'bg-red-50 text-red-600 font-medium'
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Trash2 size={13} />
            {deleteConfirm ? 'Confirm delete' : 'Delete'}
          </button>
        )}
      </div>

      {/* Settings */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settings</h3>
        </div>
        <div className="p-5 flex flex-col gap-5">
          {/* Slug */}
          <div className="flex items-start gap-4">
            <label className="w-36 text-sm font-medium text-slate-600 pt-2 shrink-0">
              Slug <span className="text-slate-400 font-normal text-xs">(ID)</span>
            </label>
            {isNew ? (
              <div className="flex-1 flex flex-col gap-1">
                <input
                  value={draft.slug}
                  onChange={e => {
                    setSlugEdited(true)
                    setDraft(d => ({ ...d, slug: e.target.value.replace(/\s+/g, '_').toLowerCase() }))
                    setHasChanges(true)
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-300 ${slugConflict ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="my_survey"
                />
                {slugConflict && <p className="text-xs text-red-500">Slug already in use.</p>}
                <p className="text-xs text-slate-400">Lowercase letters, numbers, hyphens, underscores. Fixed after first save.</p>
              </div>
            ) : (
              <span className="font-mono text-sm text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                {draft.slug}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium text-slate-600 shrink-0">Title</label>
            <input
              value={draft.title}
              onChange={e => update({ title: e.target.value })}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="How are we doing?"
            />
          </div>

          {/* Intro */}
          <div className="flex gap-4">
            <label className="w-36 text-sm font-medium text-slate-600 pt-2 shrink-0">Intro text</label>
            <textarea
              value={draft.intro}
              onChange={e => update({ intro: e.target.value })}
              rows={3}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              placeholder="Tell users why answering helps…"
            />
          </div>

          {/* Kind + Frequency (two-column row) */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">Survey kind</label>
              <div className="flex gap-4">
                {(['quantitative', 'qualitative'] as const).map(kind => (
                  <label key={kind} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={draft.surveyKind === kind}
                      onChange={() => update({ surveyKind: kind })}
                      className="accent-violet-600"
                    />
                    <span className="text-sm text-slate-700 capitalize">{kind}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">Repeat frequency</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={draft.minDaysBetweenShows}
                  onChange={e => update({ minDaysBetweenShows: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <span className="text-sm text-slate-500">days after completion</span>
              </div>
            </div>
          </div>

          {/* Dismiss cooldown */}
          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium text-slate-600 shrink-0">Dismiss cooldown</label>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                min={1}
                value={draft.dismissCooldownDays}
                onChange={e => update({ dismissCooldownDays: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <span className="text-sm text-slate-500">days after dismissal</span>
              {draft.surveyKind === 'qualitative' && (
                <span className="text-xs text-slate-400">(qualitative override: always 30 days)</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Questions
          </h3>
          <span className="text-xs text-slate-400">{draft.questions.length} total</span>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {draft.questions.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No questions yet. Add one below.</p>
          )}
          {draft.questions.map((q, i) => (
            <QuestionEditor
              key={q.key + i}
              question={q}
              index={i}
              total={draft.questions.length}
              onChange={updated => updateQuestion(i, updated)}
              onRemove={() => removeQuestion(i)}
              onMove={dir => moveQuestion(i, dir)}
            />
          ))}
          <button
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
          >
            <Plus size={15} /> Add question
          </button>
        </div>
      </section>

      {/* Save row */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4">
        <div className="text-sm">
          {status === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle size={14} /> Saved
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-red-500 font-medium">
              <AlertCircle size={14} /> Save failed
            </span>
          )}
          {hasChanges && status === 'idle' && (
            <span className="text-amber-600 font-medium">Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && status !== 'saving' && (
            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <RotateCcw size={13} /> Reset
            </button>
          )}
          <button
            onClick={save}
            disabled={!hasChanges || status === 'saving' || !draft.slug || slugConflict}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-40 transition-colors"
          >
            {status === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? 'Create survey' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function SurveysConfigPage() {
  const [surveys, setSurveys] = useState<SurveyDef[]>([])
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [newDraft, setNewDraft] = useState<SurveyDef | null>(null)

  useEffect(() => {
    fetch('/api/admin/surveys')
      .then(r => r.json())
      .then((data: SurveyDef[]) => {
        setSurveys(data)
        if (data.length > 0) setActiveKey(data[0].slug)
      })
      .finally(() => setLoading(false))
  }, [])

  const openNewSurvey = () => {
    setNewDraft({ ...EMPTY_SURVEY, slug: '' })
    setActiveKey(NEW_TAB_KEY)
  }

  const cancelNew = () => {
    setNewDraft(null)
    setActiveKey(surveys[0]?.slug ?? null)
  }

  const handleSaved = (saved: SurveyDef, prevSlug: string) => {
    if (prevSlug === '') {
      setSurveys(prev => [...prev, saved])
      setNewDraft(null)
    } else {
      setSurveys(prev => prev.map(s => s.slug === prevSlug ? saved : s))
    }
    setActiveKey(saved.slug)
  }

  const handleDelete = (slug: string) => {
    const remaining = surveys.filter(s => s.slug !== slug)
    setSurveys(remaining)
    setActiveKey(remaining[0]?.slug ?? null)
  }

  const activeSurvey = activeKey === NEW_TAB_KEY ? null : surveys.find(s => s.slug === activeKey)
  const existingSlugs = surveys.map(s => s.slug)

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* ── Left: survey list ── */}
      <div className="w-60 shrink-0 sticky top-0 h-screen overflow-y-auto bg-slate-50 border-r border-slate-200 flex flex-col">
        {/* Panel header */}
        <div className="px-4 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3.5">
            <Settings2 size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Surveys</span>
          </div>
          <button
            onClick={openNewSurvey}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            <Plus size={14} />
            New survey
          </button>
        </div>

        {/* List */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={16} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {surveys.map(s => {
                const isActive = activeKey === s.slug
                return (
                  <button
                    key={s.slug}
                    onClick={() => { setActiveKey(s.slug); setNewDraft(null) }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      isActive ? 'bg-violet-50' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className={`text-sm font-medium truncate leading-tight ${
                      isActive ? 'text-violet-800' : 'text-slate-800'
                    }`}>
                      {s.title || s.slug}
                    </div>
                    <div className={`flex items-center gap-1 mt-0.5 text-xs ${
                      isActive ? 'text-violet-400' : 'text-slate-400'
                    }`}>
                      <span className="capitalize">{s.surveyKind}</span>
                      <span className="opacity-50">·</span>
                      <span>{s.questions.length}q</span>
                    </div>
                  </button>
                )
              })}

              {/* New survey draft item — appears while creating */}
              {activeKey === NEW_TAB_KEY && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-amber-800 truncate leading-tight">
                      {newDraft?.title || 'New survey'}
                    </div>
                    <div className="text-xs text-amber-500 mt-0.5">Draft</div>
                  </div>
                  <button
                    onClick={cancelNew}
                    className="text-amber-400 hover:text-amber-700 transition-colors shrink-0 p-0.5 rounded"
                    title="Discard"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {surveys.length === 0 && activeKey !== NEW_TAB_KEY && (
                <p className="text-xs text-slate-400 text-center py-8 px-3 leading-relaxed">
                  No surveys yet. Create your first one using the button above.
                </p>
              )}
            </>
          )}
        </nav>
      </div>

      {/* ── Right: editor ── */}
      <div className="flex-1 min-w-0">
        {activeKey === NEW_TAB_KEY && newDraft ? (
          <SurveyEditor
            key="__new__"
            survey={newDraft}
            isNew
            existingSlugs={existingSlugs}
            onSaved={handleSaved}
            onDelete={handleDelete}
          />
        ) : activeSurvey ? (
          <SurveyEditor
            key={activeSurvey.slug}
            survey={activeSurvey}
            isNew={false}
            existingSlugs={existingSlugs}
            onSaved={handleSaved}
            onDelete={handleDelete}
          />
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-96 gap-4 text-center px-8">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <ClipboardList size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Select a survey to edit</p>
              <p className="text-sm text-slate-400 mt-1">Or create a new one using the button in the panel on the left.</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
