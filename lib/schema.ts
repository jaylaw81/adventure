import { pgTable, uuid, text, timestamp, doublePrecision, integer, boolean } from 'drizzle-orm/pg-core'

export const adventures = pgTable('adventures', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  userEmail: text('user_email'),
  isPublic: boolean('is_public').notNull().default(false),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

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
})

export const choices = pgTable('choices', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  sourceNodeId: uuid('source_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  targetNodeId: uuid('target_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  label: text('label').notNull().default('Continue'),
  orderIndex: integer('order_index').notNull().default(0),
})

export type Adventure = typeof adventures.$inferSelect
export type Node = typeof nodes.$inferSelect
export type Choice = typeof choices.$inferSelect
export type NewAdventure = typeof adventures.$inferInsert
export type NewNode = typeof nodes.$inferInsert
export type NewChoice = typeof choices.$inferInsert
