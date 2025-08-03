# Target API Integration Guide

This guide shows you how to integrate Target's Partners API with your SmartBudget AI app for real-time product data and affiliate links.

## 🎯 Target Partners API Overview

Target offers a Partners API that provides:
- **Product Search**: Search Target's inventory
- **Real-time Pricing**: Current prices and availability
- **Product Details**: Images, descriptions, ratings
- **Affiliate Links**: Trackable links for commissions

## 🚀 Getting Started

### Step 1: Apply for Target Partners API Access

1. **Visit Target's Partner Portal**
   - Go to: https://partners.target.com/
   - Click "Apply to Become a Partner"

2. **Application Requirements**
   - Business website (your deployed SmartBudget AI app)
   - Business description and use case
   - Expected API usage volume
   - Technical integration plan

3. **API Access Approval**
   - Target reviews applications manually
   - Process typically takes 2-4 weeks
   - They're selective about partners

### Step 2: Get Your API Credentials

Once approved, you'll receive:
- **API Key**: Your unique identifier
- **Base URL**: https://api.target.com/partner_api/v3
- **Documentation**: Detailed API specs

### Step 3: Configure Your App

1. **Add API Key to Environment**
```bash
# In your .env.local file
TARGET_API_KEY=your-target-api-key-here
TARGET_AFFILIATE_ID=your-target-affiliate-id
```

2. **Enable Target API**
```typescript
// In src/lib/api-integrator.ts, set:
target: {
  name: 'Target Partners API',
  baseUrl: 'https://api.target.com/partner_api/v3',
  searchEndpoint: '/products/search',
  rateLimit: 1000,
  enabled: true, // Change this to true
}
```

## 📡 API Implementation

### Search Endpoint
```
GET https://api.target.com/partner_api/v3/products/search
```

### Required Parameters
- `key`: Your API key
- `keyword`: Search term
- `count`: Number of results (max 25)
- `offset`: Pagination offset
- `pricing_store_id`: Store ID (3991 for online)

### Example Request
```typescript
const url = new URL('https://api.target.com/partner_api/v3/products/search');
url.searchParams.append('key', 'your-api-key');
url.searchParams.append('keyword', 'wireless headphones');
url.searchParams.append('count', '5');
url.searchParams.append('offset', '0');
url.searchParams.append('pricing_store_id', '3991');

const response = await fetch(url.toString(), {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'SmartBudget-AI/1.0'
  }
});
```

### Response Format
```json
{
  "products": [
    {
      "tcin": "54643926",
      "title": "Apple AirPods Pro",
      "price": {
        "current": 199.99,
        "regular": 249.99
      },
      "availability_status": "IN_STOCK",
      "ratings": {
        "average": 4.5,
        "count": 1234
      },
      "images": [
        {
          "base_url": "https://target.scene7.com/is/image/Target/..."
        }
      ],
      "bullet_description": [
        "Active Noise Cancellation",
        "Spatial Audio"
      ]
    }
  ]
}
```

## 🔗 Affiliate Link Integration

### Target Circle Benefits
Target's affiliate program offers:
- **Up to 8% commission** on purchases
- **Target Circle benefits** for customers
- **Free shipping** promotions
- **Exclusive deals** and early access

### Link Format
```
https://target.com/p/-/A-{tcin}?afid={affiliate_id}&ref=smartbudget
```

### Implementation
The system automatically:
1. Generates affiliate links with your ID
2. Tracks clicks for analytics
3. Calculates estimated commissions
4. Displays Target Circle benefits

## 📊 Testing Your Integration

### 1. Test API Connection
```bash
# Test API endpoint (replace with your key)
curl "https://api.target.com/partner_api/v3/products/search?key=YOUR_KEY&keyword=test&count=1"
```

### 2. Check Affiliate Links
Search for products in your app and verify:
- Target products appear in results
- Links include your affiliate ID
- Commission estimates are shown
- Click tracking works

### 3. Monitor Analytics
Use the Analytics dashboard to track:
- Target API response times
- Product availability accuracy
- Click-through rates
- Commission estimates vs actual

## 🎯 Optimization Tips

