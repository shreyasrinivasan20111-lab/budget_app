import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';
import { affiliateManager } from '@/lib/affiliate-manager';

interface AffiliateProductProps {
  product: {
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
  };
  currency: string;
  onAddToWishlist: (product: {
    id: string;
    name: string;
    price: number;
    store: string;
    link: string;
    affiliateLink: string;
    inStock: boolean;
    rating: number;
    image?: string;
  }) => void;
  isInWishlist: (productId: string) => boolean;
}

const AffiliateProduct: React.FC<AffiliateProductProps> = ({
  product,
  currency,
  onAddToWishlist,
  isInWishlist
}) => {
  const handleAffiliateClick = async () => {
    // Validate the affiliate link before opening
    if (!product.affiliateLink || product.affiliateLink === '#') {
      console.error('Invalid affiliate link:', product.affiliateLink);
      alert('Sorry, this product link is not available. Please try another product.');
      return;
    }

    // Track the affiliate click
    try {
      await affiliateManager.trackAffiliateClick(
        product.store,
        product.id,
        undefined, // userId - you can add user tracking here
        {
          productName: product.name,
          price: product.price,
          currency,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to track affiliate click:', error);
      // Continue with link opening even if tracking fails
    }

    // Open the affiliate link
    console.log('Opening affiliate link for:', product.name);
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$',
      AUD: 'A$', CHF: 'CHF', CNY: '¥', INR: '₹', BRL: 'R$',
      KRW: '₩', MXN: '$', SGD: 'S$', HKD: 'HK$', NOK: 'kr',
      SEK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft'
    };
    return symbols[curr] || curr;
  };

  const formatRating = (rating: number) => {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-400 fill-current" />
        <span className="ml-1 text-sm text-gray-600">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.svg';
              target.onerror = null; // Prevent infinite loop
            }}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
          </h4>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold" style={{ color: '#64B5CD' }}>
                {getCurrencySymbol(currency)}{(typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0).toFixed(2)}
              </span>
              {/* Stock Status Indicator */}
              <div className="flex items-center">
                {!product.inStock ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                    Out of Stock
                  </span>
                ) : product.stockLevel === 'low-stock' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                    Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    In Stock
                  </span>
                )}
              </div>
            </div>
            {formatRating(product.rating)}
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-medium text-gray-700">
              Store: {product.store}
            </span>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onAddToWishlist({
                  ...product,
                  inStock: product.inStock
                })}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isInWishlist(product.id)
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              
              <button
                onClick={handleAffiliateClick}
                disabled={!product.inStock}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  product.inStock 
                    ? 'text-white hover:scale-105' 
                    : 'text-gray-400 cursor-not-allowed opacity-60'
                }`}
                style={{ 
                  backgroundColor: product.inStock ? '#64B5CD' : '#E5E7EB'
                }}
                onMouseEnter={(e) => {
                  if (product.inStock) {
                    e.currentTarget.style.backgroundColor = '#5AA5BD';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.inStock) {
                    e.currentTarget.style.backgroundColor = '#64B5CD';
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {product.inStock ? 'View Deal' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateProduct;
