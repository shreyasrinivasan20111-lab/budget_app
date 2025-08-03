import { NextRequest, NextResponse } from 'next/server';
import { apiIntegrator } from '@/lib/api-integrator';
import { affiliateManager } from '@/lib/affiliate-manager';
import { realAPIService } from '@/lib/real-api-service';
import { rapidAPIService } from '@/lib/rapidapi-service';

interface SearchRequest {
  budget: number;
  currency: string;
  items: string[];
  location?: string;
  qualityPreference?: 'best_quality' | 'best_price' | 'both';
}

interface Product {
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
  estimatedCommission?: number;
}

interface SearchResult {
  item: string;
  products: Product[];
}

// Enhanced function that combines real API calls with mock data
async function searchProducts(item: string, budget: number, currency: string, location?: string, qualityPreference?: string): Promise<Product[]> {
  console.log(`searchProducts called for: ${item}, budget: ${budget}, currency: ${currency}, location: ${location}, quality: ${qualityPreference}`);
  
  // Try to get real API results first
  try {
    // Try RapidAPI first (easiest to get started and most reliable)
    if (process.env.RAPIDAPI_KEY) {
      console.log('Trying RapidAPI for real products...');
      const rapidResults = await rapidAPIService.searchProducts(item, 12);
      if (rapidResults.length > 0) {
        console.log(`Found ${rapidResults.length} real API results from RapidAPI for ${item}`);
        return rapidResults;
      }
    }

    // Fallback to other real API services
    if (process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY) {
      console.log('Trying Amazon PA-API for real products...');
      const paApiResults = await realAPIService.searchAmazonPAAPI(item);
      if (paApiResults.length > 0) {
        console.log(`Found ${paApiResults.length} real API results from PA-API for ${item}`);
        return paApiResults;
      }
    }

    // Try SerpAPI for Google Shopping results
    if (process.env.SERPAPI_KEY) {
      console.log('Trying SerpAPI for Google Shopping results...');
      const serpResults = await realAPIService.searchGoogleShopping(item);
      if (serpResults.length > 0) {
        console.log(`Found ${serpResults.length} real API results from SerpAPI for ${item}`);
        return serpResults;
      }
    }

    // Fallback to legacy API integrator
    const realResults = await apiIntegrator.searchAll(item, budget, currency);
    if (realResults.length > 0) {
      console.log(`Found ${realResults.length} real API results for ${item}`);
      return realResults;
    }
  } catch (error) {
    console.error('Real API search failed, falling back to mock data:', error);
  }

  console.log(`Generating mock data for: ${item}`);

  // Get location-specific stores
  const stores = getLocationSpecificStores(location);
  const products: Product[] = [];
  
  // Track used brands to avoid duplicates
  const usedBrands = new Set<string>();
  
  // Mock product generation with enhanced variety and affiliate links - ensure multiple options per store
  for (let i = 0; i < Math.min(30, stores.length * 5); i++) {
    try {
      const store = stores[i % stores.length];
      
      // Generate 4-6 product variants per store for more options
      const variantsPerStore = Math.floor(Math.random() * 3) + 4; // 4-6 variants
      
      for (let variant = 0; variant < variantsPerStore; variant++) {
        // Get brand-specific pricing tiers and filter out used brands
        const availableBrands = getLocationSpecificBrands(item, location);
        const unusedBrands = availableBrands.filter(brand => !usedBrands.has(brand));
        
        // If all brands are used, reset and allow reuse
        if (unusedBrands.length === 0) {
          usedBrands.clear();
          unusedBrands.push(...availableBrands);
        }

        let selectedBrand = unusedBrands[Math.floor(Math.random() * unusedBrands.length)];
        
        // Identify store-exclusive brands
        const amazonBrands = unusedBrands.filter(brand => 
          brand.includes('Amazon') || brand === 'Amazon Basics'
        );
        // Target brands removed
        
        // Prefer Amazon brands when on Amazon store
        if (store === 'Amazon' && amazonBrands.length > 0 && Math.random() < 0.7) {
          // 70% chance to use Amazon brand when on Amazon store
          selectedBrand = amazonBrands[Math.floor(Math.random() * amazonBrands.length)];
        }
        
        // Additional check: If an Amazon brand was randomly selected, keep it for Amazon store  
        if ((selectedBrand.includes('Amazon') || selectedBrand === 'Amazon Basics') && store !== 'Amazon') {
          // Skip this brand for non-Amazon stores, pick a generic one instead
          const genericBrands = unusedBrands.filter(brand => 
            !brand.includes('Amazon')
          );
          if (genericBrands.length > 0) {
            selectedBrand = genericBrands[Math.floor(Math.random() * genericBrands.length)];
          }
        }
        
        usedBrands.add(selectedBrand);
        
        // Price products based on brand quality/tier and quality preference with realistic pricing
        let basePrice;
        let rating;
        
        // Get realistic price range based on item category and brand
        const priceRange = getRealisticPriceRange(item);
        
        if (qualityPreference === 'best_quality') {
          // Prioritize premium brands with higher ratings
          if (isPremiumBrand(selectedBrand)) {
            basePrice = Math.random() * (priceRange.premium.max - priceRange.premium.min) + priceRange.premium.min;
            rating = Math.random() * 1 + 4.0; // 4.0-5.0 rating
          } else if (isMidTierBrand(selectedBrand)) {
            basePrice = Math.random() * (priceRange.midTier.max - priceRange.midTier.min) + priceRange.midTier.min;
            rating = Math.random() * 1.5 + 3.5; // 3.5-5.0 rating
          } else {
            basePrice = Math.random() * (priceRange.budget.max - priceRange.budget.min) + priceRange.budget.min;
            rating = Math.random() * 1 + 3.0; // 3.0-4.0 rating
          }
        } else if (qualityPreference === 'best_price') {
          // Prioritize ultra-cheap options with heavily discounted pricing
          if (isPremiumBrand(selectedBrand)) {
            basePrice = Math.random() * (priceRange.budget.max * 0.3 - priceRange.budget.min * 0.2) + priceRange.budget.min * 0.2;
            rating = Math.random() * 1.5 + 3.5; // 3.5-5.0 rating
          } else if (isMidTierBrand(selectedBrand)) {
            basePrice = Math.random() * (priceRange.budget.max * 0.4 - priceRange.budget.min * 0.3) + priceRange.budget.min * 0.3;
            rating = Math.random() * 1.5 + 3.0; // 3.0-4.5 rating
          } else {
            basePrice = Math.random() * (priceRange.budget.max * 0.5 - priceRange.budget.min * 0.2) + priceRange.budget.min * 0.2;
            rating = Math.random() * 1.5 + 2.5; // 2.5-4.0 rating
          }
        } else {
          // 'both' or default: Balance quality and price (realistic market pricing)
          if (isPremiumBrand(selectedBrand)) {
            basePrice = Math.random() * (priceRange.premium.max - priceRange.premium.min) + priceRange.premium.min;
            rating = Math.random() * 1.5 + 3.5; // 3.5-5.0 rating
          } else if (isMidTierBrand(selectedBrand)) {
            basePrice = Math.random() * (priceRange.midTier.max - priceRange.midTier.min) + priceRange.midTier.min;
            rating = Math.random() * 1.5 + 3.5; // 3.5-5.0 rating
          } else {
            basePrice = Math.random() * (priceRange.budget.max - priceRange.budget.min) + priceRange.budget.min;
            rating = Math.random() * 1.5 + 3.0; // 3.0-4.5 rating
          }
        }
        
        // Ensure we have price variety across variants with more options
        if (variant === 0) {
          // First variant: adjust based on preference
          if (qualityPreference === 'best_price') {
            basePrice = Math.random() * 1.5 + 0.25; // Always ultra-budget option $0.25-$1.75
          } else if (qualityPreference === 'best_quality') {
            basePrice = Math.random() * 20 + 15; // Premium option
            rating = Math.max(rating, 4.0); // Ensure high rating
          }
        } else if (variant === 1) {
          // Second variant: mid-range option or super cheap for price preference
          if (qualityPreference === 'best_price') {
            basePrice = Math.random() * 2 + 0.5; // $0.50-$2.50 range
          } else {
            basePrice = Math.random() * 10 + 3; // $3-$13 range
          }
        } else if (variant === 2) {
          // Third variant: budget alternative
          if (qualityPreference === 'best_price') {
            basePrice = Math.random() * 3 + 0.75; // $0.75-$3.75 range
          } else {
            basePrice = Math.random() * 5 + 1; // $1-$6 range
          }
        } else if (variant === 3) {
          // Fourth variant: premium alternative or still cheap for price preference
          if (qualityPreference === 'best_price') {
            basePrice = Math.random() * 4 + 1; // $1-$5 range
          } else {
            basePrice = Math.random() * 15 + 8; // $8-$23 range
            rating = Math.max(rating, 3.5); // Ensure decent rating
          }
        } else if (variant === 4) {
          // Fifth variant: value option
          if (qualityPreference === 'best_price') {
            basePrice = Math.random() * 5 + 1.5; // $1.50-$6.50 range
          } else {
            basePrice = Math.random() * 8 + 2; // $2-$10 range
          }
        } else if (variant === 5) {
          // Sixth variant: high-end option or max budget for price preference
          if (qualityPreference === 'best_price') {
            basePrice = Math.random() * 7 + 2; // $2-$9 range (still very cheap)
          } else {
            basePrice = Math.random() * 25 + 12; // $12-$37 range
            rating = Math.max(rating, 4.2); // Ensure high rating
          }
        }
        
        const currencyMultiplier = getCurrencyMultiplier(currency);
        const locationPriceMultiplier = getLocationPriceMultiplier(location);
        const finalPrice = Math.round((basePrice * currencyMultiplier * locationPriceMultiplier) * 100) / 100;
        
        // Add some variation to product names based on store
        
        // Add product model/version variations for more diversity
        const modelVariations = ['Standard', 'Pro', 'Plus', 'Deluxe', 'Essential', 'Premium', 'Classic', 'Modern', 'Elite', 'Basic', 'Advanced', 'Ultimate'];
        const randomModel = modelVariations[Math.floor(Math.random() * modelVariations.length)];

        // Generate product with real brands and realistic names - add more variety
        const productTypes = ['', 'Pro', 'Max', 'Mini', 'XL', 'Compact'];
        const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
        const productName = `${selectedBrand} ${item.charAt(0).toUpperCase() + item.slice(1)} ${productType} ${randomModel}`.trim();
        const brandForDescription = selectedBrand;

        const originalLink = getStoreLink(store, item, location, selectedBrand);
        const productId = `${store.toLowerCase()}-${item}-${Date.now()}-${i}-${variant}`;
        
        console.log(`Creating product for ${store}: ${productId}`);
        
        const finalRating = Math.round(rating * 10) / 10; // Round to 1 decimal place
        
        // Generate realistic stock status based on item category, brand, and store
        const stockInfo = getRealisticStockStatus(item, selectedBrand, store, finalPrice);
        
        const product: Product = {
          id: productId,
          name: productName,
          price: finalPrice,
          store,
          link: originalLink,
          affiliateLink: affiliateManager.generateAffiliateLink(store, originalLink, productId),
          inStock: stockInfo.inStock,
          stockLevel: stockInfo.stockLevel,
          rating: finalRating,
          image: getStoreImage(store),
          description: `${brandForDescription} ${item} available at ${store} - ${getStoreDescription(store)} - ${stockInfo.statusMessage} - Ships to ${location || 'your region'}`,
          estimatedCommission: affiliateManager.calculateCommission(store, finalPrice)
        };
        
        products.push(product);
        console.log(`Successfully created product: ${product.name} - $${product.price} - ${product.rating}★`);
      }
      
    } catch (productError) {
      console.error(`Error creating product for store ${stores[i]}:`, productError);
      // Continue with next store
    }
  }

  console.log(`Generated ${products.length} mock products for ${item}`);
  
  // Create special products: Cheapest Choice and Amazon's Choice
  const specialProducts: Product[] = [];
  
  // 1. Create "Cheapest Choice" product - always the lowest price
  const cheapestBrands = ['Amazon Basics', 'Generic Brand', 'Store Brand'];
  // Select cheapest brand that hasn't been used
  const unusedCheapestBrands = cheapestBrands.filter(brand => !usedBrands.has(brand));
  const cheapestBrand = unusedCheapestBrands.length > 0 ? 
    unusedCheapestBrands[Math.floor(Math.random() * unusedCheapestBrands.length)] :
    cheapestBrands[Math.floor(Math.random() * cheapestBrands.length)];
  usedBrands.add(cheapestBrand);
  
  // Get realistic price range and use the lowest budget option
  const cheapestPriceRange = getRealisticPriceRange(item);
  const cheapestPrice = Math.random() * (cheapestPriceRange.budget.max * 0.3 - cheapestPriceRange.budget.min * 0.2) + cheapestPriceRange.budget.min * 0.2;
  const currencyMultiplier = getCurrencyMultiplier(currency);
  const locationPriceMultiplier = getLocationPriceMultiplier(location);
  const finalCheapestPrice = Math.round((cheapestPrice * currencyMultiplier * locationPriceMultiplier) * 100) / 100;
  
  // Use Amazon store for cheapest product
  const cheapestStore = 'Amazon';
  
  // Get realistic stock status for cheapest product
  const cheapestStockInfo = getRealisticStockStatus(item, cheapestBrand, cheapestStore, finalCheapestPrice);
  
  const cheapestProduct: Product = {
    id: `cheapest-${item}-${Date.now()}`,
    name: `${cheapestBrand} ${item.charAt(0).toUpperCase() + item.slice(1)}`,
    price: finalCheapestPrice,
    store: cheapestStore,
    link: getStoreLink(cheapestStore, item, location, cheapestBrand),
    affiliateLink: affiliateManager.generateAffiliateLink(cheapestStore, getStoreLink(cheapestStore, item, location, cheapestBrand), `cheapest-${item}`),
    inStock: cheapestStockInfo.inStock,
    stockLevel: cheapestStockInfo.stockLevel,
    rating: Math.random() * 1.5 + 2.5, // 2.5-4.0 rating for budget option
    image: getStoreImage(cheapestStore),
    description: `${cheapestBrand} ${item} - Cheapest Choice available at ${cheapestStore} - Basic quality, great value - ${cheapestStockInfo.statusMessage} - Ships to ${location || 'your region'}`,
    estimatedCommission: affiliateManager.calculateCommission(cheapestStore, finalCheapestPrice)
  };
  specialProducts.push(cheapestProduct);
  
  // 2. Create "Amazon's Choice" product
  const storeChoiceStore = 'Amazon'; // Use Amazon for choice product
  const choiceProductName = "Amazon's Choice";
  
  const storeChoiceBrands = getBrandsForItem(item).filter(brand => 
    !brand.includes(`${storeChoiceStore} Basics`) && !usedBrands.has(brand)
  );
  const storeChoiceBrand = storeChoiceBrands.length > 0 ? 
    storeChoiceBrands[Math.floor(Math.random() * storeChoiceBrands.length)] : 
    `${storeChoiceStore} Basics`;
  usedBrands.add(storeChoiceBrand);
  
  // Get realistic price range for Store's Choice (typically mid-tier pricing)
  const storeChoicePriceRange = getRealisticPriceRange(item);
  const storeChoicePrice = Math.random() * (storeChoicePriceRange.midTier.max - storeChoicePriceRange.midTier.min) + storeChoicePriceRange.midTier.min;
  const finalStoreChoicePrice = Math.round((storeChoicePrice * currencyMultiplier * locationPriceMultiplier) * 100) / 100;
  
  // Get realistic stock status for Store's Choice product
  const storeChoiceStockInfo = getRealisticStockStatus(item, storeChoiceBrand, storeChoiceStore, finalStoreChoicePrice);
  
  const storeChoiceProduct: Product = {
    id: `${storeChoiceStore.toLowerCase()}s-choice-${item}-${Date.now()}`,
    name: `${storeChoiceBrand} ${item.charAt(0).toUpperCase() + item.slice(1)}`,
    price: finalStoreChoicePrice,
    store: storeChoiceStore,
    link: getStoreLink(storeChoiceStore, item, location, storeChoiceBrand),
    affiliateLink: affiliateManager.generateAffiliateLink(storeChoiceStore, getStoreLink(storeChoiceStore, item, location, storeChoiceBrand), `${storeChoiceStore.toLowerCase()}s-choice-${item}`),
    inStock: storeChoiceStockInfo.inStock,
    stockLevel: storeChoiceStockInfo.stockLevel,
    rating: Math.random() * 1 + 4.0, // 4.0-5.0 rating for Store's Choice
    image: getStoreImage(storeChoiceStore),
    description: `${storeChoiceBrand} ${item} - ${choiceProductName} for "${item}" - Highly rated, well-priced products available to ship immediately - ${storeChoiceStockInfo.statusMessage} - Ships to ${location || 'your region'}`,
    estimatedCommission: affiliateManager.calculateCommission(storeChoiceStore, finalStoreChoicePrice)
  };
  specialProducts.push(storeChoiceProduct);
  
  // Combine special products with regular products and remove brand duplicates
  const allProducts = [...specialProducts, ...products];
  
  // Filter out duplicate brands, keeping the best product per brand
  const uniqueBrandProducts: Product[] = [];
  const seenBrands = new Set<string>();
  
  for (const product of allProducts) {
    const brandName = product.name.split(' ')[0]; // Extract brand name (first word)
    if (!seenBrands.has(brandName)) {
      seenBrands.add(brandName);
      uniqueBrandProducts.push(product);
    }
  }
  
  // Sort products based on quality preference
  let sortedProducts = [...uniqueBrandProducts];
  
  if (qualityPreference === 'best_quality') {
    // Sort by rating first, then by price (higher rating = better, lower price = better for same rating)
    sortedProducts = uniqueBrandProducts.sort((a, b) => {
      if (Math.abs(a.rating - b.rating) > 0.1) {
        return b.rating - a.rating; // Higher rating first
      }
      return a.price - b.price; // Lower price for same rating
    });
  } else if (qualityPreference === 'best_price') {
    // Sort by price first, then by rating (lower price = better, higher rating = better for same price)
    sortedProducts = uniqueBrandProducts.sort((a, b) => {
      if (Math.abs(a.price - b.price) > 1) {
        return a.price - b.price; // Lower price first
      }
      return b.rating - a.rating; // Higher rating for same price
    });
  } else {
    // 'both' or default: Sort by value score (rating/price ratio, but weighted)
    sortedProducts = uniqueBrandProducts.sort((a, b) => {
      const valueScoreA = (a.rating * a.rating) / Math.max(a.price, 1); // Square rating to emphasize quality
      const valueScoreB = (b.rating * b.rating) / Math.max(b.price, 1);
      return valueScoreB - valueScoreA; // Higher value score first
    });
  }
  
  // Ensure we always include cheapest choice and Amazon's choice in final results
  const finalProducts = [];
  
  // Find cheapest and Amazon's choice products in sorted list
  const cheapestInResults = sortedProducts.find(p => p.id.includes('cheapest'));
  const amazonsChoiceInResults = sortedProducts.find(p => p.id.includes('amazons-choice'));
  
  // Always include cheapest choice first if user prefers best price
  if (qualityPreference === 'best_price') {
    if (cheapestInResults) finalProducts.push(cheapestInResults);
    if (amazonsChoiceInResults) finalProducts.push(amazonsChoiceInResults);
    // Add remaining products up to 12 total
    const remaining = sortedProducts.filter(p => 
      !p.id.includes('cheapest') && !p.id.includes('amazons-choice')
    ).slice(0, 12 - finalProducts.length);
    finalProducts.push(...remaining);
  } else if (qualityPreference === 'best_quality') {
    // For quality preference, put Amazon's choice first, then others, cheapest last
    if (amazonsChoiceInResults) finalProducts.push(amazonsChoiceInResults);
    const remaining = sortedProducts.filter(p => 
      !p.id.includes('cheapest') && !p.id.includes('amazons-choice')
    ).slice(0, 10);
    finalProducts.push(...remaining);
    if (cheapestInResults) finalProducts.push(cheapestInResults);
  } else {
    // For 'both' preference, mix them naturally based on value score but ensure they're included
    const otherProducts = sortedProducts.filter(p => 
      !p.id.includes('cheapest') && !p.id.includes('amazons-choice')
    );
    if (amazonsChoiceInResults) finalProducts.push(amazonsChoiceInResults);
    finalProducts.push(...otherProducts.slice(0, 5));
    if (cheapestInResults) finalProducts.push(cheapestInResults);
    finalProducts.push(...otherProducts.slice(5, 12 - finalProducts.length));
  }
  
  // Return more products to show variety from each store - increase from 5 to 12
  return finalProducts.slice(0, 12);
}

