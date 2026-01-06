import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import dotenv from 'dotenv';
import type { IntentAnalysis } from './gpt.service.js';

dotenv.config();

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  description: string;
  short_description: string;
  sku: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ src: string; alt: string }>;
  attributes: Array<{ name: string; options: string[] }>;
}

class WooCommerceService {
  private api: WooCommerceRestApi | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeAPI();
  }

  /**
   * Initialize WooCommerce API client
   */
  private initializeAPI(): void {
    const url = process.env.WOOCOMMERCE_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!url || !consumerKey || !consumerSecret) {
      console.warn('⚠️  WooCommerce credentials not configured');
      this.isConfigured = false;
      return;
    }

    try {
      this.api = new WooCommerceRestApi({
        url,
        consumerKey,
        consumerSecret,
        version: 'wc/v3',
        queryStringAuth: true, // Force basic authentication as query string
      });
      this.isConfigured = true;
      console.log('✅ WooCommerce API initialized');
    } catch (error) {
      console.error('❌ Error initializing WooCommerce API:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Search products based on intent parameters
   */
  async searchProducts(intentAnalysis: IntentAnalysis): Promise<WooCommerceProduct[]> {
    if (!this.isConfigured || !this.api) {
      console.error('WooCommerce API not configured');
      return [];
    }

    try {
      const params: any = {
        per_page: 5, // Limit to 5 products
        status: 'publish',
        stock_status: 'instock',
      };

      const { parameters } = intentAnalysis;

      // Add search query
      if (parameters?.keywords && parameters.keywords.length > 0) {
        params.search = parameters.keywords.join(' ');
      } else if (parameters?.productType) {
        params.search = parameters.productType;
      }

      // Add category filter
      if (parameters?.category) {
        params.category = parameters.category;
      }

      // Add price filters
      if (parameters?.minPrice) {
        params.min_price = parameters.minPrice.toString();
      }
      if (parameters?.maxPrice) {
        params.max_price = parameters.maxPrice.toString();
      }

      console.log('🔍 Searching WooCommerce with params:', params);

      const response = await this.api.get('products', params);
      const products = response.data as WooCommerceProduct[];

      // Additional filtering based on color, size, etc.
      let filteredProducts = products;

      if (parameters?.color) {
        filteredProducts = this.filterByAttribute(products, 'color', parameters.color);
      }

      if (parameters?.size) {
        filteredProducts = this.filterByAttribute(filteredProducts, 'size', parameters.size);
      }

      if (parameters?.brand) {
        filteredProducts = filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(parameters.brand!.toLowerCase())
        );
      }

      console.log(`✅ Found ${filteredProducts.length} products`);

      return filteredProducts;
    } catch (error: any) {
      console.error('❌ Error searching products:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: number): Promise<WooCommerceProduct | null> {
    if (!this.isConfigured || !this.api) {
      return null;
    }

    try {
      const response = await this.api.get(`products/${productId}`);
      return response.data as WooCommerceProduct;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Get all product categories
   */
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    if (!this.isConfigured || !this.api) {
      return [];
    }

    try {
      const response = await this.api.get('products/categories', {
        per_page: 100,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Search products by simple keyword
   */
  async searchByKeyword(keyword: string, limit: number = 5): Promise<WooCommerceProduct[]> {
    if (!this.isConfigured || !this.api) {
      return [];
    }

    try {
      const response = await this.api.get('products', {
        search: keyword,
        per_page: limit,
        status: 'publish',
        stock_status: 'instock',
      });

      return response.data as WooCommerceProduct[];
    } catch (error) {
      console.error('Error searching by keyword:', error);
      return [];
    }
  }

  /**
   * Filter products by attribute (color, size, etc.)
   */
  private filterByAttribute(products: WooCommerceProduct[], attributeName: string, value: string): WooCommerceProduct[] {
    return products.filter((product) => {
      const attribute = product.attributes.find(
        (attr) => attr.name.toLowerCase() === attributeName.toLowerCase()
      );

      if (!attribute) {
        return false;
      }

      return attribute.options.some((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    });
  }

  /**
   * Format products for Instagram message
   */
  formatProductsForMessage(products: WooCommerceProduct[]): string {
    if (products.length === 0) {
      return 'Sorry, I could not find any products matching your search.';
    }

    let message = `Here are ${products.length} product${products.length > 1 ? 's' : ''} I found:\n\n`;

    products.forEach((product, index) => {
      message += `${index + 1}. ${product.name}\n`;
      message += `   💰 Price: ${product.price}\n`;
      message += `   🔗 ${product.permalink}\n`;

      if (product.on_sale && product.sale_price) {
        message += `   🏷️ On Sale!\n`;
      }

      if (index < products.length - 1) {
        message += '\n';
      }
    });

    return message;
  }

  /**
   * Test WooCommerce connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.api) {
      return {
        success: false,
        message: 'WooCommerce API not configured. Check credentials.',
      };
    }

    try {
      const response = await this.api.get('products', { per_page: 1 });

      if (response.status === 200) {
        return {
          success: true,
          message: `Connected successfully to ${process.env.WOOCOMMERCE_URL}`,
        };
      }

      return {
        success: false,
        message: 'Unexpected response from WooCommerce API',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to connect to WooCommerce',
      };
    }
  }

  /**
   * Update credentials (can be called from settings)
   */
  updateCredentials(url: string, consumerKey: string, consumerSecret: string): void {
    process.env.WOOCOMMERCE_URL = url;
    process.env.WOOCOMMERCE_CONSUMER_KEY = consumerKey;
    process.env.WOOCOMMERCE_CONSUMER_SECRET = consumerSecret;
    this.initializeAPI();
  }

  /**
   * Check if service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const woocommerceService = new WooCommerceService();
export default woocommerceService;

