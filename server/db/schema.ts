import { pgTable, text, timestamp, serial, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Conversations table
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  instagramUserId: text('instagram_user_id').notNull().unique(),
  instagramUsername: text('instagram_username'),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  status: text('status').notNull().default('active'), // active, archived, blocked
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('conversations_user_id_idx').on(table.instagramUserId),
  statusIdx: index('conversations_status_idx').on(table.status),
}));

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // user, assistant
  content: text('content').notNull(),
  intent: text('intent'), // product_search, general_question, greeting, etc.
  intentData: jsonb('intent_data'), // extracted parameters from GPT
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index('messages_conversation_id_idx').on(table.conversationId),
  timestampIdx: index('messages_timestamp_idx').on(table.timestamp),
}));

// Settings table - for bot configuration
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analytics table - for tracking metrics
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  metric: text('metric').notNull(), // total_messages, total_conversations, product_searches, etc.
  value: integer('value').notNull().default(0),
}, (table) => ({
  dateMetricIdx: index('analytics_date_metric_idx').on(table.date, table.metric),
}));

// Admin users table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // hashed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertConversationSchema = createInsertSchema(conversations);
export const selectConversationSchema = createSelectSchema(conversations);

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);

export const insertSettingSchema = createInsertSchema(settings);
export const selectSettingSchema = createSelectSchema(settings);

export const insertAnalyticSchema = createInsertSchema(analytics);
export const selectAnalyticSchema = createSelectSchema(analytics);

export const insertAdminUserSchema = createInsertSchema(adminUsers);
export const selectAdminUserSchema = createSelectSchema(adminUsers);