function getStoreLink(store: string, item: string, location?: string, brand?: string): string {
  const locationLower = location?.toLowerCase() || '';
  
  // Create specific search terms that include brand and item, optimized for cheapest results
  const searchTerms = [];
  if (brand) searchTerms.push(brand);
  searchTerms.push(item);
  
  const searchQuery = searchTerms.join(' ');
  
  // Amazon store links with reliable search URLs optimized for price
  if (store === 'Amazon') {
    let amazonDomain = 'amazon.com';
    
    if (locationLower.includes('uk') || locationLower.includes('united kingdom')) {
      amazonDomain = 'amazon.co.uk';
    } else if (locationLower.includes('canada')) {
      amazonDomain = 'amazon.ca';
    } else if (locationLower.includes('germany')) {
      amazonDomain = 'amazon.de';
    } else if (locationLower.includes('france')) {
      amazonDomain = 'amazon.fr';
    } else if (locationLower.includes('italy')) {
      amazonDomain = 'amazon.it';
    } else if (locationLower.includes('spain')) {
      amazonDomain = 'amazon.es';
    } else if (locationLower.includes('japan')) {
      amazonDomain = 'amazon.co.jp';
    } else if (locationLower.includes('australia')) {
      amazonDomain = 'amazon.com.au';
    } else if (locationLower.includes('india')) {
      amazonDomain = 'amazon.in';
    }
    
    // Use Amazon search with price sorting (low to high)
    return `https://${amazonDomain}/s?k=${encodeURIComponent(searchQuery)}&s=price-asc-rank`;
  }
  
  // Target store links (removed)
  // if (store === 'Target') {
  //   return `https://target.com/s?searchTerm=${encodeURIComponent(searchQuery)}&sortBy=price_low_to_high`;
  // }
  
  // Fallback for any other stores (though currently only Amazon is supported)
  return `https://${store.toLowerCase().replace(/\s+/g, '')}.com/search?q=${encodeURIComponent(searchQuery)}&sort=price_asc`;
}

