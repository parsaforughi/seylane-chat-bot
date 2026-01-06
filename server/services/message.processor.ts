import { gptService, type ConversationMessage } from './gpt.service.js';
import { woocommerceService } from './woocommerce.service.js';
import { instagramService } from './instagram.service.js';
import { db, messages } from '../db/index.js';
import { eq } from 'drizzle-orm';

export interface ProcessMessageOptions {
  conversationId: number;
  senderId: string;
  messageText: string;
}

class MessageProcessor {
  /**
   * Main message processing pipeline
   * This orchestrates GPT, WooCommerce, and Instagram services
   */
  async processMessage(options: ProcessMessageOptions): Promise<void> {
    const { conversationId, senderId, messageText } = options;

    try {
      console.log(`🔄 Processing message from conversation ${conversationId}`);

      // 1. Get conversation history for context
      const conversationHistory = await this.getConversationHistory(conversationId);

      // 2. Analyze intent using GPT
      console.log('🤖 Analyzing intent with GPT...');
      const intentAnalysis = await gptService.analyzeIntent(messageText, conversationHistory);

      console.log(`💭 Intent detected: ${intentAnalysis.intent} (confidence: ${intentAnalysis.confidence})`);

      // Save intent to database
      await this.updateMessageIntent(conversationId, messageText, intentAnalysis.intent, intentAnalysis.parameters);

      // 3. Process based on intent
      let responseText: string;
      let products: any[] = [];

      if (intentAnalysis.requiresWooCommerce && intentAnalysis.intent === 'product_search') {
        // Product search flow
        console.log('🛍️ Searching products in WooCommerce...');
        products = await woocommerceService.searchProducts(intentAnalysis);

        console.log(`📦 Found ${products.length} products`);

        // Generate product recommendation message
        responseText = await gptService.generateProductMessage(products, messageText);

        // Send typing indicator
        await instagramService.sendTypingIndicator(senderId, 'typing_on');
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Send main response
        await instagramService.sendMessage(senderId, responseText);

        // Send product details
        if (products.length > 0) {
          await instagramService.sendProductMessage(senderId, '', products.slice(0, 3));
        }

        await instagramService.sendTypingIndicator(senderId, 'typing_off');
      } else {
        // General conversation flow
        console.log('💬 Generating conversational response...');
        responseText = await gptService.generateResponse(messageText, conversationHistory, {
          intent: intentAnalysis.intent,
        });

        // Send with typing indicator
        await instagramService.sendMessageWithTyping(senderId, responseText);
      }

      // 4. Save bot response to database
      await db.insert(messages).values({
        conversationId,
        role: 'assistant',
        content: responseText,
        intent: intentAnalysis.intent,
        intentData: intentAnalysis.parameters as any,
        timestamp: new Date(),
      });

      console.log(`✅ Successfully processed message from conversation ${conversationId}`);
    } catch (error) {
      console.error('❌ Error processing message:', error);

      // Send error message to user
      const errorMessage =
        'I apologize, but I encountered an error processing your message. Please try again or contact support if the issue persists.';
      await instagramService.sendMessage(senderId, errorMessage);

      // Save error message to database
      await db.insert(messages).values({
        conversationId,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get conversation history for context
   */
  private async getConversationHistory(conversationId: number): Promise<ConversationMessage[]> {
    try {
      const recentMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.timestamp)
        .limit(10); // Last 10 messages

      return recentMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Update the last user message with intent information
   */
  private async updateMessageIntent(
    conversationId: number,
    messageText: string,
    intent: string,
    parameters?: any
  ): Promise<void> {
    try {
      // Find the most recent user message that matches the text
      const recentMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.timestamp)
        .limit(5);

      const targetMessage = recentMessages.reverse().find((msg) => msg.role === 'user' && msg.content === messageText);

      if (targetMessage) {
        await db
          .update(messages)
          .set({
            intent,
            intentData: parameters as any,
          })
          .where(eq(messages.id, targetMessage.id));
      }
    } catch (error) {
      console.error('Error updating message intent:', error);
    }
  }

  /**
   * Handle specific intents
   */
  async handleGreeting(senderId: string): Promise<string> {
    const greetings = [
      "Hi there! 👋 I'm here to help you find the perfect products. What are you looking for today?",
      "Hello! 😊 How can I assist you with your shopping today?",
      "Hey! Welcome! I'd love to help you find something great. What do you have in mind?",
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  async handleGoodbye(senderId: string): Promise<string> {
    const goodbyes = [
      "Thank you for chatting! Feel free to reach out anytime you need help. Have a great day! 👋",
      "Goodbye! Happy shopping, and don't hesitate to message if you have questions! 😊",
      "Take care! I'm always here if you need product recommendations. See you soon! 🌟",
    ];

    return goodbyes[Math.floor(Math.random() * goodbyes.length)];
  }

  async handleHelp(senderId: string): Promise<string> {
    return `I can help you with:
🛍️ Finding products - Just describe what you're looking for
❓ Answering questions about our store
📦 Checking product availability

Try asking me something like "I'm looking for a red dress under $50" or "Do you have running shoes?"`;
  }
}

// Export singleton instance
export const messageProcessor = new MessageProcessor();
export default messageProcessor;

