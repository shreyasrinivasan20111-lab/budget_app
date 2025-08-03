'use client';

import { Globe } from 'lucide-react';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center">
        <Globe className="h-4 w-4 mr-2" style={{ color: '#64B5CD' }} />
        Currency
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 font-medium"
        style={{ 
          borderColor: '#64B5CD', 
          '--tw-ring-color': '#64B5CD'
        } as React.CSSProperties}
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
}
