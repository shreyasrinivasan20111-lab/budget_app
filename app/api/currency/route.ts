import { NextRequest, NextResponse } from 'next/server';

// Mock currency conversion API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || 'USD';
  const to = searchParams.get('to') || 'USD';
  const amount = parseFloat(searchParams.get('amount') || '1');

  try {
    // In a real app, use a service like exchangerate-api.com or fixer.io
    const mockRates: { [key: string]: { [key: string]: number } } = {
      USD: {
        EUR: 0.85, GBP: 0.73, CAD: 1.25, AUD: 1.35, JPY: 110,
        CHF: 0.92, CNY: 6.4, INR: 74, BRL: 5.2, USD: 1
      },
      EUR: {
        USD: 1.18, GBP: 0.86, CAD: 1.47, AUD: 1.59, JPY: 129,
        CHF: 1.08, CNY: 7.53, INR: 87, BRL: 6.12, EUR: 1
      },
      GBP: {
        USD: 1.37, EUR: 1.16, CAD: 1.71, AUD: 1.85, JPY: 151,
        CHF: 1.26, CNY: 8.77, INR: 101, BRL: 7.12, GBP: 1
      },
      // Add more currency pairs as needed
    };

    const rate = mockRates[from]?.[to] || 1;
    const convertedAmount = amount * rate;

    return NextResponse.json({
      from,
      to,
      rate,
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}
