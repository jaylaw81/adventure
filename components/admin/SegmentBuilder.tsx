'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, X, Save, Trash2, Users, Loader2, CheckCircle2, ChevronDown, Tag } from 'lucide-react'
import {
  type SegmentCondition,
  type BillingStatus,
  FIELD_LABELS,
  BILLING_STATUS_LABELS,
} from '@/lib/segmentTypes'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedSegment {
  id: string
  name: string
  conditions: SegmentCondition[]
  createdAt: string
}

interface PreviewResult {
  count: number
  sample: { email: string; displayName: string }[]
}

interface Props {
  conditions: SegmentCondition[]
  onChange: (conditions: SegmentCondition[]) => void
  recipientCount: number | null
  onCountChange: (count: number | null) => void
}

// ── Field config ──────────────────────────────────────────────────────────────

type FieldType = 'billing_status' | 'boolean' | 'number' | 'account_status'

const FIELD_TYPES: Record<SegmentCondition['field'], FieldType> = {
  billing_status:         'billing_status',
  has_stories:            'boolean',
  has_public_stories:     'boolean',
  story_count_min:        'number',
  account_status:         'account_status',
  joined_last_days:       'number',
  joined_more_than_days:  'number',
  trial_ends_within_days: 'number',
  inactive_days:          'number',
}

function defaultValue(field: SegmentCondition['field']): SegmentCondition['value'] {
  const t = FIELD_TYPES[field]
  if (t === 'billing_status') return 'active'
  if (t === 'boolean') return true
  if (t === 'account_status') return 'active'
  return 7
}

function conditionLabel(c: SegmentCondition): string {
  switch (c.field) {
    case 'billing_status':        return `Billing is ${BILLING_STATUS_LABELS[c.value as BillingStatus]}`
    case 'has_stories':           return c.value ? 'Has at least one story' : 'Has no stories'
    case 'has_public_stories':    return c.value ? 'Has a public story' : 'Has no public stories'
    case 'story_count_min':       return `Story count ≥ ${c.value}`
    case 'account_status':        return `Account is ${c.value}`
    case 'joined_last_days':      return `Joined in the last ${c.value} days`
    case 'joined_more_than_days': return `Joined more than ${c.value} days ago`
    case 'trial_ends_within_days':return `Trial ends within ${c.value} days`
    case 'inactive_days':         return `Inactive for ${c.value}+ days`
    default:                      return ''
  }
}

// ── Condition row ─────────────────────────────────────────────────────────────

