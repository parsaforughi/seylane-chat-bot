import { Router } from 'express';
import { db, conversations, messages, settings, analytics } from '../db/index.js';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { woocommerceService } from '../services/woocommerce.service.js';
import { gptService } from '../services/gpt.service.js';
import { instagramService } from '../services/instagram.service.js';

const router = Router();

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Apply auth middleware to all API routes
router.use(requireAuth);

// ============ CONVERSATIONS ROUTES ============

// Get all conversations
router.get('/conversations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit)
      .offset(offset);

    // Get message count for each conversation
    const conversationsWithCounts = await Promise.all(
      allConversations.map(async (conv) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(eq(messages.conversationId, conv.id));

        return { ...conv, messageCount: count };
      })
    );

    res.json({ conversations: conversationsWithCounts });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get single conversation with messages
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);

    res.json({ conversation, messages: conversationMessages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// ============ ANALYTICS ROUTES ============

// Get dashboard overview stats
router.get('/analytics/overview', async (req, res) => {
  try {
    // Total conversations
    const [{ totalConversations }] = await db
      .select({ totalConversations: sql<number>`count(*)` })
      .from(conversations);

    // Total messages
    const [{ totalMessages }] = await db
      .select({ totalMessages: sql<number>`count(*)` })
      .from(messages);

    // Active conversations (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [{ activeConversations }] = await db
      .select({ activeConversations: sql<number>`count(*)` })
      .from(conversations)
      .where(gte(conversations.lastMessageAt, yesterday));

    // Product search count
    const [{ productSearches }] = await db
      .select({ productSearches: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.intent, 'product_search'));

    res.json({
      totalConversations,
      totalMessages,
      activeConversations,
      productSearches,
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get message volume over time (last 30 days)
router.get('/analytics/messages-over-time', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const messageStats = await db
      .select({
        date: sql<string>`DATE(${messages.timestamp})`,
        count: sql<number>`count(*)`,
      })
      .from(messages)
      .where(gte(messages.timestamp, since))
      .groupBy(sql`DATE(${messages.timestamp})`)
      .orderBy(sql`DATE(${messages.timestamp})`);

    res.json({ data: messageStats });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ error: 'Failed to fetch message stats' });
  }
});

// Get intent distribution
router.get('/analytics/intent-distribution', async (req, res) => {
  try {
    const intentStats = await db
      .select({
        intent: messages.intent,
        count: sql<number>`count(*)`,
      })
      .from(messages)
      .where(sql`${messages.intent} IS NOT NULL`)
      .groupBy(messages.intent)
      .orderBy(desc(sql`count(*)`));

    res.json({ data: intentStats });
  } catch (error) {
    console.error('Error fetching intent distribution:', error);
    res.status(500).json({ error: 'Failed to fetch intent distribution' });
  }
});

// ============ SETTINGS ROUTES ============

// Get all settings
router.get('/settings', async (req, res) => {
  try {
    const allSettings = await db.select().from(settings);
    
    // Convert to key-value object
    const settingsObj = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.post('/settings', async (req, res) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(settings)
        .values({ key, value: value as string, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: value as string, updatedAt: new Date() },
        });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get a specific setting
router.get('/settings/:key', async (req, res) => {
  try {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, req.params.key))
      .limit(1);

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ value: setting.value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// ============ LOGS ROUTES ============

// Get recent logs (recent messages with details)
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;

    const recentMessages = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        role: messages.role,
        content: messages.content,
        intent: messages.intent,
        timestamp: messages.timestamp,
        instagramUserId: conversations.instagramUserId,
        instagramUsername: conversations.instagramUsername,
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .orderBy(desc(messages.timestamp))
      .limit(limit);

    res.json({ logs: recentMessages });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// ============ TEST CONNECTION ROUTES ============

// Test WooCommerce connection
router.get('/test/woocommerce', async (req, res) => {
  try {
    const result = await woocommerceService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Error testing WooCommerce:', error);
    res.status(500).json({ success: false, message: 'Failed to test WooCommerce connection' });
  }
});

// Test OpenAI connection
router.get('/test/openai', async (req, res) => {
  try {
    const result = await gptService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Error testing OpenAI:', error);
    res.status(500).json({ success: false, message: 'Failed to test OpenAI connection' });
  }
});

// Test Instagram connection
router.get('/test/instagram', async (req, res) => {
  try {
    const result = await instagramService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Error testing Instagram:', error);
    res.status(500).json({ success: false, message: 'Failed to test Instagram connection' });
  }
});

export default router;

