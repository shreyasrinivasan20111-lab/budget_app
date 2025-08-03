'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function UsageQuota() {
  const [usageCount, setUsageCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const maxFreeUses = 35;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      const storedUsage = localStorage.getItem('usageCount');
      if (storedUsage && storedUsage !== 'undefined' && storedUsage !== 'null') {
        const parsedUsage = parseInt(storedUsage, 10);
        if (!isNaN(parsedUsage) && parsedUsage >= 0) {
          setUsageCount(parsedUsage);
        }
      }
    } catch (error) {
      console.warn('Failed to load usage count from localStorage:', error);
      localStorage.removeItem('usageCount'); // Clear corrupted data
    }
  }, [isHydrated]);

  const remainingUses = Math.max(0, maxFreeUses - usageCount);

  // Don't render until hydrated to prevent SSR/client mismatch
  if (!isHydrated) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm">
            <div className="font-medium" style={{ color: '#374151' }}>
              -- uses left
            </div>
            <div className="text-xs text-gray-500">
              -/35 free searches
            </div>
          </div>
        </div>
        <div className="flex items-center text-gray-600">
          <User className="h-6 w-6" style={{ color: '#64B5CD' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-sm">
          <div className="font-medium" style={{ color: '#374151' }}>
            {remainingUses} uses left
          </div>
          <div className="text-xs text-gray-500">
            {usageCount}/{maxFreeUses} free searches
          </div>
        </div>
      </div>

      <div className="flex items-center text-gray-600">
        <User className="h-6 w-6" style={{ color: '#64B5CD' }} />
      </div>
    </div>
  );
}
