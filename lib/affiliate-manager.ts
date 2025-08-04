// Affiliate Link Management System
// This handles affiliate links, tracking, and commission management

export interface AffiliateConfig {
  store: string;
  baseUrl: string;
  affiliateId: string;
  tagParameter: string;
  trackingParameter?: string;
  commissionRate: number; // percentage
  enabled: boolean;
}

// Affiliate program configurations
export const AFFILIATE_CONFIGS: Record<string, AffiliateConfig> = {
  amazon: {
    store: 'Amazon',
    baseUrl: 'https://amazon.com',
    affiliateId: process.env.AMAZON_AFFILIATE_ID || 'yourstore-20', // Replace with your Amazon Associate tag
    tagParameter: 'tag',
    trackingParameter: 'ascsubtag',
    commissionRate: 5.0, // Updated 2025 Amazon commission rate
    enabled: true,
  },
  ebay: {
    store: 'eBay',
    baseUrl: 'https://ebay.com',
    affiliateId: process.env.EBAY_PARTNER_ID || 'your-ebay-partner-id',
    tagParameter: 'campid',
    trackingParameter: 'customid',
    commissionRate: 4.0, // Updated 2025 eBay partner network rate
    enabled: true,
  },
  walmart: {
    store: 'Walmart',
    baseUrl: 'https://walmart.com',
    affiliateId: process.env.WALMART_AFFILIATE_ID || 'your-walmart-id',
    tagParameter: 'wmlspartner',
    trackingParameter: 'sourceid',
    commissionRate: 4.5, // Updated 2025 Walmart commission rate
    enabled: true,
  },
  target: {
    store: 'Target',
    baseUrl: 'https://target.com',
    affiliateId: process.env.TARGET_AFFILIATE_ID || 'your-target-id',
    tagParameter: 'afid',
    trackingParameter: 'ref',
    commissionRate: 8.0, // Target Circle maintains good rates
    enabled: true,
  },
  bestbuy: {
    store: 'Best Buy',
    baseUrl: 'https://bestbuy.com',
    affiliateId: process.env.BESTBUY_AFFILIATE_ID || 'your-bestbuy-id',
    tagParameter: 'ref',
    trackingParameter: 'loc',
    commissionRate: 4.5, // Updated 2025 Best Buy commission rate
    enabled: true,
  },
  wayfair: {
    store: 'Wayfair',
    baseUrl: 'https://wayfair.com',
    affiliateId: process.env.WAYFAIR_AFFILIATE_ID || 'your-wayfair-id',
    tagParameter: 'refid',
    trackingParameter: 'placement',
    commissionRate: 10.0, // Wayfair has higher commission rates
    enabled: true,
  },
  aliexpress: {
    store: 'AliExpress',
    baseUrl: 'https://aliexpress.com',
    affiliateId: process.env.ALIEXPRESS_AFFILIATE_ID || 'your-ali-id',
    tagParameter: 'aff_short_key',
    trackingParameter: 'terminal_id',
    commissionRate: 8.5,
    enabled: true,
  },
  homedepot: {
    store: 'Home Depot',
    baseUrl: 'https://homedepot.com',
    affiliateId: process.env.HOMEDEPOT_AFFILIATE_ID || 'your-homedepot-id',
    tagParameter: 'cm_mmc',
    trackingParameter: 'source',
    commissionRate: 3.0, // Home improvement category
    enabled: true,
  },
  macys: {
    store: 'Macy\'s',
    baseUrl: 'https://macys.com',
    affiliateId: process.env.MACYS_AFFILIATE_ID || 'your-macys-id',
    tagParameter: 'cm_mmc',
    trackingParameter: 'source',
    commissionRate: 6.0, // Department store rates
    enabled: true,
  },
  costco: {
    store: 'Costco',
    baseUrl: 'https://costco.com',
    affiliateId: process.env.COSTCO_AFFILIATE_ID || 'your-costco-id',
    tagParameter: 'cm_re',
    trackingParameter: 'source',
    commissionRate: 2.0, // Wholesale membership rates
    enabled: true,
  }
};

export class AffiliateManager {
  private configs: Record<string, AffiliateConfig>;
  private userId?: string;

  constructor(userId?: string) {
    this.configs = AFFILIATE_CONFIGS;
    this.userId = userId;
  }