### 1. API Usage Best Practices
- **Rate Limiting**: Stay under 1000 requests/hour
- **Caching**: Cache popular searches for 15-30 minutes
- **Error Handling**: Fallback to mock data if API fails
- **Monitoring**: Track API response times and errors

### 2. Product Selection
Focus on Target's strong categories:
- **Home & Decor**: Higher commission rates
- **Electronics**: Popular search terms
- **Fashion**: Seasonal trends
- **Baby & Kids**: High conversion rates

### 3. User Experience
- Show Target Circle benefits prominently
- Highlight free shipping thresholds
- Display exclusive Target deals
- Show in-store pickup options

## 🔧 Advanced Features

### 1. Store Locator Integration
```typescript
// Add store location data
const storeResponse = await fetch(
  `https://api.target.com/partner_api/v3/stores/search?key=${apiKey}&zip=${zipCode}`
);
```

### 2. Inventory Checking
```typescript
// Check real-time inventory
const inventoryResponse = await fetch(
  `https://api.target.com/partner_api/v3/products/${tcin}/inventory?key=${apiKey}&store_id=${storeId}`
);
```

### 3. Price History Tracking
Store historical prices to show:
- Price trends over time
- Best time to buy alerts
- Seasonal pricing patterns

## 🐛 Common Issues & Solutions

### 1. API Access Denied
**Problem**: 401 Unauthorized errors
**Solution**: 
- Verify API key is correct
- Check if key has expired
- Ensure proper headers are set

### 2. Rate Limiting
**Problem**: 429 Too Many Requests
**Solution**:
- Implement exponential backoff
- Cache frequent searches
- Distribute requests over time

### 3. Product Data Missing
**Problem**: Incomplete product information
**Solution**:
- Check for null/undefined fields
- Provide fallback values
- Use mock data as backup

### 4. Affiliate Links Not Working
**Problem**: Clicks not tracked or commission not attributed
**Solution**:
- Verify affiliate ID is correct
- Check link format matches Target's requirements
- Test with Target's link validator

## 📈 Performance Monitoring

### Key Metrics to Track
- **API Response Time**: Should be < 500ms
- **Success Rate**: Aim for > 99%
- **Product Availability Accuracy**: > 95%
- **Commission Attribution**: Track in Target dashboard

### Monitoring Setup
```typescript
// Add performance tracking
const startTime = Date.now();
const response = await fetch(targetApiUrl);
const responseTime = Date.now() - startTime;

// Log metrics
console.log('Target API Response Time:', responseTime + 'ms');
```

## 💰 Revenue Optimization

### Commission Rates by Category
- **Home Decor**: 8-10%
- **Electronics**: 4-6%
- **Fashion**: 6-8%
- **Baby Items**: 8-10%
- **Health & Beauty**: 6-8%

### Best Practices
1. **Focus on High-Value Items**: Better absolute commission
2. **Promote Seasonal Sales**: Higher conversion rates
3. **Use Target Circle Benefits**: Increase customer appeal
4. **Track Performance**: Optimize based on data

## 🔐 Security & Compliance

### API Key Security
- Store keys in environment variables only
- Never commit keys to version control
- Rotate keys regularly
- Monitor for unauthorized usage

### Data Privacy
- Don't store unnecessary customer data
- Comply with Target's data usage policies
- Implement proper data retention policies

## 📞 Support & Resources

### Target Partner Support
- **Email**: partners@target.com
- **Phone**: 1-800-TARGET (business hours)
- **Documentation**: https://partners.target.com/docs

### Developer Resources
- **API Documentation**: Available in partner portal
- **SDKs**: Node.js and Python libraries available
- **Testing Environment**: Sandbox API for development

---

## 🚀 Ready to Go Live?

Once you have:
✅ Target Partners API access approved
✅ API key configured in your app
✅ Affiliate program approved
✅ Testing completed successfully

You're ready to start earning commissions from Target sales! The integration will automatically handle product searches, affiliate link generation, and commission tracking.

**Expected Timeline**: 2-4 weeks for approval + 1 day for integration = Ready to earn! 🎯
