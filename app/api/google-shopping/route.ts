// Google Shopping API Route using SerpAPI
// Endpoint: /api/google-shopping

import { NextRequest, NextResponse } from 'next/server';
import { serpAPIService } from '@/lib/serpapi-service';

interface GoogleShoppingRequest {
  query: string;
  budget?: number;
  currency?: string;
  location?: string;
  filters?: {
    priceRange?: { min: number; max: number };
    sortBy?: 'price_low' | 'price_high' | 'rating' | 'reviews';
    store?: string;
    maxResults?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GoogleShoppingRequest = await request.json();
    const { query, budget, currency = 'USD', location, filters } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log(`Google Shopping API called for: "${query}"`);

    // Prepare search filters
    const searchFilters: {
      location?: string;
      maxResults?: number;
      priceRange?: { min: number; max: number };
      sortBy?: 'price_low' | 'price_high' | 'rating' | 'reviews';
      store?: string;
    } = {
      location: location || 'United States',
      maxResults: filters?.maxResults || 20,
      ...filters
    };

    // Add budget-based price filter if budget is provided
    if (budget && budget > 0) {
      searchFilters.priceRange = {
        min: 1,
        max: budget,
        ...filters?.priceRange
      };
    }

    // Search Google Shopping
    const products = await serpAPIService.searchWithFilters(query, searchFilters);

    // Filter by budget if no price filter was applied
    const filteredProducts = budget 
      ? products.filter(product => product.price <= budget)
      : products;

    // Sort by preference
    let sortedProducts = filteredProducts;
    if (filters?.sortBy) {
      sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
    }

    // Calculate summary statistics
    const totalProducts = sortedProducts.length;
    const avgPrice = totalProducts > 0 
      ? sortedProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts 
      : 0;
    const priceRange = totalProducts > 0 
      ? {
          min: Math.min(...sortedProducts.map(p => p.price)),
          max: Math.max(...sortedProducts.map(p => p.price))
        }
      : { min: 0, max: 0 };

    // Get store distribution
    const storeDistribution = sortedProducts.reduce((acc, product) => {
      acc[product.store] = (acc[product.store] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      success: true,
      query,
      totalResults: totalProducts,
      products: sortedProducts,
      metadata: {
        averagePrice: Math.round(avgPrice * 100) / 100,
        priceRange,
        currency,
        storeDistribution,
        searchFilters,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`Google Shopping: Found ${totalProducts} products for "${query}"`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Google Shopping API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search Google Shopping',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || searchParams.get('q');
    const budget = searchParams.get('budget');
    const location = searchParams.get('location');
    const sortBy = searchParams.get('sort') as 'price_low' | 'price_high' | 'rating' | 'reviews' | null;
    const store = searchParams.get('store');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const searchFilters: {
      location?: string;
      maxResults?: number;
      priceRange?: { min: number; max: number };
      sortBy?: 'price_low' | 'price_high' | 'rating' | 'reviews';
      store?: string;
    } = {
      location: location || 'United States',
      maxResults: 20
    };

    if (budget) {
      searchFilters.priceRange = { min: 1, max: parseInt(budget) };
    }

    if (sortBy) {
      searchFilters.sortBy = sortBy;
    }

    if (store) {
      searchFilters.store = store;
    }

    const products = await serpAPIService.searchWithFilters(query, searchFilters);

    return NextResponse.json({
      success: true,
      query,
      totalResults: products.length,
      products,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Google Shopping GET error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search Google Shopping'
      },
      { status: 500 }
    );
  }
}
