import { pgTable, uuid, text, timestamp, doublePrecision, integer, boolean, index, uniqueIndex, json } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Forward-declare chapters so nodes can reference it below
// (defined fully after adventures)

export const users = pgTable('users', {
  id: uuid('id').notNull().unique().default(sql`gen_random_uuid()`).$defaultFn(() => crypto.randomUUID()),
  email: text('email').primaryKey(),
  displayName: text('display_name').notNull().default(''),
  birthDate: text('birth_date'), // YYYY-MM-DD, nullable until user sets it
  passwordHash: text('password_hash'), // null for Google-only accounts
  tier: text('tier').notNull().default('free'), // 'free' | 'organization'
  status: text('status').notNull().default('active'), // 'active' | 'suspended'
  emailSubscribed: boolean('email_subscribed').notNull().default(true),
  unsubscribeToken: text('unsubscribe_token').unique().$defaultFn(() => crypto.randomUUID()),
  grandfathered: boolean('grandfathered').notNull().default(false),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'), // 'active'|'trialing'|'paused'|'past_due'|'canceled'
  subscriptionAmountCents: integer('subscription_amount_cents'),
  subscriptionInterval: text('subscription_interval'), // 'month' | 'week' — null for non-subscribers
  trialEndsAt: timestamp('trial_ends_at'),
  gracePeriodEndsAt: timestamp('grace_period_ends_at'),
  welcomeEmailSentAt: timestamp('welcome_email_sent_at'),
  trialReminderSentAt: timestamp('trial_reminder_sent_at'),
  reEngagementSentAt: timestamp('re_engagement_sent_at'),
  inactivityReminderSentAt: timestamp('inactivity_reminder_sent_at'),
  lastLoginAt: timestamp('last_login_at'),
  languagePreference: text('language_preference').notNull().default('en'), // ISO 639-1 reader language
  acquisitionSource: text('acquisition_source'), // how the user found StoryQuestor
  invitedByToken: text('invited_by_token'), // friend invite token this user signed up through
  pendingFriendRewardWeeks: integer('pending_friend_reward_weeks').notNull().default(0),
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
  status: text('status').notNull().default('active'), // 'active' | 'suspended'
  editorMode: text('editor_mode').notNull().default('node'), // 'node' | 'block'
  language: text('language').notNull().default('en'), // ISO 639-1 story language
  storyType: text('story_type'), // 'path' | 'world' — null treated as 'path'
  createdFrom: text('created_from'), // 'blank' | 'template' — null for stories created before tracking
  readCount: integer('read_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('adventures_user_email_idx').on(t.userEmail),
  index('adventures_is_public_idx').on(t.isPublic),
])

export const chapters = pgTable('chapters', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('New Chapter'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('chapters_adventure_id_idx').on(t.adventureId),
])

export const nodes = pgTable('nodes', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  chapterId: uuid('chapter_id').references(() => chapters.id, { onDelete: 'set null' }),
  nextChapterId: uuid('next_chapter_id').references(() => chapters.id, { onDelete: 'set null' }),
  title: text('title').notNull().default(''),
  content: text('content').notNull().default(''),
  nodeType: text('node_type').notNull().default('scene'), // 'start' | 'scene' | 'ending' | 'chapter_end'
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed'
  imageUrl: text('image_url'),
  soundUrl: text('sound_url'),
  soundTitle: text('sound_title'),
  positionX: doublePrecision('position_x').notNull().default(0),
  positionY: doublePrecision('position_y').notNull().default(0),
  // For chapter_end nodes: specific entry scene in the next chapter (overrides getChapterStartNode)
  chapterEntryNodeId: uuid('chapter_entry_node_id'),
  // World Builder: items findable in this scene
  sceneItems: json('scene_items').$type<import('./worldBuilder').SceneItemPickup[]>(),
  // World Builder: foe assigned to this scene
  sceneFoeId: text('scene_foe_id'),
  foeRunAwayNodeId: text('foe_run_away_node_id'),
}, (t) => [
  index('nodes_adventure_id_idx').on(t.adventureId),
  index('nodes_chapter_id_idx').on(t.chapterId),
])

