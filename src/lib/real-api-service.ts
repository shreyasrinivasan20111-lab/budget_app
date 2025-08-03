// Real API Integration for Affiliate Links
// This service integrates with actual shopping APIs to get real products and affiliate links

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
  private async createAmazonSignedRequest(query: string): Promise<{ authorization: string; amzDate: string }> {
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

  private transformSerpAPIResults(results: any[]): ProductResult[] {
    return results.map((result, index) => ({
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
    }));
  }

  private createGenericAffiliateLink(originalUrl: string, store: string): string {
    // For non-Amazon stores, you'd implement their specific affiliate link format
    // This is a placeholder - each store has different requirements
    return originalUrl; // Return original URL for now
  }
}

// Export singleton instance
export const realAPIService = new RealAPIService();

// Export types
export type { ProductResult };
