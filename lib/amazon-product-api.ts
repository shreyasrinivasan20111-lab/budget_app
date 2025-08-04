// Amazon Product API Utility Functions for RapidAPI
// Standalone functions to fetch Amazon product details using ASIN and country code

export interface AmazonProductDetail {
  asin: string;
  title: string;
  price: {
    current?: string;
    original?: string;
    currency?: string;
  };
  rating?: {
    value: number;
    count: number;
  };
  availability?: string;
  images?: {
    primary: string;
    gallery?: string[];
  };
  url: string;
  description?: string;
  brand?: string;
  category?: string;
  features?: string[];
  dimensions?: {
    weight?: string;
    size?: string;
  };
}

export interface AmazonAPIResponse {
  product: AmazonProductDetail;
  success: boolean;
  message?: string;
}

export interface AmazonSearchResponse {
  products: AmazonProductDetail[];
  total: number;
  page: number;
  success: boolean;
  message?: string;
}

/**
 * Fetch Amazon product details by ASIN using RapidAPI
 * @param asin - Amazon Standard Identification Number
 * @param countryCode - Country code (US, UK, CA, DE, FR, IT, ES, JP, AU, IN, etc.)
 * @param rapidApiKey - Your RapidAPI key
 * @returns Promise<AmazonProductDetail | null>
 */
export async function fetchAmazonProductByASIN(
  asin: string,
  countryCode: string = 'US',
  rapidApiKey?: string
): Promise<AmazonProductDetail | null> {
  try {
    const apiKey = rapidApiKey || process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      throw new Error('RapidAPI key is required. Set RAPIDAPI_KEY environment variable or pass it as parameter.');
    }

    console.log(`Fetching Amazon product details for ASIN: ${asin} in country: ${countryCode}`);

    const response = await fetch('https://amazon-products1.p.rapidapi.com/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com'
      },
      body: JSON.stringify({
        asin: asin,
        country: countryCode.toUpperCase()
      })
    });

    if (!response.ok) {
      throw new Error(`Amazon Product API responded with status: ${response.status} ${response.statusText}`);
    }

    const data: AmazonAPIResponse = await response.json();

    if (!data.success || !data.product) {
      console.warn(`No product found for ASIN: ${asin}. Message: ${data.message}`);
      return null;
    }

    return data.product;
  } catch (error) {
    console.error(`Failed to fetch Amazon product for ASIN ${asin}:`, error);
    return null;
  }
}

/**
 * Fetch multiple Amazon products by ASINs
 * @param asins - Array of Amazon Standard Identification Numbers
 * @param countryCode - Country code (US, UK, CA, DE, FR, IT, ES, JP, AU, IN, etc.)
 * @param rapidApiKey - Your RapidAPI key
 * @returns Promise<AmazonProductDetail[]>
 */
