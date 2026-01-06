import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Intent types the bot can understand
export type IntentType =
  | 'product_search'
  | 'general_question'
  | 'greeting'
  | 'order_status'
  | 'help'
  | 'goodbye'
  | 'unknown';

export interface IntentAnalysis {
  intent: IntentType;
  confidence: number;
  parameters?: {
    productType?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    size?: string;
    brand?: string;
    keywords?: string[];
  };
  requiresWooCommerce: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class GPTService {
  private openai: OpenAI;
  private model: string = 'gpt-4';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not set');
      this.openai = new OpenAI({ apiKey: 'dummy-key' });
    } else {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Analyze user message intent and extract parameters
   */
  async analyzeIntent(message: string, conversationHistory: ConversationMessage[] = []): Promise<IntentAnalysis> {
    try {
      const systemPrompt = `You are an AI assistant that analyzes customer messages for an e-commerce store.
Your job is to classify the intent and extract relevant parameters.

Intent types:
- product_search: Customer looking for products
- general_question: Questions about the store, shipping, returns, etc.
- greeting: Hello, hi, hey, etc.
- order_status: Asking about existing orders
- help: Need assistance or information
- goodbye: Ending conversation
- unknown: Cannot determine intent

For product_search, extract:
- productType (e.g., "dress", "shoes", "laptop")
- color (if mentioned)
- minPrice and maxPrice (if mentioned, in USD)
- category (e.g., "clothing", "electronics")
- size (if mentioned)
- brand (if mentioned)
- keywords (array of search terms)

Respond ONLY with valid JSON in this format:
{
  "intent": "product_search",
  "confidence": 0.95,
  "parameters": {
    "productType": "dress",
    "color": "red",
    "maxPrice": 50,
    "keywords": ["red", "dress", "affordable"]
  },
  "requiresWooCommerce": true
}`;

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-5), // Include last 5 messages for context
        { role: 'user', content: `Analyze this message: "${message}"` },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        return this.getDefaultIntent();
      }

      // Parse JSON response
      const analysis: IntentAnalysis = JSON.parse(content);
      return analysis;
    } catch (error) {
      console.error('Error analyzing intent:', error);
      return this.getDefaultIntent();
    }
  }

  /**
   * Generate a conversational response based on context
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: ConversationMessage[] = [],
    context?: {
      intent?: IntentType;
      products?: any[];
      additionalInfo?: string;
    }
  ): Promise<string> {
    try {
      let systemPrompt = `You are a friendly and helpful customer service assistant for an online store.
Your goal is to help customers find products and answer their questions.

Guidelines:
- Be conversational and warm
- Keep responses concise (2-3 sentences max)
- If showing products, describe them enthusiastically
- Always be helpful and positive
- Use emojis sparingly (1-2 max)`;

      if (context?.products && context.products.length > 0) {
        systemPrompt += `\n\nYou have found these products for the customer:\n${JSON.stringify(
          context.products.map((p) => ({
            name: p.name,
            price: p.price,
            url: p.permalink,
          }))
        )}`;
      }

      if (context?.additionalInfo) {
        systemPrompt += `\n\nAdditional context: ${context.additionalInfo}`;
      }

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-5),
        { role: 'user', content: userMessage },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I had trouble processing that. Could you try rephrasing?';
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I had trouble processing that. Could you try rephrasing?';
    }
  }

  /**
   * Generate a product recommendation message
   */
  async generateProductMessage(products: any[], originalQuery: string): Promise<string> {
    try {
      if (products.length === 0) {
        return `I couldn't find any products matching "${originalQuery}". Could you try describing what you're looking for in a different way? 😊`;
      }

      const systemPrompt = `You are writing a friendly product recommendation message.
The customer searched for: "${originalQuery}"

Create an engaging message (2-3 sentences) that:
1. Acknowledges what they're looking for
2. Mentions you found ${products.length} product(s)
3. Encourages them to check out the products

Be enthusiastic but not pushy. Use 1-2 emojis max.`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Products found: ${products.map((p) => p.name).join(', ')}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      return (
        response.choices[0]?.message?.content ||
        `Great! I found ${products.length} product${products.length > 1 ? 's' : ''} for you! 🎉`
      );
    } catch (error) {
      console.error('Error generating product message:', error);
      return `Great! I found ${products.length} product${products.length > 1 ? 's' : ''} for you!`;
    }
  }

  /**
   * Get default intent when analysis fails
   */
  private getDefaultIntent(): IntentAnalysis {
    return {
      intent: 'unknown',
      confidence: 0.5,
      requiresWooCommerce: false,
    };
  }

  /**
   * Test OpenAI connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Say "Hello"' }],
        max_tokens: 10,
      });

      if (response.choices[0]?.message?.content) {
        return { success: true, message: 'OpenAI connected successfully' };
      }

      return { success: false, message: 'Unexpected response from OpenAI' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to connect to OpenAI',
      };
    }
  }

  /**
   * Update model (can be called from settings)
   */
  updateModel(model: string): void {
    this.model = model;
  }
}

// Export singleton instance
export const gptService = new GPTService();
export default gptService;

