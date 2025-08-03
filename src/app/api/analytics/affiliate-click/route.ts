import { NextRequest, NextResponse } from 'next/server';

interface AffiliateClickData {
  store: string;
  productId: string;
  userId?: string;
  timestamp: string;
  userAgent?: string;
  referrer?: string;
  metadata?: Record<string, string | number | boolean>;
}

// In a real implementation, you would use a database to store this data
// For now, we'll use in-memory storage (this will reset on server restart)
let affiliateClicks: AffiliateClickData[] = [];

export async function POST(request: NextRequest) {
  try {
    const clickData: AffiliateClickData = await request.json();
    
    // Validate required fields
    if (!clickData.store || !clickData.productId) {
      return NextResponse.json(
        { error: 'Store and productId are required' },
        { status: 400 }
      );
    }
    
    // Add server-side enrichment
    const enrichedData: AffiliateClickData = {
      ...clickData,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
    };
    
    // Store the click data
    affiliateClicks.push(enrichedData);
    
    // Keep only the last 1000 clicks to prevent memory issues
    if (affiliateClicks.length > 1000) {
      affiliateClicks = affiliateClicks.slice(-1000);
    }
    
    console.log('Affiliate click tracked:', enrichedData);
    
    // In a real implementation, you would:
    // 1. Store in a database (PostgreSQL, MongoDB, etc.)
    // 2. Send to analytics services (Google Analytics, Mixpanel, etc.)
    // 3. Queue for batch processing
    // 4. Update commission tracking
    
    // Example database storage:
    // await db.affiliateClicks.insert(enrichedData);
    
    // Example analytics service:
    // await analytics.track('Affiliate Click', enrichedData);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Click tracked successfully',
        clickId: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const store = searchParams.get('store');
    const limit = parseInt(searchParams.get('limit') || '100');
    const userId = searchParams.get('userId');
    
    let filteredClicks = affiliateClicks;
    
    // Filter by store if provided
    if (store) {
      filteredClicks = filteredClicks.filter(click => 
        click.store.toLowerCase() === store.toLowerCase()
      );
    }
    
    // Filter by userId if provided
    if (userId) {
      filteredClicks = filteredClicks.filter(click => click.userId === userId);
    }
    
    // Limit results
    const limitedClicks = filteredClicks.slice(-limit);
    
    // Calculate analytics
    const analytics = {
      totalClicks: filteredClicks.length,
      storeBreakdown: getStoreBreakdown(filteredClicks),
      recentClicks: limitedClicks,
      clicksByDay: getClicksByDay(filteredClicks),
    };
    
    return NextResponse.json(analytics, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getStoreBreakdown(clicks: AffiliateClickData[]) {
  const breakdown: Record<string, number> = {};
  clicks.forEach(click => {
    breakdown[click.store] = (breakdown[click.store] || 0) + 1;
  });
  return breakdown;
}

function getClicksByDay(clicks: AffiliateClickData[]) {
  const clicksByDay: Record<string, number> = {};
  clicks.forEach(click => {
    const date = new Date(click.timestamp).toISOString().split('T')[0];
    clicksByDay[date] = (clicksByDay[date] || 0) + 1;
  });
  return clicksByDay;
}
