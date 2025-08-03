'use client';

import { useState, useEffect } from 'react';
import { Crown, Check, Star, ArrowLeft, Palette, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Subscribe() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');

  useEffect(() => {
    // Check URL params for plan selection
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    if (plan === 'premium') {
      setSelectedPlan('premium');
    }
  }, []);

  const handleSubscribe = async (plan: 'basic' | 'premium') => {
    setIsProcessing(true);
    
    // Mock payment processing
    setTimeout(() => {
      setPaymentSuccess(true);
      setIsProcessing(false);
      
      // Set appropriate subscription status
      if (plan === 'basic') {
        localStorage.setItem('isSubscribed', 'true');
      } else {
        localStorage.setItem('isSubscribed', 'true');
        localStorage.setItem('isPremiumUser', 'true');
      }
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pro!</h1>
          <p className="text-gray-600 mb-6">
            Your subscription is now active. Enjoy unlimited searches and premium features!
          </p>
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 text-indigo-600 hover:text-indigo-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to SmartBudget AI</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Crown className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your SmartBudget Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock powerful AI shopping features and maximize your savings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <p className="text-gray-600">Limited searches</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>50 free searches</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Basic product comparison</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Multiple store search</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Currency conversion</span>
              </li>
            </ul>
          </div>

          {/* Basic Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-indigo-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$20</div>
              <p className="text-gray-600">per year</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="font-medium">Unlimited searches</span>
              </li>
              <li className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="font-medium">Advanced AI recommendations</span>
              </li>
              <li className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="font-medium">Price drop alerts</span>
              </li>
              <li className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="font-medium">Priority customer support</span>
              </li>
              <li className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="font-medium">Export shopping lists</span>
              </li>
            </ul>
            
            <button
              onClick={() => handleSubscribe('basic')}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Subscribe to Basic Pro
                </>
              )}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-purple-500 relative transform lg:scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                🔥 Best Value
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Premium Theme</h3>
                <Sparkles className="h-6 w-6 text-purple-600 ml-2" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                $30
              </div>
              <p className="text-gray-600">per year</p>
              <p className="text-sm text-purple-600 font-medium mt-1">
                Save $10 vs separate plans!
              </p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="font-medium">Everything in Basic Pro</span>
              </li>
              <li className="flex items-center">
                <Palette className="h-5 w-5 text-purple-500 mr-3" />
                <span className="font-medium">AI Theme-Based Shopping</span>
              </li>
              <li className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-500 mr-3" />
                <span className="font-medium">Style coordination AI</span>
              </li>
              <li className="flex items-center">
                <Crown className="h-5 w-5 text-purple-500 mr-3" />
                <span className="font-medium">Curated product collections</span>
              </li>
              <li className="flex items-center">
                <Star className="h-5 w-5 text-purple-500 mr-3" />
                <span className="font-medium">Theme-based recommendations</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-purple-500 mr-3" />
                <span className="font-medium">Premium customer support</span>
              </li>
            </ul>
            
            <button
              onClick={() => handleSubscribe('premium')}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Subscribe to Premium
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Theme Feature Showcase */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8 mb-8 border border-purple-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Palette className="h-8 w-8 text-purple-600 mr-3" />
              Premium Theme Shopping
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Transform your shopping experience with AI-powered theme coordination. 
              Get perfectly matched products for any occasion!
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🎂</div>
              <p className="font-medium">Birthday Parties</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🌺</div>
              <p className="font-medium">Tropical Vibes</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🎃</div>
              <p className="font-medium">Halloween</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">❄️</div>
              <p className="font-medium">Winter Wonder</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">✨</div>
              <p className="font-medium">Custom Themes</p>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose SmartBudget Pro?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Savings</h3>
              <p className="text-gray-600 text-sm">
                Advanced algorithms find the best deals and suggest money-saving alternatives
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unlimited Access</h3>
              <p className="text-gray-600 text-sm">
                Search as much as you want without any restrictions or limits
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Theme Coordination</h3>
              <p className="text-gray-600 text-sm">
                AI creates perfectly matched product collections for any theme or occasion
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            Trusted by thousands of smart shoppers worldwide
          </p>
          <p className="text-xs text-gray-400">
            Secure payment processing • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </main>
    </div>
  );
}