  /**
   * Generates an affiliate link for a product
   */
  generateAffiliateLink(
    store: string, 
    originalUrl: string, 
    productId?: string,
    customTracking?: string
  ): string {
    const config = this.configs[store.toLowerCase()];
    
    if (!config || !config.enabled || !config.affiliateId) {
      return originalUrl; // Return original URL if no affiliate config
    }

    try {
      const url = new URL(originalUrl);
      
      // Add affiliate ID parameter
      url.searchParams.set(config.tagParameter, config.affiliateId);
      
      // Add tracking parameter if available
      if (config.trackingParameter) {
        const trackingValue = customTracking || this.generateTrackingId(productId);
        url.searchParams.set(config.trackingParameter, trackingValue);
      }
      
      // Add timestamp for analytics
      url.searchParams.set('utm_source', 'smartfete');
      url.searchParams.set('utm_medium', 'affiliate');
      url.searchParams.set('utm_campaign', 'budget-search');
      
      return url.toString();
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      return originalUrl;
    }
  }

  /**
   * Generates affiliate links for Amazon products specifically
   * Amazon has special requirements for their affiliate links
   */
  generateAmazonAffiliateLink(
    asin: string, 
    keywords?: string,
    customTracking?: string
  ): string {
    const config = this.configs.amazon;
    if (!config.enabled) {
      return `https://amazon.com/dp/${asin}`;
    }

    const baseUrl = `https://amazon.com/dp/${asin}`;
    const url = new URL(baseUrl);
    
    // Amazon-specific parameters
    url.searchParams.set('tag', config.affiliateId);
    
    if (customTracking) {
      url.searchParams.set('ascsubtag', customTracking);
    }
    
    if (keywords) {
      url.searchParams.set('keywords', keywords);
    }
    
    // Add UTM parameters for tracking
    url.searchParams.set('linkCode', 'as2');
    url.searchParams.set('camp', '1789');
    url.searchParams.set('creative', '9325');
    
    return url.toString();
  }

  /**
   * Track affiliate link clicks for analytics
   */
  async trackAffiliateClick(
    store: string,
    productId: string,
    userId?: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> {
    try {
      const clickData = {
        store: store.toLowerCase(),
        productId,
        userId: userId || this.userId,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? window.document.referrer : '',
        metadata
      };

      // Store locally for backup and offline functionality
      if (typeof window !== 'undefined') {
        const clicks = JSON.parse(localStorage.getItem('affiliateClicks') || '[]');
        clicks.push(clickData);
        localStorage.setItem('affiliateClicks', JSON.stringify(clicks.slice(-100))); // Keep last 100 clicks
      }
      
      console.log('Affiliate click tracked:', clickData);
      
      // Send to analytics API
      try {
        await fetch('/api/analytics/affiliate-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clickData)
        });
      } catch (apiError) {
        console.warn('Failed to send click to analytics API:', apiError);
        // Continue silently - local storage backup will suffice
      }
      
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  }

  /**
   * Calculate potential commission for a product
   */
  calculateCommission(store: string, price: number): number {
    const config = this.configs[store.toLowerCase()];
    if (!config) return 0;
    
    return (price * config.commissionRate) / 100;
  }

  /**
   * Get commission rates for all stores
   */
  getCommissionRates(): Record<string, number> {
    const rates: Record<string, number> = {};
    Object.entries(this.configs).forEach(([store, config]) => {
      rates[store] = config.commissionRate;
    });
    return rates;
  }

  /**
   * Generate a unique tracking ID for analytics
   */
  private generateTrackingId(productId?: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const product = productId ? productId.substring(0, 8) : 'generic';
    return `sb_${timestamp}_${random}_${product}`;
  }

  /**
   * Validate if a store has affiliate program enabled
   */
  isAffiliateEnabled(store: string): boolean {
    const config = this.configs[store.toLowerCase()];
    return config ? config.enabled && !!config.affiliateId : false;
  }

  /**
   * Get affiliate disclosure text (required by FTC)
   */
  getDisclosureText(): string {
    return "As an Amazon Associate and affiliate partner with other retailers, we may earn from qualifying purchases. This doesn't affect the price you pay.";
  }

  /**
   * Generate short affiliate links (useful for social media)
   * This would typically use a URL shortening service
   */
  async generateShortLink(affiliateUrl: string): Promise<string> {
    try {
      // In a real implementation, you would use a URL shortening service like bit.ly
      // For now, we'll return the original URL
      
      // Example implementation with a hypothetical shortening service:
      // const response = await fetch('/api/shorten-url', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: affiliateUrl, store })
      // });
      // const data = await response.json();
      // return data.shortUrl;
      
      return affiliateUrl;
    } catch (error) {
      console.error('Error generating short link:', error);
      return affiliateUrl;
    }
  }
}

// Export singleton instance
export const affiliateManager = new AffiliateManager();

// Helper function to initialize affiliate manager with user ID
export const initializeAffiliateManager = (userId: string) => {
  return new AffiliateManager(userId);
};