function ConditionRow({
  condition,
  index,
  onChange,
  onRemove,
}: {
  condition: SegmentCondition
  index: number
  onChange: (c: SegmentCondition) => void
  onRemove: () => void
}) {
  const type = FIELD_TYPES[condition.field]

  function setField(field: SegmentCondition['field']) {
    onChange({ field, value: defaultValue(field) } as SegmentCondition)
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      {index > 0 && (
        <span className="text-xs font-semibold text-slate-400 w-6 shrink-0 text-center">AND</span>
      )}
      {index === 0 && <span className="w-6 shrink-0" />}

      {/* Field selector */}
      <div className="relative flex-1 min-w-0">
        <select
          value={condition.field}
          onChange={e => setField(e.target.value as SegmentCondition['field'])}
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none pr-7"
        >
          {(Object.keys(FIELD_LABELS) as SegmentCondition['field'][]).map(f => (
            <option key={f} value={f}>{FIELD_LABELS[f]}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Value input */}
      <div className="shrink-0">
        {type === 'billing_status' && (
          <div className="relative">
            <select
              value={condition.value as string}
              onChange={e => onChange({ field: 'billing_status', value: e.target.value as BillingStatus })}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none pr-7"
            >
              {(Object.entries(BILLING_STATUS_LABELS) as [BillingStatus, string][]).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
        {type === 'boolean' && (
          <div className="relative">
            <select
              value={String(condition.value)}
              onChange={e => onChange({ field: condition.field as 'has_stories' | 'has_public_stories', value: e.target.value === 'true' })}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none pr-7"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
        {type === 'account_status' && (
          <div className="relative">
            <select
              value={condition.value as string}
              onChange={e => onChange({ field: 'account_status', value: e.target.value as 'active' | 'suspended' })}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none pr-7"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
        {type === 'number' && (
          <input
            type="number"
            min={1}
            value={condition.value as number}
            onChange={e => onChange({ field: condition.field as 'story_count_min' | 'joined_last_days' | 'joined_more_than_days' | 'trial_ends_within_days' | 'inactive_days', value: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-20 text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 text-center"
          />
        )}
      </div>

      <button onClick={onRemove} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
        <X size={13} />
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SegmentBuilder({ conditions, onChange, recipientCount, onCountChange }: Props) {
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([])
  const [loadingSegments, setLoadingSegments] = useState(true)
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load saved segments
  useEffect(() => {
    fetch('/api/admin/segments')
      .then(r => r.json())
      .then(data => { setSavedSegments(Array.isArray(data) ? data : []); setLoadingSegments(false) })
      .catch(() => setLoadingSegments(false))
  }, [])

  // Debounced preview
  const runPreview = useCallback((conds: SegmentCondition[]) => {
    if (previewTimer.current) clearTimeout(previewTimer.current)
    if (conds.length === 0) {
      setPreview(null)
      onCountChange(null)
      return
    }
    previewTimer.current = setTimeout(async () => {
      setPreviewing(true)
      try {
        const res = await fetch('/api/admin/segments/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conditions: conds }),
        })
        const data = await res.json()
        setPreview(data)
        onCountChange(data.count ?? 0)
      } finally {
        setPreviewing(false)
      }
    }, 600)
  }, [onCountChange])

  useEffect(() => {
    runPreview(conditions)
  }, [conditions, runPreview])

  function addCondition() {
    onChange([...conditions, { field: 'billing_status', value: 'active' } as SegmentCondition])
  }

  function updateCondition(index: number, c: SegmentCondition) {
    const next = [...conditions]
    next[index] = c
    onChange(next)
  }

  function removeCondition(index: number) {
    onChange(conditions.filter((_, i) => i !== index))
  }

  function loadSegment(seg: SavedSegment) {
    onChange(seg.conditions)
    setSaveName(seg.name)
  }

  async function deleteSegment(id: string) {
    await fetch(`/api/admin/segments/${id}`, { method: 'DELETE' })
    setSavedSegments(prev => prev.filter(s => s.id !== id))
  }

  async function saveSegment() {
    if (!saveName.trim() || conditions.length === 0) return
    setSaving(true)
    setSaveMsg(null)
    const res = await fetch('/api/admin/segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: saveName.trim(), conditions }),
    })
    if (res.ok) {
      const seg = await res.json()
      setSavedSegments(prev => [seg, ...prev])
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(null), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">

      {/* Conditions */}
      <div className="space-y-2">
        {conditions.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
            Add conditions to define your audience
          </p>
        )}
        {conditions.map((c, i) => (
          <ConditionRow
            key={i}
            condition={c}
            index={i}
            onChange={c => updateCondition(i, c)}
            onRemove={() => removeCondition(i)}
          />
        ))}
        <button
          onClick={addCondition}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Plus size={13} /> Add condition
        </button>
      </div>

      {/* Preview */}
      {conditions.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            {previewing ? (
              <Loader2 size={13} className="animate-spin text-slate-400" />
            ) : (
              <Users size={13} className="text-violet-600" />
            )}
            <span className="text-xs font-semibold text-slate-700">
              {previewing
                ? 'Calculating…'
                : preview
                  ? `${preview.count.toLocaleString()} subscribed user${preview.count !== 1 ? 's' : ''} match${preview.count === 1 ? 'es' : ''}`
                  : 'No preview yet'
              }
            </span>
          </div>
          {!previewing && preview && preview.sample.length > 0 && (
            <div className="space-y-1">
              {preview.sample.map(u => (
                <p key={u.email} className="text-xs text-slate-500 font-mono truncate">
                  {u.displayName || '(no name)'} · {u.email}
                </p>
              ))}
              {preview.count > preview.sample.length && (
                <p className="text-xs text-slate-400">…and {(preview.count - preview.sample.length).toLocaleString()} more</p>
              )}
            </div>
          )}
          {!previewing && preview?.count === 0 && (
            <p className="text-xs text-slate-400">No subscribed users match these conditions.</p>
          )}
        </div>
      )}

      {/* Save segment */}
      {conditions.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Segment name…"
            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            onClick={saveSegment}
            disabled={saving || !saveName.trim()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save
          </button>
          {saveMsg && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 size={12} /> {saveMsg}
            </span>
          )}
        </div>
      )}

      {/* Saved segments */}
      {!loadingSegments && savedSegments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Saved segments</p>
          <div className="flex flex-wrap gap-2">
            {savedSegments.map(seg => (
              <div key={seg.id} className="flex items-center gap-1 pl-2.5 pr-1 py-1 bg-white border border-slate-200 rounded-lg text-xs">
                <Tag size={11} className="text-slate-400 shrink-0" />
                <button
                  onClick={() => loadSegment(seg)}
                  className="font-medium text-slate-700 hover:text-violet-700 transition-colors max-w-[160px] truncate"
                  title={seg.name}
                >
                  {seg.name}
                </button>
                <span className="text-slate-300 mx-0.5">·</span>
                <span className="text-slate-400">{seg.conditions.length} rule{seg.conditions.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => deleteSegment(seg.id)}
                  className="ml-0.5 p-0.5 text-slate-300 hover:text-red-500 transition-colors rounded"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary pill when collapsed */}
      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          {conditions.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full border border-violet-200">
              {conditionLabel(c)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
