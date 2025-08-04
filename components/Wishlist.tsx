'use client';

import { Heart, X, ExternalLink, Star, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  store: string;
  link: string;
  rating: number;
  image?: string;
  addedAt: string;
}

interface WishlistProps {
  items: WishlistItem[];
  onRemove: (id: string) => void;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
}

const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$',
    JPY: '¥', CHF: 'CHF', CNY: '¥', INR: '₹', BRL: 'R$',
    KRW: '₩', MXN: '$', SGD: 'S$', HKD: 'HK$', NOK: 'kr',
    SEK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft'
  };
  return symbols[currency] || '$';
};

export default function Wishlist({ items, onRemove, currency, isOpen, onClose }: WishlistProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideIn"
        style={{ backgroundColor: '#F0F4F5' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2" style={{ borderColor: '#D4A373' }}>
          <div className="flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" fill="currentColor" />
            <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
            <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#64B5CD', color: 'white' }}>
              {items.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Wishlist Summary */}
        {items.length > 0 && (
          <div className="p-6 border-b" style={{ backgroundColor: 'rgba(100, 181, 205, 0.1)' }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Wishlist Value</h3>
                <p className="text-sm text-gray-600">Estimated total for all your favorite items</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold" style={{ color: '#64B5CD' }}>
                  {currencySymbol}{totalValue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">{items.length} items</p>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600">Start adding items you love by clicking the heart icon on products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="border-2 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fadeIn"
                  style={{ 
                    borderColor: '#F4D8B8',
                    backgroundColor: 'white',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      {item.image && (
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg border mb-3"
                          style={{ borderColor: '#64B5CD' }}
                        />
                      )}
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h4>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                        <span className="font-medium">{item.store}</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1" style={{ color: '#B8860B' }} />
                          <span>{item.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 ml-2"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold" style={{ color: '#64B5CD' }}>
                      {currencySymbol}{item.price.toFixed(2)}
                    </p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                      style={{ backgroundColor: '#64B5CD' }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      Buy Now
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
