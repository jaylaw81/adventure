'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PlayCircle, FlagTriangleRight } from 'lucide-react'

export type StoryNodeData = {
  title: string
  content: string
  nodeType: 'start' | 'scene' | 'ending'
  status: 'in_progress' | 'completed'
}

const statusStyles = {
  in_progress: 'border-blue-400 bg-blue-50',
  completed: 'border-red-400 bg-red-50',
}

const statusBadge = {
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-red-100 text-red-700',
}

const statusLabel = {
  in_progress: 'In Progress',
  completed: 'Completed',
}

const typeBadge = {
  start: 'bg-green-100 text-green-700',
  scene: 'bg-gray-100 text-gray-600',
  ending: 'bg-purple-100 text-purple-700',
}

function StoryNode({ data, selected }: NodeProps) {
  const nodeData = data as StoryNodeData
  const nodeType = nodeData.nodeType ?? 'scene'
  const status = nodeData.status ?? 'in_progress'

  return (
    <div
      className={`rounded-xl border-2 shadow-md p-4 w-52 cursor-pointer transition-all ${statusStyles[status]} ${
        selected ? 'ring-2 ring-offset-1 ring-amber-400' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gray-400" />

      {/* Type icon banner for start/ending */}
      {nodeType === 'start' && (
        <div className="flex items-center gap-1.5 mb-2 text-green-600">
          <PlayCircle size={16} strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wide">Start</span>
        </div>
      )}
      {nodeType === 'ending' && (
        <div className="flex items-center gap-1.5 mb-2 text-purple-600">
          <FlagTriangleRight size={16} strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wide">Ending</span>
        </div>
      )}

      <div className={`flex items-center justify-between ${nodeType === 'scene' ? 'mb-2' : 'mb-1'}`}>
        {nodeType === 'scene' && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge[nodeType]}`}>
            scene
          </span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${statusBadge[status]}`}>
          {statusLabel[status]}
        </span>
      </div>

      <div className="font-semibold text-gray-900 text-sm truncate mb-1">
        {nodeData.title || 'Untitled'}
      </div>
      <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
        {nodeData.content || 'No content yet…'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gray-400" />
    </div>
  )
}

export default memo(StoryNode)
