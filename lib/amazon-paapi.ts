// Amazon Product Advertising API (Official Amazon API)
// Free tier: 8,640 requests per day
// Setup: https://webservices.amazon.com/paapi5/documentation/

import crypto from 'crypto';

interface AmazonPAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string; // 'us-east-1' for US
}

interface PAAPIProduct {
  ASIN: string;
  DetailPageURL: string;
  Images?: {
    Primary?: {
      Large?: { URL: string };
      Medium?: { URL: string };
    };
  };
  ItemInfo?: {
    Title?: { DisplayValue: string };
    Features?: { DisplayValues: string[] };
    ProductGroup?: { DisplayValue: string };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        DisplayAmount: string;
        Amount: number;
        Currency: string;
      };
      Availability?: { Type: string };
    }>;
  };
  CustomerReviews?: {
    StarRating?: { Value: number };
    Count: number;
  };
}

export class AmazonPAAPI {
  private config: AmazonPAAPIConfig;
  private host = 'webservices.amazon.com';
  private path = '/paapi5/searchitems';

  constructor(config: AmazonPAAPIConfig) {
    this.config = config;
  }

  // AWS Signature Version 4 signing
  private sign(method: string, path: string, querystring: string, payload: string): string {
    const algorithm = 'AWS4-HMAC-SHA256';
    const service = 'ProductAdvertisingAPI';
    const region = this.config.region;
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';

    // Create canonical request
    const canonicalHeaders = `host:${this.host}\nx-amz-date:${datetime}\n`;
    const signedHeaders = 'host;x-amz-date';
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = [
      method,
      path,
      querystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    // Create string to sign
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      datetime,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${this.config.secretKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return `${algorithm} Credential=${this.config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  async searchProducts(query: string, maxResults: number = 10): Promise<PAAPIProduct[]> {
    const payload = JSON.stringify({
      Keywords: query,
      Resources: [
        'Images.Primary.Large',
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductGroup',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Type',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ],
      PartnerTag: this.config.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
      ItemCount: Math.min(maxResults, 10)
    });

    const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    const authorization = this.sign('POST', this.path, '', payload);

    try {
      const response = await fetch(`https://${this.host}${this.path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Host': this.host,
          'X-Amz-Date': datetime,
          'Authorization': authorization,
          'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
        },
        body: payload
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Amazon PA-API Error:', errorText);
        return [];
      }

      const data = await response.json();
      return data.SearchResult?.Items || [];
    } catch (error) {
      console.error('Amazon PA-API request failed:', error);
      return [];
    }
  }

  async getProductByASIN(asin: string): Promise<PAAPIProduct | null> {
    const payload = JSON.stringify({
      ItemIds: [asin],
      Resources: [
        'Images.Primary.Large',
        'Images.Primary.Medium', 
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductGroup',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Type',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ],
      PartnerTag: this.config.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    });

    const path = '/paapi5/getitems';
    const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    const authorization = this.sign('POST', path, '', payload);

    try {
      const response = await fetch(`https://${this.host}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Host': this.host,
          'X-Amz-Date': datetime,
          'Authorization': authorization,
          'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
        },
        body: payload
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Amazon PA-API Error:', errorText);
        return null;
      }

      const data = await response.json();
      return data.ItemsResult?.Items?.[0] || null;
    } catch (error) {
      console.error('Amazon PA-API request failed:', error);
      return null;
    }
  }
}

// Usage example:
export async function createAmazonPAAPI() {
  return new AmazonPAAPI({
    accessKey: process.env.AMAZON_ACCESS_KEY || '',
    secretKey: process.env.AMAZON_SECRET_KEY || '',
    partnerTag: process.env.AMAZON_AFFILIATE_ID || '',
    region: 'us-east-1'
  });
}
