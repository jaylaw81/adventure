'use client'

import { useState, useRef, useCallback } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { X } from 'lucide-react'

interface EditableEdgeData {
  label: string
  adventureId: string
  onLabelChange: (edgeId: string, label: string) => void
  onDelete: (edgeId: string) => void
}

export default function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
  selected,
}: EdgeProps) {
  const edgeData = data as unknown as EditableEdgeData
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(edgeData?.label ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDoubleClick = () => {
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commit = useCallback(() => {
    setEditing(false)
    const trimmed = value.trim() || 'Continue'
    setValue(trimmed)
    edgeData?.onLabelChange(id, trimmed)
  }, [value, id, edgeData])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setEditing(false); setValue(edgeData?.label ?? '') }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    edgeData?.onDelete(id)
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1"
          onDoubleClick={handleDoubleClick}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              className="px-2 py-0.5 text-xs border border-amber-400 rounded bg-white shadow-md outline-none w-36 text-center"
              autoFocus
            />
          ) : (
            <div className={`px-2 py-0.5 text-xs rounded shadow-sm cursor-pointer select-none font-medium transition-colors border ${
              selected
                ? 'bg-amber-100 border-amber-500 text-amber-800'
                : 'bg-amber-50 border-amber-300 text-gray-700 hover:bg-amber-100'
            }`}>
              {value || 'Continue'}
            </div>
          )}
          {selected && !editing && (
            <button
              onClick={handleDelete}
              className="w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
              title="Delete choice"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
