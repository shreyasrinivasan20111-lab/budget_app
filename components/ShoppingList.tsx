'use client';

import { useState } from 'react';
import { Plus, X, ShoppingBag } from 'lucide-react';

interface ShoppingListProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export default function ShoppingList({ items, onChange }: ShoppingListProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim().toLowerCase())) {
      onChange([...items, newItem.trim().toLowerCase()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
        <ShoppingBag className="h-6 w-6 mr-2" style={{ color: '#B8860B' }} />
        Shopping List
      </h3>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add item (e.g., balloons, paper plates)"
            className="flex-1 px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 font-medium placeholder-gray-500"
            style={{ 
              borderColor: '#64B5CD', 
              '--tw-ring-color': '#64B5CD',
              backgroundColor: 'white'
            } as React.CSSProperties}
          />
          <button
            onClick={addItem}
            className="text-white p-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#64B5CD' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5AA5BD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#64B5CD';
            }}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Items to find:</p>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#F0F4F5' }}
              >
                <span className="capitalize text-gray-900 font-medium">{item}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="p-1 transition-colors"
                  style={{ color: '#B8860B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#A0751F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#B8860B';
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-700">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" style={{ color: '#64B5CD' }} />
            <p className="font-medium">Add items to your shopping list</p>
            <p className="text-sm text-gray-600">Start typing common items like balloons, cups, decorations</p>
          </div>
        )}
      </div>
    </div>
  );
}
