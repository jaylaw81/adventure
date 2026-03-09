import { pgTable, uuid, text, timestamp, doublePrecision, integer, boolean, index } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  email: text('email').primaryKey(),
  displayName: text('display_name').notNull().default(''),
  birthDate: text('birth_date'), // YYYY-MM-DD, nullable until user sets it
  passwordHash: text('password_hash'), // null for Google-only accounts
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const adventures = pgTable('adventures', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  userEmail: text('user_email'),
  audience: text('audience').notNull().default('all'), // 'all' | 'teens' | 'adults'
  tags: text('tags').notNull().default('[]'), // JSON array of strings
  isPublic: boolean('is_public').notNull().default(false),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('adventures_user_email_idx').on(t.userEmail),
  index('adventures_is_public_idx').on(t.isPublic),
])

export const nodes = pgTable('nodes', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default(''),
  content: text('content').notNull().default(''),
  nodeType: text('node_type').notNull().default('scene'), // 'start' | 'scene' | 'ending'
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed'
  imageUrl: text('image_url'),
  positionX: doublePrecision('position_x').notNull().default(0),
  positionY: doublePrecision('position_y').notNull().default(0),
}, (t) => [
  index('nodes_adventure_id_idx').on(t.adventureId),
])

export const choices = pgTable('choices', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  sourceNodeId: uuid('source_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  targetNodeId: uuid('target_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  label: text('label').notNull().default('Continue'),
  orderIndex: integer('order_index').notNull().default(0),
}, (t) => [
  index('choices_adventure_id_idx').on(t.adventureId),
  index('choices_source_node_id_idx').on(t.sourceNodeId),
])

export const passwordResetTokens = pgTable('password_reset_tokens', {
  token: text('token').primaryKey(),
  email: text('email').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const storyReports = pgTable('story_reports', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  reporterEmail: text('reporter_email'), // null for anonymous reporters
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').notNull().default('pending'), // 'pending' | 'reviewed' | 'dismissed'
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
}, (t) => [
  index('story_reports_adventure_id_idx').on(t.adventureId),
  index('story_reports_status_idx').on(t.status),
])

export type User = typeof users.$inferSelect
export type Adventure = typeof adventures.$inferSelect
export type Node = typeof nodes.$inferSelect
export type Choice = typeof choices.$inferSelect
export type NewAdventure = typeof adventures.$inferInsert
export type NewNode = typeof nodes.$inferInsert
export type NewChoice = typeof choices.$inferInsert
