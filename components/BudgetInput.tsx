'use client';

interface BudgetInputProps {
  value: number;
  onChange: (budget: number) => void;
  currency: string;
}

const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
  };
  return symbols[currency] || '$';
};

export default function BudgetInput({ value, onChange, currency }: BudgetInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        Total Budget
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-bold text-lg" style={{ color: '#B8860B' }}>
          {getCurrencySymbol(currency)}
        </span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue === '') {
              onChange(0);
            } else {
              // Parse as float and round to 2 decimal places to avoid precision issues
              const numValue = parseFloat(inputValue);
              if (!isNaN(numValue)) {
                onChange(Math.round(numValue * 100) / 100);
              }
            }
          }}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="w-full pl-8 pr-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 font-medium placeholder-gray-500"
          style={{ 
            borderColor: '#64B5CD', 
            '--tw-ring-color': '#64B5CD',
            backgroundColor: 'white'
          } as React.CSSProperties}
        />
      </div>
      <p className="text-sm text-gray-700 mt-1">
        Enter your total budget for shopping
      </p>
    </div>
  );
}
