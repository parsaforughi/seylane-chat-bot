import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface InstagramMessage {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
  };
}

interface SendMessagePayload {
  recipient: {
    id: string;
  };
  message: {
    text: string;
  };
}

class InstagramService {
  private accessToken: string;
  private verifyToken: string;

  constructor() {
    this.accessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN || '';
    this.verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN || '';

    if (!this.accessToken) {
      console.warn('⚠️  INSTAGRAM_PAGE_ACCESS_TOKEN not set');
    }
    if (!this.verifyToken) {
      console.warn('⚠️  INSTAGRAM_VERIFY_TOKEN not set');
    }
  }

  /**
   * Verify webhook - Called by Instagram when setting up webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('✅ Webhook verified');
      return challenge;
    }
    console.log('❌ Webhook verification failed');
    return null;
  }

  /**
   * Parse incoming webhook data from Instagram
   */
  parseWebhookData(body: any): InstagramMessage | null {
    try {
      if (body.object !== 'instagram') {
        return null;
      }

      const entry = body.entry?.[0];
      if (!entry) {
        return null;
      }

      const messaging = entry.messaging?.[0];
      if (!messaging) {
        return null;
      }

      return messaging as InstagramMessage;
    } catch (error) {
      console.error('Error parsing webhook data:', error);
      return null;
    }
  }

  /**
   * Send a text message to a user
   */
  async sendMessage(recipientId: string, text: string): Promise<boolean> {
    try {
      const payload: SendMessagePayload = {
        recipient: {
          id: recipientId,
        },
        message: {
          text,
        },
      };

      const response = await axios.post(
        `${GRAPH_API_BASE}/me/messages`,
        payload,
        {
          params: {
            access_token: this.accessToken,
          },
        }
      );

      console.log('✅ Message sent:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending message:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Send a message with typing indicator
   */
  async sendMessageWithTyping(recipientId: string, text: string, typingDuration: number = 1000): Promise<boolean> {
    try {
      // Send typing indicator
      await this.sendTypingIndicator(recipientId, 'typing_on');
      
      // Wait for typing duration
      await new Promise(resolve => setTimeout(resolve, typingDuration));
      
      // Send the actual message
      const result = await this.sendMessage(recipientId, text);
      
      // Turn off typing indicator
      await this.sendTypingIndicator(recipientId, 'typing_off');
      
      return result;
    } catch (error) {
      console.error('Error sending message with typing:', error);
      return false;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(recipientId: string, action: 'typing_on' | 'typing_off'): Promise<boolean> {
    try {
      await axios.post(
        `${GRAPH_API_BASE}/me/messages`,
        {
          recipient: { id: recipientId },
          sender_action: action,
        },
        {
          params: {
            access_token: this.accessToken,
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<{ name?: string; username?: string } | null> {
    try {
      const response = await axios.get(`${GRAPH_API_BASE}/${userId}`, {
        params: {
          fields: 'name,username',
          access_token: this.accessToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Send a message with product cards (for WooCommerce products)
   */
  async sendProductMessage(recipientId: string, text: string, products: any[]): Promise<boolean> {
    try {
      // First send the text message
      await this.sendMessage(recipientId, text);

      // Then send product details as separate messages
      // Instagram doesn't support rich cards in the same way as Facebook,
      // so we format products as text with URLs
      for (const product of products.slice(0, 3)) { // Limit to 3 products
        const productText = `\n${product.name}\n💰 ${product.price}\n🔗 ${product.permalink}`;
        await this.sendMessage(recipientId, productText);
      }

      return true;
    } catch (error) {
      console.error('Error sending product message:', error);
      return false;
    }
  }

  /**
   * Update access token (can be called from settings)
   */
  updateAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Test if credentials are valid
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.accessToken) {
        return { success: false, message: 'Access token not configured' };
      }

      const response = await axios.get(`${GRAPH_API_BASE}/me`, {
        params: {
          access_token: this.accessToken,
        },
      });

      return {
        success: true,
        message: `Connected successfully to account: ${response.data.name || response.data.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Failed to connect to Instagram',
      };
    }
  }
}

// Export singleton instance
export const instagramService = new InstagramService();
export default instagramService;

