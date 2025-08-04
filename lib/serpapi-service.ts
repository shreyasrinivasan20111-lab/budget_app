// SerpAPI Google Shopping Integration
// This service provides real Google Shopping results for your budget app

import { ProductResult } from './real-api-service';

export interface GoogleShoppingProduct {
  title: string;
  price: string;
  source: string;
  product_link: string;  // Changed from 'link' to 'product_link'
  thumbnail: string;
  rating?: number;
  reviews?: number;
  shipping?: string;
  delivery?: string;
  position: number;
  extracted_price?: number;
  product_id?: string;
  tag?: string;
}

export interface SerpAPIResponse {
  shopping_results?: GoogleShoppingProduct[];
  search_metadata?: {
    status: string;
    total_results?: number;
  };
  error?: string;
}

export class SerpAPIService {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search.json';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPAPI_KEY || '';
  }

  /**
   * Search Google Shopping with basic query
   */
  async searchProducts(query: string, options: {
    location?: string;
    num?: number;
    country?: string;
  } = {}): Promise<ProductResult[]> {
    try {
      if (!this.apiKey) {
        console.warn('SerpAPI key not found, using mock data');
        return [];
      }

      console.log(`SerpAPI: Searching Google Shopping for "${query}"`);

      const params = new URLSearchParams({
        engine: 'google_shopping',
        q: query,
        api_key: this.apiKey,
        location: options.location || 'United States',
        num: (options.num || 20).toString(),
        gl: options.country || 'us',
        hl: 'en'
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'Budget App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`);
      }

      const data: SerpAPIResponse = await response.json();

      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      if (!data.shopping_results || data.shopping_results.length === 0) {
        console.warn(`No Google Shopping results found for "${query}"`);
        return [];
      }

      console.log(`Found ${data.shopping_results.length} Google Shopping results for "${query}"`);

      return this.convertToProductResults(data.shopping_results, query);
    } catch (error) {
      console.error('SerpAPI Google Shopping search failed:', error);
      return [];
    }
  }

  /**
   * Advanced search with filters
   */
  async searchWithFilters(query: string, filters: {
    priceRange?: { min: number; max: number };
    sortBy?: 'price_low' | 'price_high' | 'rating' | 'reviews';
    location?: string;
    store?: string;
    maxResults?: number;
  } = {}): Promise<ProductResult[]> {
    try {
      console.log(`SerpAPI: Advanced search for "${query}" with filters:`, filters);

      const params = new URLSearchParams({
        engine: 'google_shopping',
        q: query,
        api_key: this.apiKey,
        location: filters.location || 'United States',
        num: (filters.maxResults || 20).toString(),
        gl: 'us',
        hl: 'en'
      });

      // Add price filter
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        params.append('tbs', `p_ord:p,price:1,ppr_min:${min},ppr_max:${max}`);
      }

      // Add sorting
      if (filters.sortBy) {
        const sortMap = {
          'price_low': 'p',
          'price_high': 'pd', 
          'rating': 'r',
          'reviews': 'rv'
        };
        params.append('tbs', `p_ord:${sortMap[filters.sortBy]}`);
      }

      // Add store filter
      if (filters.store) {
        params.append('tbs', `vw:l,mr:1,price:1,local_avail:1,ss:${filters.store}`);
      }

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data: SerpAPIResponse = await response.json();

      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      return this.convertToProductResults(data.shopping_results || [], query);
    } catch (error) {
      console.error('SerpAPI advanced search failed:', error);
      return [];
    }
  }

  /**
   * Get price comparison for specific product
   */
  async getPriceComparison(productName: string, maxResults: number = 10): Promise<ProductResult[]> {
    return this.searchWithFilters(productName, {
      sortBy: 'price_low',
      maxResults
    });
  }

  /**
   * Search by store
   */
  async searchByStore(query: string, store: string): Promise<ProductResult[]> {
    return this.searchWithFilters(query, { store });
  }

  /**
   * Convert SerpAPI results to ProductResult format
   */
  private convertToProductResults(results: GoogleShoppingProduct[], originalQuery: string): ProductResult[] {
    return results.map((item, index) => {
      // Extract price number from price string
      const priceMatch = item.price?.match(/[\d,]+\.?\d*/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : item.extracted_price || 0;

      // Use product_link from SerpAPI response
      const originalLink = item.product_link || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
      
      // Generate affiliate link (you can customize this)
      const affiliateLink = this.generateAffiliateLink(originalLink, item.source || 'Unknown');

      return {
        id: `serpapi-${originalQuery.replace(/\s+/g, '-')}-${index + 2}`,
        name: item.title || 'Unknown Product',
        price: price,
        store: item.source || 'Google Shopping',
        link: originalLink,
        affiliateLink: affiliateLink,
        inStock: true, // Assume in stock since it's on Google Shopping
        rating: item.rating || 0,
        image: item.thumbnail || '/placeholder-image.svg',
        description: `${item.title || 'Product'} from ${item.source || 'Google Shopping'}${item.delivery ? ` - ${item.delivery}` : ''}`,
        asin: item.product_id || `serpapi-${Date.now()}-${index}`,
        estimatedCommission: this.calculateCommission(price, item.source || 'Unknown')
      };
    });
  }

  /**
   * Generate affiliate links based on store
   */
  private generateAffiliateLink(originalLink: string, store: string): string {
    // Check if the original link is valid
    if (!originalLink || !originalLink.startsWith('http')) {
      console.warn(`Invalid link received: ${originalLink}`);
      return originalLink || '#';
    }

    const affiliateIds = {
      'Amazon.com': process.env.AMAZON_AFFILIATE_ID || 'yourstore-20',
      'eBay': process.env.EBAY_PARTNER_ID || 'your-ebay-id',
      'Walmart': process.env.WALMART_AFFILIATE_ID || 'your-walmart-id',
      'Target': process.env.TARGET_AFFILIATE_ID || 'your-target-id'
    };

    try {
      // For Google Shopping redirect URLs, we need to decode them properly
      let processedLink = originalLink;
      
      // If it's a Google redirect URL, try to extract the actual destination
      if (originalLink.includes('google.com') && originalLink.includes('url=')) {
        const urlMatch = originalLink.match(/url=([^&]+)/);
        if (urlMatch) {
          processedLink = decodeURIComponent(urlMatch[1]);
        }
      }

      // Amazon affiliate link
      if ((store.includes('Amazon') || processedLink.includes('amazon.com')) && affiliateIds['Amazon.com']) {
        if (processedLink.includes('amazon.com')) {
          const separator = processedLink.includes('?') ? '&' : '?';
          return `${processedLink}${separator}tag=${affiliateIds['Amazon.com']}`;
        }
      }

      // eBay affiliate link
      if ((store.includes('eBay') || processedLink.includes('ebay.com')) && affiliateIds['eBay']) {
        // eBay Partner Network integration would go here
        return processedLink;
      }

      // Walmart affiliate link
      if ((store.includes('Walmart') || processedLink.includes('walmart.com')) && affiliateIds['Walmart']) {
        if (processedLink.includes('walmart.com')) {
          const separator = processedLink.includes('?') ? '&' : '?';
          return `${processedLink}${separator}wmlspartner=${affiliateIds['Walmart']}`;
        }
      }

      // Target affiliate link
      if ((store.includes('Target') || processedLink.includes('target.com')) && affiliateIds['Target']) {
        if (processedLink.includes('target.com')) {
          const separator = processedLink.includes('?') ? '&' : '?';
          return `${processedLink}${separator}afid=${affiliateIds['Target']}`;
        }
      }

      // For other stores, return the processed link
      return processedLink;
    } catch (error) {
      console.error('Error processing affiliate link:', error);
      return originalLink;
    }
  }

  /**
   * Calculate estimated commission based on store and price
   */
  private calculateCommission(price: number, store: string): number {
    const commissionRates: Record<string, number> = {
      'Amazon.com': 0.05,      // 5% updated 2025 rate
      'Amazon': 0.05,          // 5% for variations
      'eBay': 0.04,           // 4% updated 2025 rate  
      'Walmart': 0.045,       // 4.5% updated 2025 rate
      'Walmart - Seller': 0.04, // 4% for marketplace sellers
      'Target': 0.08,         // 8% Target maintains premium rates
      'Best Buy': 0.045,     // 4.5% updated 2025 rate
      'Home Depot': 0.03,    // 3% steady rate
      'Costco': 0.02,        // 2% wholesale rate
      'Macy\'s': 0.06,       // 6% department store rate
      'REI': 0.08,           // 8% outdoor gear premium
      'JLab': 0.08,          // 8% direct brand rate
      'Sennheiser': 0.06,    // 6% audio brand rate
      'JBL': 0.05,           // 5% audio brand rate
      'TOZO': 0.07,          // 7% emerging brand rate
      'QCY Brand': 0.08,     // 8% direct brand rate
      'Lenovo': 0.04,        // 4% tech brand rate
      'Five Below': 0.03,    // 3% discount retailer
      'RadioShack': 0.04,    // 4% electronics rate
      'DICK\'S Sporting Goods': 0.05, // 5% sporting goods
      'Big 5 Sporting Goods': 0.04,  // 4% regional rate
      'Turntable Lab': 0.06, // 6% specialty audio
      'Newegg.com': 0.03,    // 3% tech marketplace
      'default': 0.03        // 3% updated default rate
    };

    const rate = commissionRates[store] || commissionRates['default'];
    return Math.round(price * rate * 100) / 100;
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(category: string = 'electronics'): Promise<ProductResult[]> {
    const trendingQueries = [
      `trending ${category}`,
      `popular ${category}`,
      `best ${category} 2025`,
      `top rated ${category}`
    ];

    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    return this.searchProducts(randomQuery, { num: 10 });
  }

  /**
   * Check API quota status
   */
  async checkQuota(): Promise<{ remaining?: number; status: string }> {
    try {
      // Make a minimal search to check quota
      const params = new URLSearchParams({
        engine: 'google_shopping',
        q: 'test',
        api_key: this.apiKey,
        num: '1'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();

      if (data.search_metadata?.status === 'Success') {
        return { status: 'active' };
      } else {
        return { status: 'error' };
      }
    } catch (error) {
      return { status: 'error' };
    }
  }
}

// Export singleton instance
export const serpAPIService = new SerpAPIService();