export const choices = pgTable('choices', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  sourceNodeId: uuid('source_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  targetNodeId: uuid('target_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  label: text('label').notNull().default('Continue'),
  orderIndex: integer('order_index').notNull().default(0),
  characterEffects: json('character_effects').$type<import('./worldBuilder').CharacterEffect[]>(),
  conditions: json('conditions').$type<import('./worldBuilder').ChoiceCondition[]>(),
}, (t) => [
  index('choices_adventure_id_idx').on(t.adventureId),
  index('choices_source_node_id_idx').on(t.sourceNodeId),
])

export const worldCharacters = pgTable('world_characters', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  attributes: json('attributes').notNull().$type<import('./worldBuilder').CharacterAttribute[]>().default([]),
  inventoryCapacity: integer('inventory_capacity'), // null = unlimited (heroes only)
  characterType: text('character_type').notNull().default('hero'), // 'hero' | 'foe'
  foeHp: integer('foe_hp'), // total HP a foe has; null for heroes
  foeDamage: integer('foe_damage'), // damage per round the foe deals; null for heroes
  foeDefeatText: text('foe_defeat_text'), // narrative shown when foe is conquered
  emoji: text('emoji'), // optional icon (used for foes)
  avatarUrl: text('avatar_url'), // AI-generated portrait image
  healthAttributeId: text('health_attribute_id'), // which attribute is the primary HP
  armorAttributeId: text('armor_attribute_id'),   // which attribute absorbs damage before HP
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('world_chars_adventure_id_idx').on(t.adventureId),
])

export const worldItems = pgTable('world_items', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  itemType: text('item_type').notNull().default('item'), // 'item'|'weapon'|'armor'|'ability'|'consumable'|'key'
  effects: json('effects').notNull().$type<import('./worldBuilder').CharacterEffect[]>().default([]),
  emoji: text('emoji'),
  damage: integer('damage'), // damage dealt per use (weapons/abilities); null = no combat damage
  durabilityMax: integer('durability_max'), // max uses before broken; null = unlimited
  durabilityLoss: integer('durability_loss'), // durability points lost per use; null defaults to 1
  reviveAmount: integer('revive_amount'), // if set, item can revive a fallen character with this much HP restored
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('world_items_adventure_id_idx').on(t.adventureId),
])

export const passwordResetTokens = pgTable('password_reset_tokens', {
  token: text('token').primaryKey(),
  email: text('email').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const storyReviews = pgTable('story_reviews', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  reviewerEmail: text('reviewer_email').notNull(),
  rating: integer('rating').notNull(), // 1–5
  reviewText: text('review_text'),
  hidden: boolean('hidden').notNull().default(false), // admin-hidden; excluded from display and scoring
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('story_reviews_unique_reviewer_idx').on(t.adventureId, t.reviewerEmail),
  index('story_reviews_adventure_id_idx').on(t.adventureId),
])

export const reviewReports = pgTable('review_reports', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reviewId: uuid('review_id').notNull().references(() => storyReviews.id, { onDelete: 'cascade' }),
  adventureId: uuid('adventure_id').notNull(), // denormalised for easy admin joins
  reporterEmail: text('reporter_email'),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').notNull().default('pending'), // 'pending' | 'reviewed' | 'dismissed'
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
}, (t) => [
  index('review_reports_review_id_idx').on(t.reviewId),
  index('review_reports_status_idx').on(t.status),
])

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

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  adminEmail: text('admin_email').notNull().references(() => users.email, { onDelete: 'cascade' }),
  description: text('description'),
  privacyLevel: text('privacy_level').notNull().default('org-only'), // 'public' | 'org-only' | 'private'
  status: text('status').notNull().default('active'), // 'active' | 'suspended'
  consentFormEnabled: boolean('consent_form_enabled').notNull().default(false),
  consentFormTitle: text('consent_form_title'),
  consentFormBody: text('consent_form_body'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('organizations_admin_email_idx').on(t.adminEmail),
])

