'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, DollarSign, MapPin, Heart, Sparkles } from 'lucide-react';
import CurrencySelector from '@/components/CurrencySelector';
import BudgetInput from '@/components/BudgetInput';
import ShoppingList from '@/components/ShoppingList';
import ProductResults from '@/components/ProductResults';
import UsageQuota from '@/components/UsageQuota';
import Wishlist from '@/components/Wishlist';

interface SearchResult {
  item: string;
  products: Array<{
    name: string;
    price: number;
    store: string;
    link: string;
    affiliateLink: string;
    inStock: boolean;
    stockLevel?: string;
    rating: number;
    id: string;
    image?: string;
    description?: string;
    estimatedCommission?: number;
  }>;
}

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

export default function Home() {
  const [budget, setBudget] = useState<number>(150);
  const [currency, setCurrency] = useState<string>('USD');
  const [location, setLocation] = useState<string>('');
  const [shoppingItems, setShoppingItems] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist && savedWishlist !== 'undefined') {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        }
      }
    } catch (error) {
      console.warn('Failed to load wishlist from localStorage:', error);
      localStorage.removeItem('wishlist'); // Clear corrupted data
    }
  }, [isHydrated]);

  // Save wishlist to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (!isHydrated || wishlist.length === 0) return;
    
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.warn('Failed to save wishlist to localStorage:', error);
    }
  }, [wishlist, isHydrated]);

  const addToWishlist = (product: {
    id: string;
    name: string;
    price: number;
    store: string;
    link: string;
    affiliateLink: string;
    inStock: boolean;
    rating: number;
    image?: string;
  }) => {
    const wishlistItem: WishlistItem = {
      id: product.id || `${product.store}-${Date.now()}`,
      name: product.name,
      price: product.price,
      store: product.store,
      link: product.link,
      rating: product.rating,
      image: product.image,
      addedAt: new Date().toISOString()
    };

    setWishlist(prev => {
      if (prev.some(item => item.id === wishlistItem.id)) {
        return prev; // Item already in wishlist
      }
      return [...prev, wishlistItem];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const handleSearch = async () => {
    console.log('handleSearch called with:', { budget, shoppingItemsLength: shoppingItems.length });
    
    if (!budget || shoppingItems.length === 0) {
      console.log('Validation failed - budget or items missing');
      alert('Please enter a budget and add at least one item to your shopping list.');
      return;
    }
    
    setIsSearching(true);
    
    try {
      console.log('Starting search with:', { budget, currency, items: shoppingItems, location });
      
      // Add more detailed debugging
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/search`;
      console.log('Full API URL:', apiUrl);
      
      const requestBody = {
        budget,
        currency,
        items: shoppingItems,
        location
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response received:', response);
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        console.error('Full response:', response);
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
        
        // Update usage count
        try {
          const usageCount = parseInt(localStorage.getItem('usageCount') || '0');
          localStorage.setItem('usageCount', (usageCount + 1).toString());
        } catch (storageError) {
          console.warn('Failed to update usage count:', storageError);
        }
        
        console.log('Search completed successfully');
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format - no results array found');
      }
      
    } catch (error) {
      console.error('Detailed search error:', error);
      console.error('Error type:', typeof error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error - please check your connection and try again';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Search failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E3F2FD' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#F0F4F5' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-8 w-8" style={{ color: '#64B5CD' }} />
              <h1 className="text-2xl font-bold text-gray-900">SmartFête</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowWishlist(true)}
                className="flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover-lift"
                style={{ backgroundColor: '#64B5CD', color: 'white' }}
              >
                <Heart className="h-5 w-5 mr-2" fill={wishlist.length > 0 ? 'currentColor' : 'none'} />
                Wishlist ({wishlist.length})
              </button>
              <UsageQuota />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fadeIn">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            SmartFête - AI Shopping Assistant
            <Sparkles className="inline h-8 w-8 ml-2 animate-pulse-custom" style={{ color: '#B8860B' }} />
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Enter your budget and shopping list. Our AI will find the best deals from multiple stores,
            keeping you within budget while maximizing value.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Input Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-lg shadow-md p-6 border-4" style={{ backgroundColor: '#F0F4F5', borderColor: '#F4D8B8' }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                  <DollarSign className="h-6 w-6 mr-2" style={{ color: '#B8860B' }} />
                  Budget & Currency
                </h3>
                <div className="space-y-4">
                  <CurrencySelector 
                    value={currency}
                    onChange={setCurrency}
                  />
                  <BudgetInput
                    value={budget}
                    onChange={setBudget}
                    currency={currency}
                  />
                </div>
              </div>

              <div className="rounded-lg shadow-md p-6 border-4" style={{ backgroundColor: '#F0F4F5', borderColor: '#F4D8B8' }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                  <MapPin className="h-6 w-6 mr-2" style={{ color: '#B8860B' }} />
                  Location (Optional)
                </h3>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your city or ZIP code"
                  className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 font-medium placeholder-gray-500"
                  style={{ 
                    borderColor: '#64B5CD', 
                    '--tw-ring-color': '#64B5CD',
                    backgroundColor: 'white'
                  } as React.CSSProperties}
                />
                <p className="text-sm text-gray-700 mt-2">
                  Help us find products available in your area
                </p>
              </div>

              <div className="rounded-lg shadow-md p-6 border-4" style={{ backgroundColor: '#F0F4F5', borderColor: '#F4D8B8' }}>
                <ShoppingList
                  items={shoppingItems}
                  onChange={setShoppingItems}
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={!budget || shoppingItems.length === 0 || isSearching}
                className="w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                style={{ 
                  backgroundColor: '#64B5CD',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#5AA5BD';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#64B5CD';
                  }
                }}
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Find Best Deals
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2">
              <ProductResults
                results={searchResults}
                budget={budget}
                currency={currency}
                isLoading={isSearching}
                onAddToWishlist={addToWishlist}
                isInWishlist={isInWishlist}
              />
            </div>
          </div>

        {/* Wishlist Modal */}
        <Wishlist
          items={wishlist}
          onRemove={removeFromWishlist}
          currency={currency}
          isOpen={showWishlist}
          onClose={() => setShowWishlist(false)}
        />
      </main>
    </div>
  );
}
