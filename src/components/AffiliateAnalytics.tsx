'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, DollarSign, MousePointer } from 'lucide-react';

interface AnalyticsData {
  totalClicks: number;
  storeBreakdown: Record<string, number>;
  recentClicks: Array<{
    store: string;
    productId: string;
    timestamp: string;
    metadata?: Record<string, string | number>;
  }>;
  clicksByDay: Record<string, number>;
}

interface AffiliateAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AffiliateAnalytics: React.FC<AffiliateAnalyticsProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...');
      const response = await fetch('/api/analytics/affiliate-click');
      console.log('Analytics response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analytics API error:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const estimatedEarnings = analytics ? Object.entries(analytics.storeBreakdown).reduce((total, [store, clicks]) => {
    // Rough estimate based on average click value and conversion rates
    const avgCommissionPerClick = {
      'Amazon': 0.50,
      'eBay': 0.35,
      'Walmart': 0.40,
      'Target': 0.60,
      'Best Buy': 0.45,
      'Wayfair': 0.75,
      'AliExpress': 0.30
    };
    return total + (clicks * (avgCommissionPerClick[store as keyof typeof avgCommissionPerClick] || 0.25));
  }, 0) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" style={{ color: '#64B5CD' }} />
              <h2 className="text-2xl font-bold text-gray-900">Affiliate Analytics</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#64B5CD' }} />
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F4F5', border: '2px solid #64B5CD' }}>
                  <div className="flex items-center">
                    <MousePointer className="h-8 w-8" style={{ color: '#64B5CD' }} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalClicks}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F4F5', border: '2px solid #B8860B' }}>
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8" style={{ color: '#B8860B' }} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Estimated Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">${estimatedEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F4F5', border: '2px solid #F4D8B8' }}>
                  <div className="flex items-center">
                    <ExternalLink className="h-8 w-8" style={{ color: '#D4A373' }} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Stores</p>
                      <p className="text-2xl font-bold text-gray-900">{Object.keys(analytics.storeBreakdown).length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Breakdown */}
              <div className="rounded-lg p-6" style={{ backgroundColor: '#F0F4F5', border: '2px solid #F4D8B8' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks by Store</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.storeBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([store, clicks]) => {
                      const percentage = (clicks / analytics.totalClicks) * 100;
                      return (
                        <div key={store} className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{store}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: '#64B5CD'
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {clicks} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Recent Clicks */}
              <div className="rounded-lg p-6" style={{ backgroundColor: '#F0F4F5', border: '2px solid #F4D8B8' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Clicks</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.recentClicks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No clicks tracked yet</p>
                  ) : (
                    analytics.recentClicks.reverse().map((click, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <span className="font-medium text-gray-900">{click.store}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {click.metadata?.productName || click.productId}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(click.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(click.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-lg p-6" style={{ backgroundColor: 'rgba(100, 181, 205, 0.1)', border: '1px solid #64B5CD' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Affiliate Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Higher-priced items typically generate more commission per click</li>
                  <li>• Amazon and Wayfair tend to have the best conversion rates</li>
                  <li>• Track which products generate the most clicks to optimize your search results</li>
                  <li>• Consider promoting seasonal items for higher earnings</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">Failed to load analytics data</p>
              <p className="text-sm text-gray-400 mb-4">Check browser console for details</p>
              <button
                onClick={fetchAnalytics}
                className="mt-4 px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#64B5CD' }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateAnalytics;
