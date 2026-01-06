import { Router } from 'express';
import { instagramService } from '../services/instagram.service.js';
import { messageProcessor } from '../services/message.processor.js';
import { db, conversations, messages } from '../db/index.js';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * GET /webhook - Webhook verification endpoint
 * Instagram calls this to verify your webhook URL
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    const result = instagramService.verifyWebhook(
      mode as string,
      token as string,
      challenge as string
    );

    if (result) {
      res.status(200).send(result);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

/**
 * POST /webhook - Receive messages from Instagram
 * Instagram sends messages here as webhook events
 */
router.post('/', async (req, res) => {
  try {
    // Always respond 200 OK immediately to Instagram
    res.sendStatus(200);

    const webhookData = instagramService.parseWebhookData(req.body);

    if (!webhookData || !webhookData.message?.text) {
      console.log('📭 No message text in webhook data');
      return;
    }

    const senderId = webhookData.sender.id;
    const messageText = webhookData.message.text;

    console.log(`📨 Received message from ${senderId}: ${messageText}`);

    // Get or create conversation
    let [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.instagramUserId, senderId))
      .limit(1);

    if (!conversation) {
      // Get user profile
      const userProfile = await instagramService.getUserProfile(senderId);

      // Create new conversation
      [conversation] = await db
        .insert(conversations)
        .values({
          instagramUserId: senderId,
          instagramUsername: userProfile?.username || null,
          lastMessageAt: new Date(),
          status: 'active',
        })
        .returning();

      console.log(`✨ Created new conversation for user ${senderId}`);
    } else {
      // Update last message timestamp
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversation.id));
    }

    // Save user message to database
    await db.insert(messages).values({
      conversationId: conversation.id,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    });

    // Process message through the AI pipeline
    await messageProcessor.processMessage({
      conversationId: conversation.id,
      senderId,
      messageText,
    });

    console.log(`✅ Processed message from ${senderId}`);
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
  }
});

/**
 * Test webhook endpoint (for development)
 */
router.post('/test', async (req, res) => {
  try {
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({ error: 'recipientId and message required' });
    }

    const success = await instagramService.sendMessage(recipientId, message);

    if (success) {
      res.json({ success: true, message: 'Message sent' });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

