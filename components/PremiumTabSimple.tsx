'use client';

import { useState } from 'react';
import { Crown, DollarSign } from 'lucide-react';
import CurrencySelector from './CurrencySelector';
import BudgetInput from './BudgetInput';
import ShoppingList from './ShoppingList';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const PremiumTabSimple: React.FC<PremiumTabProps> = ({
  currency,
  setCurrency,
  budget,
  setBudget,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  location,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setLocation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddToWishlist,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isInWishlist
}) => {
  const [theme, setTheme] = useState<string>('');
  const [shoppingItems, setShoppingItems] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Crown className="h-10 w-10 mr-3" style={{ color: '#B8860B' }} />
          <h2 className="text-3xl font-bold text-gray-900">
            AI Theme Shopping
          </h2>
        </div>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Discover products that match your aesthetic! Enter any theme, style, or vibe, 
          and our AI will curate a perfect shopping list just for you.
        </p>
        
        <div className="mt-6 p-6 rounded-lg border-4" style={{ backgroundColor: '#FFF8E1', borderColor: '#B8860B' }}>
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 mr-2" style={{ color: '#B8860B' }} />
            <h3 className="text-xl font-bold" style={{ color: '#B8860B' }}>
              Premium Feature - $10/year
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Unlock AI-powered theme shopping with unlimited searches and exclusive features!
          </p>
          <button
            className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: '#B8860B' }}
          >
            Activate Premium - $10/year
          </button>
        </div>
      </div>

      <div className="text-center p-8 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Premium Theme Search</h3>
        <p>Enter your theme preference and we&apos;ll curate products for you!</p>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="e.g., Minimalist Nordic, Vintage Retro..."
          className="mt-4 w-full max-w-md px-4 py-2 border rounded-lg"
        />
        
        <div className="mt-6 p-4 bg-white rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center justify-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Budget & Currency
          </h4>
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
        
        <div className="mt-6 p-4 bg-white rounded-lg">
          <ShoppingList
            items={shoppingItems}
            onChange={setShoppingItems}
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumTabSimple;
