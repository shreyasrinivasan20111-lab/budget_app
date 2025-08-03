import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json();
    
    // Mock Stripe payment intent creation
    // In a real app, you'd use: stripe.paymentIntents.create()
    
    const paymentIntent = {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Stripe uses cents
      currency: currency.toLowerCase(),
      status: 'requires_payment_method'
    };
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('payment_intent');
  
  if (!paymentIntentId) {
    return NextResponse.json(
      { error: 'Payment intent ID is required' },
      { status: 400 }
    );
  }
  
  // Mock payment intent retrieval
  // In a real app, you'd use: stripe.paymentIntents.retrieve()
  
  return NextResponse.json({
    id: paymentIntentId,
    status: 'succeeded', // Mock successful payment
    amount: 2000, // $20.00 in cents
    currency: 'usd'
  });
}