export const organizationGroups = pgTable('organization_groups', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  privacyLevel: text('privacy_level').notNull().default('inherit'), // 'inherit' | 'public' | 'org-only' | 'private'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('org_groups_org_id_idx').on(t.organizationId),
])

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull().references(() => users.email, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => organizationGroups.id, { onDelete: 'set null' }),
  role: text('role').notNull().default('member'), // 'admin' | 'teacher' | 'reviewer' | 'member'
  roleScope: text('role_scope').notNull().default('org'), // 'org' | 'groups'
  status: text('status').notNull().default('active'), // 'active' | 'inactive'
  consentStatus: text('consent_status'), // null | 'pending' | 'accepted' | 'declined'
  consentedAt: timestamp('consented_at'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('org_members_org_user_idx').on(t.organizationId, t.userEmail),
  index('org_members_org_id_idx').on(t.organizationId),
  index('org_members_group_id_idx').on(t.groupId),
])

export const memberGroups = pgTable('member_groups', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull().references(() => users.email, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => organizationGroups.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('member_groups_unique').on(t.organizationId, t.userEmail, t.groupId),
  index('member_groups_org_user_idx').on(t.organizationId, t.userEmail),
])

export const memberGroupPermissions = pgTable('member_group_permissions', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull().references(() => users.email, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => organizationGroups.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('mgp_org_user_group_idx').on(t.organizationId, t.userEmail, t.groupId),
  index('mgp_org_user_idx').on(t.organizationId, t.userEmail),
])

export const organizationInvites = pgTable('organization_invites', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => organizationGroups.id, { onDelete: 'set null' }),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  invitedBy: text('invited_by').references(() => users.email, { onDelete: 'set null' }),
  role: text('role').notNull().default('member'), // 'member' | 'teacher' | 'reviewer'
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'expired'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('org_invites_org_id_idx').on(t.organizationId),
  index('org_invites_email_idx').on(t.email),
])

export const organizationWaitlist = pgTable('organization_waitlist', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  name: text('name'),
  school: text('school'),
  role: text('role'), // e.g. 'teacher', 'administrator', 'librarian'
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'denied'
  inviteToken: text('invite_token').unique(),
  inviteExpiresAt: timestamp('invite_expires_at'),
  inviteSentAt: timestamp('invite_sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('org_waitlist_email_idx').on(t.email),
])

export const surveyConfigs = pgTable('survey_configs', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  intro: text('intro').notNull(),
  surveyKind: text('survey_kind').notNull(), // 'quantitative' | 'qualitative'
  minDaysBetweenShows: integer('min_days_between_shows').notNull(),
  dismissCooldownDays: integer('dismiss_cooldown_days').notNull(),
  questions: json('questions').notNull().$type<import('./surveys').SurveyQuestion[]>(),
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const surveyResponses = pgTable('survey_responses', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userEmail: text('user_email').references(() => users.email, { onDelete: 'set null' }),
  likes: text('likes'),
  dislikes: text('dislikes'),
  featureRequests: text('feature_requests'),
  surveyType: text('survey_type').notNull().default('initial'), // 'initial' | 'followup'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('survey_responses_user_email_idx').on(t.userEmail),
])

export const surveyReplies = pgTable('survey_replies', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  surveyResponseId: uuid('survey_response_id').notNull().references(() => surveyResponses.id, { onDelete: 'cascade' }),
  sentByEmail: text('sent_by_email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
}, (t) => [
  index('survey_replies_response_id_idx').on(t.surveyResponseId),
])
export type SurveyReply = typeof surveyReplies.$inferSelect

export const surveyDismissals = pgTable('survey_dismissals', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userEmail: text('user_email').notNull().references(() => users.email, { onDelete: 'cascade' }),
  dismissedAt: timestamp('dismissed_at').defaultNow().notNull(),
  nextShowAt: timestamp('next_show_at').notNull(),
}, (t) => [
  index('survey_dismissals_user_email_idx').on(t.userEmail),
])

