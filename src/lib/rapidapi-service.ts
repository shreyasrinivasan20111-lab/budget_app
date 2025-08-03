// RapidAPI Service for Real Product Search and Affiliate Links
// This service integrates with various RapidAPI endpoints to get real product data

import { ProductResult } from './real-api-service';

export interface RapidAPIProduct {
  title: string;
  price: string;
  rating?: number;
  reviews?: number;
  image: string;
  url: string;
  asin?: string;
  availability?: string;
  store?: string;
  brand?: string;
}

export interface AffiliateConfig {
  amazon: string;        // Your Amazon Associate tag
  ebay: string;          // Your eBay Partner ID
  walmart: string;       // Your Walmart affiliate ID
  target: string;        // Your Target affiliate ID
}

export class RapidAPIService {
  private apiKey: string;
  private affiliateConfig: AffiliateConfig;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.affiliateConfig = {
      amazon: process.env.AMAZON_AFFILIATE_ID || 'yourstore-20',
      ebay: process.env.EBAY_PARTNER_ID || 'your-ebay-id',
      walmart: process.env.WALMART_AFFILIATE_ID || 'your-walmart-id',
      target: process.env.TARGET_AFFILIATE_ID || 'your-target-id'
    };
  }

  // Method 1: Amazon Product API (amazon-products1.p.rapidapi.com)
  async searchAmazonProducts(query: string, maxResults: number = 10): Promise<ProductResult[]> {
    try {
      console.log(`RapidAPI: Searching Amazon for "${query}"`);
      
      const response = await fetch('https://amazon-products1.p.rapidapi.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com'
        },
        body: JSON.stringify({
          query: query,
          country: 'US',
          category: 'aps',
          max_results: maxResults
        })
      });

      if (!response.ok) {
        throw new Error(`Amazon API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`RapidAPI: Found ${data.results?.length || 0} Amazon products`);
      
      return this.transformAmazonResults(data.results || []);
    } catch (error) {
      console.error('RapidAPI Amazon search failed:', error);
      return [];
    }
  }

  // Method 2: Multi-Store Product Search API (real-time-product-search.p.rapidapi.com)
  async searchMultipleStores(query: string, maxResults: number = 20): Promise<ProductResult[]> {
    try {
      console.log(`RapidAPI: Searching multiple stores for "${query}"`);
      
      const response = await fetch('https://real-time-product-search.p.rapidapi.com/search', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'real-time-product-search.p.rapidapi.com'
        }
      });

      // Note: Each API has different endpoints and parameters
      // Check the API documentation for exact format
      const url = `https://real-time-product-search.p.rapidapi.com/search?q=${encodeURIComponent(query)}&country=us&language=en&limit=${maxResults}`;
      
      const searchResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'real-time-product-search.p.rapidapi.com'
        }
      });

      if (!searchResponse.ok) {
        throw new Error(`Multi-store API failed: ${searchResponse.status}`);
      }

      const data = await searchResponse.json();
      console.log(`RapidAPI: Found ${data.data?.length || 0} products from multiple stores`);
      
      return this.transformMultiStoreResults(data.data || []);
    } catch (error) {
      console.error('RapidAPI multi-store search failed:', error);
      return [];
    }
  }

  // Method 3: Price Comparison API (price-comparison-api.p.rapidapi.com)
  async searchPriceComparison(query: string): Promise<ProductResult[]> {
    try {
      console.log(`RapidAPI: Price comparison search for "${query}"`);
      
      const response = await fetch(`https://price-comparison-api.p.rapidapi.com/products/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'price-comparison-api.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`Price comparison API failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformPriceComparisonResults(data.products || []);
    } catch (error) {
      console.error('RapidAPI price comparison failed:', error);
      return [];
    }
  }

  // Transform Amazon API results to our ProductResult format
  private transformAmazonResults(products: RapidAPIProduct[]): ProductResult[] {
    return products.map((product, index) => {
      const price = this.parsePrice(product.price);
      const asin = product.asin || this.extractASINFromURL(product.url);
      
      return {
        id: asin || `amazon-rapid-${index}`,
        name: product.title,
        price: price,
        store: 'Amazon',
        link: product.url,
        affiliateLink: this.createAmazonAffiliateLink(product.url, asin),
        inStock: product.availability?.toLowerCase().includes('in stock') !== false,
        rating: product.rating || 0,
        image: product.image,
        description: product.title,
        asin: asin,
        estimatedCommission: this.calculateCommission('Amazon', price)
      };
    });
  }

  // Transform multi-store API results
  private transformMultiStoreResults(products: any[]): ProductResult[] {
    return products.map((product, index) => {
      const price = this.parsePrice(product.price || product.offer?.price || '0');
      const store = this.detectStore(product.source || product.merchant || 'Unknown');
      
      return {
        id: `multistore-rapid-${index}`,
        name: product.title || product.name,
        price: price,
        store: store,
        link: product.link || product.url,
        affiliateLink: this.createStoreAffiliateLink(product.link || product.url, store),
        inStock: true, // Multi-store APIs usually only show available products
        rating: product.rating || 0,
        image: product.image || product.thumbnail,
        description: product.title || product.name,
        estimatedCommission: this.calculateCommission(store, price)
      };
    });
  }

  // Transform price comparison results
  private transformPriceComparisonResults(products: any[]): ProductResult[] {
    return products.map((product, index) => {
      const price = this.parsePrice(product.price);
      const store = this.detectStore(product.store || product.retailer);
      
      return {
        id: `pricecomp-rapid-${index}`,
        name: product.name || product.title,
        price: price,
        store: store,
        link: product.url || product.link,
        affiliateLink: this.createStoreAffiliateLink(product.url || product.link, store),
        inStock: product.in_stock !== false,
        rating: product.rating || 0,
        image: product.image,
        description: product.name || product.title,
        estimatedCommission: this.calculateCommission(store, price)
      };
    });
  }

  // Create Amazon affiliate links with your associate tag
  private createAmazonAffiliateLink(originalUrl: string, asin?: string): string {
    if (asin) {
      // Create clean affiliate link with ASIN
      return `https://amazon.com/dp/${asin}?tag=${this.affiliateConfig.amazon}&linkCode=as2&camp=1789&creative=9325`;
    }

    // Add affiliate tag to existing URL
    try {
      const url = new URL(originalUrl);
      url.searchParams.set('tag', this.affiliateConfig.amazon);
      url.searchParams.set('linkCode', 'as2');
      url.searchParams.set('camp', '1789');
      url.searchParams.set('creative', '9325');
      return url.toString();
    } catch {
      // Fallback if URL parsing fails
      return `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}tag=${this.affiliateConfig.amazon}`;
    }
  }

  // Create affiliate links for other stores
  private createStoreAffiliateLink(originalUrl: string, store: string): string {
    try {
      const url = new URL(originalUrl);
      
      switch (store.toLowerCase()) {
        case 'amazon':
          return this.createAmazonAffiliateLink(originalUrl);
          
        case 'ebay':
          url.searchParams.set('campid', this.affiliateConfig.ebay);
          url.searchParams.set('customid', `rapidapi-${Date.now()}`);
          break;
          
        case 'walmart':
          url.searchParams.set('wmlspartner', this.affiliateConfig.walmart);
          url.searchParams.set('sourceid', 'rapidapi-affiliate');
          break;
          
        case 'target':
          url.searchParams.set('afid', this.affiliateConfig.target);
          url.searchParams.set('ref', 'rapidapi-affiliate');
          break;
          
        default:
          // For unknown stores, add generic tracking
          url.searchParams.set('utm_source', 'rapidapi-affiliate');
          url.searchParams.set('utm_medium', 'affiliate');
          url.searchParams.set('utm_campaign', 'budget-search');
      }
      
      return url.toString();
    } catch {
      return originalUrl; // Return original if URL parsing fails
    }
  }

  // Detect store from URL or merchant name
  private detectStore(source: string): string {
    const sourceLower = source.toLowerCase();
    
    if (sourceLower.includes('amazon')) return 'Amazon';
    if (sourceLower.includes('ebay')) return 'eBay';
    if (sourceLower.includes('walmart')) return 'Walmart';
    if (sourceLower.includes('target')) return 'Target';
    if (sourceLower.includes('bestbuy')) return 'Best Buy';
    if (sourceLower.includes('homedepot')) return 'Home Depot';
    if (sourceLower.includes('lowes')) return 'Lowe\'s';
    
    return source; // Return original if not recognized
  }

  // Extract ASIN from Amazon URL
  private extractASINFromURL(url: string): string | undefined {
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    return asinMatch?.[1];
  }

  // Parse price string to number
  private parsePrice(priceString: string): number {
    if (!priceString) return 0;
    const cleaned = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  // Calculate estimated commission
  private calculateCommission(store: string, price: number): number {
    const rates: Record<string, number> = {
      'Amazon': 4.0,
      'eBay': 3.0,
      'Walmart': 4.0,
      'Target': 8.0,
      'Best Buy': 2.5,
      'Home Depot': 3.0,
      'Lowe\'s': 3.0
    };
    
    const rate = rates[store] || 2.0;
    return Math.round((price * rate / 100) * 100) / 100;
  }

  // Main search method that tries multiple APIs
  async searchProducts(query: string, maxResults: number = 15): Promise<ProductResult[]> {
    const allResults: ProductResult[] = [];

    try {
      // Try Amazon API first (usually has best results)
      const amazonResults = await this.searchAmazonProducts(query, Math.min(maxResults, 10));
      allResults.push(...amazonResults);

      // If we need more results, try multi-store API
      if (allResults.length < maxResults) {
        const multiStoreResults = await this.searchMultipleStores(query, maxResults - allResults.length);
        allResults.push(...multiStoreResults);
      }

      // Remove duplicates based on similar names
      const uniqueResults = this.removeDuplicates(allResults);
      
      console.log(`RapidAPI: Total ${uniqueResults.length} unique products found for "${query}"`);
      return uniqueResults.slice(0, maxResults);
    } catch (error) {
      console.error('RapidAPI search failed:', error);
      return [];
    }
  }

  // Remove duplicate products
  private removeDuplicates(products: ProductResult[]): ProductResult[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.name.toLowerCase().substring(0, 50)}-${product.store}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// Export singleton instance
export const rapidAPIService = new RapidAPIService();
