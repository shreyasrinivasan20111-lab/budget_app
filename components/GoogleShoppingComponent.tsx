'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Star, ExternalLink, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductResult } from '@/lib/real-api-service';

interface GoogleShoppingComponentProps {
  query: string;
  budget?: number;
  currency?: string;
  onProductSelect?: (product: ProductResult) => void;
  className?: string;
}

interface GoogleShoppingResponse {
  success: boolean;
  products: ProductResult[];
  totalResults: number;
  error?: string;
  metadata?: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    storeDistribution: Record<string, number>;
  };
}

export function GoogleShoppingComponent({ 
  query, 
  budget, 
  currency = 'USD', 
  onProductSelect,
  className = ''
}: GoogleShoppingComponentProps) {
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_PRODUCTS_SHOWN = 6;
  const [metadata, setMetadata] = useState<{
    averagePrice: number;
    priceRange: { min: number; max: number };
    storeDistribution: Record<string, number>;
  } | null>(null);
  const [filters, setFilters] = useState({
    sortBy: 'rating' as 'price_low' | 'price_high' | 'rating' | 'reviews',
    store: '',
    maxResults: 20
  });

  useEffect(() => {
    if (query && query.trim().length > 0) {
      searchGoogleShopping();
    }
  }, [query, budget, filters]);

  const searchGoogleShopping = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        query: query.trim(),
        budget,
        currency,
        filters: {
          ...filters,
          priceRange: budget ? { min: 1, max: budget } : undefined
        }
      };

      console.log('Searching Google Shopping with:', requestBody);

      const response = await fetch('/api/google-shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data: GoogleShoppingResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search Google Shopping');
      }

      if (data.success) {
        setProducts(data.products || []);
        setMetadata(data.metadata || null);
        console.log(`Google Shopping: Found ${data.totalResults} products for "${query}"`);
      } else {
        throw new Error('Search was not successful');
      }
    } catch (err) {
      console.error('Google Shopping search failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to search Google Shopping');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  };

  const getStoreColor = (store: string) => {
    const colors: Record<string, string> = {
      'Amazon.com': 'bg-orange-100 text-orange-800',
      'eBay': 'bg-blue-100 text-blue-800',
      'Walmart': 'bg-yellow-100 text-yellow-800',
      'Target': 'bg-red-100 text-red-800',
      'Best Buy': 'bg-purple-100 text-purple-800',
      'Home Depot': 'bg-orange-100 text-orange-900'
    };
    return colors[store] || 'bg-gray-100 text-gray-800';
  };

  if (!query || query.trim().length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Enter a search term to find products on Google Shopping</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">Google Shopping Results</h3>
            <p className="text-sm text-gray-600">
              {loading ? 'Searching...' : `${products.length} products found for "${query}"`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'price_low' | 'price_high' | 'rating' | 'reviews' }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="rating">Best Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="reviews">Most Reviews</option>
          </select>
          
          <select
            value={filters.maxResults}
            onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={10}>10 results</option>
            <option value={20}>20 results</option>
            <option value={50}>50 results</option>
          </select>
        </div>
      </div>

      {/* Metadata */}
      {metadata && !loading && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Average Price:</span>
              <p className="font-semibold">{formatPrice(metadata.averagePrice)}</p>
            </div>
            <div>
              <span className="text-gray-600">Price Range:</span>
              <p className="font-semibold">
                {formatPrice(metadata.priceRange.min)} - {formatPrice(metadata.priceRange.max)}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Stores:</span>
              <p className="font-semibold">{Object.keys(metadata.storeDistribution).length}</p>
            </div>
            <div>
              <span className="text-gray-600">Within Budget:</span>
              <p className="font-semibold">
                {budget ? products.filter(p => p.price <= budget).length : products.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={searchGoogleShopping}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAll ? products : products.slice(0, INITIAL_PRODUCTS_SHOWN)).map((product, index) => (
            <div 
              key={product.id || index} 
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onProductSelect?.(product)}
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                  {product.name}
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  {budget && product.price <= budget && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Within Budget
                    </span>
                  )}
                </div>

                {/* Store Badge */}
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className={`text-xs px-2 py-1 rounded-full ${getStoreColor(product.store)}`}>
                    {product.store}
                  </span>
                </div>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-gray-500">rating</span>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(product.affiliateLink || product.link, '_blank');
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  View Product <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          </div>

          {/* Show More/Less Button */}
          {products.length > INITIAL_PRODUCTS_SHOWN && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less ({products.length - INITIAL_PRODUCTS_SHOWN} fewer)
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show More ({products.length - INITIAL_PRODUCTS_SHOWN} more products)
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && query && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or budget
          </p>
          <button
            onClick={searchGoogleShopping}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Again
          </button>
        </div>
      )}
    </div>
  );
}