export const surveyImpressionsV2 = pgTable('survey_impressions_v2', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  surveySlug: text('survey_slug').notNull(),
  userEmail: text('user_email').references(() => users.email, { onDelete: 'set null' }),
  shownAt: timestamp('shown_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  dismissedAt: timestamp('dismissed_at'),
}, (t) => [
  index('survey_imp_v2_user_email_idx').on(t.userEmail),
  index('survey_imp_v2_slug_idx').on(t.surveySlug),
])

export const surveyAnswersV2 = pgTable('survey_answers_v2', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  impressionId: uuid('impression_id').notNull().references(() => surveyImpressionsV2.id, { onDelete: 'cascade' }),
  questionKey: text('question_key').notNull(),
  answerValue: text('answer_value').notNull(),
}, (t) => [
  index('survey_answers_v2_imp_idx').on(t.impressionId),
])

export const emailBlasts = pgTable('email_blasts', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  subject: text('subject').notNull(),
  bodyHtml: text('body_html').notNull(),
  sentByEmail: text('sent_by_email').notNull(),
  recipientCount: integer('recipient_count').notNull().default(0),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  audience: text('audience').notNull().default('all'),
  segmentConditions: text('segment_conditions'), // JSON: SegmentCondition[] when audience='custom'
})

export const emailBlastRecipients = pgTable('email_blast_recipients', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  blastId: uuid('blast_id').notNull().references(() => emailBlasts.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  resendId: text('resend_id'),
  // 'sent' = accepted by Resend, awaiting webhook; 'failed' = our API call failed;
  // 'delivered' | 'bounced' | 'complained' set by webhook
  status: text('status').notNull().default('sent'),
  error: text('error'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
}, (t) => [
  index('ebr_blast_id_idx').on(t.blastId),
  index('ebr_resend_id_idx').on(t.resendId),
])

export const emailSegments = pgTable('email_segments', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  conditions: text('conditions').notNull(), // JSON: SegmentCondition[]
  createdByEmail: text('created_by_email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const adminMessages = pgTable('admin_messages', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sentByEmail: text('sent_by_email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
}, (t) => [
  index('admin_messages_user_id_idx').on(t.userId),
])

export const deletedAccounts = pgTable('deleted_accounts', {
  email: text('email').primaryKey(),
  deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  trialUsed: boolean('trial_used').notNull().default(false),
  hadPaidSubscription: boolean('had_paid_subscription').notNull().default(false),
  reason: text('reason').notNull().default('self_deleted'), // 'self_deleted' | 'admin_deleted'
})

// Tracks when each named cron job last ran successfully — used to enforce global cooldowns
export const friendInvites = pgTable('friend_invites', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  inviterEmail: text('inviter_email').notNull().references(() => users.email, { onDelete: 'cascade' }),
  inviteeEmail: text('invitee_email').notNull(),
  token: text('token').notNull().unique(),
  // 'pending' → invitee not signed up yet
  // 'signed_up' → invitee signed up but not subscribed
  // 'rewarded' → invitee subscribed, inviter rewarded
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  signedUpAt: timestamp('signed_up_at'),
  subscribedAt: timestamp('subscribed_at'),
  rewardedAt: timestamp('rewarded_at'),
}, (t) => [
  index('friend_invites_inviter_idx').on(t.inviterEmail),
  uniqueIndex('friend_invites_token_idx').on(t.token),
  index('friend_invites_invitee_idx').on(t.inviteeEmail),
])

