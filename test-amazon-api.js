// Test script for Amazon Product API with RapidAPI
// Run with: node test-amazon-api.js

const RAPIDAPI_KEY = '71d83a20fcmsh0fb4ca13ec109d6p1cf2f1jsn2cdfd6d14e69';

async function testAmazonProductAPI() {
  console.log('🔍 Testing Amazon Product API with RapidAPI...\n');

  // Test 1: Fetch product by ASIN
  console.log('Test 1: Fetching product by ASIN (B08N5WRWNW - popular item)');
  try {
    const response = await fetch('https://amazon-products1.p.rapidapi.com/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com'
      },
      body: JSON.stringify({
        asin: 'B08N5WRWNW',
        country: 'US'
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Product data received:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Search for products
  console.log('Test 2: Searching for "laptop" products');
  try {
    const response = await fetch('https://amazon-products1.p.rapidapi.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com'
      },
      body: JSON.stringify({
        query: 'laptop',
        country: 'US',
        page: 1,
        limit: 5
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Search results:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Check API quota/status
  console.log('Test 3: Checking API status');
  try {
    const response = await fetch('https://amazon-products1.p.rapidapi.com/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'amazon-products1.p.rapidapi.com'
      },
      body: JSON.stringify({
        asin: 'INVALID_ASIN',
        country: 'US'
      })
    });

    console.log(`API Response Headers:`);
    console.log(`X-RateLimit-Requests-Limit: ${response.headers.get('X-RateLimit-Requests-Limit')}`);
    console.log(`X-RateLimit-Requests-Remaining: ${response.headers.get('X-RateLimit-Requests-Remaining')}`);
    console.log(`X-RateLimit-Requests-Reset: ${response.headers.get('X-RateLimit-Requests-Reset')}`);
    
  } catch (error) {
    console.error('❌ Status check error:', error.message);
  }
}

// Run the test
testAmazonProductAPI().catch(console.error);