export async function fetchAmazonProductsByASINs(
  asins: string[],
  countryCode: string = 'US',
  rapidApiKey?: string
): Promise<AmazonProductDetail[]> {
  try {
    console.log(`Fetching ${asins.length} Amazon products by ASIN in country: ${countryCode}`);
    
    // Fetch products in parallel but with rate limiting
    const batchSize = 5; // Process 5 requests at a time to avoid rate limiting
    const results: AmazonProductDetail[] = [];
    
    for (let i = 0; i < asins.length; i += batchSize) {
      const batch = asins.slice(i, i + batchSize);
      const batchPromises = batch.map(asin => 
        fetchAmazonProductByASIN(asin, countryCode, rapidApiKey)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value !== null) {
          results.push(result.value);
        }
      }
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < asins.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Successfully fetched ${results.length} out of ${asins.length} products`);
    return results;
  } catch (error) {
    console.error('Failed to fetch Amazon products by ASINs:', error);
    return [];
  }
}

/**
 * Search Amazon products and get detailed results
 * @param query - Search query
 * @param countryCode - Country code
 * @param maxResults - Maximum number of results
 * @param rapidApiKey - Your RapidAPI key
 * @returns Promise<AmazonProductDetail[]>
 */
export async function searchAmazonProductsDetailed(
  query: string,
  countryCode: string = 'US',
  maxResults: number = 10,
  rapidApiKey?: string
): Promise<AmazonProductDetail[]> {
  try {
    const apiKey = rapidApiKey || process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      throw new Error('RapidAPI key is required. Set RAPIDAPI_KEY environment variable or pass it as parameter.');
    }

    console.log(`Searching Amazon for: "${query}" in country: ${countryCode}`);

    const response = await fetch('https://amazon-products1.p.rapidapi.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com'
      },
      body: JSON.stringify({
        query: query,
        country: countryCode.toUpperCase(),
        page: 1,
        limit: maxResults
      })
    });

    if (!response.ok) {
      throw new Error(`Amazon Search API responded with status: ${response.status} ${response.statusText}`);
    }

    const data: AmazonSearchResponse = await response.json();

    if (!data.success || !data.products) {
      console.warn(`No products found for query: "${query}". Message: ${data.message}`);
      return [];
    }

    console.log(`Found ${data.products.length} products for query: "${query}"`);
    return data.products;
  } catch (error) {
    console.error(`Failed to search Amazon products for query "${query}":`, error);
    return [];
  }
}

/**
 * Utility function to extract ASIN from Amazon URL
 * @param url - Amazon product URL
 * @returns string | null
 */
export function extractASINFromURL(url: string): string | null {
  try {
    // Common Amazon URL patterns:
    // https://amazon.com/dp/B08N5WRWNW
    // https://amazon.com/product-name/dp/B08N5WRWNW
    // https://www.amazon.com/gp/product/B08N5WRWNW
    
    const asinMatch = url.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})/i);
    return asinMatch ? asinMatch[1] : null;
  } catch (error) {
    console.error('Failed to extract ASIN from URL:', error);
    return null;
  }
}

/**
 * Generate Amazon affiliate link with ASIN
 * @param asin - Amazon Standard Identification Number
 * @param countryCode - Country code
 * @param affiliateTag - Your Amazon Associate tag
 * @returns string
 */
export function generateAmazonAffiliateLink(
  asin: string,
  countryCode: string = 'US',
  affiliateTag?: string
): string {
  const tag = affiliateTag || process.env.AMAZON_AFFILIATE_ID || 'yourstore-20';
  const domain = getAmazonDomain(countryCode);
  
  return `https://amazon.${domain}/dp/${asin}?tag=${tag}`;
}

/**
 * Get Amazon domain for country code
 * @param countryCode - Country code
 * @returns string
 */
export function getAmazonDomain(countryCode: string): string {
  const domainMap: Record<string, string> = {
    'US': 'com',
    'UK': 'co.uk',
    'CA': 'ca',
    'DE': 'de',
    'FR': 'fr',
    'IT': 'it',
    'ES': 'es',
    'JP': 'co.jp',
    'AU': 'com.au',
    'IN': 'in',
    'BR': 'com.br',
    'MX': 'com.mx',
    'NL': 'nl',
    'PL': 'pl',
    'SE': 'se',
    'TR': 'com.tr'
  };
  return domainMap[countryCode.toUpperCase()] || 'com';
}

/**
 * Parse price string to number
 * @param priceString - Price string like "$19.99" or "19.99"
 * @returns number
 */
export function parsePrice(priceString: string): number {
  if (!priceString) return 0;
  
  // Remove currency symbols and non-numeric characters except decimal point
  const cleaned = priceString.replace(/[^\d.-]/g, '');
  const price = parseFloat(cleaned);
  
  return isNaN(price) ? 0 : price;
}

/**
 * Format price with currency
 * @param price - Price number
 * @param currency - Currency code (USD, EUR, GBP, etc.)
 * @param locale - Locale for formatting
 * @returns string
 */
export function formatPrice(price: number, currency: string = 'USD', locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(price);
  } catch (error) {
    return `${currency} ${price.toFixed(2)}`;
  }
}
