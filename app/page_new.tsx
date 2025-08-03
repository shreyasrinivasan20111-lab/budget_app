'use client';

import { useState } from 'react';
import { ShoppingCart, DollarSign, MapPin, Search } from 'lucide-react';
import CurrencySelector from '@/components/CurrencySelector';
import BudgetInput from '@/components/BudgetInput';
import ShoppingList from '@/components/ShoppingList';
import ProductResults from '@/components/ProductResults';
import UsageQuota from '@/components/UsageQuota';

export default function Home() {
  const [budget, setBudget] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('USD');
  const [location, setLocation] = useState<string>('');
  const [shoppingItems, setShoppingItems] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!budget || shoppingItems.length === 0) return;
    
    setIsSearching(true);
    // Mock search results for demo
    setTimeout(() => {
      setSearchResults([
        {
          item: 'balloons',
          products: [
            {
              name: 'Colorful Party Balloons (50 pack)',
              price: 12.99,
              store: 'Amazon',
              link: 'https://amazon.com/balloons',
              inStock: true,
              rating: 4.5
            },
            {
              name: 'Premium Helium Balloons (30 pack)',
              price: 15.99,
              store: 'Walmart',
              link: 'https://walmart.com/balloons',
              inStock: true,
              rating: 4.2
            }
          ]
        }
      ]);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">SmartBudget AI</h1>
            </div>
            <UsageQuota />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Budget Shopping Assistant
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your budget and shopping list. Our AI will find the best deals from multiple stores,
            keeping you within budget while maximizing value.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                Location (Optional)
              </h3>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your city or ZIP code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Help us find products available in your area
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <ShoppingList
                items={shoppingItems}
                onChange={setShoppingItems}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={!budget || shoppingItems.length === 0 || isSearching}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}
