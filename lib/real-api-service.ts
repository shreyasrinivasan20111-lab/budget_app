// Real API service - currently configured for RapidAPI integration
// Falls back to mock data when APIs are not available

export async function searchAmazonProducts(query: string, maxResults: number = 10): Promise<ProductResult[]> {
  try {
    console.log(`Searching for products: "${query}"`);
    
    // For now, return mock data since RapidAPI integration is handled in rapidapi-service.ts
    // The main search endpoint will try RapidAPI first, then fall back to this
    return generateMockAmazonProducts(query, maxResults);
  } catch (error) {
    console.error('Search failed:', error);
    return generateMockAmazonProducts(query, maxResults);
  }
}

function generateMockAmazonProducts(query: string, count: number): ProductResult[] {
  const baseProducts = [
    { name: 'Laptop', basePrice: 749, category: 'Electronics' },
    { name: 'Wireless Mouse', basePrice: 32, category: 'Computer Accessories' },
    { name: 'Keyboard', basePrice: 115, category: 'Computer Accessories' },
    { name: 'Monitor', basePrice: 259, category: 'Electronics' },
    { name: 'Headphones', basePrice: 99, category: 'Audio' },
    { name: 'Smartphone', basePrice: 499, category: 'Electronics' },
    { name: 'Tablet', basePrice: 329, category: 'Electronics' },
    { name: 'Speaker', basePrice: 169, category: 'Audio' }
  ];

  return Array.from({ length: count }, (_, i) => {
    const base = baseProducts[i % baseProducts.length];
    const variation = Math.random() * 0.4 + 0.8; // 80% to 120% of base price
    const price = Math.round(base.basePrice * variation);
    const productId = `${query.toLowerCase()}-${i + 1}`;
    
    return {
      id: productId,
      name: `${base.name} - ${query.charAt(0).toUpperCase() + query.slice(1)} Edition`,
      price: price,
      store: 'Amazon',
      link: `https://amazon.com/dp/${productId}`,
      affiliateLink: `https://amazon.com/dp/${productId}?tag=yourstore-20`,
      inStock: Math.random() > 0.1, // 90% in stock
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      image: `/api/placeholder/300/300?text=${encodeURIComponent(base.name)}`,
      description: `High-quality ${base.name.toLowerCase()} perfect for ${query}. Features modern design and reliable performance.`,
      asin: `B${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      estimatedCommission: Math.round(price * 0.04 * 100) / 100 // 4% commission
    };
  });
}

export interface ProductResult {
  id: string;
  name: string;
  price: number;
  store: string;
  link: string;
  affiliateLink: string;
  inStock: boolean;
  stockLevel?: string;
  rating: number;
  image?: string;
  description?: string;
  asin?: string;
  estimatedCommission?: number;
}

interface RapidAPIAmazonProduct {
  title: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  url: string;
  asin: string;
  availability: string;
}

interface AmazonPAAPIProduct {
  ASIN: string;
  DetailPageURL: string;
  ItemInfo: {
    Title: { DisplayValue: string };
  };
  Offers: {
    Listings: [{
      Price: { DisplayAmount: string; Amount: number };
      Availability: { Message: string };
    }];
  };
  Images: {
    Primary: { Medium: { URL: string } };
  };
  CustomerReviews: {
    StarRating: { Value: number };
  };
}

export class RealAPIService {
  private rapidApiKey: string;
  private amazonAccessKey: string;
  private amazonSecretKey: string;
  private amazonAffiliateId: string;

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    this.amazonAccessKey = process.env.AMAZON_ACCESS_KEY || '';
    this.amazonSecretKey = process.env.AMAZON_SECRET_KEY || '';
    this.amazonAffiliateId = process.env.AMAZON_AFFILIATE_ID || 'yourstore-20';
  }

  // Method 1: Using RapidAPI (Easier to get started)
  async searchAmazonViaRapidAPI(query: string): Promise<ProductResult[]> {
    try {
      const response = await fetch('https://amazon-products1.p.rapidapi.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com'
        },
        body: JSON.stringify({
          query: query,
          country: 'US',
          category: 'aps'
        })
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRapidAPIResults(data.results || []);
    } catch (error) {
      console.error('RapidAPI search failed:', error);
      return [];
    }
  }

  // Method 2: Direct Amazon PA-API (Requires approval)
  async searchAmazonPAAPI(query: string): Promise<ProductResult[]> {
    try {
      // This requires AWS signature and proper authentication
      // Implementation would use AWS SDK or custom signing
      const signedRequest = await this.createAmazonSignedRequest(query);
      
      const response = await fetch('https://webservices.amazon.com/paapi5/searchitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
          'Authorization': signedRequest.authorization,
          'X-Amz-Date': signedRequest.amzDate
        },
        body: JSON.stringify({
          Keywords: query,
          Resources: [
            'ItemInfo.Title',
            'Offers.Listings.Price',
            'Images.Primary.Medium',
            'CustomerReviews.StarRating'
          ],
          PartnerTag: this.amazonAffiliateId,
          PartnerType: 'Associates',
          Marketplace: 'www.amazon.com'
        })
      });

      const data = await response.json();
      return this.transformPAAPIResults(data.SearchResult?.Items || []);
    } catch (error) {
      console.error('Amazon PA-API search failed:', error);
      return [];
    }
  }

  // Transform RapidAPI results to our format
  private transformRapidAPIResults(products: RapidAPIAmazonProduct[]): ProductResult[] {
    return products.map((product, index) => ({
      id: product.asin || `rapid-${index}`,
      name: product.title,
      price: this.parsePrice(product.price),
      store: 'Amazon',
      link: product.url,
      affiliateLink: this.createAmazonAffiliateLink(product.url, product.asin),
      inStock: product.availability?.toLowerCase().includes('in stock') !== false,
      rating: product.rating || 0,
      image: product.image,
      description: product.title,
      asin: product.asin,
      estimatedCommission: this.calculateCommission('Amazon', this.parsePrice(product.price))
    }));
  }

  // Transform PA-API results to our format
  private transformPAAPIResults(products: AmazonPAAPIProduct[]): ProductResult[] {
    return products.map(product => ({
      id: product.ASIN,
      name: product.ItemInfo.Title.DisplayValue,
      price: product.Offers.Listings[0]?.Price.Amount || 0,
      store: 'Amazon',
      link: product.DetailPageURL,
      affiliateLink: this.createAmazonAffiliateLink(product.DetailPageURL, product.ASIN),
      inStock: product.Offers.Listings[0]?.Availability.Message === 'In Stock',
      rating: product.CustomerReviews?.StarRating?.Value || 0,
      image: product.Images.Primary.Medium.URL,
      description: product.ItemInfo.Title.DisplayValue,
      asin: product.ASIN,
      estimatedCommission: this.calculateCommission('Amazon', product.Offers.Listings[0]?.Price.Amount || 0)
    }));
  }

  // Create Amazon affiliate link with your associate tag
  private createAmazonAffiliateLink(originalUrl: string, asin?: string): string {
    if (asin) {
      // Create clean affiliate link with ASIN
      return `https://amazon.com/dp/${asin}?tag=${this.amazonAffiliateId}`;
    }

    // Add affiliate tag to existing URL
    const url = new URL(originalUrl);
    url.searchParams.set('tag', this.amazonAffiliateId);
    return url.toString();
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
      'Target': 8.0
    };
    
    const rate = rates[store] || 2.0;
    return Math.round((price * rate / 100) * 100) / 100;
  }

  // Placeholder for Amazon request signing
  private async createAmazonSignedRequest(_query: string): Promise<{ authorization: string; amzDate: string }> {
    // This would implement AWS Signature Version 4
    // For now, return placeholder - you'd use AWS SDK or implement signing
    return {
      authorization: 'AWS4-HMAC-SHA256 ...',
      amzDate: new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
    };
  }

  // Method 3: Using SerpAPI for Google Shopping results
  async searchGoogleShopping(query: string): Promise<ProductResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformSerpAPIResults(data.shopping_results || []);
    } catch (error) {
      console.error('SerpAPI search failed:', error);
      return [];
    }
  }

  private transformSerpAPIResults(results: unknown[]): ProductResult[] {
    return results.map((item: unknown, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = item as any; // Type assertion for unknown API response structure
      return {
        id: `serp-${index}`,
        name: result.title,
        price: result.extracted_price || 0,
        store: result.source,
        link: result.link,
        affiliateLink: this.createGenericAffiliateLink(result.link, result.source),
        inStock: true, // SerpAPI doesn't always provide stock info
        rating: result.rating || 0,
        image: result.thumbnail,
        description: result.title,
        estimatedCommission: this.calculateCommission(result.source, result.extracted_price || 0)
      };
    });
  }

  private createGenericAffiliateLink(originalUrl: string, _store: string): string {
    // For non-Amazon stores, you'd implement their specific affiliate link format
    // This is a placeholder - each store has different requirements
    return originalUrl; // Return original URL for now
  }
}

// Export singleton instance
export const realAPIService = new RealAPIService();