export const cronLogs = pgTable('cron_logs', {
  jobName: text('job_name').primaryKey(),
  lastRunAt: timestamp('last_run_at').notNull(),
  lastRunResult: text('last_run_result'), // brief JSON summary of the last run
})

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const priceReductionOffers = pgTable('price_reduction_offers', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userEmail: text('user_email').notNull().references(() => users.email, { onDelete: 'cascade' }),
  currentAmountCents: integer('current_amount_cents').notNull(),
  offeredAmountCents: integer('offered_amount_cents').notNull(),
  token: text('token').notNull().unique(),
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'expired'
  offeredAt: timestamp('offered_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  expiresAt: timestamp('expires_at').notNull(),
}, (t) => [
  index('price_offers_user_email_idx').on(t.userEmail),
])

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  publishedAt: text('published_at').notNull(), // YYYY-MM-DD
  readingMinutes: integer('reading_minutes').notNull().default(5),
  category: text('category').notNull().default('Writing Tips'),
  heroImageUrl: text('hero_image_url'),
  heroImageCredit: text('hero_image_credit'), // JSON: { authorName, authorUrl } — set when sourced from Unsplash
  intro: text('intro').notNull().default(''),
  sections: json('sections').notNull().$type<import('./blogPosts').BlogSection[]>().default([]),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('blog_posts_slug_idx').on(t.slug),
  index('blog_posts_published_idx').on(t.published),
])

export type BlogPostRow = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert

export const siteFeedback = pgTable('site_feedback', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userEmail: text('user_email'), // null for unauthenticated visitors
  type: text('type').notNull().default('other'), // 'question' | 'concern' | 'other'
  message: text('message').notNull(),
  pageUrl: text('page_url'),
  status: text('status').notNull().default('new'), // 'new' | 'reviewed' | 'resolved'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('site_feedback_status_idx').on(t.status),
  index('site_feedback_created_at_idx').on(t.createdAt),
])

export type SiteFeedback = typeof siteFeedback.$inferSelect

export const storyReferrers = pgTable('story_referrers', {
  id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adventureId: uuid('adventure_id').notNull().references(() => adventures.id, { onDelete: 'cascade' }),
  referrerDomain: text('referrer_domain').notNull(), // 'direct', 'google.com', 'facebook.com', …
  referrerCategory: text('referrer_category').notNull(), // 'direct' | 'search' | 'social' | 'referral' | 'email' | 'internal'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('story_referrers_adventure_id_idx').on(t.adventureId),
  index('story_referrers_created_at_idx').on(t.createdAt),
])

export type SiteSetting = typeof siteSettings.$inferSelect
export type PriceReductionOffer = typeof priceReductionOffers.$inferSelect
export type FriendInvite = typeof friendInvites.$inferSelect
export type DeletedAccount = typeof deletedAccounts.$inferSelect
export type CronLog = typeof cronLogs.$inferSelect
export type EmailSegment = typeof emailSegments.$inferSelect
export type EmailBlast = typeof emailBlasts.$inferSelect
export type EmailBlastRecipient = typeof emailBlastRecipients.$inferSelect
export type SurveyConfig = typeof surveyConfigs.$inferSelect
export type SurveyImpressionV2 = typeof surveyImpressionsV2.$inferSelect
export type SurveyAnswerV2 = typeof surveyAnswersV2.$inferSelect
export type AdminMessage = typeof adminMessages.$inferSelect
export type User = typeof users.$inferSelect
export type Organization = typeof organizations.$inferSelect
export type OrganizationGroup = typeof organizationGroups.$inferSelect
export type MemberGroupPermission = typeof memberGroupPermissions.$inferSelect
export type OrganizationMember = typeof organizationMembers.$inferSelect
export type OrganizationInvite = typeof organizationInvites.$inferSelect
export type WorldCharacter = typeof worldCharacters.$inferSelect
export type WorldItem = typeof worldItems.$inferSelect
export type Adventure = typeof adventures.$inferSelect
export type Chapter = typeof chapters.$inferSelect
export type Node = typeof nodes.$inferSelect
export type Choice = typeof choices.$inferSelect
export type NewAdventure = typeof adventures.$inferInsert
export type NewChapter = typeof chapters.$inferInsert
export type NewNode = typeof nodes.$inferInsert
export type NewChoice = typeof choices.$inferInsert
