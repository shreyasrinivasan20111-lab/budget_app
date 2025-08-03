'use client';

import { useState, useEffect } from 'react';
import { Search, Crown, Palette, Sparkles, Star, Lock } from 'lucide-react';
import BudgetInput from './BudgetInput';
import CurrencySelector from './CurrencySelector';
import ShoppingList from './ShoppingList';
import ProductResults from './ProductResults';

interface PremiumTabProps {
  currency: string;
  setCurrency: (currency: string) => void;
  budget: number;
  setBudget: (budget: number) => void;
  location: string;
  setLocation: (location: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddToWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
}

interface SearchResult {
  item: string;
  products: Array<{
    name: string;
    price: number;
    store: string;
    link: string;
    affiliateLink: string;
    inStock: boolean;
    rating: number;
    id: string;
    image?: string;
    description?: string;
    estimatedCommission?: number;
  }>;
}

const PremiumTab: React.FC<PremiumTabProps> = ({
  currency,
  setCurrency,
  budget,
  setBudget,
  location,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setLocation,
  onAddToWishlist,
  isInWishlist
}) => {
  const [shoppingItems, setShoppingItems] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState('');
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Check premium status on component mount
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = () => {
    const premiumExpiry = localStorage.getItem('premiumExpiry');
    if (premiumExpiry) {
      const expiryDate = new Date(premiumExpiry);
      const now = new Date();
      if (expiryDate > now) {
        setIsPremiumUser(true);
        return true;
      } else {
        localStorage.removeItem('premiumExpiry');
      }
    }
    setIsPremiumUser(false);
    return false;
  };

  const handlePremiumPurchase = async () => {
    // Simulate payment processing
    setShowUpgrade(false);
    
    // Set premium expiry to 1 year from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    localStorage.setItem('premiumExpiry', expiryDate.toISOString());
    setIsPremiumUser(true);
    
    alert('Premium activated! You now have access to AI Theme Shopping for 1 year.');
  };

  const handleThemeSearch = async () => {
    if (!isPremiumUser) {
      setShowUpgrade(true);
      return;
    }

    if (!theme.trim()) {
      alert('Please enter a theme for your shopping search');
      return;
    }

    if (shoppingItems.length === 0) {
      alert('Please add at least one item to your shopping list');
      return;
    }

    if (!budget || budget <= 0) {
      alert('Please set a valid budget');
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch('/api/premium-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: shoppingItems,
          budget,
          currency,
          location,
          theme: theme.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setSearchResults(results);

      // Update premium usage count
      const premiumUsageCount = parseInt(localStorage.getItem('premiumUsageCount') || '0');
      localStorage.setItem('premiumUsageCount', (premiumUsageCount + 1).toString());

    } catch (error) {
      console.error('Premium search error:', error);
      alert('Failed to search for products. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const popularThemes = [
    'Minimalist Modern',
    'Cozy Rustic',
    'Elegant Luxury',
    'Bohemian Chic',
    'Industrial Urban',
    'Scandinavian Clean',
    'Vintage Retro',
    'Tropical Paradise'
  ];

  if (showUpgrade) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="rounded-lg p-8 border-4" style={{ backgroundColor: '#F0F4F5', borderColor: '#B8860B' }}>
            <Crown className="h-16 w-16 mx-auto mb-4" style={{ color: '#B8860B' }} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Theme Shopping</h3>
            <p className="text-gray-600 mb-6">
              Unlock AI-powered theme-based shopping! Find products that match your style and aesthetic preferences.
            </p>
            
            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2" style={{ color: '#B8860B' }} />
                <span className="text-sm">AI-powered theme matching</span>
              </div>
              <div className="flex items-center">
                <Palette className="h-5 w-5 mr-2" style={{ color: '#B8860B' }} />
                <span className="text-sm">Curated style recommendations</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" style={{ color: '#B8860B' }} />
                <span className="text-sm">Premium product selections</span>
              </div>
            </div>

            <div className="text-3xl font-bold mb-2" style={{ color: '#B8860B' }}>
              $10/year
            </div>
            <p className="text-sm text-gray-500 mb-6">Less than $1 per month!</p>

            <div className="space-y-3">
              <button
                onClick={handlePremiumPurchase}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: '#B8860B' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A0751F'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B8860B'}
              >
                Upgrade to Premium
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Input Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-lg shadow-md p-6 border-4" style={{ backgroundColor: '#F0F4F5', borderColor: '#B8860B' }}>
          <div className="flex items-center mb-4">
            <Crown className="h-6 w-6 mr-2" style={{ color: '#B8860B' }} />
            <h3 className="text-xl font-semibold text-gray-900">Premium Theme Shopping</h3>
          </div>

          {isPremiumUser ? (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)', border: '1px solid #B8860B' }}>
              <div className="flex items-center text-sm">
                <Crown className="h-4 w-4 mr-2" style={{ color: '#B8860B' }} />
                <span style={{ color: '#B8860B' }} className="font-medium">Premium Active</span>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-lg bg-gray-100 border">
              <div className="flex items-center text-sm text-gray-600">
                <Lock className="h-4 w-4 mr-2" />
                <span>Premium features locked</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <BudgetInput
              value={budget}
              onChange={setBudget}
              currency={currency}
            />
            
            <CurrencySelector
              value={currency}
              onChange={setCurrency}
            />

            {/* Theme Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="inline h-4 w-4 mr-1" />
                Shopping Theme
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Minimalist Modern, Cozy Rustic, Elegant Luxury..."
                className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                style={{ 
                  borderColor: '#F4D8B8'
                }}
                disabled={!isPremiumUser}
              />
              
              {/* Popular Themes */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Popular themes:</p>
                <div className="flex flex-wrap gap-1">
                  {popularThemes.slice(0, 4).map((popularTheme) => (
                    <button
                      key={popularTheme}
                      onClick={() => isPremiumUser && setTheme(popularTheme)}
                      className="text-xs px-2 py-1 rounded-full border transition-colors"
                      style={{ 
                        borderColor: '#F4D8B8',
                        backgroundColor: theme === popularTheme ? '#B8860B' : 'transparent',
                        color: theme === popularTheme ? 'white' : '#666'
                      }}
                      disabled={!isPremiumUser}
                    >
                      {popularTheme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ShoppingList
          items={shoppingItems}
          onChange={setShoppingItems}
        />

        <button
          onClick={handleThemeSearch}
          disabled={isSearching || !isPremiumUser}
          className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          style={{ backgroundColor: isPremiumUser ? '#B8860B' : '#666' }}
          onMouseEnter={(e) => {
            if (isPremiumUser && !isSearching) {
              e.currentTarget.style.backgroundColor = '#A0751F';
            }
          }}
          onMouseLeave={(e) => {
            if (isPremiumUser) {
              e.currentTarget.style.backgroundColor = '#B8860B';
            }
          }}
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Search className="h-5 w-5 mr-2" />
          )}
          {isSearching ? 'Finding Themed Products...' : isPremiumUser ? 'Search with Theme' : 'Upgrade to Search'}
        </button>
      </div>

      {/* Right Column - Results */}
      <div className="lg:col-span-2">
        <ProductResults
          results={searchResults}
          budget={budget}
          currency={currency}
          isLoading={isSearching}
          onAddToWishlist={onAddToWishlist}
          isInWishlist={isInWishlist}
        />
      </div>
    </div>
  );
};

export default PremiumTab;
