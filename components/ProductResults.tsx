'use client';

import { TrendingUp, AlertCircle } from 'lucide-react';
import AffiliateProduct from './AffiliateProduct';
import { affiliateManager } from '@/lib/affiliate-manager';

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

interface ProductResultsProps {
  results: SearchResult[];
  budget: number;
  currency: string;
  isLoading: boolean;
  onAddToWishlist?: (product: Product) => void;
  isInWishlist?: (productId: string) => boolean;
}

const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$',
    JPY: '¥', CHF: 'CHF', CNY: '¥', INR: '₹', BRL: 'R$',
  };
  return symbols[currency] || '$';
};

export default function ProductResults({ 
  results, 
  budget, 
  currency, 
  isLoading, 
  onAddToWishlist, 
  isInWishlist 
}: ProductResultsProps) {
  const currencySymbol = getCurrencySymbol(currency);
  
  const getTotalPrice = () => {
    if (!results || !Array.isArray(results)) {
      return 0;
    }
    return results.reduce((total, result) => {
      if (!result || !result.products || !Array.isArray(result.products)) {
        return total;
      }
      const cheapestProduct = result.products.sort((a, b) => a.price - b.price)[0];
      return total + (cheapestProduct?.price || 0);
    }, 0);
  };

  const totalPrice = getTotalPrice();
  const isOverBudget = totalPrice > budget;
  const remainingBudget = budget - totalPrice;

  if (isLoading) {
    return (
      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#F0F4F5' }}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#64B5CD' }}></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching for Best Deals</h3>
          <p className="text-gray-600">Our AI is comparing prices across multiple stores...</p>
        </div>
      </div>
    );
  }

  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#F0F4F5' }}>
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto mb-4" style={{ color: '#64B5CD', opacity: 0.6 }} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Find Deals</h3>
          <p className="text-gray-600">Enter your budget and add items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#F0F4F5' }}>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Budget Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-2xl font-bold text-gray-900">
              {currencySymbol}{budget.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Best Price Total</p>
            <p className={`text-2xl font-bold`} style={{ color: isOverBudget ? '#B8860B' : '#64B5CD' }}>
              {currencySymbol}{totalPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </p>
            <p className={`text-2xl font-bold`} style={{ color: isOverBudget ? '#B8860B' : '#64B5CD' }}>
              {currencySymbol}{Math.abs(remainingBudget).toFixed(2)}
            </p>
          </div>
        </div>
        
        {isOverBudget && (
          <div className="mt-4 p-3 rounded-lg flex items-center" style={{ backgroundColor: '#FFF8E1', border: '2px solid #B8860B' }}>
            <AlertCircle className="h-5 w-5 mr-2" style={{ color: '#B8860B' }} />
            <p className="text-sm font-medium" style={{ color: '#B8860B' }}>
              You&apos;re over budget! Consider cheaper alternatives or increase your budget.
            </p>
          </div>
        )}
      </div>

      {/* Product Results */}
      {results.map((result, index) => {
        // Safety check for result data
        if (!result || !result.products || !Array.isArray(result.products) || result.products.length === 0) {
          return null;
        }
        
        return (
        <div key={`result-${result.item || 'item'}-${index}`} className="rounded-lg shadow-md p-6 border-4" style={{ backgroundColor: '#F0F4F5', borderColor: '#F4D8B8' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold capitalize text-gray-900">{result.item || 'Unknown Item'}</h3>
          </div>
          
          <div className="space-y-4">
            {result.products
              .filter(product => product && product.name && product.price !== undefined) // Filter out invalid products
              .sort((a, b) => a.price - b.price)
              .map((product, productIndex) => (
                <div 
                  key={`${result.item}-${product.id}-${productIndex}`}
                  className={`border-2 rounded-lg transition-all duration-300 hover:shadow-lg animate-fadeIn`}
                  style={{ 
                    borderColor: productIndex === 0 ? '#64B5CD' : '#D4D4D8',
                    backgroundColor: productIndex === 0 ? 'rgba(100, 181, 205, 0.1)' : 'white',
                    animationDelay: `${productIndex * 0.1}s`
                  }}
                >
                  {productIndex === 0 && (
                    <div className="px-4 py-2 text-center">
                      <span className="text-xs px-3 py-1 rounded-full animate-pulse font-semibold text-white" style={{ backgroundColor: '#64B5CD' }}>
                        🏆 Best Price Deal
                      </span>
                    </div>
                  )}
                  
                  <AffiliateProduct
                    product={product}
                    currency={currency}
                    onAddToWishlist={onAddToWishlist || (() => {})}
                    isInWishlist={isInWishlist || (() => false)}
                  />
                </div>
              ))}
          </div>
          
          {/* Affiliate Disclosure */}
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 181, 205, 0.1)', border: '1px solid #64B5CD' }}>
            <p className="text-xs text-gray-600">
              <strong>Affiliate Disclosure:</strong> {affiliateManager.getDisclosureText()}
            </p>
          </div>
        </div>
        );
      })}
    </div>
  );
}
