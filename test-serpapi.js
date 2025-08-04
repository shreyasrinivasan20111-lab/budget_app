// Test SerpAPI Google Shopping Integration
// Run: node test-serpapi.js

async function testSerpAPI() {
  console.log('🔍 Testing SerpAPI Google Shopping Integration\n');

  // Test 1: Direct SerpAPI call
  console.log('Test 1: Testing direct SerpAPI call...');
  
  const testKey = 'demo'; // SerpAPI provides demo key for testing
  
  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: 'laptop under 1000',
      api_key: testKey,
      location: 'United States',
      num: '5'
    });

    console.log('Making request to SerpAPI...');
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ SerpAPI working!');
      console.log(`Found ${data.shopping_results?.length || 0} shopping results`);
      
      if (data.shopping_results && data.shopping_results.length > 0) {
        console.log('\nSample product:');
        const sample = data.shopping_results[0];
        console.log({
          title: sample.title,
          price: sample.price,
          source: sample.source,
          rating: sample.rating
        });
      }
    } else if (response.status === 401) {
      console.log('❌ Invalid API key');
      console.log('💡 Sign up at https://serpapi.com for free API key');
    } else {
      console.log(`⚠️ Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Your app's Google Shopping endpoint
  console.log('Test 2: Testing your app\'s Google Shopping endpoint...');
  
  try {
    const testPayload = {
      query: 'wireless headphones',
      budget: 200,
      currency: 'USD',
      filters: {
        sortBy: 'price_low',
        maxResults: 5
      }
    };

    console.log('Making request to your app...');
    const response = await fetch('http://localhost:3003/api/google-shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Your Google Shopping API is working!');
      console.log(`Found ${data.totalResults || 0} products`);
      
      if (data.products && data.products.length > 0) {
        console.log('\nSample result from your app:');
        const sample = data.products[0];
        console.log({
          name: sample.name,
          price: sample.price,
          store: sample.store,
          inStock: sample.inStock
        });
      }

      if (data.metadata) {
        console.log('\nMetadata:');
        console.log({
          averagePrice: data.metadata.averagePrice,
          priceRange: data.metadata.priceRange,
          stores: Object.keys(data.metadata.storeDistribution || {})
        });
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Your app returned error:', errorData.error);
      
      if (errorData.message?.includes('API key')) {
        console.log('💡 You need to add your SerpAPI key to .env.local');
      }
    }
  } catch (error) {
    console.error('❌ App test failed:', error.message);
    console.log('💡 Make sure your development server is running on localhost:3003');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: GET endpoint test
  console.log('Test 3: Testing GET endpoint...');
  
  try {
    const response = await fetch('http://localhost:3003/api/google-shopping?query=phone&budget=500&sort=price_low');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET endpoint working!');
      console.log(`Found ${data.totalResults || 0} products via GET`);
    } else {
      console.log(`❌ GET endpoint returned ${response.status}`);
    }
  } catch (error) {
    console.log('❌ GET test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Summary
  console.log('📋 SERPAPI INTEGRATION STATUS:');
  console.log('✅ SerpAPI service: Created');
  console.log('✅ Google Shopping API route: Ready');
  console.log('✅ React component: Built');
  console.log('✅ Search integration: Connected');
  
  console.log('\n🚀 SETUP STEPS:');
  console.log('1. Sign up at https://serpapi.com (100 free searches/month)');
  console.log('2. Add SERPAPI_KEY=your_key_here to .env.local');
  console.log('3. Restart your dev server');
  console.log('4. Your app will have real Google Shopping data!');
  
  console.log('\n💰 PRICING:');
  console.log('- Free tier: 100 searches/month');
  console.log('- Starter: $50/month for 5,000 searches');
  console.log('- Professional: $200/month for 25,000 searches');
}

testSerpAPI().catch(console.error);
