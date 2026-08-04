// Fired to bring the floating feedback widget back after a user has hidden it.
// Kept as a shared constant since the trigger (Footer) and the widget itself
// are separate components with no shared state provider.
export const SHOW_FEEDBACK_WIDGET_EVENT = 'sq:show-feedback-widget'
export const FEEDBACK_WIDGET_HIDDEN_KEY = 'sq_feedback_widget_hidden'