function getStoreImage(store: string): string {
  // Use a simple data URI or reliable CDN instead of via.placeholder.com
  const colors: Record<string, string> = {
    'Amazon': 'FF9900'
    // 'Target': 'CC0000' - removed
  };
  
  const color = colors[store] || '64B5CD';
  // Create a simple SVG data URI instead of external placeholder
  return `data:image/svg+xml,${encodeURIComponent(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#${color}"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="24" font-weight="bold">${store}</text></svg>`)}`;
}

function getStoreDescription(store: string): string {
  const descriptions: Record<string, string> = {
    'Amazon': 'Fast Prime shipping available'
    // 'Target': 'Same day pickup and delivery' - removed
  };
  
  return descriptions[store] || 'perfect for your needs';
}

function getLocationSpecificStores(location?: string): string[] {
  const locationLower = location?.toLowerCase() || '';
  
  // United States - Amazon available
  if (locationLower.includes('usa') || locationLower.includes('united states') || 
      locationLower.includes('america') || locationLower.includes('us') || locationLower === '' || !location) {
    return ['Amazon'];
  }
  
  // Canada - Amazon available
  if (locationLower.includes('canada') || locationLower.includes('canadian')) {
    return ['Amazon'];
  }
  
  // United Kingdom - Amazon available
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') || 
      locationLower.includes('britain') || locationLower.includes('england') ||
      locationLower.includes('scotland') || locationLower.includes('wales')) {
    return ['Amazon'];
  }
  
  // European Union countries - Amazon available
  if (locationLower.includes('germany') || locationLower.includes('france') || 
      locationLower.includes('italy') || locationLower.includes('spain') ||
      locationLower.includes('netherlands') || locationLower.includes('belgium') ||
      locationLower.includes('austria') || locationLower.includes('poland') ||
      locationLower.includes('europe')) {
    return ['Amazon'];
  }
  
  // Australia - Amazon available
  if (locationLower.includes('australia') || locationLower.includes('australian')) {
    return ['Amazon'];
  }
  
  // Japan - Amazon available
  if (locationLower.includes('japan') || locationLower.includes('japanese')) {
    return ['Amazon'];
  }
  
  // India - Amazon available
  if (locationLower.includes('india') || locationLower.includes('indian')) {
    return ['Amazon'];
  }
  
  // Other countries - only Amazon (global marketplace)
  return ['Amazon'];
}

function getLocationSpecificBrands(item: string, location?: string): string[] {
  const locationLower = location?.toLowerCase() || '';
  const baseBrands = getBrandsForItem(item);
  
  // Add location-specific brands
  if (locationLower.includes('japan') || locationLower.includes('japanese')) {
    // Add Japanese brands
    if (item.toLowerCase().includes('car') || item.toLowerCase().includes('auto')) {
      return [...baseBrands, 'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru'];
    }
    if (item.toLowerCase().includes('electronics') || item.toLowerCase().includes('tech')) {
      return [...baseBrands, 'Sony', 'Nintendo', 'Panasonic', 'Sharp', 'Toshiba'];
    }
  }
  
  if (locationLower.includes('germany') || locationLower.includes('german')) {
    // Add German brands
    if (item.toLowerCase().includes('car') || item.toLowerCase().includes('auto')) {
      return [...baseBrands, 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche'];
    }
    if (item.toLowerCase().includes('tool') || item.toLowerCase().includes('hardware')) {
      return [...baseBrands, 'Bosch', 'Festool', 'Knipex', 'Wera'];
    }
  }
  
  if (locationLower.includes('france') || locationLower.includes('french')) {
    // Add French brands
    if (item.toLowerCase().includes('beauty') || item.toLowerCase().includes('makeup')) {
      return [...baseBrands, 'L\'Oreal', 'Lancome', 'Chanel', 'Dior'];
    }
  }
  
  if (locationLower.includes('italy') || locationLower.includes('italian')) {
    // Add Italian brands
    if (item.toLowerCase().includes('fashion') || item.toLowerCase().includes('clothing')) {
      return [...baseBrands, 'Gucci', 'Prada', 'Versace', 'Armani'];
    }
  }
  
  return baseBrands;
}

function getRealisticStockStatus(item: string, brand: string, store: string, price: number): {
  inStock: boolean;
  stockLevel: string;
  statusMessage: string;
} {
  const itemLower = item.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  // Base stock probability - starts high for most items
  let lowStockProbability = 0.15; // 15% chance of low stock
  let outOfStockProbability = 0.05; // 5% chance of out of stock
  
  // High-demand categories more likely to have stock issues
  if (itemLower.includes('phone') || itemLower.includes('smartphone')) {
    if (brandLower.includes('apple') || brandLower.includes('samsung')) {
      lowStockProbability = 0.25;
      outOfStockProbability = 0.15;
    }
  }
  
  if (itemLower.includes('laptop') || itemLower.includes('notebook')) {
    if (brandLower.includes('apple') || brandLower.includes('dell')) {
      lowStockProbability = 0.20;
      outOfStockProbability = 0.10;
    }
  }
  
  // Gaming and tech accessories often have stock fluctuations
  if (itemLower.includes('headphones') || itemLower.includes('earbuds') || itemLower.includes('speaker')) {
    if (brandLower.includes('apple') || brandLower.includes('bose') || brandLower.includes('sony')) {
      lowStockProbability = 0.15;
      outOfStockProbability = 0.08;
    }
  }
  
  // Beauty products - popular items often sell out
  if (itemLower.includes('makeup') || itemLower.includes('lipstick') || itemLower.includes('foundation')) {
    if (brandLower.includes('nyx') || brandLower.includes('elf')) {
      lowStockProbability = 0.12;
      outOfStockProbability = 0.06;
    }
  }
  
  // Seasonal or trending items
  if (itemLower.includes('air fryer') || itemLower.includes('coffee maker') || itemLower.includes('blender')) {
    if (brandLower.includes('ninja') || brandLower.includes('keurig')) {
      lowStockProbability = 0.18;
      outOfStockProbability = 0.08;
    }
  }
  
  // Exercise equipment (high demand post-pandemic)
  if (itemLower.includes('yoga mat') || itemLower.includes('exercise') || itemLower.includes('fitness')) {
    lowStockProbability = 0.12;
    outOfStockProbability = 0.07;
  }
  
  // Budget vs Premium pricing affects stock
  const priceRange = getRealisticPriceRange(item);
  if (price <= priceRange.budget.max) {
    // Budget items usually well-stocked
    outOfStockProbability = Math.max(outOfStockProbability - 0.03, 0.02);
  } else if (price >= priceRange.premium.min) {
    // Premium items might have limited stock
    outOfStockProbability = Math.min(outOfStockProbability + 0.03, 0.12);
  }
  
  // Amazon usually has better stock levels
  if (store === 'Amazon') {
    outOfStockProbability = Math.max(outOfStockProbability - 0.02, 0.03);
  }
  
  // Target has good stock levels too
  if (store === 'Target') {
    outOfStockProbability = Math.max(outOfStockProbability - 0.01, 0.04);
  }
  
  // Generate random stock status based on calculated probabilities
  const random = Math.random();
  
  if (random < outOfStockProbability) {
    return {
      inStock: false,
      stockLevel: 'out-of-stock',
      statusMessage: 'Currently out of stock - Check back soon'
    };
  } else if (random < outOfStockProbability + lowStockProbability) {
    const remainingItems = Math.floor(Math.random() * 5) + 1; // 1-5 items left
    return {
      inStock: true,
      stockLevel: 'low-stock',
      statusMessage: `Only ${remainingItems} left in stock - Order soon`
    };
  } else {
    // Amazon gets faster shipping messages
    if (store === 'Amazon') {
      const amazonMessages = [
        'In stock - Prime eligible',
        'Ships same day with Prime',
        'Ready for Prime delivery',
        'In stock - Free Prime shipping'
      ];
      const message = amazonMessages[Math.floor(Math.random() * amazonMessages.length)];
      return {
        inStock: true,
        stockLevel: 'in-stock',
        statusMessage: message
      };
    }
    
    // Fallback messages for other stores
    const stockMessages = [
      'In stock',
      'Ready to ship',
      'Available now',
      'Ships within 1-2 business days',
      'Usually ships within 24 hours'
    ];
    const message = stockMessages[Math.floor(Math.random() * stockMessages.length)];
    return {
      inStock: true,
      stockLevel: 'in-stock',
      statusMessage: message
    };
  }
}

function getRealisticPriceRange(item: string): {
  budget: { min: number; max: number };
  midTier: { min: number; max: number };
  premium: { min: number; max: number };
} {
  const itemLower = item.toLowerCase();
  
  // Beauty and makeup pricing
  if (itemLower.includes('lipstick') || itemLower.includes('lip color')) {
    return {
      budget: { min: 3, max: 8 },      // Drugstore brands
      midTier: { min: 8, max: 18 },    // Mid-range brands
      premium: { min: 18, max: 45 }    // Luxury brands
    };
  }
  
  if (itemLower.includes('foundation') || itemLower.includes('concealer')) {
    return {
      budget: { min: 5, max: 12 },     // Drugstore
      midTier: { min: 12, max: 30 },   // Mid-range
      premium: { min: 30, max: 65 }    // High-end
    };
  }
  
  if (itemLower.includes('mascara') || itemLower.includes('eyeshadow')) {
    return {
      budget: { min: 4, max: 10 },
      midTier: { min: 10, max: 25 },
      premium: { min: 25, max: 50 }
    };
  }
  
  // Electronics pricing
  if (itemLower.includes('phone') || itemLower.includes('smartphone')) {
    return {
      budget: { min: 150, max: 300 },   // Budget phones
      midTier: { min: 300, max: 600 },  // Mid-range
      premium: { min: 600, max: 1200 }  // Flagship phones
    };
  }
  
  if (itemLower.includes('laptop') || itemLower.includes('notebook')) {
    return {
      budget: { min: 300, max: 600 },
      midTier: { min: 600, max: 1200 },
      premium: { min: 1200, max: 2500 }
    };
  }
  
  if (itemLower.includes('headphones') || itemLower.includes('earbuds')) {
    return {
      budget: { min: 15, max: 50 },
      midTier: { min: 50, max: 150 },
      premium: { min: 150, max: 400 }
    };
  }
  
  if (itemLower.includes('speaker')) {
    return {
      budget: { min: 20, max: 60 },
      midTier: { min: 60, max: 200 },
      premium: { min: 200, max: 500 }
    };
  }
  
  // Skincare pricing
  if (itemLower.includes('moisturizer') || itemLower.includes('face cream')) {
    return {
      budget: { min: 8, max: 20 },
      midTier: { min: 20, max: 45 },
      premium: { min: 45, max: 120 }
    };
  }
  
  if (itemLower.includes('cleanser') || itemLower.includes('serum')) {
    return {
      budget: { min: 6, max: 15 },
      midTier: { min: 15, max: 35 },
      premium: { min: 35, max: 80 }
    };
  }
  
  if (itemLower.includes('sunscreen')) {
    return {
      budget: { min: 8, max: 18 },
      midTier: { min: 18, max: 35 },
      premium: { min: 35, max: 60 }
    };
  }
  
  // Hair care pricing
  if (itemLower.includes('shampoo') || itemLower.includes('conditioner')) {
    return {
      budget: { min: 4, max: 12 },
      midTier: { min: 12, max: 28 },
      premium: { min: 28, max: 65 }
    };
  }
  
  // Home and kitchen appliances
  if (itemLower.includes('coffee maker')) {
    return {
      budget: { min: 25, max: 80 },
      midTier: { min: 80, max: 200 },
      premium: { min: 200, max: 500 }
    };
  }
  
  if (itemLower.includes('blender')) {
    return {
      budget: { min: 20, max: 60 },
      midTier: { min: 60, max: 150 },
      premium: { min: 150, max: 400 }
    };
  }
  
  if (itemLower.includes('air fryer')) {
    return {
      budget: { min: 40, max: 100 },
      midTier: { min: 100, max: 200 },
      premium: { min: 200, max: 350 }
    };
  }
  
  // Kitchen tools
  if (itemLower.includes('knife') || itemLower.includes('cutting board')) {
    return {
      budget: { min: 8, max: 25 },
      midTier: { min: 25, max: 60 },
      premium: { min: 60, max: 150 }
    };
  }
  
  // Storage and organization
  if (itemLower.includes('storage') || itemLower.includes('container')) {
    return {
      budget: { min: 5, max: 15 },
      midTier: { min: 15, max: 35 },
      premium: { min: 35, max: 80 }
    };
  }
  
  // Clothing pricing
  if (itemLower.includes('jeans')) {
    return {
      budget: { min: 20, max: 50 },
      midTier: { min: 50, max: 120 },
      premium: { min: 120, max: 300 }
    };
  }
  
  if (itemLower.includes('sneakers') || itemLower.includes('shoes')) {
    return {
      budget: { min: 30, max: 80 },
      midTier: { min: 80, max: 180 },
      premium: { min: 180, max: 400 }
    };
  }
  
  if (itemLower.includes('t-shirt') || itemLower.includes('shirt')) {
    return {
      budget: { min: 8, max: 20 },
      midTier: { min: 20, max: 45 },
      premium: { min: 45, max: 120 }
    };
  }
  
  // Fitness equipment
  if (itemLower.includes('yoga mat')) {
    return {
      budget: { min: 15, max: 35 },
      midTier: { min: 35, max: 75 },
      premium: { min: 75, max: 150 }
    };
  }
  
  if (itemLower.includes('protein powder')) {
    return {
      budget: { min: 15, max: 30 },
      midTier: { min: 30, max: 60 },
      premium: { min: 60, max: 120 }
    };
  }
  
  // Tools
  if (itemLower.includes('drill') || itemLower.includes('tool')) {
    return {
      budget: { min: 25, max: 60 },
      midTier: { min: 60, max: 150 },
      premium: { min: 150, max: 350 }
    };
  }
  
  // Pet supplies
  if (itemLower.includes('dog food') || itemLower.includes('cat food')) {
    return {
      budget: { min: 8, max: 20 },
      midTier: { min: 20, max: 45 },
      premium: { min: 45, max: 80 }
    };
  }
  
  // Office supplies
  if (itemLower.includes('pen') || itemLower.includes('notebook')) {
    return {
      budget: { min: 1, max: 4 },      // Ultra-cheap office supplies
      midTier: { min: 4, max: 8 },     // HP printer paper range $4-8
      premium: { min: 8, max: 20 }     // Premium office supplies
    };
  }
  
  // Paper products - specifically for printer paper
  if (itemLower.includes('paper') || itemLower.includes('printer paper')) {
    return {
      budget: { min: 2, max: 5 },      // Generic paper
      midTier: { min: 4, max: 7 },     // HP printer paper specific range $4-7
      premium: { min: 7, max: 15 }     // Premium paper brands
    };
  }
  
  // Batteries and accessories
  if (itemLower.includes('battery') || itemLower.includes('cable') || itemLower.includes('charger')) {
    return {
      budget: { min: 5, max: 15 },
      midTier: { min: 15, max: 35 },
      premium: { min: 35, max: 80 }
    };
  }
  
  // Default pricing for miscellaneous items
  return {
    budget: { min: 5, max: 20 },
    midTier: { min: 20, max: 50 },
    premium: { min: 50, max: 150 }
  };
}

function isPremiumBrand(brand: string): boolean {
  const premiumBrands = [
    'Charlotte Tilbury', 'Dior', 'YSL', 'NARS', 'Fenty Beauty', 'Too Faced', 'Urban Decay', 'Tarte',
    'MAC', 'Estée Lauder', 'Clinique', 'La Roche-Posay', 'Olaplex', 'Moroccanoil',
    'iPhone 15', 'MacBook Air M3', 'Sony WH-1000XM5', 'Bose QuietComfort', 'Vitamix 5200',
    'KitchenAid', 'Dyson', 'Apple AirPods Pro', 'Levi\'s 501 Original', 'Nike Air Max',
    'Adidas Ultraboost', 'Manduka PRO', 'DeWalt 20V MAX', 'BMW', 'Mercedes-Benz', 'Audi'
  ];
  
  return premiumBrands.some(premiumBrand => brand.includes(premiumBrand));
}

function isMidTierBrand(brand: string): boolean {
  const midTierBrands = [
    'Maybelline', 'L\'Oreal', 'Revlon', 'NYX Professional Makeup', 'Milani', 'CeraVe', 'Neutrogena',
    'TRESemmé', 'Pantene', 'Samsung Galaxy', 'Dell XPS', 'HP Spectre', 'HP', 'JBL', 'Ninja',
    'Cuisinart', 'Hamilton Beach', 'American Eagle', 'Gap', 'New Balance', 'ASICS',
    'Gaiam', 'Black+Decker', 'Craftsman', 'Hill\'s Science Diet', 'Blue Buffalo',
    // Real mid-tier brands
    'Americanflat', 'Kate and Laurel', 'OGX', 'Herbal Essences', 'Anker',
    'COSORI', 'Chefman', 'Mercer Culinary', 'OXO', 'Spigen', 'ESR',
    'Magic Bullet', 'Chicago Cutlery', 'WORKPRO', 'Govee', 'IRIS USA', 
    'Sterilite', 'NICETOWN', 'Deconovo', 'BalanceFrom', 'Cellucor', 
    'TheraBand', 'KONG', 'WeatherTech', 'Husky Liners', 'Motor Trend'
  ];
  
  return midTierBrands.some(midTierBrand => brand.includes(midTierBrand));
}

function getBrandsForItem(item: string): string[] {
  const itemLower = item.toLowerCase();
  
  // Beauty and makeup brands - popular trendy brands
  if (itemLower.includes('lipstick') || itemLower.includes('lip color') ||
      itemLower.includes('foundation') || itemLower.includes('concealer') ||
      itemLower.includes('mascara') || itemLower.includes('eyeshadow') ||
      itemLower.includes('blush') || itemLower.includes('bronzer') || 
      itemLower.includes('makeup')) {
    return ['Fenty Beauty', 'Rare Beauty', 'Charlotte Tilbury', 'Too Faced', 'Urban Decay', 'NARS', 'MAC', 'Maybelline'];
  }
  
  // Electronics - most popular brands
  if (itemLower.includes('phone') || itemLower.includes('smartphone')) {
    return ['iPhone', 'Samsung Galaxy', 'Google Pixel', 'OnePlus', 'Nothing Phone'];
  }
  
  if (itemLower.includes('laptop') || itemLower.includes('notebook')) {
    return ['MacBook', 'Dell XPS', 'HP Spectre', 'Lenovo ThinkPad', 'ASUS ZenBook', 'Surface Laptop'];
  }
  
  if (itemLower.includes('headphones') || itemLower.includes('earbuds') || itemLower.includes('airpods') || itemLower.includes('earphones')) {
    return ['AirPods', 'Sony WH-1000XM5', 'Bose QuietComfort', 'JBL', 'Beats', 'Sennheiser'];
  }
  
  if (itemLower.includes('speaker')) {
    return ['JBL Flip', 'Bose SoundLink', 'Sony SRS', 'Ultimate Ears', 'Anker Soundcore'];
  }
  
  // Cables and accessories
  if (itemLower.includes('cable') || itemLower.includes('charger') || itemLower.includes('adapter')) {
    return ['Anker', 'Belkin', 'UGREEN', 'Apple', 'Amazon Basics'];
  }
  
  // Skincare - trending brands
  if (itemLower.includes('moisturizer') || itemLower.includes('face cream')) {
    return ['CeraVe', 'The Ordinary', 'Neutrogena', 'Clinique', 'Olay', 'La Roche-Posay'];
  }
  
  if (itemLower.includes('cleanser') || itemLower.includes('face wash')) {
    return ['CeraVe', 'The Ordinary', 'Neutrogena', 'Cetaphil', 'La Roche-Posay'];
  }
  
  if (itemLower.includes('serum')) {
    return ['The Ordinary', 'Paula\'s Choice', 'Drunk Elephant', 'Neutrogena', 'No7'];
  }
  
  if (itemLower.includes('sunscreen')) {
    return ['EltaMD', 'La Roche-Posay', 'Neutrogena', 'CeraVe', 'Supergoop!'];
  }
  
  // Hair care - popular brands
  if (itemLower.includes('shampoo') || itemLower.includes('conditioner')) {
    return ['Olaplex', 'Moroccanoil', 'Pantene', 'TRESemmé', 'Head & Shoulders', 'OGX'];
  }
  
  // Home and kitchen - trending brands
  if (itemLower.includes('coffee maker')) {
    return ['Keurig', 'Nespresso', 'Breville', 'Cuisinart', 'Mr. Coffee'];
  }
  
  if (itemLower.includes('blender')) {
    return ['Vitamix', 'NutriBullet', 'Ninja', 'Breville', 'KitchenAid'];
  }
  
  if (itemLower.includes('air fryer')) {
    return ['Ninja Foodi', 'COSORI', 'Instant Vortex', 'Philips Airfryer', 'Chefman'];
  }
  
  // Kitchen tools and gadgets
  if (itemLower.includes('knife') || itemLower.includes('utensil') || itemLower.includes('cutting board')) {
    return ['Wüsthof', 'Shun', 'OXO', 'Cuisinart', 'Chicago Cutlery'];
  }
  
  // Storage and organization
  if (itemLower.includes('storage') || itemLower.includes('container') || itemLower.includes('bin')) {
    return ['The Container Store', 'Rubbermaid', 'Sterilite', 'IKEA', 'Simplehuman'];
  }
  
  // Clothing - popular fashion brands
  if (itemLower.includes('jeans')) {
    return ['Levi\'s', 'Wrangler', 'American Eagle', 'Gap', 'Old Navy'];
  }
  
  if (itemLower.includes('sneakers') || itemLower.includes('shoes')) {
    return ['Nike', 'Adidas', 'Converse', 'Vans', 'New Balance', 'Puma'];
  }
  
  if (itemLower.includes('t-shirt') || itemLower.includes('shirt')) {
    return ['Uniqlo', 'H&M', 'Champion', 'Nike', 'Adidas', 'Hanes'];
  }
  
  if (itemLower.includes('dress') || itemLower.includes('women')) {
    return ['Zara', 'H&M', 'Forever 21', 'ASOS', 'Urban Outfitters'];
  }
  
  // Office supplies
  if (itemLower.includes('pen') || itemLower.includes('notebook') || itemLower.includes('paper')) {
    return ['Pilot', 'Sharpie', 'BIC', 'Moleskine', 'Leuchtturm1917', 'HP'];
  }
  
  // Fitness - popular brands
  if (itemLower.includes('yoga mat')) {
    return ['Manduka', 'Liforme', 'Gaiam', 'Alo Yoga', 'Jade Yoga'];
  }
  
  if (itemLower.includes('protein powder')) {
    return ['Optimum Nutrition', 'Dymatize', 'Ghost', 'Cellucor', 'BSN'];
  }
  
  if (itemLower.includes('resistance band') || itemLower.includes('exercise')) {
    return ['TheraBand', 'Fit Simplify', 'Bodylastics', 'SPRI', 'Resistance Band Training'];
  }
  
  // Tools - popular brands
  if (itemLower.includes('drill') || itemLower.includes('tool')) {
    return ['DeWalt', 'Milwaukee', 'Makita', 'Ryobi', 'Black+Decker'];
  }
  
  // Pet supplies - popular brands
  if (itemLower.includes('dog food')) {
    return ['Blue Buffalo', 'Hill\'s Science Diet', 'Royal Canin', 'Purina Pro Plan', 'Wellness'];
  }
  
  if (itemLower.includes('cat food')) {
    return ['Hill\'s Science Diet', 'Royal Canin', 'Blue Buffalo', 'Purina Pro Plan', 'Wellness'];
  }
  
  if (itemLower.includes('pet toy') || itemLower.includes('dog toy')) {
    return ['KONG', 'Nylabone', 'ChuckIt!', 'ZippyPaws', 'Benebone'];
  }
  
  // Baby products
  if (itemLower.includes('baby') || itemLower.includes('diaper')) {
    return ['Pampers', 'Huggies', 'Honest Company', 'Seventh Generation', 'Bambo Nature'];
  }
  
  // Batteries and electronics accessories
  if (itemLower.includes('battery') || itemLower.includes('batteries')) {
    return ['Energizer', 'Duracell', 'Panasonic', 'Rayovac', 'Amazon Basics'];
  }
  
  // Cleaning supplies
  if (itemLower.includes('cleaning') || itemLower.includes('detergent') || itemLower.includes('soap')) {
    return ['Tide', 'Dawn', 'Lysol', 'Clorox', 'Method'];
  }
  
  // Personal care
  if (itemLower.includes('toothbrush') || itemLower.includes('dental') || itemLower.includes('oral care')) {
    return ['Oral-B', 'Sonicare', 'Colgate', 'Crest', 'TheraBreath'];
  }
  
  // Vitamins and supplements
  if (itemLower.includes('vitamin') || itemLower.includes('supplement')) {
    return ['Nature Made', 'Garden of Life', 'NOW Foods', 'Centrum', 'One A Day'];
  }
  
  // For any other items, return popular general brands
  return ['Amazon Basics', 'Great Value', 'Generic', 'Store Brand'];
}

function getCurrencyMultiplier(currency: string): number {
  // Mock currency conversion rates (in real app, use live rates API)
  const rates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    CAD: 1.25,
    AUD: 1.35,
    JPY: 110,
    CHF: 0.92,
    CNY: 6.4,
    INR: 74,
    BRL: 5.2,
  };
  return rates[currency] || 1;
}

function getLocationPriceMultiplier(location?: string): number {
  const locationLower = location?.toLowerCase() || '';
  
  // Price adjustments based on location (cost of living, import duties, etc.)
  if (locationLower.includes('japan') || locationLower.includes('japanese')) {
    return 1.2; // Higher prices in Japan
  }
  
  if (locationLower.includes('germany') || locationLower.includes('france') || 
      locationLower.includes('italy') || locationLower.includes('netherlands') ||
      locationLower.includes('switzerland') || locationLower.includes('austria')) {
    return 1.15; // Higher prices in Western Europe
  }
  
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') || 
      locationLower.includes('britain') || locationLower.includes('england')) {
    return 1.1; // Slightly higher prices in UK
  }
  
  if (locationLower.includes('canada') || locationLower.includes('canadian')) {
    return 1.05; // Slightly higher prices in Canada
  }
  
  if (locationLower.includes('australia') || locationLower.includes('australian')) {
    return 1.25; // Higher prices in Australia
  }
  
  if (locationLower.includes('india') || locationLower.includes('indian') ||
      locationLower.includes('pakistan') || locationLower.includes('bangladesh') ||
      locationLower.includes('sri lanka')) {
    return 0.7; // Lower prices in South Asia
  }
  
  if (locationLower.includes('china') || locationLower.includes('chinese') ||
      locationLower.includes('thailand') || locationLower.includes('vietnam') ||
      locationLower.includes('philippines') || locationLower.includes('indonesia')) {
    return 0.8; // Lower prices in Southeast Asia
  }
  
  if (locationLower.includes('mexico') || locationLower.includes('brazil') ||
      locationLower.includes('argentina') || locationLower.includes('colombia') ||
      locationLower.includes('peru') || locationLower.includes('chile')) {
    return 0.85; // Lower prices in Latin America
  }
  
  // Default for USA and other countries
  return 1;
}

function suggestAlternatives(results: SearchResult[], budget: number): string[] {
  const suggestions = [];
  const totalCost = results.reduce((sum, result) => {
    const cheapest = result.products.sort((a, b) => a.price - b.price)[0];
    return sum + (cheapest?.price || 0);
  }, 0);
  
  if (totalCost > budget) {
    suggestions.push('Consider buying fewer items or look for cheaper alternatives');
    suggestions.push('Try shopping during sales periods or use discount codes');
    suggestions.push('Consider generic/store brands instead of name brands');
  }
  
  return suggestions;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Search API called');
    const requestBody = await request.json();
    console.log('Request body:', requestBody);
    
    const { budget, currency, items, location, qualityPreference }: SearchRequest = requestBody;
    
    if (!budget || !items || items.length === 0) {
      console.log('Validation failed:', { budget, items });
      return NextResponse.json(
        { error: 'Budget and items are required' },
        { status: 400 }
      );
    }
    
    console.log('Starting search for items:', items, 'with quality preference:', qualityPreference);

    const results: SearchResult[] = [];

    // Search for each item
    for (const item of items) {
      try {
        console.log(`Searching for item: ${item}`);
        const products = await searchProducts(item.toLowerCase().trim(), budget, currency, location, qualityPreference);
        console.log(`Found ${products.length} products for ${item}`);
        results.push({
          item: item.toLowerCase().trim(),
          products
        });
      } catch (itemError) {
        console.error(`Error searching for item ${item}:`, itemError);
        // Continue with other items even if one fails
        results.push({
          item: item.toLowerCase().trim(),
          products: []
        });
      }
    }

    console.log('All items processed, calculating totals...');
    
    // Calculate totals and suggestions
    const totalCost = results.reduce((sum, result) => {
      const cheapest = result.products.sort((a, b) => a.price - b.price)[0];
      return sum + (cheapest?.price || 0);
    }, 0);
    
    const isOverBudget = totalCost > budget;
    const suggestions = suggestAlternatives(results, budget);
    
    return NextResponse.json({
      results,
      summary: {
        totalCost,
        budget,
        isOverBudget,
        remaining: budget - totalCost,
        currency
      },
      suggestions,
      location: location || 'Global',
      qualityPreference: qualityPreference || 'both'
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
