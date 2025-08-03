# Affiliate Link Integration Guide

Your SmartBudget AI app now has a complete affiliate link system! Here's everything you need to know to start earning commissions.

## 🎯 What's Included

✅ **Affiliate Link Generation** - Automatic affiliate links for 7+ major stores
✅ **Click Tracking** - Real-time analytics on affiliate link performance  
✅ **Commission Estimation** - See potential earnings from each product
✅ **Analytics Dashboard** - Track clicks, earnings, and performance by store
✅ **FTC Compliance** - Required affiliate disclosures included

## 🏪 Supported Stores & Commission Rates

| Store | Commission Rate | Sign Up Link |
|-------|----------------|--------------|
| Amazon | ~4% | https://affiliate-program.amazon.com/ |
| eBay | ~3% | https://partnernetwork.ebay.com/ |
| Walmart | ~4% | https://affiliates.walmart.com/ |
| Target | ~8% | https://corporate.target.com/partnerships |
| Best Buy | ~4% | https://affiliate.bestbuy.com/ |
| Wayfair | ~10% | https://www.wayfair.com/v/account/affiliate_program |
| AliExpress | ~8.5% | https://portals.aliexpress.com/ |

## 🚀 Setup Instructions

### Step 1: Apply to Affiliate Programs

1. **Amazon Associates** (Most Important)
   - Go to https://affiliate-program.amazon.com/
   - Sign up with your website URL (you'll need your deployed site)
   - Wait for approval (usually 1-3 days)
   - Get your affiliate tag (format: `yourname-20`)

2. **eBay Partner Network**
   - Visit https://partnernetwork.ebay.com/
   - Apply with your website
   - Get your Partner ID

3. **Other Programs**
   - Apply to each store's affiliate program
   - Most require an active website with content

### Step 2: Add Your Affiliate IDs

1. Copy `.env.example` to `.env.local`
2. Replace the placeholder values:

```bash
# Your actual affiliate IDs
AMAZON_AFFILIATE_ID=yourname-20
EBAY_PARTNER_ID=your-ebay-partner-id
WALMART_AFFILIATE_ID=your-walmart-id
TARGET_AFFILIATE_ID=your-target-id
BESTBUY_AFFILIATE_ID=your-bestbuy-id
WAYFAIR_AFFILIATE_ID=your-wayfair-id
ALIEXPRESS_AFFILIATE_ID=your-ali-id
```

### Step 3: Test Your Setup

1. Start your dev server: `npm run dev`
2. Search for products
3. Click the "Analytics" button to see tracking
4. Test affiliate links (they should include your IDs)

## 💰 How It Works

### Automatic Affiliate Links
- Every product gets both a regular link and affiliate link
- Users click "View Deal" → opens affiliate link
- You earn commission when they purchase

### Real-Time Tracking
- Clicks are tracked in real-time
- Analytics show performance by store
- Estimated earnings calculated automatically

### Example Affiliate Link
```
Regular: https://amazon.com/dp/B08N5WRWNW
Affiliate: https://amazon.com/dp/B08N5WRWNW?tag=yourname-20&linkCode=as2
```

## 📊 Analytics Features

Your analytics dashboard shows:
- **Total Clicks** - How many affiliate links were clicked
- **Estimated Earnings** - Projected commission based on click rates
- **Store Performance** - Which stores perform best
- **Recent Activity** - Latest clicks and trends

## 🔧 Customization Options

### Adding New Stores
1. Add store config to `src/lib/affiliate-manager.ts`
2. Update search API to include the store
3. Apply to their affiliate program

### Custom Tracking
```typescript
// Track custom events
await affiliateManager.trackAffiliateClick(
  'Amazon',
  'product-123',
  'user-456',
  {
    category: 'electronics',
    price: 99.99,
    source: 'search'
  }
);
```

### Commission Rate Updates
Update rates in `affiliate-manager.ts` based on your actual program terms.

## 💡 Monetization Tips

### 1. Content Strategy
- Write helpful buying guides
- Compare products across stores
- Focus on high-commission categories

### 2. SEO Optimization
- Target long-tail keywords
- Create category-specific pages
- Add product reviews

### 3. User Experience
- Always disclose affiliate relationships
- Provide genuine value
- Don't overwhelm with affiliate links

### 4. Track Performance
- Monitor which stores convert best
- Test different product categories
- Optimize based on analytics

## 📋 Legal Requirements

### FTC Compliance
- Affiliate disclosures are automatically included
- Update disclosure text in `affiliate-manager.ts` if needed
- Be transparent about earning commissions

### Tax Considerations
- Track your affiliate earnings
- Report income on tax returns
- Keep records of payments

## 🚀 Advanced Features

### Database Integration
For production, consider storing analytics in a database:

```typescript
// Example: PostgreSQL integration
await db.affiliateClicks.insert({
  store,
  productId,
  userId,
  timestamp: new Date(),
  commission: estimatedCommission
});
```

### Third-Party Analytics
Integrate with services like:
- Google Analytics 4
- Mixpanel
- Segment

### A/B Testing
Test different:
- Button text ("View Deal" vs "Check Price")
- Button colors
- Placement of affiliate disclosures

## 🐛 Troubleshooting

### Links Not Working
1. Check your affiliate IDs in `.env.local`
2. Verify program approval status
3. Test with different browsers

### No Analytics Data
1. Check browser console for errors
2. Verify API endpoints are working
3. Clear localStorage and test again

### Commission Tracking
1. Most programs have 24-48 hour reporting delays
2. Check your affiliate dashboards regularly
3. Some purchases may not be attributed immediately

## 📈 Expected Earnings

### Realistic Expectations
- **New Site**: $10-100/month in first 6 months
- **Established**: $100-1000/month with good traffic
- **Optimized**: $1000+/month with SEO and content strategy

### Factors Affecting Earnings
- Traffic volume
- User intent (shopping vs browsing)
- Product categories
- Seasonal trends
- Conversion rates by store

## 🎯 Next Steps

1. **Deploy Your Site** - Get it live for affiliate applications
2. **Apply to Programs** - Start with Amazon, then others
3. **Create Content** - Add buying guides and product comparisons
4. **Monitor Analytics** - Track performance and optimize
5. **Scale Up** - Add more stores and features

## 🔗 Useful Resources

- [Amazon Associates Help](https://affiliate-program.amazon.com/help)
- [FTC Affiliate Disclosure Guidelines](https://www.ftc.gov/tips-advice/business-center/guidance/ftcs-endorsement-guides-what-people-are-asking)
- [Affiliate Marketing Best Practices](https://blog.affiliatemanager.com/)

---

**Ready to start earning?** Deploy your app, apply to affiliate programs, and watch your commissions grow! 🚀
