'use client'

import { SHOW_FEEDBACK_WIDGET_EVENT } from '@/lib/feedbackWidgetEvent'

interface Props {
  className?: string
  style?: React.CSSProperties
}

export default function FeedbackFooterLink({ className, style }: Props) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(SHOW_FEEDBACK_WIDGET_EVENT))}
      className={className}
      style={style}
    >
      Feedback
    </button>
  )
}
