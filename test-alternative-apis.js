// Alternative Amazon API test - trying different endpoints
// Run with: node test-alternative-apis.js

const RAPIDAPI_KEY = '71d83a20fcmsh0fb4ca13ec109d6p1cf2f1jsn2cdfd6d14e69';

async function testAlternativeAPIs() {
  console.log('🔍 Testing alternative Amazon APIs on RapidAPI...\n');

  // List of alternative Amazon API endpoints to try
  const apis = [
    {
      name: 'Amazon Product Search API',
      host: 'amazon-product-search.p.rapidapi.com',
      endpoint: 'https://amazon-product-search.p.rapidapi.com/search',
      method: 'GET',
      params: '?query=laptop&country=US'
    },
    {
      name: 'Amazon Data Scraper',
      host: 'amazon-data-scraper.p.rapidapi.com',
      endpoint: 'https://amazon-data-scraper.p.rapidapi.com/search',
      method: 'POST',
      body: { query: 'laptop', country: 'US' }
    },
    {
      name: 'Real-time Amazon Data',
      host: 'real-time-amazon-data.p.rapidapi.com',
      endpoint: 'https://real-time-amazon-data.p.rapidapi.com/search',
      method: 'GET',
      params: '?query=laptop&country=US'
    },
    {
      name: 'Amazon API v2',
      host: 'amazon-api-v2.p.rapidapi.com',
      endpoint: 'https://amazon-api-v2.p.rapidapi.com/products',
      method: 'GET',
      params: '?query=laptop'
    },
    {
      name: 'Amazon Price Tracker',
      host: 'amazon-price-tracker.p.rapidapi.com',
      endpoint: 'https://amazon-price-tracker.p.rapidapi.com/search',
      method: 'GET',
      params: '?query=laptop'
    }
  ];

  for (const api of apis) {
    console.log(`\nTesting: ${api.name}`);
    console.log(`Host: ${api.host}`);
    
    try {
      const url = api.method === 'GET' ? `${api.endpoint}${api.params || ''}` : api.endpoint;
      const options = {
        method: api.method,
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': api.host
        }
      };

      if (api.method === 'POST' && api.body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(api.body);
      }

      const response = await fetch(url, options);
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        console.log('✅ This API is available!');
        const data = await response.text();
        console.log('Sample response:', data.substring(0, 200) + '...');
      } else if (response.status === 403) {
        console.log('❌ Not subscribed to this API');
      } else if (response.status === 404) {
        console.log('⚠️ API endpoint not found');
      } else if (response.status === 429) {
        console.log('⚠️ Rate limited (API exists but too many requests)');
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
    
    console.log('-'.repeat(40));
  }

  console.log('\n📋 Summary:');
  console.log('To use Amazon product APIs on RapidAPI:');
  console.log('1. Visit https://rapidapi.com/');
  console.log('2. Search for "Amazon" APIs');
  console.log('3. Subscribe to a free tier of an Amazon product API');
  console.log('4. Use your existing API key: 71d83a...14e69');
}

// Run the test
testAlternativeAPIs().catch(console.error);
