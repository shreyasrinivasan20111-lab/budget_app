import { NextRequest, NextResponse } from 'next/server';

// Mock user usage tracking
const userUsage: { [key: string]: number } = {};
const subscriptions: { [key: string]: boolean } = {};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'anonymous';
  
  const usage = userUsage[userId] || 0;
  const isSubscribed = subscriptions[userId] || false;
  const maxFreeUses = 35;
  
  return NextResponse.json({
    userId,
    usage,
    isSubscribed,
    maxFreeUses,
    remainingUses: Math.max(0, maxFreeUses - usage),
    canUseService: isSubscribed || usage < maxFreeUses
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (action === 'increment') {
      userUsage[userId] = (userUsage[userId] || 0) + 1;
    } else if (action === 'subscribe') {
      subscriptions[userId] = true;
    }
    
    const usage = userUsage[userId] || 0;
    const isSubscribed = subscriptions[userId] || false;
    const maxFreeUses = 50;
    
    return NextResponse.json({
      userId,
      usage,
      isSubscribed,
      maxFreeUses,
      remainingUses: Math.max(0, maxFreeUses - usage),
      canUseService: isSubscribed || usage < maxFreeUses
    });
    
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
